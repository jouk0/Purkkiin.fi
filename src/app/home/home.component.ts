import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service'
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as EmailValidator from 'email-validator';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { CommentDialog } from './commentDialog/commentDialog'
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

declare const cocoSsd: any;

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
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
  public email: string = ''
  public form: FormGroup;
  public rating3:number = 0
  public ratingForms: Array<FormGroup> = []
  constructor(
    public backend: BackendService,
    public dialog: MatDialog,
    private fb: FormBuilder
  ) {

    this.rating3 = 0;
    this.form = this.fb.group({
      rating: ['', Validators.required],
    })
    this.backend.videoTorrentObserver.subscribe((response:any) => {
      if(response) {
        this.torrents = response
        let genreArr: Array<string> = []
        let tagArr: Array<any> = []
        this.torrents.forEach((elem:any, ind:number) => {
          this.ratingForms.push(this.fb.group({
            rating: ['', Validators.required],
          }))
          elem.show = true
          elem.name = elem.name.replace(/_/gi, ' ')
          let date = new Date(elem.date)
          elem.ratingId = date.getTime()
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
    this.backend.statisticOsbserver.subscribe((response:any) => {
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
    this.backend.haeArvostelut()
    this.backend.arvostelutOsbserver.subscribe((response:any) => {
      if(response) {
        console.log(response)
      }
    })
    let localStorageEmail: any = localStorage.getItem('email')
    if(localStorageEmail) {
      let emailLocalstorage: any = JSON.parse(localStorageEmail)
      if(emailLocalstorage) {
        this.email = emailLocalstorage.email
      }
    }
  }

  ngOnInit(): void {
  }
  validateEmail(email:string): boolean {
    return EmailValidator.validate(email)
  }
  ratingChange(e:any, i:number, rating:number) {
    this.backend.lahetaArvostelut(this.torrents[i], rating)
  }
  openComments(e:MouseEvent, torrent:any, commentClass: string) {
    e.preventDefault()
    e.stopPropagation()
    const dialogRef = this.dialog.open(CommentDialog, {
      width: '450px',
      data: { torrent: torrent },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  updateEmail(e:Event, inputClass: string) {
    let input: any = document.querySelectorAll('input.' + inputClass)[0]
    input.classList.remove('notvalid')
    let email: any = input.value
    if(EmailValidator.validate(email)) {
      this.email = email
      localStorage.setItem('email', JSON.stringify({
        email: this.email
      }))
      this.backend.saveEmail(this.email)
    } else {
      input.classList.add('notvalid')
    }
  }
  downloadMP4(e:MouseEvent, torrent:any, inputClass:string, videoName: string) {
    e.preventDefault()
    e.stopPropagation()
    let input: any = document.querySelectorAll('input.' + inputClass)[0]
    input.classList.remove('notvalid')
    let email: any = input.value
    if(EmailValidator.validate(email)) {
      let torrentUrl: string = this.backend.backend + '/videoLibrary/' + torrent.filename
      window.open(torrentUrl, '_blank')
      this.backend.donate(email, videoName)
    } else {
      input.classList.add('notvalid')
    }
  }
  downloadMKV(e:MouseEvent, torrent:any, inputClass:string, videoName: string) {
    e.preventDefault()
    e.stopPropagation()
    let input: any = document.querySelectorAll('input.' + inputClass)[0]
    let email: any = input.value
    if(EmailValidator.validate(email)) {
      let torrentUrl: string = this.backend.backend + '/videoLibrary/' + torrent.matroskaVideo.replace('C:\\projektit\\MatroskaTesti/videos/', '')
      window.open(torrentUrl, '_blank')
      input.classList.remove('notvalid')
      this.backend.donate(email, videoName)
    } else {
      input.classList.add('notvalid')
    }
  }
  donate(e:MouseEvent, inputClass:string, videoName: string) {
    e.preventDefault()
    e.stopPropagation()
    let input: any = document.querySelectorAll('input.' + inputClass)[0]
    let email: any = input.value
    if(EmailValidator.validate(email)) {
      this.backend.donate(email, videoName)
    } else {
      input.classList.add('notvalid')
    }
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
  playEvent(e:any, torrent:any, inputClass:string, videoName: string) {
    let input: any = document.querySelectorAll('input.' + inputClass)[0]
    let email: any = input.value
    input.classList.remove('notvalid')
    if(EmailValidator.validate(email)) {
      //this.backend.donate(email, videoName)
    } else {
      input.classList.add('notvalid')
    }
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
  
  onTimeUpdate() {
      console.log("Event: onTimeUpdate");
  }

  onCanPlay() {
      console.log("Event: onCanPlay")
  }

  onLoadedMetadata() {
      console.log("Event: onLoadedMetadata")
  }
}