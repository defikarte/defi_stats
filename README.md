# Defikarte.ch Dashboard

Ein interaktives Dashboard zur Visualisierung und Analyse der Defibrillator-Datenqualität in der Schweiz.

## 🎯 Über das Projekt

Das Defikarte.ch Dashboard bietet eine umfassende Übersicht über die Qualität und Vollständigkeit der Defibrillator-Daten in allen Schweizer Kantonen. Es analysiert verschiedene Datenattribute und visualisiert die Ergebnisse in einer benutzerfreundlichen Web-Oberfläche.

### Hauptfunktionen

- **📊 Kantone-Ranking**: Sortierbare Tabelle mit Qualitätsscores aller 26 Kantone
  - Klickbare Spaltenköpfe für Sortierung (aufsteigend/absteigend)
  - Sortierbar nach: Name, Defis, Score, 24/7, Standort, Betreiber, Öffnungszeiten, Zugänglichkeit
  - Visuelle Indikatoren für aktive Sortierung (↑↓)
- **📈 KPI-Übersicht**: Wichtige Kennzahlen auf einen Blick
  - Gesamtzahl Defibrillatoren
  - Durchschnittlicher Qualitätsscore
  - Bester Kanton
  - 24/7 Verfügbarkeit (neu!)
- **📊 Wachstums-Grafik**: Historische Entwicklung seit 2020
  - Interaktive Linien-Grafik mit 60+ Datenpunkten
  - Klickbare Datenpunkte mit Tooltip (Datum + Anzahl)
  - Automatische Updates via GitHub Actions
- **🎨 Attribut-Analyse**: Detaillierte Auswertung von 10 Datenattributen
- **📱 Social Media Export**: Professionelle Grafiken für Social Media (1080x1080px)
  - Schweizweite Übersicht
  - Kantone-spezifische Grafiken mit Wappen
- **🌍 Ländervergleich**: Schweiz und Nachbarländer im europäischen Vergleich

## 🚀 Demo

