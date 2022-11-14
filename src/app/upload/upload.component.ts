import { Component, OnInit } from '@angular/core';
import { FileUploadService, FileUploader } from '@uniprank/ngx-file-uploader';
import { BackendService } from '../backend.service'



@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  public uploader: FileUploader;
  public show = false
  public value: any = ''
  constructor(
    private backend: BackendService
  ) {
    this.uploader = new FileUploader({
      url: 'http://localhost:3000/upload',
      removeBySuccess: false,
      autoUpload: false,
      filters: []
    });
    this.uploader._onAddFile = (e:any) => {
    }
  }

  ngOnInit(): void {
    this.show = true
  }
}
