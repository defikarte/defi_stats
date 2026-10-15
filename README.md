# defikarte.ch Statistik

Statistik-Seite und Kantons-Reports zu den Defibrillatoren auf [defikarte.ch](https://defikarte.ch) – live unter [stats.defikarte.ch](https://stats.defikarte.ch).

## 🎯 Über das Projekt

Die Statistik-Seite (stats.defikarte.ch) zeigt, wie viele Defibrillatoren in der Schweiz auf defikarte.ch erfasst sind, wie viele rund um die Uhr erreichbar sind und wie die Zahl wächst – schweizweit und pro Kanton.

### Hauptfunktionen

- **Kennzahlen**: Gesamtzahl, 24/7-Erreichbarkeit, Wachstum in 12 Monaten, Defis pro 10'000 Einwohner, Anteil einsatztauglich erfasst
- **Wachstum**: Verlauf seit 2020 (Schweiz) bzw. seit Oktober 2021 (pro Kanton), Zeitraum und Kanton wählbar
- **Kantone**: sortierbare Tabelle mit Defis, Wachstum, 24/7, Dichte, einsatztauglich und grösster Lücke; aufklappbar mit allen Angaben
- **Was am meisten fehlt**: fehlende Angaben schweizweit, getrennt nach «wichtig im Notfall» und «Zusatzangaben»
- **Social-Media-Grafiken** (1080 × 1080 px, Schweiz oder Kanton): nur über `?tools` eingeblendet, z.B. `stats.defikarte.ch/?tools`
- **Ländervergleich**: Schweiz und Nachbarländer (`europe/defi_europe.html`)

**Einsatztauglich erfasst** heisst: Standortbeschreibung, Zugänglichkeit, Öffnungszeiten und Innen/Aussen sind angegeben – die Angaben, die man im Notfall braucht.

## 🛠️ Technologie

- **Vanilla JavaScript** (ES-Module), kein Framework, kein Build-Schritt
- **Canvas** für Wachstumsgrafik und Social-Media-Grafiken
- **jsPDF + AutoTable** für den PDF-Export der Reports
- **GitHub Actions** für monatliche Updates und den Deploy

### Datenquellen

- Defibrillatoren: [OpenStreetMap](https://www.openstreetmap.org/), bereitgestellt über [defikarte/defi_data](https://github.com/defikarte/defi_data) (live geladen von `raw.githubusercontent.com`)
- Gemeindegrenzen und Einwohnerzahlen: [swisstopo swissBOUNDARIES3D](https://www.swisstopo.admin.ch/de/landschaftsmodell-swissboundaries3d)

## 📦 Installation

### Lokale Entwicklung

1. Repository klonen:
```bash
git clone https://github.com/defikarte/defi_stats.git
cd defi_stats
```

2. Lokalen Server starten (z.B. mit Python):
```bash
python -m http.server 8000
```

3. Im Browser öffnen:
```
http://localhost:8000/                → Statistik-Seite
http://localhost:8000/reports/?r=be   → Report Kanton Bern
```

### Deployment

Deployt wird automatisch ab GitHub nach **stats.defikarte.ch** (Workflow `deploy.yml`, per FTP):

- bei jedem Push auf `main`
- nach jedem erfolgreichen Lauf der Update-Workflows (Statistik, Europa, Gemeindegrenzen)
- manuell: Actions → "Deploy stats.defikarte.ch" → "Run workflow"

Dabei wird für jeden Eintrag in `reports/reports.json` die Seite `/<id>/` erzeugt (z.B. `stats.defikarte.ch/zh/`), und alle lokalen JS/CSS-Dateien bekommen die Commit-Nummer angehängt (`report.js?v=a5c5d3c`), damit Browser nach jedem Deploy die neue Version laden. Hochgeladen werden nur geänderte Dateien. Nicht hochgeladen werden `.github/`, `archive/`, `scripts/`, `README.md`, `LICENSE`, `screenshot.png` und `defikarte-praesentation.html`.

**Secrets:** `FTP_HOST`, `FTP_USER`, `FTP_PASS`, `FTP_PATH` (Webroot von stats.defikarte.ch)

### 🤖 Automatische Updates (GitHub Actions)

| Workflow | Wann | Was |
|----------|------|-----|
| `update-statistics.yml` | 1. jedes Monats, 09:00 UTC | Zählt die Defis aller 26 Kantone und ergänzt `historical-data.json` (Schweizer Total und Zahlen pro Kanton). Fehlt ein Kanton, bricht er ab. |
| `update-europe.yml` | 1. jedes Monats, 10:00 UTC | Fragt die Overpass API für CH, DE, AT, FR, IT, LI ab und schreibt `europe-data.json`. |
| `update-gemeinden.yml` | jährlich am 15. Februar | Erzeugt Gemeindegrenzen (`reports/kantone/`) und `einwohner.json` neu, damit Gemeindefusionen übernommen werden. |
| `deploy.yml` | bei Push auf `main` und nach den drei Workflows oben | Lädt die Seite per FTP nach stats.defikarte.ch. |

Alle Workflows lassen sich auch manuell starten: Actions → Workflow wählen → "Run workflow".

## 📊 Ausgewertete Angaben

| OSM-Tag | Angabe | Gruppe |
|---------|--------|--------|
| `defibrillator:location` | Standortbeschreibung | wichtig im Notfall |
| `access` | Zugänglichkeit | wichtig im Notfall |
| `opening_hours` | Öffnungszeiten (`24/7` = rund um die Uhr erreichbar) | wichtig im Notfall |
| `indoor` | Innen / Aussen | wichtig im Notfall |
| `operator` | Betreiber | Zusatzangabe |
| `phone` | Telefonnummer | Zusatzangabe |
| `description` | Beschreibung | Zusatzangabe |
| `level` | Stockwerk | Zusatzangabe |
| `wheelchair` | Rollstuhlzugang | Zusatzangabe |

Ein Defi gilt als **einsatztauglich erfasst**, wenn alle vier Notfall-Angaben vorhanden sind. **24/7** zählt Einträge mit `opening_hours=24/7`.

## 📈 Wachstum (`historical-data.json`)

Monatliche Zählung, ab Oktober 2021 zusätzlich pro Kanton (rückwirkend aus der Git-Historie von `defi_data` rekonstruiert, seither vom Workflow `update-statistics.yml` geschrieben):

```json
[
  {"date": "2020-03-01", "count": 2200},
  {"date": "2026-10-01", "count": 17309, "cantons": {"ag": 1433, "ai": 63, "…": 0}}
]
```

`count` ist die kommunizierte Schweizer Gesamtzahl. Fehlt beim monatlichen Lauf ein Kanton, bricht der Workflow ab, statt ein zu tiefes Total zu speichern.

## 🌍 Ländervergleich (`europe/defi_europe.html`)

Die Europe-Seite zeigt die Schweiz im Vergleich mit ihren Nachbarländern (DE, AT, FR, IT, LI).

### Features:
- **Choropleth-Karte** (D3.js, Mercator-Projektion) mit Ländereinfärbung
- **Toggle**: Absolut / pro 100k Einwohner
- **Rangliste**: Sortierbar nach Total, pro 100k oder A–Z
- **Keine Live-Abfragen**: Daten kommen aus gecachter `europe-data.json`

### Datenformat (`europe-data.json`):
```json
{
  "updated": "2026-09-02",
  "countries": {
    "CH": 17154,
    "DE": 20028,
    "AT": 1840,
    "FR": 28020,
    "IT": 7751,
    "LI": 221
  }
}
```

## 🔧 Aufbau

| Datei | Inhalt |
|-------|--------|
| `index.html` | Statistik-Seite |
| `assets/stats.js`, `assets/stats.css` | Logik und Layout der Statistik-Seite |
| `assets/social.js` | Social-Media-Grafiken (nur mit `?tools` geladen) |
| `assets/brand.css` | Gemeinsames Design (Statistik und Reports), nach defikarte.ch |
| `einwohner.json` | Einwohner pro Kanton (swisstopo), erzeugt von `scripts/build_gemeinden.py` |
| `img/wappen/<kt>.png`, `img/logo.svg` | Kantonswappen und Logo |

## 📝 Datenformat

Statistik und Reports lesen die GeoJSON-Dateien `defis_kt_<kt>.geojson` aus `defikarte/defi_data`:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "emergency": "defibrillator",
        "defibrillator:location": "Beim Haupteingang links",
        "access": "yes",
        "indoor": "no",
        "opening_hours": "24/7",
        "phone": "+41 44 123 45 67",
        "description": "Beim Haupteingang",
        "level": "0",
        "wheelchair": "yes",
        "operator": "Gemeinde Zürich",
        "ref": "ZH-001",
        "note": "Weitere Hinweise"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [8.5417, 47.3769]
      }
    }
  ]
}
```

## 🏥 Kantons-Reports (Dienstleistung)

Alle Kantons- und Kunden-Reports laufen über **eine** Vorlage in `reports/`. Jeder Eintrag in `reports/reports.json` wird beim Deploy zu einer eigenen URL:

```text
stats.defikarte.ch/zh/     → Kanton Zürich
stats.defikarte.ch/bs/     → Basel-Stadt & Basel-Landschaft (mit Tabs)
stats.defikarte.ch/luks/   → LUKS-Einzugsgebiet (LU/UR/NW/OW, Report für das Luzerner Kantonsspital)
```

Alternativ funktioniert immer auch `stats.defikarte.ch/reports/?r=<id>`.

| Datei | Inhalt |
|-------|--------|
| `reports/reports.json` | **Liste aller Reports** – hier werden Kunden eingetragen |
| `reports/index.html`, `reports/report.js` | Vorlage und Logik (gilt für alle Reports) |
| `reports/i18n.js` | Texte auf Deutsch und Französisch |
| `reports/geo.js` | Gemeinde-Zuordnung und Auswertung |
| `assets/brand.css` | Design (gemeinsam mit der Statistik-Seite) |
| `reports/kantone/<kt>.json` | Gemeindegrenzen, eine Datei pro Kanton (generiert) |

### Neuen Kanton / Kunden aufschalten

Einen Eintrag in `reports/reports.json` ergänzen und auf `main` pushen – fertig. Der Schlüssel ist die URL (`"sg"` → `stats.defikarte.ch/sg/`). Kein HTML, keine Gemeindelisten.

```jsonc
"sg": { "cantons": ["sg"] },                               // → "Defibrillatoren im Kanton St. Gallen"

