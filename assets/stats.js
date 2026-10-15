// Statistik-Seite: Gesamtzahl, 24/7, Wachstum, Kantone und Lücken
import { KANTONE, DATA_BASE } from '../reports/geo.js';

// Angaben, die im Notfall zählen ("einsatztauglich erfasst" = alle vier vorhanden)
export const CORE = [
  ['defibrillator:location', 'Standortbeschreibung'],
  ['access', 'Zugänglichkeit'],
  ['opening_hours', 'Öffnungszeiten'],
  ['indoor', 'Innen / Aussen'],
];
export const EXTRA = [
  ['operator', 'Betreiber'],
  ['phone', 'Telefonnummer'],
  ['description', 'Beschreibung'],
  ['level', 'Stockwerk'],
  ['wheelchair', 'Rollstuhlzugang'],
];
const ATTRS = [...CORE, ...EXTRA];

// Linien-Icons (Stil wie in der defikarte-App)
const ICONS = {
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  'defibrillator:location': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  access: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
  opening_hours: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  indoor: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  operator: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  description: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  level: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  wheelchair: '<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>',
};
const icon = (name, size = 20) => `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

const $ = id => document.getElementById(id);
export const fmt = n => Math.round(n).toLocaleString('de-CH');
const pct = (a, b) => b > 0 ? a / b * 100 : 0;
const has = (p, k) => p[k] !== undefined && p[k] !== null && String(p[k]).trim() !== '';
const isoDate = d => d.toISOString().slice(0, 10);
const signed = n => (n >= 0 ? '+' : '−') + fmt(Math.abs(n));

export const state = { cantons: [], ch: null, history: [] };
let sortKey = 'total', sortDir = -1, chartRange = '2y', chartSeries = 'ch', chartPoints = [], hovered = null;

// ── Laden ────────────────────────────────────────────────────────────────────
async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

async function loadHistory() {
  for (const url of ['historical-data.json?t=' + Date.now(), 'https://raw.githubusercontent.com/defikarte/defi_stats/main/historical-data.json']) {
    try { return await getJson(url); } catch { /* nächste Quelle */ }
  }
  return [];
}

function analyze(code, features, einwohner) {
  const counts = Object.fromEntries(ATTRS.map(([k]) => [k, 0]));
  let h24 = 0, core = 0;
  for (const f of features) {
    const p = f.properties || {};
    for (const [k] of ATTRS) if (has(p, k)) counts[k]++;
    if ((p.opening_hours || '').trim() === '24/7') h24++;
    if (CORE.every(([k]) => has(p, k))) core++;
  }
  return { code, name: KANTONE[code], total: features.length, h24, core, counts, einwohner };
}

// Letzter historischer Eintrag am oder vor einem Datum (optional nur mit Kantonszahlen)
function entryAt(date, withCantons = false) {
  let hit = null;
  for (const e of state.history) if (e.date <= date && (!withCantons || e.cantons)) hit = e;
  return hit;
}

function growthSince(date, current, code) {
  const e = entryAt(date, !!code);
  const before = e && (code ? e.cantons?.[code] : e.count);
  if (!before) return null;
  return { abs: current - before, pct: pct(current - before, before), since: e.date };
}

async function loadAll() {
  const codes = Object.keys(KANTONE);
  const [history, pop] = await Promise.all([loadHistory(), getJson('einwohner.json').catch(() => ({ einwohner: {} }))]);
  state.history = history;
  let done = 0;
  const results = await Promise.all(codes.map(async code => {
    const data = await getJson(`${DATA_BASE}defis_kt_${code}.geojson`);
    done++;
    $('progress-text').textContent = `${done} / ${codes.length} Kantone geladen`;
    $('progress-bar').style.width = `${done / codes.length * 100}%`;
    return analyze(code, data.features || [], pop.einwohner[code]);
  }));

  const yearAgo = new Date(); yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  for (const c of results) c.growth = growthSince(isoDate(yearAgo), c.total, c.code);

  const sum = key => results.reduce((s, c) => s + c[key], 0);
  const counts = Object.fromEntries(ATTRS.map(([k]) => [k, results.reduce((s, c) => s + c.counts[k], 0)]));
  const ch = { total: sum('total'), h24: sum('h24'), core: sum('core'), counts, einwohner: sum('einwohner') };
  ch.growth = growthSince(isoDate(yearAgo), ch.total);
  ch.ytd = growthSince(`${new Date().getFullYear()}-01-01`, ch.total);
  ch.first = state.history[0];
  state.cantons = results;
  state.ch = ch;
}

// ── Kopfbereich ──────────────────────────────────────────────────────────────
function renderHero() {
  const { ch } = state;
  $('eyebrow').textContent = 'Statistik · Stand ' + new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
  $('k-total').textContent = fmt(ch.total);
  if (ch.growth) $('k-total-delta').textContent = `${signed(ch.growth.abs)} in 12 Monaten`;
  const cards = [
    ['clock', fmt(ch.h24), 'rund um die Uhr erreichbar (24/7)', `${Math.round(pct(ch.h24, ch.total))} % aller Defibrillatoren`],
    ['trend', ch.growth ? `${ch.growth.pct >= 0 ? '+' : '−'}${Math.abs(ch.growth.pct).toFixed(1).replace('.', ',')} %` : '—', 'Wachstum in 12 Monaten', ch.growth ? `${signed(ch.growth.abs)} Defibrillatoren` : ''],
    ['people', (ch.total / ch.einwohner * 1e4).toFixed(1).replace('.', ','), "pro 10'000 Einwohner", `${fmt(ch.einwohner)} Einwohner`],
    ['shield', `${Math.round(pct(ch.core, ch.total))} %`, 'einsatztauglich erfasst', 'alle Notfall-Angaben vorhanden'],
  ];
  $('kpis').innerHTML = cards.map(([ic, v, l, s]) => `<div class="stat-card has-icon">${icon(ic, 22)}<div class="stat-val">${v}</div><div class="stat-lbl">${l}</div><div class="stat-sub">${s}</div></div>`).join('');
}

// ── Wachstum ─────────────────────────────────────────────────────────────────
function seriesData() {
  const live = chartSeries === 'ch' ? state.ch.total : state.cantons.find(c => c.code === chartSeries).total;
  const rows = chartSeries === 'ch'
    ? state.history.map(e => ({ date: e.date, count: e.count }))
    : state.history.filter(e => e.cantons?.[chartSeries]).map(e => ({ date: e.date, count: e.cantons[chartSeries] }));
  const today = isoDate(new Date());
  if (!rows.length || rows.at(-1).date !== today) rows.push({ date: today, count: live, live: true });
  return rows;
}

function renderGrowthTiles() {
  const isCh = chartSeries === 'ch';
  const c = isCh ? state.ch : state.cantons.find(x => x.code === chartSeries);
  const yearAgo = new Date(); yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const g12 = growthSince(isoDate(yearAgo), c.total, isCh ? null : c.code);
  const ytd = growthSince(`${new Date().getFullYear()}-01-01`, c.total, isCh ? null : c.code);
  const first = isCh ? state.history[0] : state.history.find(e => e.cantons?.[c.code]);
  const firstCount = first && (isCh ? first.count : first.cantons[c.code]);
  const since = first ? new Date(first.date).toLocaleDateString('de-CH', { month: 'long', year: 'numeric' }) : '';
  const tiles = [
    [g12 ? signed(g12.abs) : '—', 'in den letzten 12 Monaten', true],
    [ytd ? signed(ytd.abs) : '—', `seit Anfang ${new Date().getFullYear()}`, true],
    [g12 ? `Ø ${fmt(g12.abs / 12)}` : '—', 'neue Defis pro Monat (12 Monate)'],
    [firstCount ? `${(c.total / firstCount).toFixed(1).replace('.', ',')}×` : '—', `so viele wie im ${since}`],
  ];
  $('growth-tiles').innerHTML = tiles.map(([v, l, up]) => `<div class="tile"><div class="tile-val${up ? ' up' : ''}">${v}</div><div class="tile-lbl">${l}</div></div>`).join('');
}

function filteredSeries() {
  const data = seriesData();
  if (chartRange === 'all') return data;
  const years = { '1y': 1, '2y': 2, '5y': 5 }[chartRange];
  const cut = new Date(); cut.setFullYear(cut.getFullYear() - years); cut.setDate(1);
  return data.filter(d => d.date >= isoDate(cut));
}

function drawChart() {
  const canvas = $('growth-chart');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const { width: W, height: H } = canvas.getBoundingClientRect();
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);
  const data = filteredSeries();
  if (data.length < 2) return;

  const narrow = W < 500;
  const pad = { top: 44, right: narrow ? 16 : 32, bottom: 36, left: narrow ? 48 : 64 };
  const cw = W - pad.left - pad.right, chh = H - pad.top - pad.bottom;
  const counts = data.map(d => d.count);
  const min = chartRange === 'all' ? 0 : Math.min(...counts) * 0.97, max = Math.max(...counts) * 1.02;
  const t0 = new Date(data[0].date), t1 = new Date(data.at(-1).date);
  const x = d => pad.left + (new Date(d.date) - t0) / ((t1 - t0) || 1) * cw;
  const y = v => pad.top + chh - (v - min) / (max - min) * chh;
  chartPoints = data.map(d => ({ ...d, x: x(d), y: y(d.count) }));

  ctx.font = '300 12px Poppins, sans-serif';
  ctx.fillStyle = 'rgba(21,68,48,.6)';
  ctx.strokeStyle = '#EFEDE8';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const gy = pad.top + i / 4 * chh;
    ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(W - pad.right, gy); ctx.stroke();
    ctx.textAlign = 'right';
    ctx.fillText(fmt(max - i / 4 * (max - min)), pad.left - 10, gy + 4);
  }
  ctx.textAlign = 'center';
  if (chartRange === '1y') {
    for (const p of chartPoints) if (!p.live) ctx.fillText(new Date(p.date).toLocaleDateString('de-CH', { month: 'short' }), p.x, H - 12);
  } else {
    const seen = new Set();
    for (const p of chartPoints) { const yr = p.date.slice(0, 4); if (!seen.has(yr)) { seen.add(yr); ctx.fillText(yr, p.x, H - 12); } }
  }

  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chh);
  grad.addColorStop(0, 'rgba(152,200,103,.25)'); grad.addColorStop(1, 'rgba(152,200,103,0)');
  ctx.beginPath(); ctx.moveTo(chartPoints[0].x, pad.top + chh);
  chartPoints.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(chartPoints.at(-1).x, pad.top + chh); ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
  ctx.beginPath(); chartPoints.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
  ctx.strokeStyle = '#30805D'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.stroke();

  const showDots = chartRange !== 'all' && chartRange !== '5y';
  for (const p of chartPoints) {
    const isHover = hovered && hovered.date === p.date;
    if (!showDots && !p.live && !isHover) continue;
    if (p.live) { ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, 2 * Math.PI); ctx.fillStyle = 'rgba(152,200,103,.3)'; ctx.fill(); }
    ctx.beginPath(); ctx.arc(p.x, p.y, isHover ? 6 : 4, 0, 2 * Math.PI);
    ctx.fillStyle = p.live ? '#98C867' : '#fff'; ctx.fill();
    ctx.strokeStyle = p.live || isHover ? '#154430' : '#30805D'; ctx.lineWidth = 2; ctx.stroke();
  }

  // Titel: Veränderung im gewählten Zeitraum
  const first = data[0].count, last = data.at(-1).count;
  const label = chartSeries === 'ch' ? 'Schweiz' : KANTONE[chartSeries];
  ctx.textAlign = 'left'; ctx.font = '500 14px Poppins, sans-serif'; ctx.fillStyle = '#154430';
  const title = `${label}: ${fmt(first)} → ${fmt(last)}`;
  ctx.fillText(title, pad.left, 22);
  ctx.font = '500 13px Poppins, sans-serif'; ctx.fillStyle = '#30805D';
  ctx.fillText(`  ${signed(last - first)} (${first ? '+' + Math.round((last - first) / first * 100) : 0} %)`, pad.left + ctx.measureText(title).width + 4, 22);

  if (hovered) {
    const p = chartPoints.find(q => q.date === hovered.date);
    if (!p) return;
    const text = `${new Date(p.date).toLocaleDateString('de-CH', { day: p.live ? 'numeric' : undefined, month: 'long', year: 'numeric' })}: ${fmt(p.count)}${p.live ? ' · aktuell' : ''}`;
    ctx.font = '500 12px Poppins, sans-serif';
    const tw = ctx.measureText(text).width + 24, th = 32;
    let tx = Math.min(Math.max(p.x - tw / 2, pad.left), W - pad.right - tw), ty = p.y - th - 14;
    if (ty < 4) ty = p.y + 14;
    ctx.fillStyle = '#154430'; ctx.beginPath(); ctx.roundRect(tx, ty, tw, th, 16); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(text, tx + tw / 2, ty + th / 2 + 4);
  }
}

function setupChart() {
  const sel = $('series-select');
  sel.innerHTML = `<option value="ch">Schweiz</option>` + Object.entries(KANTONE).sort((a, b) => a[1].localeCompare(b[1], 'de')).map(([k, n]) => `<option value="${k}">${n}</option>`).join('');
  sel.addEventListener('change', () => { chartSeries = sel.value; hovered = null; renderGrowthTiles(); drawChart(); });
  $('range-buttons').addEventListener('click', e => {
    const b = e.target.closest('[data-range]'); if (!b) return;
    chartRange = b.dataset.range; hovered = null;
    $('range-buttons').querySelectorAll('.tab-btn').forEach(x => x.classList.toggle('active', x === b));
    drawChart();
  });
  const canvas = $('growth-chart');
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect(), mx = e.clientX - r.left;
    let best = null, bd = 24;
    for (const p of chartPoints) { const d = Math.abs(p.x - mx); if (d < bd) { bd = d; best = p; } }
    if (best?.date !== hovered?.date) { hovered = best; drawChart(); }
  });
  canvas.addEventListener('mouseleave', () => { hovered = null; drawChart(); });
  let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(drawChart, 150); });
}

// ── Kantone ──────────────────────────────────────────────────────────────────
const COLS = [
  ['name', 'Kanton', 'left'],
  ['total', 'Defis'],
  ['growth', '12 Monate'],
  ['h24', '24/7'],
  ['density', "pro 10'000 Einw.", 'hide-mobile'],
  ['core', 'einsatztauglich'],
  ['gap', 'grösste Lücke', 'left hide-mobile'],
];

function biggestGap(c) {
  const [k, label] = CORE.reduce((a, b) => (c.total - c.counts[b[0]] > c.total - c.counts[a[0]] ? b : a));
  return { label, missing: c.total - c.counts[k] };
}

function sortValue(c, key) {
  return {
    name: c.name, total: c.total, growth: c.growth?.abs ?? -Infinity, h24: pct(c.h24, c.total),
    density: c.total / c.einwohner, core: pct(c.core, c.total), gap: biggestGap(c).missing,
  }[key];
}

function renderTable() {
  const chCore = pct(state.ch.core, state.ch.total);
  $('canton-head').innerHTML = COLS.map(([k, l, cls = '']) => `<th class="${cls}${sortKey === k ? ' sorted' : ''}" data-sort="${k}">${l}${sortKey === k ? (sortDir < 0 ? ' ↓' : ' ↑') : ''}</th>`).join('');
  const rows = [...state.cantons].sort((a, b) => {
    const va = sortValue(a, sortKey), vb = sortValue(b, sortKey);
    return sortDir * (typeof va === 'string' ? va.localeCompare(vb, 'de') : va - vb);
  });
  $('canton-body').innerHTML = rows.map(c => {
    const core = pct(c.core, c.total), gap = biggestGap(c);
    const cls = core - chCore >= 5 ? 'above' : core - chCore <= -10 ? 'below' : '';
    const detail = ATTRS.map(([k, label]) => {
      const p = pct(c.counts[k], c.total), isCore = CORE.some(([ck]) => ck === k);
      return `<div class="attr"><span>${label}</span><span class="attr-val">${Math.round(p)} % · ${fmt(c.total - c.counts[k])} fehlen</span><div class="attr-bar${isCore ? ' core' : ''}"><div style="width:${p}%"></div></div></div>`;
    }).join('');
    return `<tr class="row" data-code="${c.code}">
      <td class="left"><div class="kt-cell"><img src="img/wappen/${c.code}.png" alt=""><span class="name">${c.name}</span><span class="arrow">▼</span></div></td>
      <td class="total">${fmt(c.total)}</td>
      <td>${c.growth ? `<span class="${c.growth.abs >= 0 ? 'growth-pos' : ''}">${signed(c.growth.abs)}</span><span class="num-sub">${c.growth.pct >= 0 ? '+' : ''}${Math.round(c.growth.pct)} %</span>` : '—'}</td>
      <td>${fmt(c.h24)}<span class="num-sub">${Math.round(pct(c.h24, c.total))} %</span></td>
      <td class="hide-mobile">${(c.total / c.einwohner * 1e4).toFixed(1).replace('.', ',')}</td>
      <td><span class="pill ${cls}">${Math.round(core)} %</span></td>
      <td class="gap-cell hide-mobile">${gap.missing ? `<strong>${gap.label}</strong><span class="num-sub">fehlt bei ${fmt(gap.missing)}</span>` : '—'}</td>
    </tr>
    <tr class="detail" data-detail="${c.code}" hidden><td colspan="${COLS.length}"><div class="detail-grid">${detail}</div></td></tr>`;
  }).join('');
  $('table-note').textContent = `Einsatztauglich erfasst: Standortbeschreibung, Zugänglichkeit, Öffnungszeiten und Innen/Aussen sind angegeben. `
    + `Grün = deutlich über, Ocker = deutlich unter dem Schweizer Wert (${Math.round(chCore)} %). `
    + `Wachstum gegenüber dem Stand vor 12 Monaten. Dichte bezieht sich auf erfasste, nicht auf alle vorhandenen Defibrillatoren.`;
}

function setupTable() {
  $('canton-head').addEventListener('click', e => {
    const th = e.target.closest('[data-sort]'); if (!th) return;
    const k = th.dataset.sort;
    sortDir = sortKey === k ? -sortDir : (k === 'name' ? 1 : -1);
    sortKey = k;
    renderTable();
  });
  $('canton-body').addEventListener('click', e => {
    const row = e.target.closest('tr.row'); if (!row) return;
    const detail = $('canton-body').querySelector(`[data-detail="${row.dataset.code}"]`);
    detail.hidden = !detail.hidden;
    row.classList.toggle('open', !detail.hidden);
  });
}

// ── Lücken ───────────────────────────────────────────────────────────────────
function renderGaps() {
  const { ch } = state;
  const tile = ([k, label]) => {
    const p = pct(ch.counts[k], ch.total), missing = ch.total - ch.counts[k];
    return `<div class="gap-tile"><div class="gap-head"><span class="gap-label">${icon(k, 18)}${label}</span></div>
      <div class="attr-bar"><div style="width:${p}%"></div></div><div class="gap-missing"><span><strong>${fmt(missing)}</strong> ohne Angabe</span><span>${Math.round(p)} %</span></div></div>`;
  };
  const byMissing = list => [...list].sort((a, b) => ch.counts[a[0]] - ch.counts[b[0]]);
  $('gaps-core').innerHTML = byMissing(CORE).map(tile).join('');
  $('gaps-extra').innerHTML = byMissing(EXTRA).map(tile).join('');
}

// ── Start ────────────────────────────────────────────────────────────────────
async function init() {
  $('year').textContent = new Date().getFullYear();
  try {
    await loadAll();
  } catch (e) {
    $('progress-text').textContent = 'Fehler beim Laden: ' + e.message;
    return;
  }
  renderHero();
  $('loading').hidden = true;
  $('content').hidden = false;
  $('last-updated').textContent = 'Geladen: ' + new Date().toLocaleString('de-CH');
  setupChart(); renderGrowthTiles(); drawChart();
  setupTable(); renderTable();
  renderGaps();
  if (new URLSearchParams(location.search).has('tools')) (await import('./social.js')).init(state);
}

init();
