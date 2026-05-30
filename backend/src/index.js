require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const cron = require('node-cron');

const seed = require('./seed');
const fetchNews = require('./newsFetcher');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/news', require('./routes/news'));
app.use('/api/markets', require('./routes/markets'));
app.use('/api/events', require('./routes/events'));
app.use('/api/stream', require('./routes/streams'));
app.use('/api/ai', require('./routes/ai'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

// Fetch news every 2 minutes and broadcast new articles
cron.schedule('*/2 * * * *', async () => {
  const newArticles = await fetchNews();
  if (newArticles.length > 0) {
    io.emit('news:update', newArticles);
    console.log(`Broadcast ${newArticles.length} new articles`);
  }
});

import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.static(path.join(__dirname, '../../frontend/dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'))
})

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`World Monitor API started on port ${PORT}`);
  seed();
});
