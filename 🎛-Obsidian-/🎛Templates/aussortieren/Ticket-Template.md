---
title: "{ title }": 
created: "{ date:YYYY-MM-DD }": 
date: "{ date:YYYY-MM-DD:+7d }":  (raus finden das die anderen sind d=tage, =wochen, =monate, =jahre)
allDay: true
startTime: 00:00
endTime: 23:69
completed: 
ticket_number: °{{ticket_number}}
---
# Ticket: {{ticket_number}} {{title}}
## 📁 Kategorie
- **Kategorie**: 
- **Subkategorie**:
- **Erstellungsdatum**: {{date:YYYY-MM-DD}}
- **Fälligkeitsdatum**: 📅 {{date:YYYY-MM-DD:+7d}}  
- **Status**: {{select:Offen|In Bearbeitung|Warten auf|Verschoben|Erledigt}}
- **Priorität**: {{select:Niedrig|Normal|Hoch|Dringend}}
- **Schätzung**: ⏳ **Dauer**: {{select:1h|2h|4h|1d|1w}} 
---
## 📋 Ticketbeschreibung
- **Hauptziel**: 
- **Beteiligte Personen**: 
- **Verwandte Projektnotizen**: 
---
## ✅ Subtickets
### Hauptticket
---
## 📝 Aufgaben
### Offene Aufgaben
- [ ] Aufgabe 1
### Abgeschlossene Aufgaben
---
## 🔗 Verknüpfte Ressourcen
---
## 🔄 Nächste Schritte
---
## ⏳ Warten auf
- **Warten auf**: 
- **Voraussichtliches Ankunftsdatum**: 
---
## 📅 Historie und Status
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
