import express from 'express'
import axios from 'axios'

const router = express.Router()

let cache = null
let cacheTs = 0
const CACHE_TTL = 60000

function fmtChange(n) {
  if (n == null) return '0.00%'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

async function buildMarkets() {
  const [cryptoRes, fxRes] = await Promise.allSettled([
    axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true', { timeout: 8000 }),
    axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 8000 }),
  ])

  const result = []

  if (cryptoRes.status === 'fulfilled') {
    const d = cryptoRes.value.data
    const coins = [
      { key: 'bitcoin', s: 'BTC' },
      { key: 'ethereum', s: 'ETH' },
      { key: 'solana', s: 'SOL' },
    ]
    for (const { key, s } of coins) {
      if (!d[key]) continue
      const v = d[key].usd
      const c = d[key].usd_24h_change ?? 0
      result.push({ s, v: v.toFixed(2), c: fmtChange(c), u: c >= 0 })
    }
  }

  if (fxRes.status === 'fulfilled') {
    const rates = fxRes.value.data.rates || {}
    const pairs = [
      { s: 'EUR/USD', rate: rates.EUR ? (1 / rates.EUR) : null },
      { s: 'USD/JPY', rate: rates.JPY ?? null },
      { s: 'GBP/USD', rate: rates.GBP ? (1 / rates.GBP) : null },
    ]
    for (const { s, rate } of pairs) {
      if (rate == null) continue
      result.push({ s, v: rate.toFixed(4), c: '0.00%', u: true })
    }
  }

  const fallback = [
    { s: 'S&P 500', v: '5248.42', c: '+0.42%', u: true },
    { s: 'NASDAQ', v: '16440.00', c: '+0.61%', u: true },
    { s: 'DOW', v: '38912.00', c: '-0.09%', u: false },
    { s: 'GOLD', v: '2341.00', c: '+0.80%', u: true },
    { s: 'WTI', v: '87.30', c: '+1.20%', u: true },
    { s: 'BRENT', v: '91.45', c: '+0.95%', u: true },
    { s: 'VIX', v: '21.40', c: '+0.80%', u: true },
  ]
  const existing = new Set(result.map(r => r.s))
  for (const f of fallback) {
    if (!existing.has(f.s)) result.push(f)
  }

  return result
}

router.get('/', async (req, res) => {
  const now = Date.now()
  if (cache && now - cacheTs < CACHE_TTL) {
    return res.json(cache)
  }
  try {
    cache = await buildMarkets()
    cacheTs = now
    res.json(cache)
  } catch (err) {
    if (cache) return res.json(cache)
    res.status(502).json({ error: 'Markets unavailable', detail: err.message })
  }
})

export default router
