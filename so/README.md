# Defi-Report soH — Solothurner Spitäler

Interaktiver Report zur Auswertung der Defibrillator-Daten im Kanton Solothurn, erstellt in Zusammenarbeit mit den Solothurner Spitälern (soH).

## 🎯 Über den Report

Der soH-Report zeigt eine detaillierte Übersicht aller in OpenStreetMap erfassten Defibrillatoren im Kanton Solothurn, aufgeschlüsselt nach Gemeinden. Er dient als Grundlage für die Verbesserung der Defibrillator-Infrastruktur und Datenqualität im Kanton.

### Hauptfunktionen

- **📊 Gemeindeübersicht**: Sortierbare Tabelle mit allen Gemeinden des Kantons Solothurn
- **🕐 24/7 Verfügbarkeit**: Auswertung, welche Defibrillatoren rund um die Uhr erreichbar sind
- **📄 PDF-Export**: Report als PDF für Präsentationen und Berichte
- **🔍 Suchfunktion**: Schnelle Suche nach Gemeinden
- **📱 Responsive Design**: Optimiert für Desktop und Mobile

### Kennzahlen

- **Defibrillatoren total** im Kanton Solothurn
- **24/7 erreichbare** Defibrillatoren (absolut und prozentual)
- **Anzahl Gemeinden** mit mindestens einem Defibrillator

## 🗺️ Abgedeckte Gemeinden

Der Report umfasst alle Gemeinden des Kantons Solothurn (Stand 2026). Doppelgemeinden und fusionierte Gemeinden werden korrekt zugeordnet:

| Doppelgemeinde | Ortsteile |
|---------------|-----------|
| Eppenberg-Wöschnau | Eppenberg, Wöschnau |
| Feldbrunnen-St. Niklaus | Feldbrunnen, St. Niklaus |
| Hauenstein-Ifenthal | Hauenstein, Ifenthal |
| Hofstetten-Flüh | Hofstetten, Flüh |
| Lohn-Ammannsegg | Lohn, Ammannsegg |
| Lüsslingen-Nennigkofen | Lüsslingen, Nennigkofen |
| Lüterkofen-Ichertswil | Lüterkofen, Ichertswil |
| Metzerlen-Mariastein | Metzerlen, Mariastein |
| Mümliswil-Ramiswil | Mümliswil, Ramiswil |
| Nuglar-St. Pantaleon | Nuglar, St. Pantaleon |
| Welschenrohr-Gänsbrunnen | Welschenrohr, Gänsbrunnen (Fusion 2024) |

## 🚀 Demo

Besuchen Sie [stats.defikarte.ch/reports/defi_report_soh.html](https://stats.defikarte.ch/reports/defi_report_soh.html) für die Live-Version.

## 🛠️ Technologie

- **Vanilla JavaScript** — Keine Framework-Abhängigkeiten
- **HTML5** — Single-File Application
- **jsPDF + AutoTable** — PDF-Generierung im Browser
- **jsDelivr CDN** — Datenlieferung von GitHub

### Datenquelle

Die Daten stammen aus OpenStreetMap und werden über das Repository [defikarte/defi_data](https://github.com/defikarte/defi_data) bereitgestellt:

```
https://cdn.jsdelivr.net/gh/defikarte/defi_data@main/data/json/defis_kt_so.geojson
```

## 📦 Installation

### Lokale Entwicklung

1. Repository klonen:
```bash
git clone https://github.com/defikarte/defi_stats.git
cd defi_stats
```

2. Lokalen Server starten:
```bash
python -m http.server 8000
```

3. Report im Browser öffnen:
```
http://localhost:8000/reports/defi_report_soh.html
```

### Deployment

Der Report ist eine einzelne HTML-Datei ohne externe Abhängigkeiten (ausser jsPDF via CDN). Einfach hochladen und fertig.

## 🔧 Gemeinde-Zuordnung

Der Report enthält eine intelligente Gemeinde-Erkennung:

### Bereinigung von Gemeindenamen

OpenStreetMap-Einträge enthalten oft zusätzliche Informationen im `addr:city` Feld. Die `cleanGemeindeName()`-Funktion bereinigt diese automatisch:

```
"Dagmersellen / Hauswart"                  → Dagmersellen
"Wauwil Ressort Soziales und Gesundheit"   → Wauwil
"Ettiswil / Abwart Martin Weibel"          → Ettiswil
```

### Mehrstufige Zuordnung

1. `addr:city` bereinigen und gegen bekannte Gemeinden prüfen
2. `operator` und `name` Felder auswerten
3. GPS-Koordinaten als Fallback (nächste bekannte Gemeinde)

### Normalisierung

Ortsteile und alternative Schreibweisen werden automatisch auf die korrekte Gemeinde gemappt:

```
"Mariastein"    → Metzerlen-Mariastein
"Flüh"          → Hofstetten-Flüh
"Welschenrohr"  → Welschenrohr-Gänsbrunnen
"Ammannsegg"    → Lohn-Ammannsegg
```

## 📄 PDF-Export

Der Report kann als PDF exportiert werden:

- Enthält alle Gemeinden mit Defibrillator-Anzahl und 24/7 Status
- Formatiert für A4-Druck
- Enthält Datum und Quelle
- Generiert im Browser (keine Serveranbindung nötig)

## 🎨 Design

Das Design folgt dem offiziellen defikarte.ch Styleguide:

- **Primärfarbe**: `#97C568` (Hellgrün)
- **Sekundärfarbe**: `#144430` (Dunkelgrün)
- **Schriftart**: Poppins

## 🤝 Partner

Dieser Report wurde in Zusammenarbeit mit den **Solothurner Spitälern (soH)** erstellt. Die soH betreiben mehrere Spitalstandorte im Kanton Solothurn und engagieren sich für die Verbesserung der Erstversorgung bei Herzstillstand.

## 📧 Kontakt

- **defikarte.ch**: [defikarte.ch](https://defikarte.ch)
- **OpenBrackets CH**: [GitHub](https://github.com/defikarte)
- **Solothurner Spitäler**: [soH](https://www.solothurnerspitaeler.ch)

## 📝 Verwandte Projekte

- [Defikarte.ch Dashboard](https://stats.defikarte.ch) — Schweizweites Datenqualitäts-Dashboard
- [LUKS Report](https://stats.defikarte.ch/reports/defi_report_luks.html) — Report für das Luzerner Kantonsspital (LU, UR, NW, OW)
- [defikarte.ch](https://defikarte.ch) — Karte aller Defibrillatoren in der Schweiz

## 📄 Lizenz

Dieses Projekt steht unter der [MIT License](LICENSE).

Die Defibrillator-Daten stammen von OpenStreetMap und unterliegen der [ODbL](https://opendatacommons.org/licenses/odbl/).
