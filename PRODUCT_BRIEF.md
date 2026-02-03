# Zielbild & Kernprinzipien

## Ziel
Eine Web-App, mit der Admins Kalkulations- und Rechnervorlagen aus konfigurierbaren Elementen bauen können (Slider, Dropdown, Regler), inkl. Einheiten, Preisregeln (pro Einheit & Optionen) und Rabatt-/Staffellogik. Endnutzer konfigurieren anschließend einen Rechner, speichern als Entwurf oder erzeugen ein Angebot mit dynamischen Feldern.

## Prinzipien (damit es langfristig tragfähig ist)
- Elemente sind wiederverwendbar (Bibliothek), Rechner sind Kompositionen.
- Preise sind regelbasiert, nicht hardcodiert (Pricing Engine).
- Versionierung für Elemente, Preislisten und Rechner (Audit & Nachvollziehbarkeit).
- Mehrmandantenfähig (falls Agenturen/Partner/mehrere Firmen später kommen).
- Saubere Trennung: Builder (Admin) ≠ Konfigurator (User) ≠ Angebots-/Dokumentenbereich.

# Rollen & Benutzerflüsse

## Rollen
- **Admin:** erstellt Elemente, pflegt Preise, baut Rechner, legt Angebots-Templates fest.
- **Sales/User:** nutzt Rechner, erstellt Entwurf/Angebot, exportiert/versendet.
- **Manager/Controller (optional):** Reporting, Freigaben, Preislistenverwaltung.

## Kern-Workflows (End-to-End)

### Element anlegen
- Name, Beschreibung, Einheit (z. B. vCPU/GB), Input-Typ (Slider/Dropdown/Toggle/Number/Checkbox), Validierungen (Min/Max/Step).

### Preispflege
- Preis pro Einheit (CPU, RAM), Festpreise pro Option (GPU-Dropdown), ggf. Setup-Fees, Mindestpreise.
- Regeln: Staffeln, Mengenrabatt, Bundles, Mindestmengen, Obergrenzen.

### Rechner erstellen
- Drag & Drop Elemente in Rechner, Reihenfolge/Abschnitte, Defaults, Abhängigkeiten.

### Rechner verwenden
- User wählt Werte (z. B. 2× CPU, 8 GB RAM, keine GPU) → Preis wird berechnet.

### Entwurf speichern oder Angebot erzeugen
- Angebot nutzt Template (Layout + dynamische Felder), enthält Positionen, Summen, Steuern, Laufzeit, SLA etc.

# Funktionsumfang als Epics (mit MVP → Ausbau)

## Epic A — Element-Bibliothek (MVP)

**Elementtypen:** Slider, Number Input, Dropdown, Toggle, Checkbox, Text (nur Anzeige)

**Felder:**
- Name, Key/Identifier, Kategorie (Compute/Storage/Network/Support …)
- Einheit (Anzeige + Rechenlogik)
- Min/Max/Step/Default
- Hilfetext/Tooltip
- Validierungen (z. B. nur ganze Zahlen)
- Optionen für Dropdown: Label, technischer Wert, optionaler SKU-Code

**Ausbau**
- Wiederverwendbare Element-Gruppen (z. B. “Compute Basis”: CPU+RAM)
- Abhängigkeiten (z. B. GPU nur wählbar wenn CPU ≥ 4)
- Formeln (z. B. RAM min = CPU×2)

## Epic B — Preispflege & Preislisten (MVP)

- Preise pro Einheit (CPU €/vCPU, RAM €/GB)
- Preise pro Dropdown-Option (GPU: RTX 3070 = x €, …)
- Gültigkeitszeiträume (von/bis), Währung, Rundungsregeln

**Ausbau (sehr wichtig)**
- Staffelpreise: z. B. 1–4 vCPU = 12 €/vCPU, 5–16 = 10 €/vCPU
- Mengenrabatt: pro Element oder global (z. B. ab 1000 €/Monat −5%)
- Bundle-Regeln: “CPU+RAM Paketpreis”, “GPU inkl. Mindest-RAM”
- Kunden-/Segmentpreise: Liste je Kunde, Partner oder Kundengruppe
- Minimum Charge / Mindestpreis je Rechner oder je Element

## Epic C — Pricing Engine (Herzstück)

