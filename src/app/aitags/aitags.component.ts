import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service'

declare const cocoSsd: any;

@Component({
  selector: 'app-aitags',
  templateUrl: './aitags.component.html',
  styleUrls: ['./aitags.component.scss']
})
export class AitagsComponent implements OnInit {
  public jobsList: Array<any> = []
  public images: Array<any> = []
  constructor(
    public backend: BackendService
  ) { 
    this.backend.jobsListObserver.subscribe((response:any) => {
      if(response) {
        console.log(response)
        this.jobsList = response.jobs
        this.jobsList.forEach((job:any, ind:number) => {
          if(job.progress === 100) {
            job.data.video.images.forEach((image:any, ind2:number) => {
              image.name = job.data.video.name
              this.images.push(image)
            })
          }
        })
        console.log(this.images)
      }
    })
  }

  ngOnInit(): void {
  }

  detectImages(e:any, image:any) {
    cocoSsd.load({
      base: 'mobilenet_v2'
    }).then((model:any) => {
      model.detect(e.path[0]).then((predictions:any) => {
        this.backend.updateAiTag(image.name, predictions)
      });
    });
  }
}
