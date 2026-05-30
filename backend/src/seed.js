const db = require('./db');

const EVENTS = [
  // Conflict
  { name: 'Ukraine — Kharkiv Front', lat: 49.9, lon: 36.3, layer: 'conflict', severity: 'high', detail: 'Active front line. Russian advances repelled near Vovchansk. Heavy artillery exchanges ongoing.' },
  { name: 'Gaza Strip', lat: 31.4, lon: 34.4, layer: 'conflict', severity: 'high', detail: 'IDF ground operations ongoing in Rafah corridor. Humanitarian crisis. 1.5M displaced.' },
  { name: 'Sudan — RSF Advance', lat: 15.6, lon: 32.5, layer: 'conflict', severity: 'high', detail: 'RSF forces within 20km of Port Sudan. SAF counteroffensive stalled. 8M+ displaced.' },
  { name: 'Red Sea — Houthi Zone', lat: 14.5, lon: 43.0, layer: 'conflict', severity: 'high', detail: 'Houthi anti-ship missile attacks on commercial vessels. 40% increase this month.' },
  { name: 'Myanmar Civil War', lat: 19.7, lon: 96.1, layer: 'conflict', severity: 'med', detail: 'Junta vs resistance forces. Aerial bombardment of Shan State civilian areas.' },
  { name: 'Somalia — Al-Shabaab', lat: 5.1, lon: 46.1, layer: 'conflict', severity: 'med', detail: 'Al-Shabaab insurgency. Multiple suicide attacks near Mogadishu.' },
  { name: 'DR Congo — M23 Rebels', lat: -1.7, lon: 29.2, layer: 'conflict', severity: 'med', detail: 'M23 rebel advance in eastern DRC. Goma under pressure. SADC forces engaged.' },
  { name: 'Sahel — Niger/Mali', lat: 13.5, lon: 2.1, layer: 'conflict', severity: 'med', detail: 'AES junta bloc. Africa Corps presence. French forces expelled. ECOWAS sanctions ongoing.' },
  { name: 'Haiti — Gang Control', lat: 18.5, lon: -72.3, layer: 'conflict', severity: 'med', detail: 'Viv Ansanm coalition controls 85% of Port-au-Prince. MSS multinational deployment ongoing.' },
  { name: 'Yemen Civil War', lat: 15.3, lon: 44.2, layer: 'conflict', severity: 'med', detail: 'Houthi–government conflict. Saudi coalition air support. UN peace talks stalled.' },
  { name: 'Ethiopia — Amhara', lat: 11.0, lon: 37.5, layer: 'conflict', severity: 'low', detail: 'Amhara Fano militia vs federal forces. Oromia insurgency ongoing.' },
  { name: 'Libya — Factional', lat: 27.0, lon: 18.0, layer: 'conflict', severity: 'low', detail: 'Eastern HoR vs GNU. Oil infrastructure flashpoints near Sirte.' },
  // Alerts / Intel
  { name: 'Taiwan Strait', lat: 23.5, lon: 120.0, layer: 'alerts', severity: 'high', detail: 'PLA naval exercises. PLAN carrier Shandong operating east of Taiwan. US CSG transit completed.' },
  { name: 'Iran Nuclear Program', lat: 32.4, lon: 53.7, layer: 'alerts', severity: 'high', detail: 'IAEA confirms 60% U-235 enrichment at Fordow. Breakout timeline 2–3 weeks. Strike risk elevated.' },
  { name: 'North Korea — ICBM', lat: 40.3, lon: 127.5, layer: 'alerts', severity: 'high', detail: 'Hwasong-19 ICBM test preparations at Tongchangri. KPA on elevated readiness.' },
  { name: 'South China Sea', lat: 14.0, lon: 114.0, layer: 'alerts', severity: 'med', detail: 'PLA Navy patrols. Philippines standoff at Second Thomas Shoal. BRP Sierra Madre resupply blocked.' },
  { name: 'Kosovo — Serbia Border', lat: 42.6, lon: 20.9, layer: 'alerts', severity: 'med', detail: 'Serbian troop buildup near northern Kosovo. KFOR reinforced. Diplomatic tensions escalating.' },
  { name: 'Russia-NATO Baltic', lat: 55.0, lon: 21.5, layer: 'alerts', severity: 'med', detail: 'Kaliningrad corridor pressure. GPS spoofing incidents. NATO Steadfast Defender exercise underway.' },
  { name: 'Venezuela Border', lat: 6.4, lon: -63.6, layer: 'alerts', severity: 'low', detail: 'Guyana border dispute. Maduro posturing. SOUTHCOM monitoring Essequibo region.' },
  { name: 'Pakistan Instability', lat: 30.4, lon: 69.3, layer: 'alerts', severity: 'med', detail: 'PTI protests vs military. IMF program under pressure. Nuclear command authority monitoring.' },
  // Military
  { name: 'Al Udeid Air Base', lat: 25.1, lon: 51.3, layer: 'military', severity: 'base', detail: 'USAF largest base in Middle East. Qatar. CENTCOM forward HQ. 10,000+ personnel.' },
  { name: 'Camp Lemonnier', lat: 11.5, lon: 43.1, layer: 'military', severity: 'base', detail: 'US AFRICOM. Djibouti. Critical Horn of Africa ops hub. MQ-9 operations.' },
  { name: 'Guam — Andersen AFB', lat: 13.5, lon: 144.9, layer: 'military', severity: 'base', detail: 'USAF. B-52 rotations. Critical Pacific deterrence hub. THAAD deployed.' },
  { name: 'Yokosuka Naval Base', lat: 35.3, lon: 139.6, layer: 'military', severity: 'base', detail: 'US 7th Fleet HQ. Japan. Carrier USS George Washington homeport.' },
  { name: 'RAF Akrotiri', lat: 34.5, lon: 32.9, layer: 'military', severity: 'base', detail: 'UK Sovereign Base Area. Cyprus. Active ISR missions over Middle East and Black Sea.' },
  // Nuclear
  { name: 'Zaporizhzhia NPP', lat: 47.5, lon: 34.6, layer: 'nuclear', severity: 'high', detail: "Europe's largest nuclear plant. Under Russian control. IAEA monitoring. External power unstable." },
  { name: 'Natanz Enrichment', lat: 33.7, lon: 51.9, layer: 'nuclear', severity: 'high', detail: 'Iran centrifuge facility. 60% enrichment confirmed. Underground hardened site.' },
  { name: 'Yongbyon Complex', lat: 39.8, lon: 125.7, layer: 'nuclear', severity: 'high', detail: 'North Korea main nuclear facility. Reactor operational. Plutonium production ongoing.' },
  // Energy
  { name: 'Strait of Hormuz', lat: 26.5, lon: 56.3, layer: 'energy', severity: 'high', detail: '20% global oil transit. Iranian interdiction threat. US 5th Fleet patrol ongoing.' },
  { name: 'Bab-el-Mandeb', lat: 12.6, lon: 43.5, layer: 'energy', severity: 'high', detail: 'Red Sea chokepoint. Houthi disruption active. Rerouting to Cape of Good Hope adding 14 days.' },
];

function seed() {
  const count = db.prepare('SELECT COUNT(*) as c FROM events').get().c;
  if (count > 0) return;

  const now = Date.now();
  const insert = db.prepare(
    'INSERT INTO events (name, lat, lon, layer, severity, detail, ts) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const insertMany = db.transaction((events) => {
    for (const e of events) {
      let ts;
      if (e.severity === 'high') ts = now - (1 + Math.random() * 4) * 3600000;
      else if (e.severity === 'med') ts = now - (6 + Math.random() * 30) * 3600000;
      else ts = now - (2 + Math.random() * 4) * 86400000;
      insert.run(e.name, e.lat, e.lon, e.layer, e.severity, e.detail, Math.floor(ts));
    }
  });

  insertMany(EVENTS);
  console.log(`Seeded ${EVENTS.length} events`);
}

module.exports = seed;
