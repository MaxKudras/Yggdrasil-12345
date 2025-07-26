# 🗂️ Hauptdashboard: Ticketsystem

<!Willkommen im Hauptdashboard des Ticketsystems!  
Hier findest du eine Übersicht über alle wichtigen Tickets und schnellen Zugriff auf zentrale Funktionen und Kategorien.>

---


[Erstelle neue Notiz](obsidian://new?vault=Brain-Notes&name=Notizen/Notiz-%24%7Bdate%7D&content=## Neue Notiz%0AInhalt der neuen Notiz.)
```button
name Neue Notiz erstellen
type command
action templater:insert-template
color green
icon plus
tooltip Template für neue Notiz auswählen
```

## 🔎 Quick Access
<div style="display: flex; justify-content: space-between;">
  <a href="https://link1.com">📝 Neues Ticket</a>
  <a href="https://link2.com">📋 Übersichten</a>
  <a href="https://link3.com">📂 Legenden Kategorien-Templates</a>
</div>

- [📝 Neues Ticket erstellen](templater: "Neues Ticket Template")
- [📋 Übersichten anzeigen](file:///Projekte/Ticketsystem Templates/Zentrale Übersichtdateien)
- [📂 Kategorien-Templates öffnen](file:///Projekte/Ticketsystem Templates/Ticketkategorie)

- [!button text="Neues Ticket erstellen" action="templater" template="Neues Ticket Template" class="btn-primary"]
- [!button text="Alle Tickets anzeigen" action="open" filepath="Projekte/Ticketsystem/Templates/All Tickets.md" class="btn-secondary"]
- [!button text="Archiv anzeigen" action="open" filepath="Projekte/Ticketsystem/Templates/Archiv.md" class="btn-secondary"]
---

## 📊 Statusübersicht
```dataview
table status as "Status", count(status) as "Anzahl"
from "Projekte/Ticketsystem"
group by status
sort by status asc
```


## 📆 Fällige und überfällige Tickets
### Überfällige Tickets
```dataview
table priority as "Priorität", file.link as "Ticket", due as "Fälligkeitsdatum"
from "Projekte/Ticketsystem"
where due <= date(today) and status != "Erledigt"
sort due asc
```
### Bald fällige Tickets
```dataview
table priority as "Priorität", file.link as "Ticket", due as "Fälligkeitsdatum"
from "Projekte/Ticketsystem"
where due >= date(today) and due <= date(today) + dur(7 days) and status != "Erledigt"
sort due asc
```
## 🏷️ **Tickets nach Kategorien**

- [🟢 Gesundheit](file:///Projekte/Ticketsystem Templates/Zentrale Übersichtdateien/Gesundheit.md)
- [🔵 Hobbys](file:///Projekte/Ticketsystem Templates/Zentrale Übersichtdateien/Hobbys.md)
- [🟡 Routinen](file:///Projekte/Ticketsystem Templates/Zentrale Übersichtdateien/Routinen.md)
- [🛒 Kaufen](file:///Projekte/Ticketsystem Templates/Zentrale Übersichtdateien/Kaufen.md)
- [➕ Mehr Kategorien anzeigen](file:///Projekte/Ticketsystem Templates/Zentrale Übersichtdateien)

## 🔔 **Erinnerungen
```dataview
table file.link as "Ticket", reminder as "Erinnerungsdatum"
from "Projekte/Ticketsystem"
where reminder and reminder <= date(today) + dur(1 day)
sort reminder asc
```