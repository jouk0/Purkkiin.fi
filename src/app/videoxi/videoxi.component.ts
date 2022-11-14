import { Component, OnInit } from '@angular/core';
import { FileUploadService, FileUploader } from '@uniprank/ngx-file-uploader';
import { BackendService } from '../backend.service'
import { environment } from '../../environments/environment';

declare const cocoSsd: any;
declare const Pizzicato: any;
declare const WaveSurfer: any;

@Component({
  selector: 'app-videoxi',
  templateUrl: './videoxi.component.html',
  styleUrls: ['./videoxi.component.scss']
})
export class VideoxiComponent implements OnInit {
  public uploader: FileUploader;
  public uploader2: FileUploader;
  public files: Array<any> = []
  public files2: Array<any> = []
  public videoxi: Array<any> = []
  public uploading: boolean = false
  public uploading2: boolean = false
  public videoxiVideos: Array<any> = []
  public filesInTransition: Array<any> = []
  public genre: string = ''
  public sounds: Array<any> = []
  public group: any;
  public delay: any;
  public audioContext: any;
  public detectingImageAITags: boolean = false
  public wavesurfer: any;
  public audioFilePath: string = ''
  constructor(
    private backend: BackendService
  ) {
    this.uploader = new FileUploader({
      url: environment.backend + '/videoxi',
      removeBySuccess: false,
      autoUpload: true,
      filters: []
    });
    this.uploader2 = new FileUploader({
      url: environment.backend + '/videoxi',
      removeBySuccess: false,
      autoUpload: true,
      filters: []
    });
    this.uploader.onCompleteAll = (a:any) => {
      this.uploading = false
      a._queue.forEach((elem:any, ind:number) => {
        if(elem._isUploading) {
          this.uploading = elem._isUploading
        }
      })
      if(!this.uploading) {
        this.addNewVideoxi()
        this.filesInTransition = []
      }
    }
    this.uploader.onProgressFileSpeed = (a:any, b:any) => {
      this.updateFilesInTransition(a._fileElement.name, b.speedToText, b.percent)
    }
    this.uploader2.onProgressFileSpeed = (a:any, b:any) => {
      this.updateFilesInTransition(a._fileElement.name, b.speedToText, b.percent)
    }
    this.uploader2.onCompleteAll = (a:any) => {
      this.uploading2 = false
      a._queue.forEach((elem:any, ind:number) => {
        if(elem._isUploading) {
          this.uploading2 = elem._isUploading
        }
      })
      if(!this.uploading2) {
        this.addNewVideoxiSecond()
        this.filesInTransition = []
      }
    }
    this.uploader2.onSuccess = (a:any, b:any, c:any, d: any) => {
      let response = JSON.parse(b)
      this.files2.push({
        id: this.makeid(5) + '-' + this.makeid(5) + '-' + this.makeid(5) + '-' + this.makeid(5),
        file: a._file,
        name: this.backend.backend + '/videoLibrary/' + response.filename,
        filepath: response.filename,
        text: '',
        subtitle: '',
        title: '',
        start: 0,
        stop: 0,
        categories: []
      })
    }
    this.uploader.onSuccess = (a:any, b:any, c:any, d: any) => {
      let response = JSON.parse(b)
      this.files.push({
        id: this.makeid(5) + '-' + this.makeid(5) + '-' + this.makeid(5) + '-' + this.makeid(5),
        file: a._file,
        name: this.backend.backend + '/videoLibrary/' + response.filename,
        filepath: response.filename,
        text: '',
        subtitle: '',
        title: '',
        start: 0,
        stop: 0,
        categories: []
      })
    }
    this.backend.videoxiVideoObserver.subscribe((response:any) => {
      if(response) {
        this.videoxi = []
        this.backend.getTorrents()
      }
    })
  }

