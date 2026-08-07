# Defi-Report Basel-Stadt & Basel-Landschaft

Interaktiver Report zur Auswertung der Defibrillator-Daten in den Kantonen Basel-Stadt und Basel-Landschaft, basierend auf OpenStreetMap-Daten via [defikarte.ch](https://defikarte.ch).

## 🎯 Über den Report

Der BS/BL-Report zeigt eine detaillierte Übersicht aller erfassten Defibrillatoren in beiden Basler Kantonen, aufgeschlüsselt nach Gemeinden. Über Kanton-Tabs lassen sich BS und BL separat oder gemeinsam auswerten.

### Hauptfunktionen

- **📊 Gemeindeübersicht**: Sortierbare Tabelle mit allen Gemeinden beider Kantone
- **🗂️ Kanton-Tabs**: Filterung nach Basel-Stadt, Basel-Landschaft oder beide
- **🕐 24/7 Verfügbarkeit**: Auswertung rund um die Uhr erreichbarer Defibrillatoren
- **📄 PDF-Export**: Report des aktiven Tabs als PDF
- **📊 CSV-Export**: Defibrillatoren des aktiven Tabs als CSV (1 Zeile pro Defi)
- **🔍 Suchfunktion**: Schnelle Suche nach Gemeinden

### Kennzahlen

- **Defibrillatoren total** (BS + BL)
- **Basel-Stadt** und **Basel-Landschaft** separat
- **24/7 erreichbare** Defibrillatoren
- **Anzahl Gemeinden** mit mindestens einem Defibrillator

## 🗺️ Abgedeckte Gemeinden

| Kanton | Gemeinden |
|--------|-----------|
| **Basel-Stadt (BS)** | 3 (Basel, Riehen, Bettingen) |
| **Basel-Landschaft (BL)** | 73 |
| **Total** | 76 |

## 🗂️ Kanton-Tabs und CSV-Export

Der CSV-Export berücksichtigt den aktiven Tab:

| Tab | CSV-Inhalt | Dateiname |
|-----|-----------|-----------|
| Alle | BS + BL | `defibrillatoren-bs-bl-DD-MM-YYYY.csv` |
| Basel-Stadt | Nur BS | `defibrillatoren-bs-DD-MM-YYYY.csv` |
| Basel-Landschaft | Nur BL | `defibrillatoren-bl-DD-MM-YYYY.csv` |

Das CSV enthält zusätzlich eine `kanton`-Spalte (BS/BL).

## 🏥 Spezial-Zuordnungen (SPECIAL)

Bekannte Institutionen werden direkt einer Gemeinde zugeordnet:

- **Universitätsspital Basel / USB** → Basel
- **Kinderspital beider Basel (UKBB)** → Basel
- **Kantonsspital Baselland** → Liestal
- **SBB** → Basel
- **BVB / BLT** → Basel

## 🚀 Demo

Live unter [stats.defikarte.ch/reports/defi_report_bs_bl.html](https://stats.defikarte.ch/reports/defi_report_bs_bl.html)

## 🛠️ Technologie

- **Vanilla JavaScript** — Keine Framework-Abhängigkeiten
- **HTML5** — Single-File Application
- **jsPDF + AutoTable** — PDF-Generierung im Browser
- **jsDelivr CDN / GitHub raw** — Datenbezug

### Datenquellen

```
https://raw.githubusercontent.com/defikarte/defi_data/main/data/json/defis_kt_bs.geojson
https://raw.githubusercontent.com/defikarte/defi_data/main/data/json/defis_kt_bl.geojson
```

## 📦 Installation

```bash
git clone https://github.com/defikarte/defi_stats.git
cd defi_stats
python -m http.server 8000
# → http://localhost:8000/reports/defi_report_bs_bl.html
```

## 📊 CSV-Export

Der CSV-Export enthält pro Defibrillator:

| Spalte | Inhalt |
|--------|--------|
| `gemeinde` | Zugeordnete Gemeinde |
| `kanton` | BS oder BL |
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

Mehrstufige Erkennung:
1. `addr:city` bereinigen und gegen bekannte Gemeinden prüfen
2. `operator` und `name` Felder auswerten (SPECIAL-Tabelle)
3. GPS-Koordinaten als Fallback (nächste bekannte Gemeinde)

## 🎨 Design

Dem offiziellen defikarte.ch Styleguide folgend:

- **Primärfarbe**: `#97C568` (Hellgrün)
- **Sekundärfarbe**: `#144430` (Dunkelgrün)
- **Schriftart**: Poppins

## 📝 Verwandte Projekte

- [Defikarte.ch Dashboard](https://stats.defikarte.ch) — Schweizweites Übersichts-Dashboard
- [LUKS Report](https://stats.defikarte.ch/reports/defi_report_luks.html) — LU/UR/NW/OW
- [soH Report](https://stats.defikarte.ch/reports/defi_report_soh.html) — Kanton Solothurn
- [defikarte.ch](https://defikarte.ch) — Karte aller Defibrillatoren in der Schweiz

## 📄 Lizenz

[MIT License](LICENSE) · Daten: [ODbL](https://opendatacommons.org/licenses/odbl/) via OpenStreetMap
