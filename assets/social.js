// Social-Media-Grafiken (1080×1080), nur mit ?tools eingeblendet
import { KANTONE } from '../reports/geo.js';
import { fmt } from './stats.js';

const S = 1080;
const pct = (a, b) => b > 0 ? Math.round(a / b * 100) : 0;
const signed = n => (n >= 0 ? '+' : '−') + fmt(Math.abs(n));

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function rounded(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

async function draw(ctx, { title, subtitle, total, cards, wappen }) {
  await document.fonts.load('500 100px Poppins');
  await document.fonts.load('300 30px Poppins');
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, '#154430'); g.addColorStop(1, '#659552');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);

  const logo = await loadImage('img/logo.svg');
  if (logo) ctx.drawImage(logo, 72, 72, 330, 60);
  ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = '300 28px Poppins';
  ctx.fillText(new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' }), S - 72, 112);

  let y = 250;
  if (wappen) {
    const img = await loadImage(wappen);
    if (img) { const h = 120, w = img.width * h / img.height; ctx.drawImage(img, 72, y - 20, w, h); }
    y += 140;
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = '#98C867'; ctx.font = '500 200px Poppins';
  ctx.fillText(total, 64, y + 150);
  ctx.fillStyle = '#fff'; ctx.font = '500 46px Poppins';
  ctx.fillText(title, 72, y + 225);
  if (subtitle) { ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = '300 30px Poppins'; ctx.fillText(subtitle, 72, y + 275); }

  const cw = (S - 144 - 2 * 24) / 3, cy = S - 72 - 230;
  cards.forEach(([val, label, sub], i) => {
    const x = 72 + i * (cw + 24);
    ctx.fillStyle = 'rgba(255,255,255,.14)'; rounded(ctx, x, cy, cw, 190, 24); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '500 62px Poppins'; ctx.fillText(val, x + 32, cy + 88);
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '300 26px Poppins'; ctx.fillText(label, x + 32, cy + 132);
    if (sub) { ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillText(sub, x + 32, cy + 166); }
  });
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '300 24px Poppins'; ctx.textAlign = 'center';
  ctx.fillText('defikarte.ch · Daten: OpenStreetMap', S / 2, S - 30);
}

function overview(state) {
  const { ch } = state;
  return {
    total: fmt(ch.total), title: 'Defibrillatoren in der Schweiz', subtitle: 'erfasst auf defikarte.ch',
    cards: [
      [fmt(ch.h24), 'erreichbar 24/7', `${pct(ch.h24, ch.total)} % aller Defis`],
      [ch.growth ? signed(ch.growth.abs) : '—', 'in 12 Monaten', ch.growth ? `${ch.growth.pct >= 0 ? '+' : ''}${Math.round(ch.growth.pct)} % Wachstum` : ''],
      [(ch.total / ch.einwohner * 1e4).toFixed(1).replace('.', ','), "pro 10'000", 'Einwohner'],
    ],
  };
}

function canton(state, code) {
  const c = state.cantons.find(x => x.code === code);
  return {
    total: fmt(c.total), title: `Defibrillatoren im Kanton ${KANTONE[code]}`, wappen: `img/wappen/${code}.png`,
    cards: [
      [fmt(c.h24), 'erreichbar 24/7', `${pct(c.h24, c.total)} % aller Defis`],
      [c.growth ? signed(c.growth.abs) : '—', 'in 12 Monaten', c.growth ? `${c.growth.pct >= 0 ? '+' : ''}${Math.round(c.growth.pct)} % Wachstum` : ''],
      [(c.total / c.einwohner * 1e4).toFixed(1).replace('.', ','), "pro 10'000", 'Einwohner'],
    ],
  };
}

export function init(state) {
  const box = document.getElementById('tools');
  box.hidden = false;
  box.innerHTML = `
    <div class="section-head"><div><h2>Social-Media-Grafik</h2><p class="section-sub">PNG, 1080 × 1080 px</p></div></div>
    <div class="tools-card">
      <div class="tools-controls">
        <select class="select" id="export-type">
          <option value="ch">Schweiz</option>
          ${Object.entries(KANTONE).sort((a, b) => a[1].localeCompare(b[1], 'de')).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}
        </select>
        <button class="btn btn-primary" id="export-btn">Grafik erzeugen</button>
        <a class="btn btn-secondary" id="export-dl" hidden>PNG herunterladen</a>
      </div>
      <canvas id="export-canvas" width="${S}" height="${S}"></canvas>
    </div>`;
  const canvas = document.getElementById('export-canvas');
  document.getElementById('export-btn').addEventListener('click', async () => {
    const code = document.getElementById('export-type').value;
    await draw(canvas.getContext('2d'), code === 'ch' ? overview(state) : canton(state, code));
    canvas.classList.add('visible');
    const dl = document.getElementById('export-dl');
    dl.href = canvas.toDataURL('image/png');
    dl.download = `defikarte-${code === 'ch' ? 'schweiz' : code}-${new Date().toISOString().slice(0, 10)}.png`;
    dl.hidden = false;
  });
}
