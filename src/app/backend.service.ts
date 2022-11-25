import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from './../environments/environment';
import * as EmailValidator from 'email-validator';

declare const Essentia: any;
declare const EssentiaWASM: any;
declare const EssentiaExtractor: any;



@Injectable({
  providedIn: 'root'
})
export class BackendService {
  public backend: string = environment.backend
  public queueInterval: any
  public videoTorrent: any = new BehaviorSubject(null)
  public videoTorrentObserver = this.videoTorrent.asObservable()
  public videoxiVideo: any = new BehaviorSubject(null)
  public videoxiVideoObserver = this.videoxiVideo.asObservable()
  public jobs: any = new BehaviorSubject(null)
  public jobsObserver = this.jobs.asObservable()
  public jobsList: any = new BehaviorSubject(null)
  public jobsListObserver = this.jobsList.asObservable()
  public statistics: any = new BehaviorSubject(null)
  public statisticOsbserver = this.statistics.asObservable()
  public kommentit: any = new BehaviorSubject(null)
  public kommentitOsbserver = this.kommentit.asObservable()
  constructor(
    public http: HttpClient
  ) {
    this.update()
  }
  haeKommentit() {
    const headers = { 
      'content-type': 'application/json'
    }
    this.http.get(this.backend + '/kommentit', {
      'headers': headers
    }).subscribe((response: any) => {
      console.log(response)
      this.kommentit.next(response)
    })
  }
  lahetaKommentti(torrent:any, nick:string, comment: string) {
    const headers = { 
      'content-type': 'application/json'
    }
    let data = {
      nick: nick,
      comment: comment,
      date: new Date().getTime(),
      torrentName: torrent.name
    }
    this.http.post(this.backend + '/kommentit', JSON.stringify(data), {
      'headers': headers
    }).subscribe((response: any) => {
      console.log(response)
    })
  }
  donate(email:string, videoName:string) {
    if(EmailValidator.validate(email)) {
      const headers = { 
        'content-type': 'application/json'
      }
      let data = {
        email: email,
        videoName: videoName
      }
      this.http.post(this.backend + '/donate', JSON.stringify(data), {
        'headers': headers
      }).subscribe((response: any) => {
        console.log(response)
        window.open(response.hosted_checkout_url, '_blank')
      })
    }
  }
  updateAiTag(path:string, categories:Array<any>) {
    
    const headers = { 
      'content-type': 'application/json'
    }
    let data = {
      path: path,
      categories: categories
    }
    this.http.post(this.backend + '/updateAiTags', JSON.stringify(data), {
      'headers': headers
    }).subscribe((response: any) => {
      this.getTorrents()
    })
  }
  update() {
    this.getTorrents()
    this.getJobs()
    this.getJobsList()
    //this.obliterate()
  }
  login(username:string, password:string) {
    const headers = { 
      'content-type': 'application/json'
    }
    let login = {
      username: username,
      password: password
    }
    this.http.post(this.backend + '/login', JSON.stringify(login), {
      'headers': headers
    }).subscribe((response: any) => {
      if(response.success) {
        localStorage.setItem('token', response.token)
        window.location.href = this.backend + '/admin/queues?token=' + response.token
      } else {
      }
    })
  }
  obliterate() {
    
    const headers = { 
      'content-type': 'application/json'
    }
    
    this.http.get(this.backend + '/restart', {
      'headers': headers
    }).subscribe((response: any) => {
      console.log(response)
    })
    
  }
  getJobsList() {
    
    const headers = { 
      'content-type': 'application/json'
    }
    
    this.http.get(this.backend + '/jobs', {
      'headers': headers
    }).subscribe((response: any) => {
      console.log(response)
      this.jobsList.next(response)
      /*
      let essentia:any
      let extractor
      this.jobsListObserver.subscribe((response:any) => {
        response.jobs.forEach((elem:any, ind:number) => {
          EssentiaWASM().then( (EssentiaWasm:any) => {
            if(!ind) {
              essentia = new Essentia(EssentiaWasm);
              extractor = new EssentiaExtractor(EssentiaWasm, true)
              if(typeof elem.data.video.mp3 === 'string') {
                console.log(elem.data.video.mp3)
                const audioCtx = new AudioContext();
                let audioBuffer = essentia.getAudioBufferFromURL(this.backend + '/videoLibrary/' + elem.data.video.mp3, audioCtx)
                // prints version of the essentia wasm backend
                console.log(essentia.version)
                console.log(essentia)
                // prints all the available algorithms in essentia.js
                console.log(essentia.algorithmNames);
                audioBuffer.then((response: any) => {
                  console.log(response)
                  let inputSignalVector:any = essentia.arrayToVector(response.getChannelData(0));
                  console.log(inputSignalVector)
                  let outputPyYin = essentia.PitchYinProbabilistic(inputSignalVector, // input
                                          // parameters (optional)
                                          4096, // frameSize
                                          256, // hopSize
                                          0.1, // lowRMSThreshold
                                          'zero', // outputUnvoiced,
                                          false, // preciseTime
                                          44100); //sampleRate

                  let pitches = essentia.vectorToArray(outputPyYin.pitch);
                  let voicedProbabilities = essentia.vectorToArray(outputPyYin.voicedProbabilities);
                  
                  console.log(pitches);
                  console.log(voicedProbabilities);
                  
                  outputPyYin.pitch.delete()
                  outputPyYin.voicedProbabilities.delete()
                  // call internal essentia::shutdown C++ method
                  essentia.shutdown();
                  // delete EssentiaJS instance, free JS memory
                  essentia.delete();
                })
                // add your custom audio feature extraction callbacks here
              }
            }
          });
        })
      })
      */
    })
  }
  getTorrents() {
    const headers = { 
      'content-type': 'application/json'
    }
    this.http.get(this.backend + '/torrent', {
      'headers': headers
    }).subscribe((response: any) => {
      this.getStatistics()
      this.videoTorrent.next(response.torrents)
    })
  }
  getJobs() {
    const headers = { 
      'content-type': 'application/json'
    }
    this.http.get(this.backend + '/queue', {
      'headers': headers
    }).subscribe((response: any) => {
      this.jobs.next(response.jobs)
    })
  }
  createVideoxi(data: any) {
    const headers = { 
      'content-type': 'application/json'
    }
    let backendData:any = {
      video: {
        name: '',
        videos: [],
        images: [],
        mp3: {
          path: ''
        },
        genre: data.genre,
        email: data.email
      }
    }
    data.files.forEach((elem:any, ind:number) => {
      if(elem.file.type.indexOf('video') !== -1) {
        backendData.video.videos.push({
          path: elem.filepath,
          text: elem.text,
          subtitle: elem.subtitle,
          title: elem.title,
          duration: elem.duration,
          index: ind
        })
      }
      if(elem.file.type.indexOf('image') !== -1) {
        backendData.video.images.push({
          path: elem.filepath,
          text: elem.text,
          subtitle: elem.subtitle,
          title: elem.title,
          index: ind,
          categories: elem.categories
        })
      }
      if(elem.file.type.indexOf('audio') !== -1) {
        backendData.video.mp3 = elem.filepath
        backendData.video.name = elem.filepath.split('/')[1].replace('.mp3', '')
      }
    })
    this.http.post(this.backend + '/queue', JSON.stringify(backendData), {
      'headers': headers
    }).subscribe((response: any) => {
      data.ready = true
      this.videoxiVideo.next(response.success)
    })
  }
  statisticsForVideo(torrent:any) {
    const headers = { 
      'content-type': 'application/json'
    }
    let backendData = {
      statistics : torrent.filename
    }
    this.http.post(this.backend + '/statistics', JSON.stringify(backendData), {
      'headers': headers
    }).subscribe((response: any) => {
      
    })
  }
  getStatistics() {
    const headers = { 
      'content-type': 'application/json'
    }
    this.http.get(this.backend + '/statistics', {
      'headers': headers
    }).subscribe((response: any) => {
      this.statistics.next(response.statistics)
    })
  }
}
