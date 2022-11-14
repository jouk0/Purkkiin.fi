const Queue = require('bull');
const fs = require('fs')
const Xvfb = require('xvfb');
const getMP3Duration = require('get-mp3-duration')
const editly = require('editly');
const common = require('../common')
const torrentsJson = __dirname + '/data/torrents.json'
const videoQueue = new Queue('Videoxi', { redis: { port: 6379, host: '127.0.0.1' /*, password: 'R3dishAlive'*/ } });
const imageSetup = require('./images')
const videoSetup = require('./videos')
const noiseSetup = require('./noise')

videoQueue.process(async (job, done) => {
    job.progress(5);
    var xvfb = new Xvfb({
        silent: true,
        xvfb_args: ["-screen", "0", '1280x720x24', "-ac"],
    });
    xvfb.start((err)=>{if (err) console.error(err)})
    let video = job.data.video
    var songName = video.name.replace(/[^a-z-9]/gi, '_').toLowerCase();
    var songNameForHD = video.name.replace(/[^a-zöäå0-9]/gi, '_').toLowerCase();
    let clips = []
    videoSetup.init(video.videos, clips)
    let categories = []
    imageSetup.init(video.images, clips, categories)
    clips.push({ 
        duration: 2,
        layers: [
          { type: 'rainbow-colors' },
          { type: 'canvas', noiseSetup },
        ] 
    })
    let clips2 = JSON.parse(JSON.stringify(clips))
    let clips3 = JSON.parse(JSON.stringify(clips))
    let clips4 = JSON.parse(JSON.stringify(clips))
    clips = clips.concat(clips2)
    clips = clips.concat(clips3)
    clips = clips.concat(clips4)
    var mp3Path = video.mp3;
    let folder = common.makeid(5) + '-' + common.makeid(5) + '-' + common.makeid(5) + '-' + common.makeid(5)
    fs.mkdir(__dirname + '/data/videos/' + folder, { recursive: true }, async (err) => {
        if (err) throw err;

        var mp4Path = __dirname + '/data/videos/' + folder + '/' + songNameForHD + '.mp4';
        let newVideo = {
            mp3: __dirname + '/data/videos/' + mp3Path,
            mp4: mp4Path,
            clips: clips
        }
        const buffer = fs.readFileSync(newVideo.mp3)
        const duration = getMP3Duration(buffer)
        let mp3LenghtInSeconds = duration/1000
        let editSpec = {
            width: 512,
            height: 256,
            outPath: newVideo.mp4,
            fps: 25,
            clips: newVideo.clips,
            audioNorm: { 
                enable: true, 
                gaussSize: 3, 
                maxGain: 100 
            },
            audioTracks: [
                { path: newVideo.mp3 }
            ]
        }
        
        editSpec.clips.forEach((elem) => {
            let found = false
            elem.layers.forEach((elem2, ind2) => {
                if(elem2.type === 'video') {
                    found = true
                }
            })
            if(!found) {
                elem.duration = mp3LenghtInSeconds / (editSpec.clips.length-1)
            } else {
                mp3LenghtInSeconds -= elem.duration
            }
        })
        job.progress(10);
        await editly(editSpec)
        .catch(console.error);
        
        job.progress(80);
        var stats = fs.statSync(newVideo.mp4)
        let data = {
            type: 'video/mp4',
            name: songName,
            size: stats.size,
            filename: folder + '/' + songNameForHD + '.mp4',
            date: new Date(),
            genre: job.data.video.genre,
            categories: categories
        }
        let torrents = JSON.parse(fs.readFileSync(torrentsJson))
        torrents.push(data)
        await fs.writeFileSync(torrentsJson, JSON.stringify(torrents))
        xvfb.stop();
        job.progress(100);
        done();
    })
});

module.exports = {
    queue: videoQueue
}
