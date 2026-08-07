# Defi-Report LUKS — Luzerner Kantonsspital

Interaktiver Report zur Auswertung der Defibrillator-Daten im LUKS-Einzugsgebiet (Kantone Luzern, Uri, Nidwalden, Obwalden), erstellt in Zusammenarbeit mit dem Luzerner Kantonsspital (LUKS).

## 🎯 Über den Report

Der LUKS-Report zeigt eine detaillierte Übersicht aller in OpenStreetMap erfassten Defibrillatoren in den vier Zentralschweizer Kantonen, aufgeschlüsselt nach Gemeinden. Über Kanton-Tabs lassen sich die Kantone separat oder gemeinsam auswerten.

### Hauptfunktionen

- **📊 Gemeindeübersicht**: Sortierbare Tabelle mit allen Gemeinden der 4 Kantone
- **🗂️ Kanton-Tabs**: Filterung nach LU, UR, NW, OW oder alle
- **🕐 24/7 Verfügbarkeit**: Auswertung rund um die Uhr erreichbarer Defibrillatoren
- **📄 PDF-Export**: Report des aktiven Tabs als PDF
- **📊 CSV-Export**: Defibrillatoren des aktiven Tabs als CSV (1 Zeile pro Defi)
- **🔍 Suchfunktion**: Schnelle Suche nach Gemeinden

### Kennzahlen

- **Defibrillatoren total** (alle 4 Kantone)
- Aufschlüsselung nach **LU / UR / NW / OW**
- **24/7 erreichbare** Defibrillatoren
- **Anzahl Gemeinden** mit mindestens einem Defibrillator

## 🗺️ Abgedeckte Gemeinden

| Kanton | Gemeinden |
|--------|-----------|
| **Luzern (LU)** | 67 |
| **Uri (UR)** | 19 (Stand nach Fusionen 2021) |
| **Nidwalden (NW)** | 11 |
| **Obwalden (OW)** | 7 |
| **Total** | 104 |

### Korrekturen und Fusionen

| OSM-Eintrag | Gemeinde | Bemerkung |
|-------------|----------|-----------|
| Amsteg | Silenen | Ortsteil von Silenen |
| Bauen | Seedorf | Fusion 2021 |
| Flüeli-Ranft | Sachseln | Ortsteil von Sachseln |
| Kaiserstuhl OW | Kerns | Ortsteil von Kerns |
| Emmetten | NW | Korrekt (nicht URI) |
| Buochs | NW | Korrekt (nicht URI) |
| Gersau | — | Gehört zu SZ, nicht im Report |

## 🗂️ Kanton-Tabs und CSV-Export

Der CSV-Export berücksichtigt den aktiven Tab:

| Tab | CSV-Inhalt | Dateiname |
|-----|-----------|-----------|
| Alle Kantone | LU + UR + NW + OW | `defibrillatoren-luks-alle-kantone-DD-MM-YYYY.csv` |
| Luzern | Nur LU | `defibrillatoren-luks-lu-DD-MM-YYYY.csv` |
| Uri | Nur UR | `defibrillatoren-luks-ur-DD-MM-YYYY.csv` |
| Nidwalden | Nur NW | `defibrillatoren-luks-nw-DD-MM-YYYY.csv` |
| Obwalden | Nur OW | `defibrillatoren-luks-ow-DD-MM-YYYY.csv` |

Das CSV enthält zusätzlich eine `kanton`-Spalte (LU/UR/NW/OW).

## 🏥 Partner

Dieser Report wurde in Zusammenarbeit mit dem **Luzerner Kantonsspital (LUKS)** erstellt.

## 🏥 Spezial-Zuordnungen (SPECIAL)

Bekannte Institutionen werden direkt einer Gemeinde zugeordnet:

