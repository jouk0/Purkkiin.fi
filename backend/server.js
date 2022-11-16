require('dotenv').config()
const express = require("express")
const cors = require("cors")
const fs = require('fs')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
var http = require('http');
var https = require('https');
let videoxi = require('./processors/videoxi')
let common = require('./common')
var compression = require('compression')
var zlib = require('zlib')
const helmet = require("helmet");
const slowDown = require("express-slow-down");
const rateLimit = require("express-rate-limit");
let breachIpList = require('./blacklist/blacklist.json')
let statistics = require('./statistics/statistics.json')
const os = require("os")
const cluster = require("cluster")
const QueueMQ = require('bullmq')
const { createBullBoard } = require('@bull-board/api')
const { BullAdapter } = require('@bull-board/api/bullAdapter')
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter')
const { ExpressAdapter } = require('@bull-board/express')
const jwt = require('jsonwebtoken');
let crypto = require('crypto')
const { runInNewContext } = require("vm")
let random = crypto.randomBytes(64).toString('hex')
var privateKey = fs.readFileSync(__dirname + '/cert/privkey.pem');
var certificate = fs.readFileSync(__dirname + '/cert/fullchain.pem');
var useragent = require('express-useragent');
var geoip = require('geoip-lite');
const opennode = require('opennode');
opennode.setCredentials(process.env.OPENNODEAPIKEY, 'live');

