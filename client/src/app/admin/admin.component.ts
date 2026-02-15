import { Component } from '@angular/core';
import { VideoService } from '../video.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent {
  file?: File;
  title = '';
  description = '';

  constructor(private vs: VideoService) {}

  onFile(event: any) {
    const f = event.target.files && event.target.files[0];
    if (f) this.file = f;
  }

  upload() {
    if (!this.file) return;
    const fd = new FormData();
    fd.append('video', this.file);
    fd.append('title', this.title);
    fd.append('description', this.description);
    this.vs.upload(fd).subscribe(() => alert('Uploaded'));
  }
}
