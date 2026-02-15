import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface VideoMeta {
  id: string;
  filename: string;
  title: string;
  description?: string;
  views: number;
}

@Injectable({ providedIn: 'root' })
export class VideoService {
  private base = 'http://localhost:3000/api';
  constructor(private http: HttpClient) {}

  list(): Observable<VideoMeta[]> {
    return this.http.get<VideoMeta[]>(`${this.base}/videos`);
  }

  upload(formData: FormData) {
    return this.http.post(`${this.base}/upload`, formData);
  }

  incrementView(id: string) {
    return this.http.post(`${this.base}/videos/${id}/view`, {});
  }
}