- **Luzerner Kantonsspital / LUKS** → Luzern
- **Kantonsspital Nidwalden** → Stans
- **Kantonsspital Obwalden** → Sarnen
- **Kantonsspital Uri** → Altdorf
- **Verkehrsbetriebe Luzern (VBL)** → Luzern
- **Zentralbahn** → Luzern
- **Pilatus-Bahnen** → Kriens
- **Rigi Bahnen** → Küssnacht am Rigi
- **Titlisbahnen** → Engelberg

## 🚀 Demo

Live unter [stats.defikarte.ch/reports/defi_report_luks.html](https://stats.defikarte.ch/reports/defi_report_luks.html)

## 🛠️ Technologie

- **Vanilla JavaScript** — Keine Framework-Abhängigkeiten
- **HTML5** — Single-File Application
- **jsPDF + AutoTable** — PDF-Generierung im Browser
- **jsDelivr CDN** — Datenbezug

### Datenquellen

```
https://cdn.jsdelivr.net/gh/defikarte/defi_data@main/data/json/defis_kt_lu.geojson
https://cdn.jsdelivr.net/gh/defikarte/defi_data@main/data/json/defis_kt_ur.geojson
https://cdn.jsdelivr.net/gh/defikarte/defi_data@main/data/json/defis_kt_nw.geojson
https://cdn.jsdelivr.net/gh/defikarte/defi_data@main/data/json/defis_kt_ow.geojson
```

## 📦 Installation

```bash
git clone https://github.com/defikarte/defi_stats.git
cd defi_stats
python -m http.server 8000
# → http://localhost:8000/reports/defi_report_luks.html
```

## 📊 CSV-Export

Der CSV-Export enthält pro Defibrillator:

| Spalte | Inhalt |
|--------|--------|
| `gemeinde` | Zugeordnete Gemeinde |
| `kanton` | LU, UR, NW oder OW |
| `latitude` / `longitude` | GPS-Koordinaten |
| `opening_hours` | z.B. "24/7" |
| `access` | z.B. "yes", "private" |
| `operator` | Betreiber |
| `name` | Standortname |
| `phone` | Telefonnummer |
| `description` | Beschreibung |
| `indoor` | Ja/Nein |
| `level` | Stockwerk |
| `note` | Bemerkungen |
| `osm_id` | OpenStreetMap-ID |

Das CSV enthält ein UTF-8 BOM für korrekte Darstellung in Excel.

## 🔧 Gemeinde-Zuordnung

### Bereinigung von Gemeindenamen

Die `cleanGemeindeName()`-Funktion bereinigt automatisch störende Zusätze:

```
"Malters / Hauswart"        → Malters
"Sursee Ressort Soziales"   → Sursee
"Stans; Abwart Müller"      → Stans
```

### Mehrstufige Zuordnung

1. `addr:city` bereinigen und gegen bekannte Gemeinden prüfen
2. `operator` und `name` Felder auswerten (SPECIAL-Tabelle)
3. GPS-Koordinaten als Fallback (nächste bekannte Gemeinde)

## 🎨 Design

Dem offiziellen defikarte.ch Styleguide folgend:

- **Primärfarbe**: `#97C568` (Hellgrün)
- **Sekundärfarbe**: `#144430` (Dunkelgrün)
- **Schriftart**: Poppins

## 📧 Kontakt

- **defikarte.ch**: [defikarte.ch](https://defikarte.ch)
- **OpenBrackets CH**: [GitHub](https://github.com/defikarte)
- **LUKS**: [luks.ch](https://www.luks.ch)

## 📝 Verwandte Projekte

- [Defikarte.ch Dashboard](https://stats.defikarte.ch) — Schweizweites Übersichts-Dashboard
- [soH Report](https://stats.defikarte.ch/reports/defi_report_soh.html) — Kanton Solothurn
- [defikarte.ch](https://defikarte.ch) — Karte aller Defibrillatoren in der Schweiz

## 📄 Lizenz

[MIT License](LICENSE) · Daten: [ODbL](https://opendatacommons.org/licenses/odbl/) via OpenStreetMap
