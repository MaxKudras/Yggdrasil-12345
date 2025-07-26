---
title: {{title}}
allDay: true
date: {{date:YYYY-MM-DD:+7d}}
completed: null
---
# Ticket: {{title}}
## 📁 Kategorie
- **Kategorie**: {{select:Projekte|Routinen|Arbeit|Vorbereitung|Persönlich}}
- **Erstellungsdatum**: {{date:YYYY-MM-DD}}
- **Fälligkeitsdatum**: 📅 {{date:YYYY-MM-DD}}  (z.B. 📅 {{date:YYYY-MM-DD:+7d}} für in einer Woche)
- **Status**: {{select:Offen|In Bearbeitung|Warten auf|Verschoben|Erledigt}}
- **Priorität**: {{select:Niedrig|Normal|Hoch|Dringend}}
- **Schätzung**: ⏳ **Dauer**: {{select:1h|2h|4h|1d|1w}} 

---

## 📋 Ticketbeschreibung
- **Hauptziel**: {{Hier das Hauptziel beschreiben}}
- **Beteiligte Personen**: {{Name oder Kontaktinformationen}}
- **Verwandte Projekte**: [[Projektname]] (Link zu einem anderen Projekt)

---

## ✅ Subtickets
### Hauptticket
- [ ] **Subticket 1**: Teile bestellen, 📅 due:: {{date:YYYY-MM-DD:+3d}}
- [ ] **Subticket 2**: Komponenten zusammenbauen
- [ ] **Subticket 3**: Lackieren

---

## 📝 Aufgaben
### Offene Aufgaben
- [ ] Aufgabe 1
- [ ] Aufgabe 2
- [ ] Aufgabe 3

### Abgeschlossene Aufgaben
- [x] Aufgabe A
- [x] Aufgabe B

---

## 🔗 Verknüpfte Ressourcen
- [Externe Links oder Referenzen](https://example.com)

---

## 🔄 Nächste Schritte
1. {{Erste Maßnahme}}
2. {{Zweite Maßnahme}}
3. {{Dritte Maßnahme}}

---

## ⏳ Warten auf
- **Warten auf**: {{Worauf wartest du?}}
- **Voraussichtliches Ankunftsdatum**: 📅 {{date:YYYY-MM-DD:+2d}} (z.B. für Lieferung)

---

## 📅 Historie und Status
- **Zuletzt bearbeitet**: {{date:YYYY-MM-DD}}
- **Erledigt am**: {{date:YYYY-MM-DD}} (Falls erledigt)
- **Notizen zur Historie**: {{Änderungen oder Fortschritte notieren}}

---

## 📊 Fortschrittstracking
- **Fortschritt**: 
  - [ ] 0-25%
  - [ ] 26-50%
  - [ ] 51-75%
  - [ ] 76-100%
- **Letzte Aktualisierung**: {{date:YYYY-MM-DD}}

---

## 📈 Übersicht über offene Tickets (mit Dataview)
```dataview
TABLE status, due, priority, duration
FROM "Tickets"
WHERE status != "Erledigt"
SORT due ASC
