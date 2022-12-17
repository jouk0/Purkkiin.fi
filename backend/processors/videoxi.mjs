import * as dotenv from 'dotenv'
dotenv.config()
import { Queue, Worker } from 'bullmq';
import fs from 'fs'
import Xvfb from 'xvfb'
import getMP3Duration from 'get-mp3-duration'
import { getAudioDurationInSeconds } from 'get-audio-duration'
import editly from 'editly'
import { makeid } from '../common.js'
import imageSetup from './images.js'
import videoSetup from './videos.js'
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import pkgDeepgram from '@deepgram/sdk';
const { Deepgram } = pkgDeepgram;
import hbjs from 'handbrake-js'

const deepgramApiKey = process.env.DEEPGRAMAPIKEY;
//const noiseSetup = require('./noise')
export default class queue {
    videoQueue
    worker
    xvfb = new Xvfb({
        silent: true,
        xvfb_args: ["-screen", "0", '1280x720x24', "-ac"],
    })
    videoSetup = new videoSetup()
    imageSetup = new imageSetup()
    __dirname = __dirname
    deepgramApiKey = deepgramApiKey
    constructor() {
        this.videoQueue = new Queue('Videoxi', { redis: { port: 6379, host: '127.0.0.1' /*, password: ''*/ } });
        this.worker = new Worker(
            'Videoxi',
            async (job) => {
                var torrentsJson = this.__dirname + '/data/torrents.json'
            
                //job.progress(5);
                this.xvfb.start((err)=>{if (err) console.error(err)})
                let video = job.data.video
                var songName = video.name.replace(/[^a-z-9]/gi, '_').toLowerCase();
                var songNameForHD = video.name.replace(/[^a-zöäå0-9]/gi, '_').toLowerCase();
                let clips = []
                this.videoSetup.init(video.videos, clips)
                let categories = []
                this.imageSetup.init(video.images, clips, categories)
                clips.push({ 
                    duration: 2,
                    layers: [
                    { type: 'rainbow-colors' },
                    //{ type: 'canvas', noiseSetup },
                    ] 
                })
                let clips2 = JSON.parse(JSON.stringify(clips))
                let clips3 = JSON.parse(JSON.stringify(clips))
                let clips4 = JSON.parse(JSON.stringify(clips))
                clips = clips.concat(clips2)
                clips = clips.concat(clips3)
                clips = clips.concat(clips4)
                var mp3Path = video.mp3;
                let folder = makeid(5) + '-' + makeid(5) + '-' + makeid(5) + '-' + makeid(5)
                return fs.mkdir(this.__dirname + '/data/videos/' + folder, { recursive: true }, async (err) => {
                    if (err) throw err;

                    var mp4Path = this.__dirname + '/data/videos/' + folder + '/' + songNameForHD + '.mp4';
                    let newVideo = {
                        mp3: this.__dirname + '/data/videos/' + mp3Path,
                        mp4: mp4Path,
                        clips: clips
                    }
                    let duration
                    let mp3LenghtInSeconds = 0
                    // Replace with your file path and audio mimetype
                    const pathToFile = newVideo.mp3;
                    let mimetype = 'audio/wav';
                    if(newVideo.mp3.includes('.flac')) {
                        let stream = fs.createReadStream(newVideo.mp3)
                        duration = await getAudioDurationInSeconds(stream)
                        mp3LenghtInSeconds = duration
                        mimetype = 'audio/x-flac'
                    } else {
                        const buffer = fs.readFileSync(newVideo.mp3)
                        duration = getMP3Duration(buffer)
                        mp3LenghtInSeconds = duration/1000
                        mimetype = 'audio/mp3'
                    }
                    let editSpec = {
                        width: 256,
                        height: 128,
                        outPath: newVideo.mp4,
                        fps: 11,
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
                    //job.progress(10);
                    console.log(editSpec)
                    await editly(editSpec)
                    .catch(console.error);
            
                    const options = {
                            input: this.__dirname + '/data/videos/' + folder + '/' + songNameForHD + '.mp4',
                            output: this.__dirname + '/data/videos/' + folder + '/' + songNameForHD + '.mkv'
                    }
                    //job.progress(50)
                    hbjs.spawn(options)
                    .on('error', (err) => {
                        console.error(err)
                    })
                    .on('output', console.log)
                    .on('complete', async () => {
                        //job.progress(80);
                        var stats = fs.statSync(this.__dirname + '/data/videos/' + folder + '/' + songNameForHD + '.mp4')
                        let data = {
                            type: 'video/mp4',
                            name: songName,
                            size: stats.size,
                            filename: folder + '/' + songNameForHD + '.mp4',
                            matroskaVideo: folder + '/' + songNameForHD + '.mkv',
                            date: new Date(),
                            genre: job.data.video.genre,
                            categories: categories,
                            email: job.data.video.email
                        }
                        let torrents = JSON.parse(fs.readFileSync(torrentsJson))
                        torrents.push(data)
                        fs.writeFileSync(torrentsJson, JSON.stringify(torrents))
                        this.xvfb.stop();
                        //job.progress(100);
                    })
                })
            }, { 
                autorun: true,
                concurrency: 1,
                connection: {
                    host: '127.0.0.1',
                    port: 6379
                }
            },
        );
    }
    getqueue() {
        return this.videoQueue
    }
    getworker() {
        return this.worker
    }
}
