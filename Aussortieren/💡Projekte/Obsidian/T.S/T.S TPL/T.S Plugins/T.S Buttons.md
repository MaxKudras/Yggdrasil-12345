# Zusammenfassung Funktion
Erstellen von interactiven Buttons
# Verwendung im T.S
## **1. Allgemeine Verwendung**

Mit dem Buttons-Plugin kannst du interaktive Schaltflächen erstellen, die auf Klick verschiedene Aktionen ausführen, wie z. B.:

- Notizen/Tickets basierend auf Vorlagen erstellen.
- Links öffnen oder zwischen Notizen navigieren.
- Befehle oder Skripte ausführen.

Ein Button wird in Markdown als spezieller Codeblock definiert:
```button
name Name_des_Buttons
type action
action your_action_here
```

---

## **2. Praktische Anwendungen**

### **2.1. Neues Ticket erstellen**
Erstelle einen Button, der ein neues Ticket mit einem spezifischen Template erstellt:  
```button
name Neues Ticket
type template
action Projekte/Ticketsystem Templates/Generelles Template
folder Projekte/Ticketsystem/Tickets
prepend true
```
- **`name:`** Gibt dem Button einen Namen (z. B. "Neues Ticket").  
- **`type:`** Gibt an, dass es sich um ein Template handelt.  
- **`action:`** Verknüpft das Template.  
- **`folder:`** Gibt an, in welchem Ordner das Ticket erstellt werden soll.  

---

### **2.2. Ticket in spezifischer Kategorie erstellen**
Ein Button, der ein Ticket für eine bestimmte Kategorie (z. B. "Hobbys") erstellt:  
```button
name Hobby-Ticket
type template
action Projekte/Ticketsystem Templates/Ticketkategorie/Hobbys
folder Projekte/Ticketsystem/Tickets/Hobbys
prepend true
```

- Du kannst mehrere Buttons für verschiedene Kategorien erstellen.  

---

### **2.3. Navigation**
Buttons, um schnell zwischen zentralen Übersichtsnotizen zu wechseln:  

```button
name Zum Hauptdashboard
type link
action Projekte/Ticketsystem/Dashboards/Main
```

- **`type: link`** Öffnet eine spezifische Notiz.  
- Nützlich, um schnell zu wichtigen Übersichten oder Dashboards zu springen.  

---

### **2.4. Fälligkeitsübersicht**
Ein Button, um eine Übersicht aller überfälligen Tickets aufzurufen:  
```button
name Überfällige Tickets
type command
action dataview: Open query
query "file:/Tickets where ticket.deadline < today() and ticket.status != 'erledigt'"
```
- Führt eine Dataview-Abfrage aus, die alle überfälligen Tickets auflistet.  

---

### **2.5. Subticket erstellen**
Ein Button, der ein Subticket zum aktuellen Ticket erstellt:  

```button
name Subticket erstellen
type template
action Projekte/Ticketsystem Templates/Subticket
folder Projekte/Ticketsystem/Tickets/Subtickets
prepend true
```

- Automatisiert die Erstellung von Subtickets mit dem richtigen Template.  

---

### **2.6. Tags hinzufügen**
Buttons, um schnell Tags hinzuzufügen:  

```button
name #Dringend
type append
action #Dringend
```
- Füge häufig verwendete Tags wie `#Dringend` oder `#Warten` hinzu.  

---

## **3. Erweiterte Möglichkeiten**

### **3.1. Kombination mit Templater**
Buttons können mit dem **Templater-Plugin** kombiniert werden, um dynamische Inhalte einzufügen:  
```button
name Heute erledigen
type template
action Projekte/Ticketsystem Templates/Tagesaufgabe

```

Das verknüpfte Template könnte z. B. ein heutiges Datum oder andere dynamische Werte automatisch einfügen.  

---

### **3.2. Bedingungen und Skripte**
Du kannst Buttons erstellen, die Abfragen oder Skripte ausführen:  

```button
name Checkliste aktualisieren
type command
action templater run ChecklisteAktualisieren
```

- Nutze Skripte, um z. B. Checklisten zu aktualisieren oder automatische Änderungen vorzunehmen.  

---

## **4. Design und Layout**
Du kannst Buttons auch optisch anpassen, um sie ansprechender zu gestalten:  
- **Icons:** Nutze Emojis oder Symbole im `name:`-Feld, z. B.  
  ```button
  name 📝 Neues Ticket
  ```
  - **Styling:** Mit CSS-Snippets kannst du Buttons z. B. farblich hervorheben.

Ein CSS-Beispiel:
```css
.button[data-name="Neues Ticket"] {
    background-color: #4caf50;
    color: white;
    border-radius: 5px;
    padding: 10px;
}
```


