import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service'
@Component({
  selector: 'app-torrents',
  templateUrl: './torrents.component.html',
  styleUrls: ['./torrents.component.scss']
})
export class TorrentsComponent implements OnInit {

  constructor(
    private backend: BackendService
  ) {
  }

  ngOnInit(): void {
  }

}
