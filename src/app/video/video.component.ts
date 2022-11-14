import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service'

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit {
  public video: any;
  public show: boolean = false
  public width: number = window.screen.width
  constructor(
    private backend: BackendService
  ) {
    this.backend.videoTorrentObserver.subscribe((torrent:any) => {
      // Torrents can contain many files. Let's use the .mp4 file
      var file = torrent.files.find((file:any) => {
        return file.name.endsWith('.mp4')
      })
      // Display the file by adding it to the DOM.
      // Supports video, audio, image files, and more!
      this.video = file
    })
  }

  ngOnInit(): void {
    this.show = true
    setTimeout(() => {
      this.video.appendTo('section.videoPlayer')
    }, 100)
  }

}
