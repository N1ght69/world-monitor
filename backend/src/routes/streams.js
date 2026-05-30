import express from 'express'

const router = express.Router()

const STREAMS = {
  aje:  'h3MuIUNCCLI',
  bbg:  'dp8PhLsUcFE',
  dw:   'mGnF_RdgRwE',
  sky:  '9Auq9mYxFEE',
  f24:  'h3c0pUesFZk',
  eur:  'rhefSTKH5CU',
  cnn:  'aXDgtHFMc2w',
  wion: 'FPAHMBkfPao',
}

router.get('/:channel', (req, res) => {
  const id = STREAMS[req.params.channel.toLowerCase()]
  if (!id) return res.status(404).json({ error: 'Unknown channel' })
  const url = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&origin=http://localhost:3001&controls=1&modestbranding=1&rel=0`
  res.redirect(url)
})

export default router