"ksa": {                                                   // mehrere Kantone → automatisch Tabs + Kantonsspalte
  "cantons": ["ag", "so"],
  "title": "KSA-Einzugsgebiet",                            // optional, Standard: "Kanton X" bzw. "X & Y"
  "preposition": "im",                                     // optional: "im" / "in"
  "client": { "short": "KSA", "name": "Kantonsspital Aarau" }  // optional: "Report für …" im Kopfbereich und Kürzel im PDF
}
```

Optional können einzelne Defis manuell einer Gemeinde zugewiesen werden: `"overrides": { "node/123456": "Bern" }`.

**Sprache** – Reports gibt es auf Deutsch und Französisch (Texte in `reports/i18n.js`):

- GE, NE, VD, JU: standardmässig Französisch, mit Umschalter FR | DE
- BE, FR, VS (zweisprachig): standardmässig Deutsch, mit Umschalter DE | FR
- alle anderen: nur Deutsch
- fest einstellen mit `"lang": "fr"`, verlinken mit `?lang=fr` (z.B. `stats.defikarte.ch/be/?lang=fr`)
- eigener Titel auf Französisch: `"title_fr": "…"`, optional `"preposition_fr": "dans la"`

**Vertriebspartner** – Logo im Header, im Footer und im PDF:

```jsonc
"be": {
  "cantons": ["be"],
  "partner": {
    "name": "sureVIVE",                                               // Alt-Text und Fallback im PDF
    "logo": "https://assets.defikarte.ch/logo/surevive_negativ.png",  // helle Version für dunklen Hintergrund
    "url": "https://…"                                                // optional: Link auf das Logo
  }
}
```

Damit das Logo auch ins PDF eingebettet wird, muss der Logo-Server CORS erlauben (`Access-Control-Allow-Origin`), oder das Logo liegt im Repo (z.B. `"logo": "/img/partner/surevive_negativ.png"`). Sonst steht im PDF der Name als Text.

### Gemeinde-Zuordnung

Jeder Defi wird über seine GPS-Koordinate der **politischen Gemeinde** zugeordnet (Punkt-in-Polygon mit den offiziellen Grenzen von swisstopo). Nur wenn ein Punkt ausserhalb aller Gemeinden liegt (z.B. auf einem See), wird das Adressfeld bzw. die nächstgelegene Gemeinde verwendet. Ortsteile, Schreibvarianten und Betreiber-Listen müssen deshalb nicht mehr gepflegt werden.

Die Grenzen (`reports/kantone/`) werden mit `python3 scripts/build_gemeinden.py` aus [swissBOUNDARIES3D](https://www.swisstopo.admin.ch/de/landschaftsmodell-swissboundaries3d) erzeugt (auf 10 m vereinfacht, Abweichung gegenüber den Originalgrenzen < 0,05 % der Defis). Der Workflow `update-gemeinden.yml` macht das jährlich im Februar automatisch, damit Gemeindefusionen übernommen werden.

### Lokal testen

```bash
python3 -m http.server 8000
# → http://localhost:8000/reports/?r=be
```

(Direktes Öffnen per `file://` funktioniert nicht, da die Konfiguration per `fetch` geladen wird.)

