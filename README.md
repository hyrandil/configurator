# Configurator Studio

Configurator Studio ist eine moderne, interaktive Web-App, mit der Admins Kalkulations- und Rechnervorlagen aus modularen Elementen zusammenstellen können. Die Demo zeigt eine Pricing Engine mit Unit-Preisen, Staffeln, Mindestpreisen und globalen Rabatten – inklusive Live-Preiszusammenfassung.

## Features

- **Element-Bibliothek**: vCPU, RAM, GPU, Storage, Support-Tier als wiederverwendbare Bausteine.
- **Live Pricing**: Zwischensumme, Rabatt und Mindestpreis werden in Echtzeit berechnet.
- **Regel-Engine Demo**: Staffelpreise (RAM), Fixpreise (GPU/Support) und Mindestpreise (Storage).
- **Builder-Flow**: Elemente hinzufügen/entfernen, Entwurf speichern, Angebot erzeugen.
- **Modernes UI**: Glassmorphism, Gradient-Highlights und responsive Layout.

## Installation

Du kannst die App ohne Build-Tool lokal starten – es handelt sich um eine statische Web-App.

### Option 1: Mit Node (empfohlen)

```bash
npx serve .
```

### Option 2: Mit Python

```bash
python -m http.server 8080
```

### Option 3: Direkt öffnen

Öffne die `index.html` im Browser. Einige Browser blockieren lokale Skripte; mit einem lokalen Server bist du auf der sicheren Seite.

## Nutzung

1. **Element hinzufügen**: Klicke links in der Element-Bibliothek auf „Element hinzufügen“.
2. **Konfiguration anpassen**: Nutze Slider oder Dropdowns, um Werte zu ändern.
3. **Pricing Rules**: Passe den globalen Rabatt oder den Mindestpreis an.
4. **Pricing prüfen**: Die Preis-Zusammenfassung aktualisiert sich sofort.
5. **Workflow testen**: Nutze „Entwurf speichern“ oder „Angebot erzeugen“ für Demo-Aktionen.

## Projektstruktur

```text
.
├── index.html      # App-Markup
├── styles.css      # Design & Layout
├── app.js          # Interaktive Logik und Pricing
└── README.md       # Doku & Anleitung
```

## Anpassungsideen

- Weitere Elementtypen hinzufügen (Toggle, Checkbox, komplexe Abhängigkeiten).
- Regeln versionieren und snapshots für Angebote speichern.
- Angebotsvorlagen als PDF generieren und CRM-Integration vorbereiten.

Viel Spaß beim Ausprobieren!
