# 🗂️ Main Dashboard: Ticketsystem

<!Willkommen im Hauptdashboard des Ticketsystems!  
Hier findest du eine Übersicht über alle wichtigen Tickets und schnellen Zugriff auf zentrale Funktionen und Kategorien.>

---

## 🔎 Quick Access
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