import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http';
import { NgxFileUploaderModule } from '@uniprank/ngx-file-uploader';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Routes, RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { NgxVideoListPlayerModule } from 'ngx-video-list-player';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UploadComponent } from './upload/upload.component';
import { VideoComponent } from './video/video.component';
import { TorrentsComponent } from './torrents/torrents.component';
import { FourOFourComponent } from './four-ofour/four-ofour.component';
import { VideoxiComponent } from './videoxi/videoxi.component';
import { CdCoverComponent } from './cd-cover/cd-cover.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { SocialShareComponent } from './social-share/social-share.component';
import { FooterComponent } from './footer/footer.component';
import { AitagsComponent } from './aitags/aitags.component';
import { KayttoehdotComponent } from './kayttoehdot/kayttoehdot.component';
import { OpennodeComponent } from './opennode/opennode.component';
import { StatisticsComponent } from './statistics/statistics.component';

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
}, {
  path: '**', component: FourOFourComponent
}];
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UploadComponent,
    VideoComponent,
    TorrentsComponent,
    FourOFourComponent,
    VideoxiComponent,
    CdCoverComponent,
    SocialShareComponent,
    FooterComponent,
    AitagsComponent,
    KayttoehdotComponent,
    OpennodeComponent,
    StatisticsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(routes, { useHash: true }),
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    HttpClientModule,
    NgxFileUploaderModule.forRoot(),
    MatInputModule,
    MatFormFieldModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    MatDialogModule,
    MatAutocompleteModule,
    NgxGoogleAnalyticsModule.forRoot('G-VSWLPQF7GY'),
    MatCheckboxModule,
    MatSelectModule,
    NgxVideoListPlayerModule,
    NgxChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
