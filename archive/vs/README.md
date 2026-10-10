# Defi-Report Kanton Wallis (Valais)

Interaktiver Report zur Auswertung der Defibrillator-Daten im Kanton Wallis (Valais), basierend auf OpenStreetMap-Daten via [defikarte.ch](https://defikarte.ch).

## 🎯 Über den Report

Der Wallis (Valais)-Report zeigt eine detaillierte Übersicht aller erfassten Defibrillatoren im Kanton Wallis (Valais), aufgeschlüsselt nach Gemeinden.

### Hauptfunktionen

- **📊 Gemeindeübersicht**: Sortierbare Tabelle mit allen Gemeinden des Kantons Wallis (Valais)
- **🕐 24/7 Verfügbarkeit**: Auswertung rund um die Uhr erreichbarer Defibrillatoren
- **📄 PDF-Export**: Report als PDF für Präsentationen und Berichte
- **📊 CSV-Export**: Alle Defibrillatoren als CSV-Datei (1 Zeile pro Defi)
- **🔍 Suchfunktion**: Schnelle Suche nach Gemeinden
- **📱 Responsive Design**: Optimiert für Desktop und Mobile

### Kennzahlen

- **Defibrillatoren total** im Kanton Wallis (Valais)
- **24/7 erreichbare** Defibrillatoren (absolut und prozentual)
- **Anzahl Gemeinden** mit mindestens einem Defibrillator

## 🗺️ Abgedeckte Gemeinden

Der Report umfasst **99 Gemeinden** des Kantons Wallis (Valais). Der Kanton Wallis ist zweisprachig (Deutsch im Oberwallis, Französisch im Unterwallis). OSM-Einträge nutzen je nach Region deutsche oder französische Namen. `Jungfraujoch` wird `Brig-Glis` zugeordnet (nächste bekannte Gemeinde).


## 🚀 Demo

Live unter [stats.defikarte.ch/reports/defi_report_vs.html](https://stats.defikarte.ch/reports/defi_report_vs.html)

## 🛠️ Technologie

- **Vanilla JavaScript** — Keine Framework-Abhängigkeiten
- **HTML5** — Single-File Application
- **jsPDF + AutoTable** — PDF-Generierung im Browser
- **jsDelivr CDN** — Datenbezug

### Datenquelle

```
https://cdn.jsdelivr.net/gh/OpenBracketsCH/defi_data@main/data/json/defis_kt_vs.geojson
```

## 📦 Installation

```bash
git clone https://github.com/OpenBracketsCH/defi_stats.git
cd defi_stats
python -m http.server 8000
# → http://localhost:8000/reports/defi_report_vs.html
```

## 📊 CSV-Export

Der CSV-Export enthält pro Defibrillator:

| Spalte | Inhalt |
|--------|--------|
| `gemeinde` | Zugeordnete Gemeinde |
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
1. `addr:city` bereinigen und gegen bekannte Gemeinden prüfen (NORMALIZE)
2. `operator` und `name` Felder auswerten (SPECIAL-Tabelle)
3. GPS-Koordinaten als Fallback (`closest()`) — nächste bekannte Gemeinde

> **Wichtig:** Unbekannte Ortsnames werden **nie** direkt übernommen — immer GPS-Fallback.

## 🏥 Spezial-Zuordnungen (SPECIAL)

Bekannte Institutionen werden direkt einer Gemeinde zugeordnet:

| Institution | Gemeinde |
|-------------|----------|
| Spital Wallis / Hôpital du Valais / RSO | Sion |
| SBB CFF FFS | Brig-Glis |
| Air Zermatt | Zermatt |
| Air-Glaciers | Sion |

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
