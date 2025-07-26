---
Ticketnummer:
Ticketname:
allDay: true
date: 2024-09-24:+72
completed: offen
---
# Ticket: °1 Ticketsystemaufbauen
## 📁 Kategorie
- **Kategorie**: Lebensverbesserung
- **Subkategorie**: Lebenorganisieren
- **Erstellungsdatum**: 2024-09-24
- **Fälligkeitsdatum**: 📅 2024-09-24:+72  
- **Status**: |In Bearbeitung
- **Priorität**: Normal
---
## 📋 Ticketbeschreibung
- **Hauptziel**: Die Schritt weise Planung und der Aufbau eines Tisckesystems 

---

## ✅ Subtickets
### Hauptticket

---
## 📝 Aufgaben
### Offene Aufgaben
- [ ] Machen das Fortschritt nicht im Ticketsystem angezeigt wird und schaffen das in speziellen (dataview wiedergabe)
- [ ] Liste mit allen Tickets sortiert nach id also nummer
- [ ] Knopf zum kreieren von Tickets mit Template;villeicht sogra template auswahl von verschiedenen je nach thema
- [ ] 
### Abgeschlossene Aufgaben
---
## 🔗 Verknüpfte Ressourcen
### Community Plugins
- Dataview
- Buttons
- Templater
- Full Calander
- Task
- iCal
### Obsidian Plugins
- Templates
---
## 🔄 Nächste Schritte
---
## ⏳ Warten auf
---
## 📅 Historie und Status
---
## 📊 Fortschrittstracking
- **Fortschritt**: 
  - [ ] 0-25%
  - [ ] 26-50%
  - [ ] 51-75%
  - [ ] 76-100%
- **Letzte Aktualisierung**: 2024-09-24

---

## 📈 Übersicht über offene Tickets (mit Dataview)
```dataview
TABLE status, due, priority, duration
FROM "Tickets"
WHERE status != "Erledigt"
SORT due ASC
