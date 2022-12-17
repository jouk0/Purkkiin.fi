import * as dotenv from 'dotenv'
dotenv.config()
import express from "express"
import cors from "cors"
import fs from 'fs'
import bodyParser from 'body-parser'
import fileUpload from 'express-fileupload'
import http from 'http'
import https from 'https'
import videoxi from './processors/videoxi.mjs'
import * as common from './common.js'
import compression from 'compression'
import zlib from 'zlib'
import helmet from "helmet"
import slowDown from "express-slow-down"
import rateLimit from "express-rate-limit"
import breachIpList from './blacklist/blacklist.json' assert {type: 'json'}
import statistics from './statistics/statistics.json' assert {type: 'json'}
import os from "os"
import cluster from "cluster"
import { ExpressAdapter } from '@bull-board/express'
import jwt from 'jsonwebtoken'
import useragent from 'express-useragent'
import geoip from 'geoip-lite'
import opennode from 'opennode'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

opennode.setCredentials(process.env.OPENNODEAPIKEY, 'live');

var privateKey = fs.readFileSync(__dirname + '/cert/privkey.pem');
var certificate = fs.readFileSync(__dirname + '/cert/fullchain.pem');

var credentials = { 
    key: privateKey,
    cert: certificate
};

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
    let token = ''
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
app.use(function(request, response, next) {
    if (!request.secure) {
       return response.redirect("https://" + request.headers.host + request.url);
    }
    next();
})

function shouldCompress (req, res) {

    if(req.originalUrl.includes('sitemap')) {
        return false
    }
    if (req.headers['x-no-compression']) {
      // don't compress responses with this request header
      return false
    }
  
    // fallback to standard filter function
    return compression.filter(req, res)
}
app.use(compression({
    level: 9,
    filter: shouldCompress
}))

app.use(useragent.express());
app.use(limiter);
app.use(speedLimiter);

app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.crossOriginOpenerPolicy());
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
/*
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [
      new BullAdapter(videoxi.queue, { allowRetries: false })
    ],
    serverAdapter:serverAdapter
})
*/
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
serverAdapter.setBasePath('/admin/queues')
//app.use('/admin/queues', serverAdapter.getRouter());
let videoQueueClass = new videoxi()
app.post('/queue', async (req, res) => {
    videoQueueClass.videoQueue.add('Videoxi', { video: req.body.video });
    res.send({
        success: true
    })
})
app.get('/queue', async (req, res) => {
    let jobs = await videoQueueClass.videoQueue.getJobCounts()
    res.send({
        success: true,
        jobs: jobs
    })
})
app.get('/jobs', async (req, res) => {
    let jobs = await videoQueueClass.videoQueue.getJobs()
    res.send({
        success: true,
        jobs: jobs
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
    fs.mkdir(__dirname + '/processors/data/videos/' + folder, { recursive: true }, (err) => {
        if (err) throw err;
        uploadPath = __dirname + '/processors/data/videos/' + folder + '/' + sampleFile.name;
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
/*
app.get('/removeJob/:id', async (req, res) => {
    let job = await videoxi.queue.getJob(req.params.id)
    await job.remove()
    res.send({
        success: true
    })
})
*/
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
import openNodechargesArr from './processors/data/charges.json' assert {type: 'json'}
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


import kommentit from './kommentit/kommentit.json' assert {type: 'json'}
app.get('/kommentit', (req, res) => {
    res.send({
        success: true,
        kommentit: kommentit
    });
})
app.post('/kommentit', (req, res) => {
    kommentit.push(req.body)
    fs.writeFileSync(__dirname + '/kommentit/kommentit.json', JSON.stringify(kommentit))
    res.send({
        success: true
    });
})

import arvostelut from './arvostelut/arvostelut.json' assert {type: 'json'}
app.get('/arvostelut', (req, res) => {
    res.send({
        success: true,
        arvostelut: arvostelut
    });
})
app.post('/arvostelut', (req, res) => {
    arvostelut.push(req.body)
    fs.writeFileSync(__dirname + '/arvostelut/arvostelut.json', JSON.stringify(kommentit))
    res.send({
        success: true
    });
})

import emailit from './emailit/emailit.json' assert {type: 'json'}
app.post('/email', (req, res) => {
    arvostelut.push(req.body)
    fs.writeFileSync(__dirname + '/emailit/emailit.json', JSON.stringify(emailit))
    res.send({
        success: true
    });
})
import kavijat from './kavijat/kavijat.json' assert {type: 'json'}
app.get('/kavijat', (req, res) => {
    res.send({
        success: true,
        kavijat: kavijat
    });
})
app.post('/kavijat', (req, res) => {
    kavijat.push(req.body)
    fs.writeFileSync(__dirname + '/kavijat/kavijat.json', JSON.stringify(kavijat))
    res.send({
        success: true
    });
})
import Handlebars from "handlebars"
const sitemapTemplate = fs.readFileSync('./sitemap/sitemap-template.html', 'utf8')
app.get('/sitemap/:version', (req, res) => {
    var template = Handlebars.compile(sitemapTemplate);
    let torrents = JSON.parse(fs.readFileSync(torrentsJson))
    torrents = torrents.reverse()
    torrents.forEach((torrent, ind) => {
        torrent.name = torrent.name.replace(/_/gi, ' ')
        torrent.date = new Date(torrent.date).toISOString()
        torrent.matroskaVideo = torrent.matroskaVideo.replace('C:\\projektit\\MatroskaTesti/videos/', '')
        statistics.forEach((statistic, ind2) => {
            if(statistic.path === torrent.filename) {
                torrent.plays = statistic.plays
            }
        })
        if(!torrent.plays) {
            torrent.plays = 0
        }
    })
    let html = template({ torrents: torrents })
    fs.writeFileSync(__dirname + '/sitemap/sitemap-' + req.params.version + '.xml', html)
    res.sendFile('sitemap/sitemap-' + req.params.version + '.xml', {root: __dirname })
})
app.post('/donate', (req, res) => {
    // Create a new charge
    if(req.body.email) {
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
    } else {
        res.send({
            success: false,
            error: 'Invalid email address.'
        });
    }
})

app.post('/donate/:amount', (req, res) => {
    // Create a new charge
    if(req.body.email) {
        opennode.createCharge({
            amount: parseFloat(req.params.amount),
            currency: "EUR",
            callback_url: "https://purkkiin.fi/opennode",
            success_url: "https://purkkiin.fi/#/opennode",
            auto_settle: false,
            order_id: common.makeid(20),
            description: 'Purkkiin.fi - Lahjoitus ' + parseFloat(req.params.amount) + ' € - Videolle: ' + req.body.videoName,
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
    } else {
        res.send({
            success: false,
            error: 'Invalid email address.'
        });
    }
})
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