Besuchen Sie [defikarte.ch/dashboard](https://defikarte.ch/dashboard) für eine Live-Demo.

## 🛠️ Technologie

Das Dashboard ist als **Single-Page Application** entwickelt:

- **Vanilla JavaScript** - Keine Framework-Abhängigkeiten
- **HTML5 Canvas API** - Für Grafik-Generierung und Wachstums-Chart
- **CSS3** - Responsive Design mit Flexbox/Grid
- **jsDelivr CDN** - Schnelle Datenlieferung mit Cache-Busting
- **GitHub Actions** - Automatische monatliche Statistik-Updates

### Datenquellen

Die Daten werden von der [OpenStreetMap](https://www.openstreetmap.org/) Community erfasst und über das Repository [defikarte/defi_data](https://github.com/defikarte/defi_data) bereitgestellt.

## 📦 Installation

### Lokale Entwicklung

1. Repository klonen:
```bash
git clone https://github.com/ihr-username/defikarte-dashboard.git
cd defikarte-dashboard
```

2. Lokalen Server starten (z.B. mit Python):
```bash
python -m http.server 8000
```

3. Dashboard im Browser öffnen:
```
http://localhost:8000/defikarte-dashboard.html
```

### Deployment

Deployt wird automatisch ab GitHub nach **stats.defikarte.ch** (Workflow `deploy.yml`, per FTP):

- bei jedem Push auf `main`
- nach jedem erfolgreichen Lauf der Update-Workflows (Statistik, Europa, Gemeindegrenzen)
- manuell: Actions → "Deploy stats.defikarte.ch" → "Run workflow"

Dabei wird für jeden Eintrag in `reports/reports.json` die Seite `/<id>/` erzeugt (z.B. `stats.defikarte.ch/zh/`). Hochgeladen werden nur geänderte Dateien. Nicht hochgeladen werden `.github/`, `archive/`, `scripts/`, `README.md`, `LICENSE`, `screenshot.png` und `defikarte-praesentation.html`.

**Secrets:** `FTP_HOST`, `FTP_USER`, `FTP_PASS`, `FTP_PATH` (Webroot von stats.defikarte.ch)

### 🤖 Automatische Statistik-Updates (GitHub Actions)

Das Repository enthält zwei GitHub Actions Workflows für automatische monatliche Updates:

#### Workflow 1: Schweizer Kantone (`update-statistics.yml`)

1. **Setup:**
   ```
   .github/
     └── workflows/
         └── update-statistics.yml
   ```

2. **Funktionsweise:**
   - Läuft automatisch am **1. jeden Monats um 09:00 UTC**
   - Lädt alle 26 Kantone-GeoJSON-Dateien
   - Summiert die Gesamtzahl der Defibrillatoren
   - Fügt neuen Datenpunkt zu `historical-data.json` hinzu
   - Committed automatisch mit Nachricht: "📊 Automatisches Update: YYYY-MM-DD - XXXXX Defibrillatoren"

3. **Manuelles Auslösen:**
   - GitHub Repository → Actions Tab
   - Workflow "Update Defibrillator Statistics" auswählen
   - "Run workflow" Button klicken

4. **Voraussetzungen:**
   - Repository muss `historical-data.json` enthalten
   - GitHub Actions müssen aktiviert sein
   - Standard `GITHUB_TOKEN` hat Schreib-Rechte

#### Workflow 2: Nachbarländer (`update-europe.yml`)

1. **Setup:**
   ```
   .github/
     └── workflows/
         └── update-europe.yml
   ```

2. **Funktionsweise:**
   - Läuft automatisch am **1. jeden Monats um 10:00 UTC** (nach dem Schweiz-Workflow)
   - Fragt Overpass API für CH, DE, AT, FR, IT und LI ab
   - Schreibt Ergebnisse in `europe-data.json`
   - Committed; der Upload läuft danach über `deploy.yml`

3. **Manuelles Auslösen (Erstbefüllung):**
   - GitHub Repository → Actions Tab
   - Workflow "Update Europe Defibrillator Data" auswählen
   - "Run workflow" Button klicken
   - ⚠️ Muss **einmalig manuell** ausgelöst werden um `europe-data.json` initial zu befüllen

## 📊 Analysierte Attribute

Das Dashboard bewertet folgende Datenattribute:

| Attribut | Gewichtung | Beschreibung |
|----------|-----------|--------------|
| `access` | 2.0 | Zugangsinformationen |
| `indoor` | 2.0 | Innen/Außen-Kennzeichnung |
| `opening_hours` | 1.5 | Öffnungszeiten (inkl. 24/7) |
| `phone` | 1.0 | Kontakttelefon |
| `description` | 1.0 | Beschreibung |
| `level` | 0.5 | Stockwerk |
| `wheelchair` | 0.5 | Rollstuhlzugang |
| `operator` | 0.5 | Betreiber |
| `ref` | 0.5 | Referenznummer |
| `note` | 0.5 | Zusätzliche Notizen |

Der **Qualitätsscore** wird als gewichteter Durchschnitt berechnet:
```
Score = (Σ vorhandene_Attribute × Gewichtung) / (Σ alle_Gewichtungen) × 100%
```

### 24/7 Verfügbarkeit

Die 24/7 Verfügbarkeit zeigt den Prozentsatz der Defibrillatoren, die rund um die Uhr zugänglich sind:
- Basiert auf OpenStreetMap-Tag `opening_hours=24/7`
- Wird für jeden Kanton einzeln berechnet
- Zeigt absolute Zahl und Prozentsatz
- Schweizweiter Durchschnitt in den KPIs

## 📈 Wachstums-Grafik

Das Dashboard enthält eine interaktive Wachstums-Grafik mit historischen Daten seit März 2020:

### Features:
- **60+ Datenpunkte** von 2020 bis heute
- **Interaktive Tooltips**: Hover über Datenpunkte zeigt Datum und exakte Anzahl
- **Automatische Updates**: Via GitHub Actions am 1. jeden Monats
- **Responsive Design**: Passt sich an Bildschirmgröße an
- **Canvas-basiert**: Keine externe Chart-Library nötig

### Datenformat (`historical-data.json`):
```json
[
  {"date": "2020-03-01", "count": 2200},
  {"date": "2020-08-13", "count": 3463},
  ...
  {"date": "2026-04-01", "count": 16353}
]
```

### Manuelle Aktualisierung:
Falls GitHub Actions nicht verwendet werden, kann die `historical-data.json` manuell aktualisiert werden:
1. Aktuellen Wert ermitteln (aus Dashboard oder via Overpass)
2. Neuen Eintrag am Ende der JSON-Datei hinzufügen
3. Datum im Format `YYYY-MM-DD` verwenden
4. Datei speichern und deployen

## 🌍 Ländervergleich (`defi_europe.html`)

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

### Erstbefüllung:
Die Datei wird durch den Workflow `update-europe.yml` befüllt. Einmalig manuell auslösen via GitHub Actions → "Update Europe Defibrillator Data" → "Run workflow".

## 🎨 Export-Funktion

Das Dashboard kann professionelle Social-Media-Grafiken erstellen:

### Übersicht-Grafik
- Schweizweite Statistiken
- KPIs (Total, Score, 24/7)
- Top-3 Attribut-Balken
- Defikarte.ch Logo

### Kantone-Grafik
- Kantonswappen
- Großer Qualitätsscore
- Detaillierte Attribut-Balken (alle 10 Attribute)
- Anzahl Defibrillatoren

Beide Formate: **1080×1080 Pixel** (optimiert für Instagram, Facebook, LinkedIn)

## 🔧 Konfiguration

### CDN-URL anpassen

Die Datenquelle kann in Zeile 739 geändert werden:

```javascript
const CDN = 'https://cdn.jsdelivr.net/gh/defikarte/defi_data@main/data/json/';
```

### Cache-Control

Das Dashboard verwendet Cache-Busting für aktuelle Daten:
```javascript
const url = `${CDN}defis_kt_${canton.code}.geojson?t=${Date.now()}`;
```

Dies stellt sicher, dass immer die neuesten Daten vom CDN geladen werden, ohne auf Browser- oder CDN-Cache zu warten.

### Sortierbare Tabelle

Die Tabelle unterstützt Sortierung nach allen Spalten:
- Klick auf Spaltenköpfe aktiviert Sortierung
- Erneuter Klick auf gleiche Spalte wechselt zwischen aufsteigend (↑) und absteigend (↓)
- Standard: Score absteigend (höchster zuerst)
- Implementiert in: `sortBy()` und `renderTable()` Funktionen

### Gewichtungen anpassen

Die Attribut-Gewichtungen können in Zeile 755 modifiziert werden:

```javascript
const WEIGHTS = {
  'access':2, 'indoor':2, 'opening_hours':1.5, 'phone':1,
  'description':1, 'level':0.5, 'wheelchair':0.5,
  'operator':0.5, 'ref':0.5, 'note':0.5
};
```

### Historische Daten aktualisieren

**Option 1: Automatisch (empfohlen)**
- GitHub Actions Workflow läuft am 1. jeden Monats
- Keine manuelle Arbeit erforderlich

**Option 2: Manuell**
- `historical-data.json` bearbeiten
- Neuen Eintrag hinzufügen: `{"date": "2026-05-01", "count": 16500}`
- Nach Datum sortiert halten
- File committen und deployen

## 📝 Datenformat

Das Dashboard erwartet GeoJSON-Dateien im folgenden Format:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "emergency": "defibrillator",
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
stats.defikarte.ch/luks/   → LUKS-Einzugsgebiet (LU/UR/NW/OW, mit Kundenbranding)
```

Alternativ funktioniert immer auch `stats.defikarte.ch/reports/?r=<id>`.

| Datei | Inhalt |
|-------|--------|
| `reports/reports.json` | **Liste aller Reports** – hier werden Kunden eingetragen |
| `reports/index.html`, `report.js`, `report.css` | Vorlage, Logik, Design (gilt für alle Reports) |
| `reports/geo.js` | Gemeinde-Zuordnung und Auswertung |
| `reports/gemeinden/<kt>.json` | Gemeindegrenzen aller 26 Kantone (generiert) |

### Neuen Kanton / Kunden aufschalten

Einen Eintrag in `reports/reports.json` ergänzen und auf `main` pushen – fertig. Der Schlüssel ist die URL (`"sg"` → `stats.defikarte.ch/sg/`). Kein HTML, keine Gemeindelisten.

```jsonc
"sg": { "cantons": ["sg"] },                               // → "Defibrillatoren im Kanton St. Gallen"

"ksa": {                                                   // mehrere Kantone → automatisch Tabs + Kantonsspalte
  "cantons": ["ag", "so"],
  "title": "KSA-Einzugsgebiet",                            // optional, Standard: "Kanton X" bzw. "X & Y"
  "preposition": "im",                                     // optional: "im" / "in"
  "client": { "short": "KSA", "name": "Kantonsspital Aarau" }  // optional: Kundenbranding in Header, Hero und PDF
}
```

Optional können einzelne Defis manuell einer Gemeinde zugewiesen werden: `"overrides": { "node/123456": "Bern" }`.

### Gemeinde-Zuordnung

Jeder Defi wird über seine GPS-Koordinate der **politischen Gemeinde** zugeordnet (Punkt-in-Polygon mit den offiziellen Grenzen von swisstopo). Nur wenn ein Punkt ausserhalb aller Gemeinden liegt (z.B. auf einem See), wird das Adressfeld bzw. die nächstgelegene Gemeinde verwendet. Ortsteile, Schreibvarianten und Betreiber-Listen müssen deshalb nicht mehr gepflegt werden.

Die Grenzen (`reports/gemeinden/`) werden mit `python3 scripts/build_gemeinden.py` aus [swissBOUNDARIES3D](https://www.swisstopo.admin.ch/de/landschaftsmodell-swissboundaries3d) erzeugt (auf 10 m vereinfacht, Abweichung gegenüber den Originalgrenzen < 0,05 % der Defis). Der Workflow `update-gemeinden.yml` macht das jährlich im Februar automatisch, damit Gemeindefusionen übernommen werden.

### Lokal testen

```bash
python3 -m http.server 8000
# → http://localhost:8000/reports/?r=be
```

(Direktes Öffnen per `file://` funktioniert nicht, da die Konfiguration per `fetch` geladen wird.)

## 🗂️ Alle Dateien im Überblick

| Datei | Beschreibung |
|-------|-------------|
| `defikarte-dashboard.html` | Hauptdashboard (alle Kantone, Ranking, Wachstum) |
| `reports/` | Kantons-Reports (eine Vorlage für alle, siehe unten) |
| `scripts/build_gemeinden.py` | Erzeugt die Gemeindegrenzen für die Reports |
| `defi_europe.html` | Ländervergleich CH / Nachbarländer |
| `historical-data.json` | Monatliche CH-Gesamtzahlen (seit 2020) |
| `europe-data.json` | Defi-Zahlen Nachbarländer (monatlich) |

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
- **jsDelivr** - Für das kostenlose CDN
- **Alle Contributors** - Die zur Verbesserung des Dashboards beitragen

## 📧 Kontakt

Bei Fragen oder Anregungen:
- GitHub Issues: [Issues erstellen](https://github.com/ihr-username/defikarte-dashboard/issues)
- Website: [defikarte.ch](https://defikarte.ch)

---

## 🎨 Design & Styleguide

Das Dashboard verwendet das offizielle defikarte.ch Farbschema:

- **Primärfarbe (Hellgrün)**: `#97C568` - für Buttons, Highlights, positive Werte
- **Sekundärfarbe (Dunkelgrün)**: `#144430` - für Header, Text, dunkle Elemente
- **Schriftart**: Poppins

Alle Farben sind in CSS-Variablen definiert und können zentral angepasst werden.

---

**Hinweis**: Die 24/7 Verfügbarkeit basiert auf dem Tag `opening_hours=24/7` in OpenStreetMap. Bitte verifizieren Sie vor Ort, ob ein Defibrillator tatsächlich rund um die Uhr zugänglich ist.
