```dataview
LIST 
FROM "-Ticketsystem/Tickets"
SORT number(regexreplace(file.name, "[^0-9]", "")) ASC
```


```dataview
TABLE
  file.name AS "Ticket", 
  number(regexreplace(file.name, "°([0-9]+)", "$1")) AS "ID"
FROM "-Ticketsystem/Tickets"
SORT ID ASC

```