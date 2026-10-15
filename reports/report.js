// Generischer Defi-Report: /<id>/ (beim Deploy erzeugt) oder /reports/?r=<id>, Konfiguration in reports.json
import { KANTONE, DATA_BASE, buildIndex, assign, summarize, is24h } from './geo.js';

const BADGE_COLORS = [['#e8f0ff', '#1a3a8a'], ['#fff0e0', '#8a3a00'], ['#ffeaea', '#8a1a1a'], ['#f0ffe8', '#1a6a1a'], ['#f3e8ff', '#5a1a8a'], ['#e8fbff', '#0a5a6a']];
const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('de-CH');
const pct = (a, b) => b > 0 ? Math.round(a / b * 100) : 0;

let cfg, assigned = [], rows = [], gemeindeCount = {};
let activeTab = 'all', sortKey = 'total', sortDir = -1;

function withDefaults(id, c) {
  const single = c.cantons.length === 1;
  const ktNames = c.cantons.map(k => KANTONE[k]);
  return {
    id,
    title: single ? `Kanton ${ktNames[0]}` : ktNames.join(' & '),
    preposition: single || c.title ? 'im' : 'in',
    overrides: {},
    ...c,
    multi: !single,
    tabLabel(tab) { return tab === 'all' ? this.title + (this.multi ? ` (${this.cantons.map(k => k.toUpperCase()).join('/')})` : '') : KANTONE[tab]; },
  };
}

