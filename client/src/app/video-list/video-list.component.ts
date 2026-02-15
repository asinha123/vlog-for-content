import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VideoService, VideoMeta } from '../video.service';

@Component({
  selector: 'app-video-list',
  templateUrl: './video-list.component.html'
})
export class VideoListComponent implements OnInit {
  videos: VideoMeta[] = [];
  constructor(private vs: VideoService, private router: Router) {}

  ngOnInit() {
    this.vs.list().subscribe(v => (this.videos = v));
  }

  open(video: VideoMeta) {
    this.router.navigate(['/video', video.id]);
  }

  trackById(index: number, item: VideoMeta) {
    return item.id;
  }
}
