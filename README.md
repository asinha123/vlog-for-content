# vlog-for-content

This repository contains a minimal Angular frontend and Node backend for a simple video upload and playback app.

Quick start

1. Start the backend server:

```bash
cd server
npm install
npm start
```

2. Start the Angular dev server in another terminal:

```bash
cd client
npm install
npm start
```

Open http://localhost:4200. Backend runs at http://localhost:3000.

Notes
- Admin UI: `/admin` — upload videos with title and description.
- Views: client calls `/api/videos/:id/view` on play to increment view count.
- Streaming: server supports range requests for efficient playback.