async function getJson(url, label) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${label}: HTTP ${res.status}`);
  return res.json();
}

async function loadData() {
  const msg = $('load-msg');
  try {
    const id = new URLSearchParams(location.search).get('r') || location.pathname.split('/').filter(Boolean)[0];
    const all = await getJson('reports.json', 'reports.json');
    if (!id || !all[id]) {
      $('table-wrap').innerHTML = `<div class="loading">Report ${id ? `«${id}» ` : ''}nicht gefunden. Verfügbar: ${Object.keys(all).map(k => `<a href="?r=${k}">${k}</a>`).join(' · ')}</div>`;
      return;
    }
    cfg = withDefaults(id, all[id]);
    renderHeader();

    msg.textContent = `Lade ${cfg.multi ? cfg.cantons.length + ' Kantone' : 'Kanton ' + KANTONE[cfg.cantons[0]]} von GitHub…`;
    const [gemeinden, defis] = await Promise.all([
      Promise.all(cfg.cantons.map(k => getJson(`gemeinden/${k}.json`, `Gemeinden ${k.toUpperCase()}`))),
      Promise.all(cfg.cantons.map(k => getJson(`${DATA_BASE}defis_kt_${k}.geojson`, k.toUpperCase()))),
    ]);

    msg.textContent = 'Daten verarbeiten…';
    const index = buildIndex(gemeinden);
    for (const g of index.gemeinden) gemeindeCount[g.canton] = (gemeindeCount[g.canton] || 0) + 1;
    assigned = defis.flatMap(d => d.features || []).map(feature => ({ feature, gemeinde: assign(index, feature, cfg.overrides) }));
    rows = summarize(assigned);

    renderStats();
    renderTabs();
    $('last-updated').textContent = 'Geladen: ' + new Date().toLocaleString('de-CH');
    $('pdf-btn').disabled = $('csv-btn').disabled = false;
    render();
  } catch (e) {
    msg.textContent = 'Fehler: ' + e.message;
  }
}

function renderHeader() {
  const { client, title, preposition, cantons, multi } = cfg;
  document.title = `Defibrillatoren ${title} — defikarte.ch`;
  $('header-tag').textContent = `${client ? client.name : title} · Report`;
  if (client) {
    $('header-client').textContent = client.short;
    $('eyebrow').textContent = `${client.short} — ${client.name}`;
    $('header-client').hidden = $('eyebrow').hidden = false;
  }
  $('title').innerHTML = `Defibrillatoren ${preposition}<br><span></span>`;
  $('title').querySelector('span').textContent = title;
  if (multi) $('subtitle').textContent = `Kantone ${cantons.map(k => KANTONE[k]).join(' · ')} · Auswertung pro Gemeinde · OpenStreetMap`;
  $('source').textContent = 'defikarte/defi_data · ' + cantons.map(k => `defis_kt_${k}.geojson`).join(' · ');
  const style = document.createElement('style');
  style.textContent = cantons.map((k, i) => { const [bg, fg] = BADGE_COLORS[i % BADGE_COLORS.length]; return `.kt-badge.${k}{background:${bg};color:${fg}}`; }).join('');
  document.head.append(style);
}

function viewRows(tab = activeTab) {
  const list = tab === 'all' ? rows : rows.filter(r => r.canton === tab);
  return list.map((r, i) => ({ ...r, rank: i + 1 }));
}

function renderStats() {
  const total = rows.reduce((s, r) => s + r.total, 0);
  const total24 = rows.reduce((s, r) => s + r.h24, 0);
  const allGem = Object.values(gemeindeCount).reduce((a, b) => a + b, 0);
  const cards = [[fmt(total), 'Defibrillatoren total', true]];
  if (cfg.multi) for (const k of cfg.cantons) cards.push([fmt(viewRows(k).reduce((s, r) => s + r.total, 0)), `${KANTONE[k]} (${k.toUpperCase()})`]);
  cards.push([fmt(total24), 'davon 24/7 erreichbar'], [pct(total24, total) + ' %', 'Anteil 24/7'], [rows.length, `Gemeinden mit Defi (von ${allGem})`]);
  $('stats').classList.toggle('compact', cards.length > 4);
  $('stats').innerHTML = cards.map(([v, l, hl]) => `<div class="stat-card${hl && cfg.client ? ' highlight' : ''}"><div class="stat-val">${v}</div><div class="stat-lbl">${l}</div></div>`).join('');
}

function renderTabs() {
  if (!cfg.multi) return;
  const tabs = [['all', 'Alle Kantone'], ...cfg.cantons.map(k => [k, KANTONE[k]])];
  $('tabs').innerHTML = tabs.map(([k, l]) => `<button class="tab-btn${k === activeTab ? ' active' : ''}" data-tab="${k}">${l} <span class="tab-tag">${viewRows(k).length}</span></button>`).join('');
}

function render() {
  const q = $('search').value.toLowerCase();
  const view = viewRows();
  const filtered = view.filter(r => r.name.toLowerCase().includes(q));
  const cmp = {
    rank: (a, b) => a.rank - b.rank,
    name: (a, b) => a.name.localeCompare(b.name, 'de'),
    kt: (a, b) => a.canton.localeCompare(b.canton),
    total: (a, b) => a.total - b.total,
    h24: (a, b) => a.h24 - b.h24,
    pct: (a, b) => a.h24 / a.total - b.h24 / b.total,
  }[sortKey];
  const sorted = [...filtered].sort((a, b) => sortDir * cmp(a, b));
  $('result-count').textContent = filtered.length < view.length ? `${filtered.length} von ${view.length} Gemeinden` : `${view.length} Gemeinden`;

  const showKt = cfg.multi && activeTab === 'all';
  const cols = [['rank', '#', 'left'], ['name', 'Gemeinde', 'left'], ...(showKt ? [['kt', 'Kt.', 'left']] : []), ['total', 'Total'], ['h24', '24/7'], ['pct', 'Anteil 24h']];
  const icon = k => sortKey === k ? (sortDir === -1 ? '↓' : '↑') : '<span style="opacity:.3">↕</span>';
  const thead = `<thead><tr>${cols.map(([k, l, cls = '']) => `<th class="${cls}${sortKey === k ? ' sorted' : ''}" data-sort="${k}">${l} <span>${icon(k)}</span></th>`).join('')}</tr></thead>`;
  const tbody = sorted.map(r => {
    const p = pct(r.h24, r.total), high = p >= 50;
    return `<tr>
      <td class="rank left">${r.rank}</td><td class="name left">${r.name}</td>
      ${showKt ? `<td class="left"><span class="kt-badge ${r.canton}">${r.canton.toUpperCase()}</span></td>` : ''}
      <td>${r.total}</td>
      <td>${r.h24 > 0 ? `<span class="badge-24h${high ? ' high' : ''}">${r.h24}</span>` : '<span class="none">—</span>'}</td>
      <td><div class="pct-wrap"><div class="pct-bar-bg"><div class="pct-bar-fill" style="width:${p}%"></div></div><span class="pct-text${high ? ' high' : ''}">${p} %</span></div></td>
    </tr>`;
  }).join('');
  $('table-wrap').innerHTML = `<table>${thead}<tbody>${tbody}</tbody></table>`;
}

function sortBy(key) {
  sortDir = sortKey === key ? -sortDir : (['total', 'h24', 'pct'].includes(key) ? -1 : 1);
  sortKey = key;
  render();
}

function switchTab(tab) {
  activeTab = tab;
  sortKey = 'total'; sortDir = -1;
  renderTabs();
  render();
}

function fileName(ext) {
  const today = new Date().toLocaleDateString('de-CH').replace(/\./g, '-');
  const part = (activeTab === 'all' ? cfg.id : `${cfg.id}-${activeTab}`).replace(/_/g, '-');
  return `defibrillatoren-${part}-${today}.${ext}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Logo konnte nicht geladen werden'));
    img.src = src;
  });
}

