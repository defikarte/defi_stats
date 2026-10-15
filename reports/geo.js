// Gemeinde-Zuordnung und Auswertung — läuft im Browser und in Node (scripts/compare-reports.mjs)

export const KANTONE = {
  ag: 'Aargau', ai: 'Appenzell Innerrhoden', ar: 'Appenzell Ausserrhoden', be: 'Bern',
  bl: 'Basel-Landschaft', bs: 'Basel-Stadt', fr: 'Freiburg', ge: 'Genf', gl: 'Glarus',
  gr: 'Graubünden', ju: 'Jura', lu: 'Luzern', ne: 'Neuenburg', nw: 'Nidwalden',
  ow: 'Obwalden', sg: 'St. Gallen', sh: 'Schaffhausen', so: 'Solothurn', sz: 'Schwyz',
  tg: 'Thurgau', ti: 'Tessin', ur: 'Uri', vd: 'Waadt', vs: 'Wallis', zg: 'Zug', zh: 'Zürich',
};

export const DATA_BASE = 'https://raw.githubusercontent.com/defikarte/defi_data/main/data/json/';

// Vergleich ohne Akzente, Bindestriche, Kantonszusatz und Gross-/Kleinschreibung
export function normKey(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/\s*\([a-z]{2}\)\s*$/, '').replace(/[-'’]/g, ' ').replace(/\s+/g, ' ').trim();
}

// "Aesch (BL)" → "Aesch", ausser der Name kommt im Report mehrfach vor
function displayNames(gemeinden) {
  const short = g => g.name.replace(/\s*\([A-Z]{2}\)$/, '');
  const count = {};
  for (const g of gemeinden) count[short(g)] = (count[short(g)] || 0) + 1;
  for (const g of gemeinden) g.label = count[short(g)] > 1 ? g.name : short(g);
}

// gemeindeFiles: Inhalt von reports/kantone/<kt>.json für alle Kantone des Reports
export function buildIndex(gemeindeFiles) {
  const gemeinden = gemeindeFiles.flatMap(f => f.gemeinden.map(g => ({ ...g, canton: f.canton })));
  displayNames(gemeinden);
  for (const g of gemeinden) {
    let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
    for (const r of g.rings) for (const [x, y] of r) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
    g.bbox = [a, b, c, d];
  }
  const byKey = {};
  for (const g of gemeinden) {
    byKey[normKey(g.label)] ??= g;
    byKey[normKey(g.name)] ??= g;
  }
  return { gemeinden, byKey, byLabel: Object.fromEntries(gemeinden.map(g => [g.label, g])) };
}

// Even-odd über alle Ringe: Löcher (Enklaven) und Mehrteiler werden korrekt behandelt
function contains(g, x, y) {
  const [a, b, c, d] = g.bbox;
  if (x < a || x > c || y < b || y > d) return false;
  let inside = false;
  for (const r of g.rings) {
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i], [xj, yj] = r[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

function nearest(index, x, y) {
  const k = Math.cos(y * Math.PI / 180);
  let best = null, bd = Infinity;
  for (const g of index.gemeinden) {
    for (const r of g.rings) for (const [px, py] of r) {
      const dist = ((px - x) * k) ** 2 + (py - y) ** 2;
      if (dist < bd) { bd = dist; best = g; }
    }
  }
  return best;
}

// Reihenfolge: manuelle Korrektur → GPS in Gemeindegrenze → Adressfeld → nächste Gemeinde (z.B. Punkt im See)
export function assign(index, feature, overrides = {}) {
  const p = feature.properties || {};
  const id = feature.id || p.id || p['@id'];
  if (overrides[id] && index.byLabel[overrides[id]]) return index.byLabel[overrides[id]];
  const [x, y] = feature.geometry?.coordinates || [];
  const valid = Number.isFinite(x) && Number.isFinite(y) && (x || y);
  if (valid) {
    const hit = index.gemeinden.find(g => contains(g, x, y));
    if (hit) return hit;
  }
  for (const k of ['addr:city', 'addr:municipality', 'is_in:city']) {
    const hit = index.byKey[normKey(p[k])];
    if (hit) return hit;
  }
  return valid ? nearest(index, x, y) : null;
}

export const is24h = p => (p.opening_hours || '').trim() === '24/7';

// features: [{feature, gemeinde}] → Zeilen pro Gemeinde, nach Anzahl sortiert und rangiert
export function summarize(assigned) {
  const rows = {};
  for (const { feature, gemeinde } of assigned) {
    const label = gemeinde?.label || 'Unbekannt';
    const r = rows[label] ||= { name: label, canton: gemeinde?.canton || '', bfs: gemeinde?.bfs, total: 0, h24: 0 };
    r.total++;
    if (is24h(feature.properties || {})) r.h24++;
  }
  return Object.values(rows)
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'de'))
    .map((r, i) => ({ ...r, rank: i + 1 }));
}
