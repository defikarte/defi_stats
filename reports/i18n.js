// Texte der Report-Seite auf Deutsch und Französisch
import { KANTONE, REGIONS, regionName } from './geo.js';

// Französischsprachige Kantone: Report standardmässig auf Französisch
export const FR_CANTONS = ['ge', 'ne', 'vd', 'ju'];
// Zweisprachige Kantone: Deutsch mit Umschalter auf Französisch
export const BILINGUAL_CANTONS = ['be', 'fr', 'vs'];

export const KANTONE_FR = {
  ag: 'Argovie', ai: 'Appenzell Rhodes-Intérieures', ar: 'Appenzell Rhodes-Extérieures', be: 'Berne',
  bl: 'Bâle-Campagne', bs: 'Bâle-Ville', fr: 'Fribourg', ge: 'Genève', gl: 'Glaris',
  gr: 'Grisons', ju: 'Jura', lu: 'Lucerne', ne: 'Neuchâtel', nw: 'Nidwald',
  ow: 'Obwald', sg: 'Saint-Gall', sh: 'Schaffhouse', so: 'Soleure', sz: 'Schwytz',
  tg: 'Thurgovie', ti: 'Tessin', ur: 'Uri', vd: 'Vaud', vs: 'Valais', zg: 'Zoug', zh: 'Zurich',
};

// "de Genève", "du Jura", "des Grisons", "d'Uri"
function deFr(k) {
  const n = KANTONE_FR[k];
  if (['ju', 'vs', 'ti'].includes(k)) return `du ${n}`;
  if (k === 'gr') return `des ${n}`;
  return /^[aeiouéèêh]/i.test(n) ? `d'${n}` : `de ${n}`;
}
const listFr = ks => ks.length > 1 ? ks.slice(0, -1).map(deFr).join(', ') + ' et ' + deFr(ks.at(-1)) : deFr(ks[0]);

export const STRINGS = {
  de: {
    locale: 'de-CH',
    colon: ': ',
    canton: k => regionName(k),
    // Titel: "Defibrillatoren im <span>Kanton Zürich</span>"
    title: c => c.title || (c.cantons.length === 1 ? (KANTONE[c.cantons[0]] ? `Kanton ${KANTONE[c.cantons[0]]}` : regionName(c.cantons[0])) : c.cantons.map(regionName).join(' & ')),
    prefix: c => `Defibrillatoren ${c.preposition || (c.cantons.length === 1 || c.title ? 'im' : 'in')}`,
    defis: 'Defibrillatoren',
    report: 'Report',
    reportFor: n => `Report für ${n}`,
    subtitle: 'Auswertung pro Gemeinde · Daten aus OpenStreetMap',
    subtitleMulti: ks => `Kantone ${ks.map(regionName).join(' · ')} · Auswertung pro Gemeinde · Daten aus OpenStreetMap`,
    source: 'Datenquelle',
    statTotal: 'Defibrillatoren total',
    stat24: 'davon 24/7 erreichbar',
    statShare: 'Anteil 24/7',
    statGem: n => `Gemeinden mit Defi (von ${n})`,
    pdfGem: 'Gemeinden mit Defi',
    section: 'Defibrillatoren pro Gemeinde',
    search: 'Gemeinde suchen…',
    count: (a, b) => a < b ? `${a} von ${b} Gemeinden` : `${b} Gemeinden`,
    allCantons: 'Alle Kantone',
    colGem: 'Gemeinde', colKt: 'Kt.', col24: '24/7', colShare: 'Anteil 24h',
    loading: 'Daten werden geladen…',
    loadingGithub: 'Lade Daten von GitHub…',
    processing: 'Daten verarbeiten…',
    error: 'Fehler: ',
    loaded: 'Geladen: ',
    unknown: 'Unbekannt',
    partner: 'Partner',
    partnerFooter: 'In Zusammenarbeit mit',
    githubLink: 'Daten auf GitHub',
    footerNote: 'Daten © OpenStreetMap-Mitwirkende (ODbL) · Gemeindegrenzen © swisstopo',
    wappenAlt: k => KANTONE[k] ? `Wappen Kanton ${KANTONE[k]}` : `Wappen ${regionName(k)}`,
    pdfStand: 'Stand',
    pdfPage: 'Seite',
    pdfFailed: 'PDF-Export fehlgeschlagen: ',
    filePrefix: 'defibrillatoren',
    csvGem: 'gemeinde', csvKt: 'kanton',
  },
  fr: {
    locale: 'fr-CH',
    colon: ' : ',   // französische Typografie: Leerschlag vor dem Doppelpunkt
    canton: k => KANTONE_FR[k] || REGIONS[k]?.name || k.toUpperCase(),
    // Titre: "Défibrillateurs dans le <span>canton de Genève</span>"
    title: c => c.title_fr || (c.title ? c.title : c.cantons.length === 1 ? `canton ${deFr(c.cantons[0])}` : `cantons ${listFr(c.cantons)}`),
    prefix: c => c.title_fr ? `Défibrillateurs ${c.preposition_fr || 'dans le'}` : c.title ? 'Défibrillateurs :' : `Défibrillateurs dans ${c.cantons.length === 1 ? 'le' : 'les'}`,
    defis: 'Défibrillateurs',
    report: 'Rapport',
    reportFor: n => `Rapport pour ${n}`,
    subtitle: 'Évaluation par commune · Données OpenStreetMap',
    subtitleMulti: ks => `Cantons ${ks.map(k => KANTONE_FR[k]).join(' · ')} · Évaluation par commune · Données OpenStreetMap`,
    source: 'Source des données',
    statTotal: 'Défibrillateurs au total',
    stat24: 'dont accessibles 24h/24',
    statShare: 'Part 24h/24',
    statGem: n => `Communes avec défibrillateur (sur ${n})`,
    pdfGem: 'Communes avec défibrillateur',
    section: 'Défibrillateurs par commune',
    search: 'Rechercher une commune…',
    count: (a, b) => a < b ? `${a} sur ${b} communes` : `${b} communes`,
    allCantons: 'Tous les cantons',
    colGem: 'Commune', colKt: 'Ct.', col24: '24h/24', colShare: 'Part 24h/24',
    loading: 'Chargement des données…',
    loadingGithub: 'Chargement des données depuis GitHub…',
    processing: 'Traitement des données…',
    error: 'Erreur : ',
    loaded: 'Chargé le ',
    unknown: 'Inconnue',
    partner: 'Partenaire',
    partnerFooter: 'En collaboration avec',
    githubLink: 'Données sur GitHub',
    footerNote: 'Données © contributeurs OpenStreetMap (ODbL) · Limites communales © swisstopo',
    wappenAlt: k => `Armoiries du canton ${deFr(k)}`,
    pdfStand: 'État au',
    pdfPage: 'Page',
    pdfFailed: "L'export PDF a échoué : ",
    filePrefix: 'defibrillateurs',
    csvGem: 'commune', csvKt: 'canton',
  },
};

// Verfügbare Sprachen und Standardsprache eines Reports
export function languagesFor(cfg) {
  const fr = cfg.cantons.some(k => FR_CANTONS.includes(k) || BILINGUAL_CANTONS.includes(k)) || cfg.lang === 'fr';
  const def = cfg.lang || (cfg.cantons.every(k => FR_CANTONS.includes(k)) ? 'fr' : 'de');
  const langs = fr ? ['de', 'fr'] : ['de'];
  return { def, langs: [def, ...langs.filter(l => l !== def)] };
}