## 🗂️ Alle Dateien im Überblick

| Datei | Beschreibung |
|-------|-------------|
| `index.html`, `assets/` | Statistik-Seite (Gesamtzahl, 24/7, Wachstum, Kantone) |
| `reports/` | Kantons-Reports (eine Vorlage für alle, siehe oben) |
| `europe/defi_europe.html` | Ländervergleich CH / Nachbarländer |
| `historical-data.json` | Monatliche Zahlen: Schweiz seit 2020, pro Kanton seit Oktober 2021 |
| `europe-data.json` | Defi-Zahlen Nachbarländer (monatlich) |
| `einwohner.json` | Einwohner pro Kanton (swisstopo) |
| `img/` | Logo und Kantonswappen |
| `scripts/build_gemeinden.py` | Erzeugt Gemeindegrenzen und Einwohnerzahlen |
| `archive/` | Alte, nicht mehr verwendete Kantons-Reports |

## 🤝 Mitwirken

Beiträge sind willkommen! So können Sie helfen:

1. **Datenqualität verbessern**: Defibrillatoren in OpenStreetMap vervollständigen
2. **Code-Beiträge**: Pull Requests für neue Features oder Bugfixes
3. **Feedback**: Issues für Verbesserungsvorschläge oder Fehlerberichte