async function exportPDF() {
  const exportRows = viewRows();
  if (!exportRows.length) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, today = new Date().toLocaleDateString('de-CH');
  const total = exportRows.reduce((s, r) => s + r.total, 0);
  const total24 = exportRows.reduce((s, r) => s + r.h24, 0);
  const label = cfg.tabLabel(activeTab);
  const files = (activeTab === 'all' ? cfg.cantons : [activeTab]).map(k => `defis_kt_${k}.geojson`).join(' + ');

  doc.setFillColor(20, 68, 48); doc.rect(0, 0, W, 44, 'F');
  doc.addImage(await loadImage('logo-pdf.jpg'), 'JPEG', 12, 5, 52, 14.7);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(180, 220, 160);
  if (cfg.client) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(151, 197, 104);
    doc.text(cfg.client.short, W - 14, 11, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(180, 220, 160);
  }
  doc.text(`Stand: ${today}`, W - 14, cfg.client ? 17 : 12, { align: 'right' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(255, 255, 255);
  doc.text(activeTab === 'all' && !cfg.multi ? `Defibrillatoren ${cfg.preposition} ${cfg.title}` : `Defibrillatoren — ${label}`, 14, 30);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(180, 220, 160);
  doc.text(`Datenquelle: defikarte/defi_data · OpenStreetMap · ${files}`, 14, 37);
  doc.setFillColor(151, 197, 104); doc.rect(0, 43, W, 1.5, 'F');

  const boxes = [[fmt(total), 'Defibrillatoren total'], [fmt(total24), 'davon 24/7 erreichbar'], [pct(total24, total) + '%', 'Anteil 24/7'], [exportRows.length, 'Gemeinden mit Defi']];
  boxes.forEach(([v, l], i) => {
    const x = 14 + i * 47.5;
    doc.setFillColor(238, 247, 227); doc.roundedRect(x, 48, 44, 20, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(20, 68, 48);
    doc.text(String(v), x + 22, 60, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(100, 100, 100);
    doc.text(l, x + 22, 65, { align: 'center' });
  });

  const showKt = cfg.multi && activeTab === 'all';
  doc.autoTable({
    startY: 73,
    head: [['#', 'Gemeinde', ...(showKt ? ['Kt.'] : []), 'Total', '24/7', 'Anteil 24h']],
    body: exportRows.map(r => [r.rank, r.name, ...(showKt ? [r.canton.toUpperCase()] : []), r.total, r.h24 > 0 ? r.h24 : '—', pct(r.h24, r.total) + '%']),
    styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [20, 68, 48], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [238, 247, 227] },
    columnStyles: showKt
      ? { 0: { halign: 'right', cellWidth: 10 }, 1: { cellWidth: 98 }, 2: { cellWidth: 12 }, 3: { halign: 'right', cellWidth: 18 }, 4: { halign: 'right', cellWidth: 18 }, 5: { halign: 'right', cellWidth: 24 } }
      : { 0: { halign: 'right', cellWidth: 10 }, 1: { cellWidth: 110 }, 2: { halign: 'right', cellWidth: 18 }, 3: { halign: 'right', cellWidth: 18 }, 4: { halign: 'right', cellWidth: 24 } },
    didDrawPage: d => {
      doc.setFillColor(151, 197, 104); doc.rect(0, 285, W, 2, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(20, 68, 48);
      doc.text('defikarte.ch', 14, 291);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
      doc.text(`Defibrillatoren ${label}${cfg.client ? ' · ' + cfg.client.short : ''} · defikarte/defi_data · OpenStreetMap`, W / 2, 291, { align: 'center' });
      doc.text('Seite ' + d.pageNumber, W - 14, 291, { align: 'right' });
    },
  });
  doc.save(fileName('pdf'));
}

function exportCSV() {
  const list = assigned.filter(a => activeTab === 'all' || a.gemeinde?.canton === activeTab);
  if (!list.length) return;
  const cols = ['gemeinde', ...(cfg.multi ? ['kanton'] : []), 'latitude', 'longitude', 'opening_hours', 'access', 'operator', 'name', 'phone', 'description', 'indoor', 'level', 'note', 'osm_id', 'bfs_nr', 'location'];
  const esc = v => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const lines = [cols.join(',')];
  for (const { feature: f, gemeinde: g } of list) {
    const p = f.properties || {};
    const [lon, lat] = f.geometry?.coordinates || [];
    lines.push([
      g?.label || 'Unbekannt', ...(cfg.multi ? [(g?.canton || '').toUpperCase()] : []),
      lat ? lat.toFixed(6) : '', lon ? lon.toFixed(6) : '',
      p.opening_hours, p.access, p.operator, p.name, p.phone, p.description, p.indoor, p.level, p.note,
      f.id || p.id || p['@id'] || '', g?.bfs, p['defibrillator:location'],
    ].map(esc).join(','));
  }
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName('csv');
  a.click();
  URL.revokeObjectURL(url);
}

$('search').addEventListener('input', render);
$('pdf-btn').addEventListener('click', () => exportPDF().catch(e => alert('PDF-Export fehlgeschlagen: ' + e.message)));
$('csv-btn').addEventListener('click', exportCSV);
$('tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) switchTab(b.dataset.tab); });
$('table-wrap').addEventListener('click', e => { const th = e.target.closest('[data-sort]'); if (th) sortBy(th.dataset.sort); });

loadData();
