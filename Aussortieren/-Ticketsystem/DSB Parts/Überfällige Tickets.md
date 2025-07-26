```dataview
table priority as "Priorität", file.link as "Ticket", due as "Fälligkeitsdatum"
from "Projekte/Ticketsystem"
where due <= date(today) and status != "Erledigt"
sort due asc
```