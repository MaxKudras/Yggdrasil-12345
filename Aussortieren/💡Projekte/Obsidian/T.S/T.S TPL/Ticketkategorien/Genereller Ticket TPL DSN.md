---
title: "{{TICKET_TITLE}}"  # Ersetze durch den Ticket-Titel
ticket_id: "{{TICKET_ID}}"  # Automatisch generiert oder manuell vergeben
categories: ["Generell"]  # Kategorien des Tickets
priority: "{{PRIORITY}}"  # Optionen: dringend, normal, langfristig
status: "{{STATUS}}"  # Optionen: offen, in Bearbeitung, abgeschlossen
due_date: "{{DUE_DATE}}"  # Format: YYYY-MM-DD
created: "{{CREATION_DATE}}"  # Automatisch generiert
tags: ["#Ticket", "#Generell"] # Für Filter und Queries
---

# {{TICKET_TITLE}}

## Beschreibung
<!-- Eine kurze, prägnante Beschreibung des Tickets. -->
Was ist das Ziel oder Problem, das gelöst werden soll?

## Aufgaben
- [ ] Aufgabe 1
- [ ] Aufgabe 2
- [ ] Aufgabe 3

## Subtickets
```dataview
table title as "Titel", priority as "Priorität", status as "Status", due_date as "Fällig bis"
from "Tickets"
where contains(categories, "Generell") and ticket_id != "{{TICKET_ID}}"
```

## Notizen
<!-- Zusätzliche Informationen, Beobachtungen oder Ideen. -->
- Hinweis 1
- Hinweis 2

## Links/Quellen
<!-- Externe Links oder interne Verweise auf relevante Dateien. -->
- [Link oder Quelle 1](#)
- [Link oder Quelle 2](#)
- 
---
```ad-info
title: Fortschritt & Updates
collapse: open
## Standardprozesse
- [ ] Schritt 1: datum...
- [ ] Schritt 2: datum...
- [ ] Schritt 3: datum...
```