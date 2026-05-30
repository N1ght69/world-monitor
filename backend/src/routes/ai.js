import express from 'express'
import axios from 'axios'

const router = express.Router()

const SYSTEM_PROMPT = `You are a world-class intelligence analyst for a real-time geopolitical monitoring platform. Respond with dense, specific, actionable analysis in 3–5 sentences. Use precise language. Active situations: Ukraine war (Kharkiv front), Gaza IDF operations, Sudan RSF advance, Houthi Red Sea attacks, Iran 60% enrichment, Taiwan PLA exercises, North Korea ICBM preps. Markets: Fed Sept cut 68%, VIX 21, WTI $87, Gold $2341.`

router.post('/', async (req, res) => {
  const { query } = req.body
  if (!query) return res.status(400).json({ error: 'query required' })

  const key = process.env.ANTHROPIC_KEY
  if (!key) return res.status(503).json({ error: 'ANTHROPIC_KEY not configured' })

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: query }],
      },
      {
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        timeout: 30000,
      }
    )
    const text = response.data.content?.[0]?.text || 'Analysis unavailable.'
    res.json({ text })
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message
    res.status(502).json({ error: msg })
  }
})

export default router
