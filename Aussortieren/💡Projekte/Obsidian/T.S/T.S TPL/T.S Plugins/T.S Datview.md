## **2. Die Grundlagen der Dataview-Abfragen**

Das Dataview Plugin verwendet eine eigene Syntax, um Daten aus deinen Notizen zu extrahieren. Die grundlegende Syntax ist wie folgt:
```dataview
QUERY
```

Hierbei ist `QUERY` der Dataview-Code, der die Notizen durchsucht und die gewünschten Daten extrahiert.

### Einfache Dataview-Abfrage:
Um alle Notizen anzuzeigen, die ein bestimmtes Tag haben (z. B. `#dringend`), kannst du Folgendes verwenden:

```dataview
table
from #dringend
```

Diese Abfrage zeigt dir eine Tabelle aller Notizen, die das Tag `#dringend` haben.

---

## **3. Verwenden von Tabellen und Listen**

Das Dataview Plugin kann Daten in verschiedenen Formaten anzeigen, darunter **Tabellen**, **Listen** und **Kalenderansichten**.

### Tabellen:
Um eine Tabelle zu erstellen, die bestimmte Felder aus deinen Notizen anzeigt (z. B. Titel und Fälligkeitsdatum), kannst du eine Abfrage wie diese verwenden:

```dataview
table title, due_date
from "Projekte/Ticketsystem"
where due_date
sort due_date asc
```

- **title**: Zeigt den Titel der Notiz.
- **due_date**: Zeigt das Fälligkeitsdatum der Notiz an.
- **from "Projekte/Ticketsystem"**: Sucht nur in diesem Ordner.
- **where due_date**: Filtert Notizen, die ein Fälligkeitsdatum haben.
- **sort due_date asc**: Sortiert die Notizen nach dem Fälligkeitsdatum in aufsteigender Reihenfolge.

### Listen:
Um eine einfache Liste von Notizen mit einem bestimmten Tag anzuzeigen, kannst du Folgendes verwenden:

```dataview
list
from #wichtig
```

Dies zeigt dir eine Liste aller Notizen an, die das Tag `#wichtig` haben.

---

## **4. Abfragen von Metadaten**

Eine der mächtigsten Funktionen von Dataview ist die Möglichkeit, Metadaten aus deinen Notizen zu verwenden. Du kannst benutzerdefinierte Felder (wie `due_date`, `status`, `priority`, etc.) definieren und darauf basierend Abfragen durchführen.

### Beispiel: Verwenden von YAML-Metadaten:
Du kannst in deinen Notizen YAML-Metadaten verwenden, um zusätzliche Informationen hinzuzufügen:

```yaml
---
due_date: 2024-12-31
priority: hoch
status: offen
---
```
Du kannst dann mit Dataview diese Metadaten abfragen:
```dataview
table due_date, priority, status
from "Projekte/Ticketsystem"
where status = "offen"
sort due_date asc
```

Dies zeigt eine Tabelle mit Fälligkeitsdatum, Priorität und Status für alle offenen Tickets an.

---

## **5. Erstellen von Abfragen für Aufgaben**

Dataview eignet sich besonders gut, um Aufgaben zu verwalten und anzuzeigen, die in deinen Notizen als Checkboxen (z. B. `- [ ] Aufgabe`) markiert sind. Du kannst mit Dataview alle offenen Aufgaben filtern und anzeigen lassen.

### Beispiel: Abfrage für alle offenen Aufgaben:

```dataview
task from "Projekte/Ticketsystem"
where !completed
sort due_date asc
```


- **task**: Zeigt Aufgaben (Checkboxen) aus deinen Notizen an.
- **where !completed**: Zeigt nur unvollständige Aufgaben an.
- **sort due_date asc**: Sortiert nach dem Fälligkeitsdatum.

---

## **6. Arbeiten mit Filtern und Bedingungen**

Du kannst Dataview-Abfragen sehr flexibel gestalten, indem du Filter und Bedingungen hinzufügst.

### Beispiel: Zeige nur Aufgaben mit einer bestimmten Priorität:

```dataview
task from "Projekte/Ticketsystem"
where priority = "hoch" and !completed
```

Dies zeigt alle unvollständigen Aufgaben mit hoher Priorität an.

---

## **7. Arbeiten mit DataviewJS (JavaScript)**

Dataview unterstützt auch **JavaScript**-basierte Abfragen durch DataviewJS. Dies gibt dir noch mehr Flexibilität und Kontrolle über deine Abfragen.

### Beispiel: Erstellen einer benutzerdefinierten Tabelle mit JavaScript:

```dataviewjs
const pages = dv.pages('"Projekte/Ticketsystem"')
  .where(p => p.status == "offen")
  .sort(p => p.due_date, 'asc');
  
dv.table(["Ticket", "Due Date"], 
  pages.map(p => [p.title, p.due_date]));
```

Dies zeigt eine benutzerdefinierte Tabelle an, in der alle offenen Tickets mit ihrem Titel und Fälligkeitsdatum angezeigt werden.

---

## **8. Erweiterte Nutzung: Kalenderansicht und Fortschrittsverfolgung**

Dataview unterstützt auch Kalenderansichten, um Fälligkeitsdaten und Aufgaben zu visualisieren. Du kannst dies kombinieren, um zu sehen, wie deine Aufgaben und Termine über die Zeit verteilt sind.

### Beispiel: Kalenderansicht:

```dataview
table
from "Projekte/Ticketsystem"
where due_date
sort due_date asc
```

Dies gibt dir eine dynamische Ansicht deiner Notizen, die Fälligkeitsdaten enthalten, und zeigt sie in einem Kalender an.

---

## **9. Tipps für die Nutzung von Dataview in deinem Ticketsystem**
- **Übersichtliche Dashboards**: Nutze Dataview, um auf deinem Dashboard eine Übersicht über deine Tickets zu erhalten, z. B. indem du alle offenen Tickets, die Fälligkeitsdaten und den Fortschritt auf einem Blick anzeigen lässt.
- **Benutzerdefinierte Notizen**: Definiere benutzerdefinierte Felder in den Metadaten deiner Notizen (z. B. `status`, `priority`, `due_date`) und nutze Dataview, um diese Felder zu filtern und darzustellen.
- **Verlinkung zu Tickets**: Nutze die **[[Link]]-Syntax** von Obsidian, um auf verwandte Tickets oder Notizen zu verlinken und sie so dynamisch miteinander zu verbinden.


