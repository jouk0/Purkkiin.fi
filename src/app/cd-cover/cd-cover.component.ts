import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cd-cover',
  templateUrl: './cd-cover.component.html',
  styleUrls: ['./cd-cover.component.scss']
})
export class CdCoverComponent implements OnInit {
  private date = new Date()
  public pages: Array<any> = [{
    covers: [{
      artist: 'Matti Meikäläinen',
      julkaisu: this.date.getDate() + '.' + (this.date.getMonth()+1) + '.' + this.date.getFullYear(),
      levynNimi: 'Kontulan nauhat',
      type: 'Single',
      biisit: [],
      copyright: 'cover copyright ' + new Date().getFullYear() + ' © Mika Petteri Korhonen',
      background: '/assets/bg3.jpg'
    },{
      biisit: [{
        name: 'Viimeiseen hetkeen asti',
        pituus: '3 min 8 sec'
      }],
      copyright: 'cover copyright ' + new Date().getFullYear() + ' © Mika Petteri Korhonen',
      background: '/assets/bg4.jpg'
    }]
  }]
  constructor() { }

  ngOnInit(): void {
  }
  changePublishDate(e:Event) {
    console.log(e)
  }
}
