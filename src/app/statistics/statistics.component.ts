import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service'
@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit {
  public showStatistics = false
  public single: any = [];
  public multi: any = []

  public view: any = [700, 400];

  // options
  public showXAxis = true;
  public showYAxis = true;
  public gradient = false;
  public showLegend = true;
  public showXAxisLabel = true;
  public xAxisLabel = 'Selaimet';
  public xAxisLabel2 = 'Sijainnit';
  public xAxisLabel3 = 'Alustat';
  public xAxisLabel4 = 'Käyttöjärjestelmät';
  public xAxisLabel5 = 'Selain versiot';
  public xAxisLabel6 = 'Päivämäärä';
  public showYAxisLabel = true;
  public yAxisLabel = 'Määrä';

  public colorScheme: any = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA', '#2b2a2a', '#1a1313']
  };

  public browserStatistics: Array<any> = []
  public platformStatistics: Array<any> = []
  public locationStatistics: Array<any> = []
  public osStatistics: Array<any> = []
  public browserVersionStatistics: Array<any> = []
  public kavijaStatistics: Array<any> = []
  public showKavijaStatistics: boolean = false
  constructor(private backend:BackendService) {
    this.backend.getKavijat()
    this.backend.kavijatOsbserver.subscribe((response:any) => {
      if(response) {
        response.kavijat.forEach((kavija:any, ind:number) => {
          if(kavija.date) {
            let found = false
            let kavijaDate = new Date(kavija.date)
            let kavijaDateString = kavijaDate.getDate() + '.' + (kavijaDate.getMonth()+1) + '.' + kavijaDate.getFullYear()
            this.kavijaStatistics.forEach((kavija2:any, ind:number) => {
              let kavija2Date = kavija2.name
              if(kavijaDateString === kavija2Date) {
                found = true
                kavija2.value += 1
              }
            })
            if(!found) {
              this.kavijaStatistics.push({
                name: kavijaDateString,
                value: 1
              })
            }
          }
        })
        this.showKavijaStatistics = true
      }
    })
    this.backend.statisticOsbserver.subscribe((response:any) => {
      if(response) {
        response.forEach((song: any, ind:number) => {
          if(song.geoIp) {
            song.geoIp.forEach((header: any, ind2:number) => {
              let found = false
              this.locationStatistics.forEach((stat: any, ind3:number) => {
                if(stat.name === header.city) {
                  stat.value += 1
                  found = true
                }
              })
              if(!found) {
                this.locationStatistics.push({
                  name: header.city,
                  value: 1
                })
              }
            })
          }
          if(song.headers) {
            song.headers.forEach((header: any, ind2:number) => {
              let found = false
              this.browserStatistics.forEach((stat: any, ind3:number) => {
                if(stat.name === header.browser) {
                  stat.value += 1
                  found = true
                }
              })
              if(!found) {
                this.browserStatistics.push({
                  name: header.browser,
                  value: 1
                })
              }
              
              let found2 = false
              this.platformStatistics.forEach((stat: any, ind3:number) => {
                if(stat.name === header.platform) {
                  stat.value += 1
                  found2 = true
                }
              })
              if(!found2) {
                this.platformStatistics.push({
                  name: header.platform,
                  value: 1
                })
              }
              let found3 = false
              this.osStatistics.forEach((stat: any, ind3:number) => {
                if(stat.name === header.os) {
                  stat.value += 1
                  found3 = true
                }
              })
              if(!found3) {
                this.osStatistics.push({
                  name: header.os,
                  value: 1
                })
              }
              let found4 = false
              this.browserVersionStatistics.forEach((stat: any, ind3:number) => {
                if(stat.name === header.version) {
                  stat.value += 1
                  found4 = true
                }
              })
              if(!found4) {
                this.browserVersionStatistics.push({
                  name: header.version,
                  value: 1
                })
              }
            })
          }
        })
        /*
        console.log(this.browserStatistics)
        console.log(this.locationStatistics)
        console.log(this.platformStatistics)
        console.log(this.osStatistics)
        console.log(this.browserVersionStatistics)
        */
        this.showStatistics = true
      }
    })
  }

  ngOnInit(): void {
  }

  onSelect(event:any) {
    console.log(event);
  }
}
