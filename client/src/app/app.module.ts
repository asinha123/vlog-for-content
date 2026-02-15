import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { VideoListComponent } from './video-list/video-list.component';
import { VideoPlayerComponent } from './video-player/video-player.component';

const routes: Routes = [
  { path: '', component: VideoListComponent },
  { path: 'video/:id', component: VideoPlayerComponent },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }
];

@NgModule({
  declarations: [AppComponent, VideoListComponent, VideoPlayerComponent],
  imports: [BrowserModule, HttpClientModule, RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