**Anforderung:** Jede Kalkulation muss reproduzierbar sein (für Angebote, Audits, Versionen).

**Regelarten (empfohlen)**
- Unit Price Rule: price = quantity * unit_price
- Option Price Rule: price = selected_option_price
- Tiered Pricing Rule: mengenabhängige Stufen
- Discount Rule: pro Element oder global (Prozent/Fix)
- Constraint Rule: erlaubt/verbietet Kombinationen, setzt Auto-Werte

**Rechenpipeline (praktisch)**
1. Werte erfassen → validieren
2. Base-Positionen berechnen (Unit/Option)
3. Staffeln anwenden
4. Rabatte/Bundles anwenden (definierte Priorität!)
5. Rundung, Steuern, Summen

**MVP-Definition**
- Unit + Option + einfache Staffel + globaler Rabatt

**v1**
- Bundles + Constraints + kundenspezifische Preislisten + Prioritäten/Regelkonflikte

## Epic D — Rechner-Builder (Admin) (MVP)

- Rechner anlegen: Name, Beschreibung, Kategorie, Sichtbarkeit
- Drag & Drop Elemente reinziehen
- Layout: Sektionen, Überschriften, Reihenfolge
- Defaults & Pflichtfelder
- Preview: Admin testet Kalkulation direkt

**Ausbau**
- Versionierung: Rechner v1/v2, “Published” vs “Draft”
- A/B Templates: Varianten pro Zielgruppe
- Mehrsprachigkeit pro Rechner/Element

## Epic E — Konfigurator (User) (MVP)

- Rechner auswählen → konfigurieren
- Live-Preis: Zwischensumme pro Element + Gesamtsumme
- Zusammenfassung (Positionenliste)
- “Entwurf speichern” / “Angebot erstellen”

**Ausbau**
- Vergleich: mehrere Konfigurationen nebeneinander
- “Empfohlen”-Hinweise (z. B. RAM/CPU-Ratio)
- “Budget-Slider” (z. B. Zielpreis, System schlägt Werte vor)

## Epic F — Entwürfe & Angebote (MVP)

- Entwurf speichern: Name, Kunde (optional), Notizen, Zeitstempel
- Angebot erstellen:
  - Angebotsnummer
  - dynamische Felder (Kunde, Adresse, Ansprechpartner, Laufzeit, Zahlungsziel)
  - Export (PDF) + interne Freigabe-Notiz

**Ausbau (sehr wertvoll für Sales)**
- Angebots-Templates (Corporate Design): Header/Footer, AGB-Anhänge
- Angebotsstatus: Draft → Review → Approved → Sent → Won/Lost
- E-Signatur-Integration (optional)
- Versand per E-Mail (oder Download + Copy Link)
- CRM-Sync (z. B. HubSpot/Salesforce) optional

# Reporting & Analytics (zusätzliche sinnvolle Features)

## Standard-Reports
- Nutzung: meistgenutzte Rechner, Conversion (Konfigurator → Angebot)
- Top-Konfigurationen: häufigste CPU/RAM/GPU-Kombis
- Preisband-Verteilung: Angebotsvolumen nach Preisklassen
- Rabatt-Impact: wie viel Rabatt wurde gegeben, wo, warum
- Deckungsbeitrag (optional): wenn du Kosten/COGS pflegen willst

## Operative Dashboards
- “Offene Entwürfe”, “Angebote in Review”, “Angebote fällig”
- Erfolgsquote pro Rechner/Produktlinie

# Datenmodell (kompakt, aber praktikabel)

## Element
- id, key, name, unit, type (slider/dropdown/…)
- constraints (min/max/step), metadata (tooltip, category)

## ElementOption (für Dropdown)
- element_id, option_key, label, sku, sort_order

## PriceList
- id, name, currency, valid_from/to, scope (global/kunde/segment)

## PriceRule
- price_list_id, target (element/option/calculator/global)
- rule_type (unit/option/tier/discount/bundle/constraint)
- payload (JSON), priority, enabled

## Calculator
- id, name, status (draft/published), version

## CalculatorElement
- calculator_id, element_id, required, default, ui_section, sort_order

## Draft
- calculator_version_id, user_id, values_json, computed_snapshot_json

## Quote/Offer
- offer_no, customer_data_json, template_id
- values_json, computed_snapshot_json, status, approvals

