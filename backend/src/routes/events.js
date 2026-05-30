import express from 'express'
import db from '../db.js'

const router = express.Router()

router.get('/', (req, res) => {
  const { layer, severity } = req.query
  const conditions = []
  const params = []
  if (layer) { conditions.push('layer = ?'); params.push(layer) }
  if (severity) { conditions.push('severity = ?'); params.push(severity) }
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : ''
  const rows = db.prepare('SELECT * FROM events' + where + ' ORDER BY ts DESC').all(...params)
  res.json(rows)
})

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Not found' })
  res.json(row)
})

export default router
