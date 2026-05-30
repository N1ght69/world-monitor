import 'dotenv/config'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import cron from 'node-cron'
import { fileURLToPath } from 'url'
import path from 'path'

import seed from './seed.js'
import fetchNews from './newsFetcher.js'
import newsRouter from './routes/news.js'
import marketsRouter from './routes/markets.js'
import eventsRouter from './routes/events.js'
import streamsRouter from './routes/streams.js'
import aiRouter from './routes/ai.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
})

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/news', newsRouter)
app.use('/api/markets', marketsRouter)
app.use('/api/events', eventsRouter)
app.use('/api/stream', streamsRouter)
app.use('/api/ai', aiRouter)

app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }))

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id))
})

cron.schedule('*/2 * * * *', async () => {
  const newArticles = await fetchNews()
  if (newArticles.length > 0) {
    io.emit('news:update', newArticles)
    console.log(`Broadcast ${newArticles.length} new articles`)
  }
})

app.use(express.static(path.join(__dirname, '../../frontend/dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'))
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`World Monitor API started on port ${PORT}`)
  seed()
})
