import express from 'express'
import axios from 'axios'
import db from '../db.js'

const router = express.Router()

const CACHE_TTL = 5 * 60 * 1000

function classify(text) {
  text = (text || '').toLowerCase()
  if (/war|attack|bomb|missile|troops|conflict|strike|military|insurgent|battle|ceasefire|offensive/.test(text)) return 'conflict'
  if (/oil|gas|energy|opec|pipeline|crude|nuclear|reactor|uranium/.test(text)) return 'energy'
  if (/stock|market|fed|rate|inflation|dollar|gdp|trade|tariff|recession|economy|crypto|bitcoin/.test(text)) return 'markets'
  return 'geo'
}

function isBreaking(title) {
  return /breaking|urgent|alert|just in|developing/i.test(title)
}

function normalize(articles) {
  const seen = new Set()
  return articles.filter(a => {
    if (!a.headline || seen.has(a.headline)) return false
    seen.add(a.headline)
    return true
  })
}

async function fetchNewsAPI(key) {
  const url = `https://newsapi.org/v2/everything?q=geopolitics+conflict+war&sortBy=publishedAt&pageSize=20&language=en&apiKey=${key}`
  const res = await axios.get(url, { timeout: 8000 })
  if (res.data.status !== 'ok') throw new Error(res.data.message)
  return res.data.articles.map(a => ({
    headline: a.title,
    source: (a.source?.name || 'NEWS').toUpperCase().slice(0, 14),
    url: a.url,
    category: classify((a.title || '') + ' ' + (a.description || '')),
    published_at: a.publishedAt,
    breaking: isBreaking(a.title),
  }))
}

async function fetchGNews(key) {
  const url = `https://gnews.io/api/v4/top-headlines?topic=world&lang=en&max=10&apikey=${key}`
  const res = await axios.get(url, { timeout: 8000 })
  return (res.data.articles || []).map(a => ({
    headline: a.title,
    source: (a.source?.name || 'GNEWS').toUpperCase().slice(0, 14),
    url: a.url,
    category: classify((a.title || '') + ' ' + (a.description || '')),
    published_at: a.publishedAt,
    breaking: isBreaking(a.title),
  }))
}

async function fetchNewsData(key) {
  const url = `https://newsdata.io/api/1/news?apikey=${key}&language=en&category=world,politics`
  const res = await axios.get(url, { timeout: 8000 })
  return (res.data.results || []).map(a => ({
    headline: a.title,
    source: (a.source_id || 'NEWSDATA').toUpperCase().slice(0, 14),
    url: a.link,
    category: classify((a.title || '') + ' ' + (a.description || '')),
    published_at: a.pubDate,
    breaking: isBreaking(a.title),
  }))
}

async function fetchHackerNews() {
  const topRes = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json', { timeout: 8000 })
  const ids = topRes.data.slice(0, 10)
  const stories = await Promise.allSettled(
    ids.map(id => axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 5000 }))
  )
  return stories
    .filter(r => r.status === 'fulfilled' && r.value.data?.title)
    .map(r => {
      const s = r.value.data
      return {
        headline: s.title,
        source: 'HACKERNEWS',
        url: s.url || `https://news.ycombinator.com/item?id=${s.id}`,
        category: classify(s.title),
        published_at: new Date(s.time * 1000).toISOString(),
        breaking: false,
      }
    })
}

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO news_cache (headline, source, url, category, published_at, fetched_at)
  VALUES (?, ?, ?, ?, ?, ?)
`)

async function fetchAndCache() {
  const { NEWSAPI_KEY, GNEWS_KEY, NEWSDATA_KEY } = process.env
  const fetches = [fetchHackerNews()]
  if (NEWSAPI_KEY) fetches.push(fetchNewsAPI(NEWSAPI_KEY))
  if (GNEWS_KEY) fetches.push(fetchGNews(GNEWS_KEY))
  if (NEWSDATA_KEY) fetches.push(fetchNewsData(NEWSDATA_KEY))

  const results = await Promise.allSettled(fetches)
  const all = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)

  const articles = normalize(all)
  const now = Date.now()

  const insertMany = db.transaction((items) => {
    for (const a of items) {
      insertStmt.run(a.headline, a.source, a.url, a.category, a.published_at, now)
    }
  })
  insertMany(articles)

  db.prepare('DELETE FROM news_cache WHERE id NOT IN (SELECT id FROM news_cache ORDER BY fetched_at DESC LIMIT 300)').run()

  return articles
}

router.get('/', async (req, res) => {
  const { category } = req.query
  const cutoff = Date.now() - CACHE_TTL

  const fresh = db.prepare('SELECT COUNT(*) as c FROM news_cache WHERE fetched_at > ?').get(cutoff)
  if (fresh.c > 0) {
    const catWhere = category && category !== 'all' ? ' AND category = ?' : ''
    const params = category && category !== 'all' ? [cutoff, category] : [cutoff]
    const rows = db.prepare(`SELECT * FROM news_cache WHERE fetched_at > ?${catWhere} ORDER BY published_at DESC LIMIT 100`).all(...params)
    return res.json(rows)
  }

  try {
    const articles = await fetchAndCache()
    const filtered = category && category !== 'all'
      ? articles.filter(a => a.category === category)
      : articles
    filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    res.json(filtered)
  } catch (err) {
    const rows = db.prepare('SELECT * FROM news_cache ORDER BY published_at DESC LIMIT 100').all()
    res.json(rows)
  }
})

router.post('/clear-cache', (req, res) => {
  db.prepare('DELETE FROM news_cache').run()
  res.json({ ok: true })
})

export default router