var credentials = {key: privateKey, cert: certificate};
var app = express();
const torrentsJson = __dirname + '/processors/data/torrents.json'
var corsOptions = {
  origin: "*"
};
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 100 requests per windowMs
    onLimitReached: (req, res, options) => {
        var ip = req.ip 
        || req.connection.remoteAddress 
        || req.socket.remoteAddress 
        || req.connection.socket.remoteAddress;
        breachIpList.push(ip)
        
        fs.writeFileSync(__dirname + '/blacklist/blacklist.json', JSON.stringify(breachIpList), {
            encoding: 'utf8'
        })
    }
});
const speedLimiter = slowDown({
    windowMs: 5 * 60 * 1000, // 15 minutes
    delayAfter: 500, // allow 100 requests per 15 minutes, then...
    delayMs: 500 // begin adding 500ms of delay per request above 100:
    // request # 101 is delayed by  500ms
    // request # 102 is delayed by 1000ms
    // request # 103 is delayed by 1500ms
    // etc.
});
function generateAccessToken(username) {
    return jwt.sign(username, random, { expiresIn: '1800s' });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = ''
    if(!authHeader) {
        token = req.query.token
    } else {
        token = authHeader && authHeader.split(' ')[1]
    }
  
    if (token == null) return res.sendStatus(401)
  
    jwt.verify(token, random, (err, user) => {
      console.log(err)
  
      if (err) return res.sendStatus(403)
  
      req.user = user
  
      next()
    })
}
app.use(cors(corsOptions));
// parse application/json
app.use(bodyParser.json())
app.use((request, response, next) => {
    if (!request.secure) {
       return response.redirect("https://" + request.headers.host + request.url);
    }
    next();
})
app.use(compression({
    level: 9
}))
app.use(useragent.express());
app.use(limiter);
app.use(speedLimiter);
app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginResourcePolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
// simple route
app.use('/', express.static('mp3ToVideo'))
app.use('/videoLibrary', express.static('processors/data/videos'))
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 * 1024 },
    debug: false
}));
const serverAdapter = new ExpressAdapter();
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [
      new BullAdapter(videoxi.queue, { allowRetries: false })
    ],
    serverAdapter:serverAdapter
})
serverAdapter.setBasePath('/admin/queues')
const users = [{
    username: 'admin',
    password: process.env.ADMINPASSWORD
}]
app.post('/login', (req, res) => {
    let found = false
    let token = ''
    users.forEach((user, ind) => {
        if(user.username === req.body.username && user.password === req.body.password) {
            found = true
            token = generateAccessToken({ username: req.body.username });
        }
    })
    if(!found) {
        res.send({
            success: false
        })
    } else {
        res.send({
            success: true,
            token: token
        })
    }
})
app.use('/admin/queues', authenticateToken, serverAdapter.getRouter());
app.post('/queue', async (req, res) => {
    videoxi.queue.add({ video: req.body.video });
    res.send({
        success: true
    })
})
app.get('/queue', async (req, res) => {
    let jobs = await videoxi.queue.getJobCounts()
    res.send({
        success: true,
        jobs: jobs
    })
})
app.get('/jobs', async (req, res) => {
    let jobs = await videoxi.queue.getJobs()
    res.send({
        success: true,
        jobs: jobs
    })
})
app.get('/restart', async (req, res) => {
    let jobs = await videoxi.queue.obliterate({ force: boolean})
    res.send({
        success: true
    })
})
app.get('/statistics', async (req, res) => {
    res.send({
        success: true,
        statistics: statistics
    })
})
app.post('/statistics', async (req, res) => {
    let found = false
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    var geo = geoip.lookup(ip);
    statistics.forEach((elem, ind) => {
        if(elem.path === req.body.statistics) {
            elem.plays += 1
            if(!elem.headers) {
                elem.headers = [req.useragent]
            } else {
                elem.headers.push(req.useragent)
            }
            if(!elem.geoIp) {
                elem.geoIp = [geo]
            } else {
                elem.geoIp.push(geo)
            }
            found = true
        }
    })
    if(!found) {
        statistics.push({
            path: req.body.statistics,
            plays: 1,
            headers: [req.useragent],
            geoIp: [geo]
        })
    }
    fs.writeFileSync(__dirname + '/statistics/statistics.json', JSON.stringify(statistics))
    res.send({
        success: true
    })
})
app.post('/videoxi', (req, res) => {
    let sampleFile;
    let uploadPath;
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    sampleFile = req.files.file;
    let folder = common.makeid(5) + '-' + common.makeid(5) + '-' + common.makeid(5) + '-' + common.makeid(5)
    fs.mkdir(__dirname + '/data/videos/' + folder, { recursive: true }, (err) => {
        if (err) throw err;
        uploadPath = __dirname + '/data/videos/' + folder + '/' + sampleFile.name;
        fs.writeFileSync(uploadPath, sampleFile.data)
        res.send({
            success: true,
            filename: folder + '/' + sampleFile.name
        })
    })
})
app.get('/torrent', (req, res) => {
    let torrents = JSON.parse(fs.readFileSync(torrentsJson))
    torrents = torrents.reverse()
    res.send({
        torrents : torrents
    })
})
app.get('/removeJob/:id', async (req, res) => {
    let job = await videoxi.queue.getJob(req.params.id)
    await job.remove()
    res.send({
        success: true
    })
})
app.post('/updateAiTags', (req, res) => {
    let torrents = JSON.parse(fs.readFileSync(torrentsJson))
    torrents.forEach((video, ind) => {
        let path = req.body.path.replace(/[^a-z-9]/gi, '_').toLowerCase()
        if(video.filename.indexOf(path) !== -1) {
            if(video.categories) {
                req.body.categories.forEach((category, ind2) => {
                    let found = false
                    video.categories.forEach((category2, ind3) => {
                        if(JSON.stringify(category) === JSON.stringify(category2)) {
                            found = true
                        }
                    })
                    if(!found) {
                        video.categories.push(category)
                    }
                })
            } else {
                video.categories = req.body.categories
            }
        }
    })
    fs.writeFileSync(torrentsJson, JSON.stringify(torrents))
    res.send({
        success: true
    })
})
const chargesJson = __dirname + '/processors/data/charges.json'
let openNodechargesArr = require(__dirname + '/processors/data/charges.json')
app.post('/opennode', (req, res) => {
    console.log(req.body)
    res.status(200).send({
        success: true
    })
    /*
    const crypto = require('crypto');

    const received = req.body.data.charge.hashed_order;
    const calculated = crypto.createHmac('sha256', MY_API_KEY).update(charge.id).digest('hex');

    if (received === calculated) {
        //Signature is valid
    }
    else {
        //Signature is invalid. Ignore.
    }
    */
})
app.post('/donate', (req, res) => {
    // Create a new charge
    opennode.createCharge({
        amount: 1,
        currency: "EUR",
        callback_url: "https://purkkiin.fi/opennode",
        success_url: "https://purkkiin.fi/#/opennode",
        auto_settle: false,
        order_id: common.makeid(20),
        description: 'Purkkiin.fi - Lahjoitus 1 € - Videolle: ' + req.body.videoName,
        customer_name: req.body.videoName,
        notif_email: req.body.email,
        ttl: 1440
    }).then(charge => {
        openNodechargesArr.push(charge)
        fs.writeFileSync(chargesJson, JSON.stringify(openNodechargesArr))
        res.send(charge);
    })
    .catch(error => {
        console.error(`${error.status} | ${error.message}`);
    });
})
// set port, listen for requests
const clusterWorkerSize = os.cpus().length

if (clusterWorkerSize > 1) {
  if (cluster.isMaster) {
    for (let i=0; i < clusterWorkerSize; i++) {
      cluster.fork()
    }

    cluster.on("exit", function(worker) {
      console.log("Worker", worker.id, " has exitted.")
    })
  } else {
    
    var httpServer = http.createServer(app);
    var httpsServer = https.createServer(credentials, app);

    httpServer.listen(80);
    httpsServer.listen(443);
  }
} else {
    var httpServer = http.createServer(app);
    var httpsServer = https.createServer(credentials, app);
    
    httpServer.listen(80);
    httpsServer.listen(443);
}
