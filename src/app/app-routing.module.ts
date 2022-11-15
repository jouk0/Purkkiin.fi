import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { UploadComponent } from './upload/upload.component'
import { TorrentsComponent } from './torrents/torrents.component'
import { FourOFourComponent } from './four-ofour/four-ofour.component'
import { VideoComponent } from './video/video.component'
import { VideoxiComponent } from './videoxi/videoxi.component'
import { SocialShareComponent } from './social-share/social-share.component'
import { AitagsComponent } from './aitags/aitags.component'
import { OpennodeComponent } from './opennode/opennode.component'
const routes: Routes = [{
  path: '', component: HomeComponent
}, {
  path: 'upload', component: UploadComponent
}, {
  path: 'torrents', component: TorrentsComponent
}, {
  path: 'video', component: VideoComponent
}, {
  path: 'editor', component: VideoxiComponent
}, {
  path: 'video/:id', component: SocialShareComponent
},{
  path: 'aitags', component: AitagsComponent
},{
  path: 'opennode', component: OpennodeComponent
}, {
  path: '**', component: FourOFourComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