  ngOnInit(): void {

  }
  onlyUnique(value:any, index:any, self:any) {
    return self.indexOf(value) === index;
  }
  detectImages() {
    this.detectingImageAITags = true
    let temp: boolean = false
    cocoSsd.load({
      base: 'mobilenet_v2'
    }).then((model:any) => {
      let images = document.querySelectorAll('img.contentImage')
      this.videoxi[0].categories = []
      images.forEach((image:any) => {
        model.detect(image).then((predictions:any) => {
          let src = image.getAttribute('src').split('/')
          this.videoxi.forEach((videoxi:any) => {
            videoxi.files.forEach((file:any) => {
              if(file.filepath.indexOf(src[5]) > -1) {
                if(file.categories) {
                  predictions.forEach((prediction:any) => {
                    if(file.categories.length) {
                      file.categories.forEach((category:any) => {
                        if(category.class === prediction.class) {
                          file.categories = file.categories.concat([prediction])
                          let tempArray = file.categories.filter(this.onlyUnique);
                          file.categories = tempArray
                        }
                      })
                    } else {
                      file.categories = file.categories.concat([prediction])
                      let tempArray = file.categories.filter(this.onlyUnique);
                      file.categories = tempArray
                    }
                  })
                } else {
                }
                videoxi.categories = videoxi.categories.concat(predictions)
                file.categories = predictions
                temp = true
              }
            })
          })
          this.detectingImageAITags = false
        });
      })
    });
  }
  playSound(file:any) {
    file.play = true
    setTimeout(() => {
      let playSound: HTMLMediaElement = document.createElement('audio')
      Pizzicato.context.createMediaElementSource(playSound);
      let playSoundDiv = document.querySelectorAll('div.playSound')
      console.log(playSound)
      playSoundDiv[0].appendChild(playSound)
    }, 1000)
  }
  getPizzicatoContext() {
    this.audioContext = Pizzicato.context
    console.log(this.audioContext)
  }
  addGroup() {
    this.group = new Pizzicato.Group();
  }
  addSound(file: any) {
    new Promise((hyva:any, paha:any) => {
      var sound = new Pizzicato.Sound({ 
        source: 'file',
        options: { path: file.name }
      }, () => {
        console.log(sound)
        file.sound = sound
        this.sounds.push(sound)
        //this.group.addSound(sound)
        hyva()
      });
    })
  }
  addDelay(target: any) {
    console.log(target)
    let delay = new Pizzicato.Effects.Delay();
    target.addEffect(delay)
  }
  addDistortion(target: any) {
    console.log(target)
    var distortion = new Pizzicato.Effects.Distortion({
      gain: 0.4
    });
    target.addEffect(distortion)
  }
  addQuadrafuzz(target: any) {
    console.log(target)
    var quadrafuzz = new Pizzicato.Effects.Quadrafuzz({
      lowGain: 0.6,
      midLowGain: 0.8,
      midHighGain: 0.5,
      highGain: 0.6,
    });
    target.addEffect(quadrafuzz)
  }
  addFlanger(target: any) {
    console.log(target)
    var flanger = new Pizzicato.Effects.Flanger({
      time: 0.45,
      speed: 0.2,
      depth: 0.1,
      feedback: 0.1,
      mix: 0.5
    });
    target.addEffect(flanger)
  }
  addCompressor(target: any) {
    console.log(target)
    var compressor = new Pizzicato.Effects.Compressor({
      threshold: -20,
      knee: 22,
      attack: 0.05,
      release: 0.05,
      ratio: 18
    });
    target.addEffect(compressor)
  }
  addLowPassFilter(target: any) {
    console.log(target)
    var lowPassFilter = new Pizzicato.Effects.LowPassFilter({
      frequency: 400,
      peak: 10
    });
    target.addEffect(lowPassFilter)
  }
  addHighPassFilter(target: any) {
    console.log(target)
    var highPassFilter = new Pizzicato.Effects.HighPassFilter({
        frequency: 120,
        peak: 10
    });
    target.addEffect(highPassFilter)
  }
  addStereoPanner(target: any) {
    console.log(target)
    var stereoPanner = new Pizzicato.Effects.StereoPanner({
      pan: 0.5
    });
    target.addEffect(stereoPanner)
  }
  addReverb(target: any) {
    console.log(target)
    var reverb = new Pizzicato.Effects.Reverb({
      time: 1,
      decay: 0.8,
      reverse: true,
      mix: 0.5
    });
    target.addEffect(reverb)
  }
  addRingModulator(target: any) {
    console.log(target)
    var ringModulator = new Pizzicato.Effects.RingModulator({
      speed: 10,
      distortion: 4,
      mix: 0.5
    });
    target.addEffect(ringModulator)
  }
  addTremolo(target: any) {
    console.log(target)
    var tremolo = new Pizzicato.Effects.Tremolo({
      speed: 5,
      depth: 1,
      mix: 0.5
    });
    target.addEffect(tremolo)
  }
  updateFilesInTransition(name:string, speed:string, progress:number) {
    let found = false
    this.filesInTransition.forEach((elem, ind) => {
      if(elem.name === name) {
        elem.speed = speed
        elem.progress = progress
        found = true
      }
    })
    if(!found) {
      this.filesInTransition.push({
        name: name,
        speed: speed,
        progress: progress
      })
    }
  }
  addNewVideoxiSecond() {
    this.files2.forEach((elem:any) => {
      this.videoxi[0].files.push(elem)
    })

    setTimeout(() => {
      this.videoxi[0].files.forEach((file:any, ind:number) => {
        if(file.file.type === 'video/mp4') {
          var video:any = document.getElementById(file.id);
          video.preload = 'metadata';
          video.onloadedmetadata = function() {
            file.duration = video.duration
          }
        }
      })
    }, 1000)
    this.files2 = []
  }
  addNewVideoxi() {
    let newVideoxi = {
      id: this.makeid(5) + '-' + this.makeid(5) + '-' + this.makeid(5) + '-' + this.makeid(5),
      files: this.files,
      ready: false,
      started: false,
      genre: this.genre,
      categories: []
    }
    this.videoxi.push(newVideoxi)
    setTimeout(() => {
      newVideoxi.files.forEach((file:any, ind:number) => {
        if(file.file.type === 'video/mp4') {
          var video:any = document.getElementById(file.id);
          video.preload = 'metadata';
          video.onloadedmetadata = function() {
            file.duration = video.duration
          }
        }
        if(file.file.type.indexOf('audio') !== -1) {
          
          setTimeout(() => {
            let path: string = file.name
            console.log('Path: ', path)
            console.log(file)
            this.wavesurfer.load(path);
          }, 2000)
        }
      })
    }, 1000)
    this.files = []
  }
  changeGenre(e:any) {
    this.genre = e.target.value
  }
  createNewVideo(e:MouseEvent, newVideoxi:any) {
    e.preventDefault()
    e.stopPropagation()
    newVideoxi.ready = false
    newVideoxi.started = true
    newVideoxi.genre = this.genre
    this.backend.createVideoxi(newVideoxi)
  }
  changeImageText(e:any, file:any) {
    e.preventDefault()
    e.stopPropagation()
    file.text = e.target.value
  }
  changeImageSubtitle(e:any, file:any) {
    e.preventDefault()
    e.stopPropagation()
    file.subtitle = e.target.value
  }
  changeImageTitle(e:any, file:any) {
    e.preventDefault()
    e.stopPropagation()
    file.title = e.target.value
  }
  moveBack(e:MouseEvent, video:any, index:number) {
    e.preventDefault()
    e.stopPropagation()
    let file = video.files[index]
    video.files.splice(index, 1)
    video.files.splice((index-1), 0, file)
  }
  moveForward(e:MouseEvent, video:any, index:number) {
    e.preventDefault()
    e.stopPropagation()
    let file = video.files[index]
    video.files.splice(index, 1)
    video.files.splice((index+1), 0, file)
  }
  changeVideoStart(e:any, file:any) {
    e.preventDefault()
    e.stopPropagation()
    file.start = e.target.value
  }
  changeVideoEnd(e:any, file:any) {
    e.preventDefault()
    e.stopPropagation()
    file.stop = e.target.value
  }
  makeid(length:number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
