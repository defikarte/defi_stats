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

Das Dashboard ist eine statische HTML-Datei und kann auf jedem Webserver gehostet werden:

- GitHub Pages
- Netlify
- Vercel
- Ihr eigener Webserver

Einfach die `defikarte-dashboard.html` und `historical-data.json` hochladen und fertig!

### 🤖 Automatische Statistik-Updates (GitHub Actions)

Das Repository enthält einen GitHub Actions Workflow für automatische monatliche Updates:

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
- **Schriftart**: Poppins (laut Styleguide) / Open Sans (im Dashboard)

Alle Farben sind in CSS-Variablen definiert und können zentral angepasst werden.

---

**Hinweis**: Die 24/7 Verfügbarkeit basiert auf dem Tag `opening_hours=24/7` in OpenStreetMap. Bitte verifizieren Sie vor Ort, ob ein Defibrillator tatsächlich rund um die Uhr zugänglich ist.
