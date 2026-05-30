import axios from 'axios'
import db from './db.js'

function classifyArticle(text) {
  text = text.toLowerCase()
  if (/war|attack|bomb|missile|troops|conflict|strike|military/.test(text)) return 'conflict'
  if (/oil|gas|energy|opec|pipeline|crude|nuclear/.test(text)) return 'energy'
  if (/stock|market|fed|rate|inflation|dollar|gdp|trade/.test(text)) return 'markets'
  return 'geo'
}

function isBreaking(title) {
  return /breaking|urgent|alert|just in|developing/i.test(title)
}

async function fetchNewsAPI(key) {
  const queries = ['war conflict military', 'geopolitical sanctions', 'oil energy opec', 'nato ukraine russia']
  const q = queries[Math.floor(Math.random() * queries.length)]
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=10&language=en&apiKey=${key}`
  const res = await axios.get(url, { timeout: 8000 })
  if (res.data.status !== 'ok') throw new Error(res.data.message)
  return res.data.articles.map(a => ({
    headline: a.title,
    source: (a.source.name || 'NEWS').toUpperCase().slice(0, 14),
    url: a.url,
    category: classifyArticle(a.title + ' ' + (a.description || '')),
    published_at: a.publishedAt,
    breaking: isBreaking(a.title),
  }))
}

async function fetchGNews(key) {
  const topics = ['world', 'nation', 'business']
  const topic = topics[Math.floor(Math.random() * topics.length)]
  const url = `https://gnews.io/api/v4/top-headlines?topic=${topic}&lang=en&max=10&apikey=${key}`
  const res = await axios.get(url, { timeout: 8000 })
  return res.data.articles.map(a => ({
    headline: a.title,
    source: (a.source.name || 'GNEWS').toUpperCase().slice(0, 14),
    url: a.url,
    category: classifyArticle(a.title + ' ' + (a.description || '')),
    published_at: a.publishedAt,
    breaking: isBreaking(a.title),
  }))
}

const insert = db.prepare(`
  INSERT OR IGNORE INTO news_cache (headline, source, url, category, published_at, fetched_at)
  VALUES (?, ?, ?, ?, ?, ?)
`)

async function fetchNews() {
  const { NEWSAPI_KEY, GNEWS_KEY } = process.env
  let articles = []

  try {
    if (NEWSAPI_KEY) articles = await fetchNewsAPI(NEWSAPI_KEY)
    else if (GNEWS_KEY) articles = await fetchGNews(GNEWS_KEY)
  } catch (e) {
    console.warn('News fetch failed:', e.message)
    return []
  }

  const now = Date.now()
  const newArticles = []
  const insertMany = db.transaction((items) => {
    for (const a of items) {
      const info = insert.run(a.headline, a.source, a.url, a.category, a.published_at, now)
      if (info.changes > 0) newArticles.push(a)
    }
  })
  insertMany(articles)

  db.prepare('DELETE FROM news_cache WHERE id NOT IN (SELECT id FROM news_cache ORDER BY fetched_at DESC LIMIT 200)').run()

  return newArticles
}

export default fetchNews