### Development Guidelines

- Kein Build-Prozess erforderlich
- Vanilla JavaScript bevorzugt
- Code-Kommentare auf Deutsch oder Englisch
- Responsive Design beibehalten

## 📄 Lizenz

Dieses Projekt steht unter der [MIT License](LICENSE).

Die Defibrillator-Daten stammen von OpenStreetMap und unterliegen der [ODbL](https://opendatacommons.org/licenses/odbl/).

## 🙏 Danksagungen

- **OpenStreetMap Community** - Für die Erfassung der Defibrillator-Daten
- **swisstopo** - Für Gemeindegrenzen und Einwohnerzahlen
- **Alle Contributors** - Die zur Verbesserung der Statistik beitragen

## 📧 Kontakt

Bei Fragen oder Anregungen:
- GitHub Issues: [Issues erstellen](https://github.com/defikarte/defi_stats/issues)
- Website: [defikarte.ch](https://defikarte.ch)

---

## 🎨 Design & Styleguide

Statistik-Seite und Reports folgen dem Design von defikarte.ch. Alle Farben sind als CSS-Variablen in `assets/brand.css` definiert:

- **Dunkelgrün** `#154430` – Header, Footer, Text
- **Hellgrün** `#98C867` – Akzente, hervorgehobene Werte
- **Verlauf** `#154430 → #659552` – Kopfbereich, Aufruf
- **Hintergrund** `#F7F6F3`, Karten weiss
- **Schrift** Poppins (500 für Titel, 300 für Fliesstext)

---

**Hinweis**: Die 24/7 Verfügbarkeit basiert auf dem Tag `opening_hours=24/7` in OpenStreetMap. Bitte verifizieren Sie vor Ort, ob ein Defibrillator tatsächlich rund um die Uhr zugänglich ist.
