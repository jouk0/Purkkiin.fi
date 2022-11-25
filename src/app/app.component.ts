import { Component } from '@angular/core';
import { BackendService } from './backend.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mp3ToVideo';
  public download: number = 0
  public upload: number = 0
  public jobsCount: number = 0
  public jobsCurrent: number = 0
  public showLogin: boolean = false
  
  constructor(
    private backend: BackendService
  ) {
    this.backend.jobsObserver.subscribe((response:any) => {
      if(response) {
        this.jobsCurrent = response.active
        this.jobsCount = response.waiting
      }
    })
  }
  login() {
    this.showLogin = !this.showLogin
  }
  sendLogin(username:HTMLInputElement, password:HTMLInputElement) {
    this.backend.login(username.value, password.value)
    this.login()
  }
  update() {
    this.backend.update()
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
