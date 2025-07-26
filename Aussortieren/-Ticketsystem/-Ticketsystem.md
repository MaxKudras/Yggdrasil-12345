## Überfällige Tickets
```dataview 
TASK 
FROM "Ticketsystem/Tickets"
WHERE due < date(today) AND !completed 
SORT due ASC 
```
## Heutige Tickets
```dataview 
TASK 
FROM "Ticketsystem/Tickets" 
WHERE due = date(today) 
SORT due ASC 
```
##  Zuküftige Tickets (wird wahrscheinlich zu diese woche + einer der den tag + 1 woche macht aber die tickets von diese woche in diesesr Notiz nicht anzeigt)
```dataview 
TASK 
FROM "Ticketsystem/Tickets" 
WHERE due > date(today) 
SORT due ASC 
```

```dataview 
CALENDAR 
file.ctime 
```