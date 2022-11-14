import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service'
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GoogleAnalyticsService } from 'ngx-google-analytics';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { IVideoConfig } from "ngx-video-list-player";

declare const cocoSsd: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public config: IVideoConfig = {
    isVideoLoader: true,
    isAutoPlay: true,
    sources: []
  }
  public torrents: Array<any> = []
  public showUpload: boolean = false
  public myControl = new FormControl();
  public options: string[] = [];
  public optionsOriginal: string[] = [];
  public filteredOptions: Observable<string[]>;
  public showFilter: boolean = false
  public statistics: Array<any> = []
  public reversed: boolean = false
  public toppings = new FormControl('');
  public toppingList: string[] = [];
  public tagsArr: Array<any> = [];
  public tagsEnabled: Array<any> = []
  public showVideoList: boolean = false
  constructor(
    public backend: BackendService,
    private $gaService: GoogleAnalyticsService
  ) {
    this.backend.videoTorrentObserver.subscribe((response:any) => {
      if(response) {
        this.torrents = response
        let genreArr: Array<string> = []
        let tagArr: Array<any> = []
        this.torrents.forEach((elem:any, ind:number) => {
          elem.show = true
          elem.name = elem.name.replace(/_/gi, ' ')
          this.config.sources.push({
            src: this.backend.backend + '/videoLibrary/' + elem.filename,
            videoName: elem.name,
            artist: elem.name,
            isYoutubeVideo: false
          })
          console.log(this.config)
          let date = new Date(elem.date)
          elem.humanDate = date.getDate() + '.' + (date.getMonth()+1) + '.' + date.getFullYear()
          this.options.push(elem.name)
          this.optionsOriginal.push(elem.name)
          if(elem.categories) {
            elem.categories.forEach((elem2:any, ind2:number) => {
              let found4 = false
              tagArr.forEach((tag4) => {
                if(tag4.name === elem2.class) {
                  found4 = true
                  tag4.count += 1
                }
              })
              if(!found4) {
                tagArr.push({
                  name: elem2.class,
                  count: 1
                })
              }
            })
          }
          let found = false
          genreArr.forEach((elem2, ind2) => {
            if(elem2 === elem.genre) {
              found = true
            }
          })
          if(!found) {
            if(elem.genre != '') {
              if(elem.genre != undefined) {
                genreArr.push(elem.genre)
              }
            }
          }
        })
        this.showVideoList = true
        this.tagsArr = tagArr
        this.toppingList = genreArr
        this.showFilter = true
        
      }
    })
    
    this.filteredOptions = this.myControl.valueChanges.pipe(startWith(''),
      map(value =>  {
        return this._filter(value)
    }));
    this.backend.statisticsbserver.subscribe((response:any) => {
      if(response) {
        this.statistics = response
        this.torrents.forEach((elem:any, ind:number) => {
          this.statistics.forEach((elem2:any, ind2:number) => {
            if(elem.filename === elem2.path) {
              elem.plays = elem2.plays
            }
          })
        })
      }
    })
  }

  ngOnInit(): void {
  }
  updateTags(e:any, tag:any) {
    if(e.checked) {
      this.torrents.forEach((video:any, ind:number) => {
        video.show = false
        if(video.categories) {
          video.categories.forEach((category:any, ind2:number) => {
            if(category.class === tag.name) {
              console.log(category.class, tag)
              let found5 = false
              this.tagsEnabled.forEach((tagsEnabled, ind) => {
                if(tagsEnabled.name === tag.name) {
                  found5 = true
                }
              })
              if(!found5) {
                this.tagsEnabled.push({
                  name: category.class,
                  count: 1
                })
              } else {
                this.tagsEnabled.forEach((tagsEnabled, ind) => {
                  if(tagsEnabled.name === tag.name) {
                    tagsEnabled.count += 1
                  }
                })
              }
            }
          })
        }
      })
    } else {
      this.tagsEnabled.forEach((tagEnambled, ind) => {
        if(tagEnambled.name === tag.name) {
          this.tagsEnabled.splice(ind, 1)
        }
      })
    }
    this.torrents.forEach((video2:any, ind:number) => {
      video2.show = false
    })
    console.log(this.tagsEnabled)
    if(this.tagsEnabled.length) {
      this.tagsEnabled.forEach((tag2:any, ind2:number) => {
        this.torrents.forEach((video2:any, ind:number) => {
          if(video2.categories) {
            video2.categories.forEach((category2:any, ind2:number) => {
              if(category2.class === tag2.name) {
                video2.show = true
              }
            })
          }
        })
      })
    } else {
      this.torrents.forEach((video2:any, ind:number) => {
        video2.show = true
      })
    }
  }
  filterByGenere(e:any) {
    if(e.length) {
      this.torrents.forEach((elem:any, ind:number) => {
        elem.show = false
        if(e.indexOf(elem.genre) > -1) {
          elem.show = true
        }
      })
    } else {
      this.torrents.forEach((elem:any, ind:number) => {
        elem.show = true
      })
    }
  }
  filterVideos(e:any) {
    let value = e.option.value
    this.torrents.forEach((elem:any, ind:number) => {
      elem.show = true
      if(value !== elem.name) {
        elem.show = false
      }
    })
  }
  playEvent(e:any, torrent:any) {
    this.$gaService.event(torrent.name, 'videoList', 'Play video');
    this.backend.statisticsForVideo(torrent)
  }
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
  show(e:MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    this.showUpload = !this.showUpload
  }
  copyToClipBoard(e:MouseEvent, torrent: any) {
    navigator.clipboard.writeText(this.backend.backend+ '/videoLibrary/'+ torrent.filename);
  }
  orderByDate(e:MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if(!this.reversed) {
      this.torrents = this.torrents.sort((a: any, b:any) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })
      this.reversed = true
    } else {
      this.torrents = this.torrents.sort((a: any, b:any) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      this.reversed = false
    }
  }
  orderByPlays(e:MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if(!this.reversed) {
      this.torrents = this.torrents.sort((a: any, b:any) => {
        return new Date(a.plays).getTime() - new Date(b.plays).getTime()
      })
      this.reversed = true
    } else {
      this.torrents = this.torrents.sort((a: any, b:any) => {
        return new Date(b.plays).getTime() - new Date(a.plays).getTime()
      })
      this.reversed = false
    }
  }
  humanFileSize(bytes:any, si=false, dp=1) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = si 
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10**dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
  }
}