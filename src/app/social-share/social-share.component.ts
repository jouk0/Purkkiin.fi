import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service'
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-social-share',
  templateUrl: './social-share.component.html',
  styleUrls: ['./social-share.component.scss']
})
export class SocialShareComponent implements OnInit {

  public torrents: Array<any> = []
  public videoId: number = 0
  public videoObject: any;
  public showVideo: boolean = false
  constructor(
    public backend: BackendService,
    private route: ActivatedRoute,
  ) {
    this.backend.update()
    this.backend.videoTorrentObserver.subscribe((response:any) => {
      if(response) {
        this.torrents = response
        this.torrents.forEach((elem:any, ind:number) => {
          elem.show = true
          elem.name = elem.name.replace(/_/gi, ' ')
          let date = new Date(elem.date)
          elem.humanDate = date.getDate() + '.' + (date.getMonth()+1) + '.' + date.getFullYear()
        })
        
        this.showVideo = false
        this.route.params.subscribe(params => {
          this.videoId = params['id'];
          this.torrents.forEach((video: any, ind:number) => {
            let temp: number = (parseInt(params['id']) + 1)
            let temp2 = ind + 1
            if(temp === temp2) {
              this.videoObject = video
              this.showVideo = true
            }
          })
        });
      }
    })
  }

  ngOnInit(): void {
    this.showVideo = false
  }
  playEvent(event:any, torrent:any) {
    this.backend.statisticsForVideo(torrent)
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
