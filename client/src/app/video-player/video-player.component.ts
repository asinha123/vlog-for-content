import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VideoService, VideoMeta } from '../video.service';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html'
})
export class VideoPlayerComponent implements OnInit {
  video?: VideoMeta;
  src = '';

  constructor(private route: ActivatedRoute, private vs: VideoService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.vs.list().subscribe(list => {
      this.video = list.find(x => x.id === id);
      if (this.video) {
        this.src = `http://localhost:3000/api/videos/${this.video.id}/stream`;
      }
    });
  }

  onPlay() {
    if (!this.video) return;
    this.vs.incrementView(this.video.id).subscribe();
  }
}
