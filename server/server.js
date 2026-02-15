const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DATA_FILE = path.join(__dirname, 'data', 'videos.json');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(path.dirname(DATA_FILE))) fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const id = uuidv4();
    const ext = path.extname(file.originalname) || '.mp4';
    const filename = id + ext;
    cb(null, filename);
  }
});

const upload = multer({ storage });

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) || [];
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/videos', (req, res) => {
  const data = readData();
  res.json(data);
});

app.post('/api/upload', upload.single('video'), (req, res) => {
  const { title, description } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file' });

  const id = path.parse(file.filename).name;
  const item = { id, filename: file.filename, title: title || file.originalname, description: description || '', views: 0 };
  const data = readData();
  data.unshift(item);
  writeData(data);
  res.json(item);
});

// Increment view count
app.post('/api/videos/:id/view', (req, res) => {
  const id = req.params.id;
  const data = readData();
  const item = data.find(v => v.id === id);
  if (!item) return res.status(404).end();
  item.views = (item.views || 0) + 1;
  writeData(data);
  res.json({ views: item.views });
});

// Stream supporting range requests
app.get('/api/videos/:id/stream', (req, res) => {
  const id = req.params.id;
  const data = readData();
  const item = data.find(v => v.id === id);
  if (!item) return res.status(404).end();
  const filePath = path.join(UPLOAD_DIR, item.filename);
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on ${port}`));