**Wichtig:** Für Entwürfe/Angebote immer ein Snapshot der Preisregeln + Rechner-Version speichern, damit ein Angebot später exakt reproduzierbar bleibt.

# Non-Functional Requirements (damit es “Enterprise-ready” ist)

- RBAC (Role-based access): Wer darf Preise ändern? Wer darf veröffentlichen?
- Audit Log: Preisänderungen, Veröffentlichungen, Angebotsfreigaben
- Validation & Fehlererklärungen: klare Meldungen (“GPU benötigt min. 16 GB RAM”)
- Performance: Pricing Engine muss schnell sein (auch bei vielen Regeln)
- Sicherheit: Mandantentrennung, Verschlüsselung, sichere Secrets
- Compliance/DSGVO: Löschkonzepte, Export, Datenminimierung
- Internationalisierung: Währungen, Steuern, Rundung, Sprache

# Umsetzungsvorgehen als Projektphasen (ohne Zeitversprechen, aber mit Reihenfolge)

## Phase 0 — Discovery / Spezifikation

- Klick-Prototyp (Builder + Konfigurator)
- Definition der Regelprioritäten (wichtig!)
- Angebotslayout & Pflichtdaten definieren
- MVP-Scope finalisieren

**Deliverables:** User Stories, Datenmodell, UI-Wireframes, Pricing-Regelkonzept

## Phase 1 — MVP bauen

**MVP beinhaltet:**
- Element-Bibliothek (Slider/Dropdown)
- Preisliste: Unit + Option, einfache Staffel, globaler Rabatt
- Rechner-Builder (Drag & Drop, Sektionen)
- Konfigurator mit Live-Preis
- Entwurf speichern
- Angebot erstellen + PDF Export (Basis)

**Deliverables:** produktiver End-to-End Flow

## Phase 2 — Professional Features

- Versionierung (Elemente/Rechner/Preislisten)
- Erweiterte Regeln (Bundles, Abhängigkeiten, Constraints)
- Angebotstemplates (CI), Statusworkflow
- Reporting Basis-Dashboard
- Audit Log + RBAC fein granular

## Phase 3 — Skalierung & Integrationen

- Kunden-/Segmentpreise, Partnerportale
- CRM Integration
- E-Signatur
- API & Webhooks (z. B. Angebot erstellt → CRM)
- Kosten/Deckungsbeitrag (falls benötigt)

# Backlog (Beispiel-User-Stories, direkt nutzbar)

## Als Admin möchte ich…
- Elemente mit Einheit und Eingabetyp anlegen, damit ich sie wiederverwenden kann.
- Preisregeln pro Element/Option pflegen, damit Rechner automatisch kalkulieren.
- Rechner per Drag & Drop zusammensetzen und veröffentlichen, damit Sales sie nutzen kann.

## Als Sales möchte ich…
- eine Konfiguration speichern, damit ich später weiterarbeiten kann.
- ein Angebot mit Kundendaten erstellen und als PDF exportieren, damit ich es versenden kann.
- sehen, welche Regeln/Rabatte angewendet wurden, damit ich es erklären kann.

## Als Manager möchte ich…
- sehen, welche Rechner am meisten genutzt werden und welche Angebote gewonnen werden.
- Freigabeprozesse für Rabatte über X% haben.

# Risiken & Leitplanken (aus Erfahrung entscheidend)

- Regelkonflikte: Bundle + Staffel + Rabatt → ohne Prioritäten wird’s unberechenbar.
  - Lösung: Priorität + “Explainability” (Kalkulationsprotokoll).
- Versionierung vergessen: Angebote müssen auch nach Preisänderungen identisch bleiben.
  - Lösung: Snapshots.
- Zu frühe Komplexität: erst MVP sauber, dann Rules Engine ausbauen.

# Nächster sinnvoller Schritt (damit du sofort starten kannst)

1. Definiere 5–10 Beispiel-Rechner (Compute, Storage, Support, …)
2. Definiere 6–12 Beispiel-Elemente (CPU/RAM/GPU/Storage/Bandwidth/Support-Tier/Setup Fee/…)
3. Lege fest:
   - Welche Rabattarten wirklich gebraucht werden (Staffel vs global vs bundle)
   - Welche Angebotsfelder Pflicht sind (Kunde, Laufzeit, SLA, Zahlungsziel, …)
