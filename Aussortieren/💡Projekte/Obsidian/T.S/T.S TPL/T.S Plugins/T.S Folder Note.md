### **2. Wie das Folder Notes Plugin funktioniert**

Das Folder Notes Plugin erstellt für jeden Ordner in deinem Obsidian-Vault automatisch eine Hauptnotiz. Diese Notiz wird dann als **"Folder Note"** bezeichnet und kann spezifische Inhalte oder eine Zusammenfassung des Ordners enthalten. Du kannst auch definieren, welche Datei als Ordnerspezifische Notiz verwendet werden soll.

#### **Standardverhalten:**

- Sobald das Plugin aktiviert ist, erstellt es eine Notiz für jeden Ordner, der im Vault vorhanden ist.
- Diese Notizen erscheinen im gleichen Ordner wie der Inhalt und können zur Organisation und Dokumentation verwendet werden.

#### **Einstellungen anpassen:**

- Du kannst in den Plugin-Einstellungen angeben, welche Notiz als "Hauptnotiz" für jeden Ordner verwendet wird (standardmäßig erstellt es eine Notiz mit dem Namen des Ordners).
- Du kannst festlegen, ob eine Notiz automatisch erstellt werden soll, wenn ein Ordner neu erstellt wird.

---

### **3. Wie du Folder Notes effektiv nutzt**

#### **A. Ordner-Übersichten und Zusammenfassungen erstellen**

Nutze **Folder Notes**, um für jeden Ordner eine zentrale Übersicht oder ein Inhaltsverzeichnis zu haben. Zum Beispiel:

1. Erstelle eine Notiz für einen Ordner wie "Projekte".
2. In dieser Notiz kannst du eine Übersicht über alle relevanten Informationen und Ziele für diesen Ordner dokumentieren.

**Beispiel für eine Folder Note:**


# Projekte Übersicht 

## Aktuelle Projekte 
- [[Projekt 1]] 
- [[Projekt 2]] 
- [[Projekt 3]]  

## Wichtige Aufgaben 
- To-Do für [[Projekt 1]]:   
- Aufgabe 1   
- Aufgabe 2 
- To-Do für [[Projekt 2]]:   
- Aufgabe 1  

## Wichtige Ressourcen 
- Link zur [[Projektbeschreibung]] 
- [[Finanzen Übersicht]]  

## Notizen 
- Notizen und Ideen zu Projekten

#### **B. Folder Notes als Inhaltsverzeichnisse für große Ordner**

Wenn du viele Notizen in einem Ordner hast, kannst du die Folder Note als Inhaltsverzeichnis verwenden. Du kannst so alle Notizen im Ordner auflisten und mit spezifischen Kategorien oder Tags filtern, um die Übersichtlichkeit zu verbessern.

**Beispiel für eine Folder Note als Inhaltsverzeichnis:**

# Inhaltsverzeichnis - Projekte  ## Offene Tickets 
````dataview 
table title, status, due_date 
from "Projekte/Ticketsystem" 
where status = "offen"
````

## Projekte im Fokus

```dataview
table title, due_date 
from "Projekte" 
where due_date >= today 
sort due_date asc
```
---

#### **C. Ordnerspezifische Templates und Funktionen**

Du kannst auch das **Templater Plugin** oder das **Dataview Plugin** kombinieren, um automatisierte oder strukturierte Inhalte für deine Folder Notes zu generieren. Zum Beispiel könntest du in jedem Ordner eine Notiz für **Projekte** oder **Tasks** haben, die durch Templates definiert werden.

Beispiel: Nutze ein Template für neue Ordnernotizen:

1. Erstelle ein Template für eine Folder Note, das dir hilft, eine bestimmte Struktur zu befolgen.
2. Jedes Mal, wenn du einen neuen Ordner hinzufügst, wird automatisch eine Hauptnotiz erstellt, die diese Struktur befolgt.

**Beispiel Template für Folder Note:**


# {{folder:name}} Übersicht  

## Projekte 
- [ ] Projekt 1 
- [ ] Projekt 2  

## Aufgaben 
- [ ] Aufgabe 1 
- [ ] Aufgabe 2  

## Notizen 
- Notiz zu {{folder:name}} hinzufügen...

---

#### **D. Filter und Verlinkung für Folder Notes**

Verwende **Dataview**-Abfragen in deiner Folder Note, um spezifische Informationen aus dem Ordner dynamisch abzurufen. So hast du stets aktuelle Daten ohne manuelles Update.

**Beispiel: Verwenden von Dataview für das Abrufen von Aufgaben in einem Ordner:**

```dataview 
table title, due_date, status 
from "Projekte/Ticketsystem" 
where status = "offen" 
```

Mit dieser Abfrage wird in der Folder Note automatisch eine Tabelle mit allen offenen Tickets aus dem „Projekte/Ticketsystem“-Ordner angezeigt. 
--- 
### **4. Praktische Anwendungsideen**  
- **Projektmanagement**: Verwende Folder Notes, um alle relevanten Details zu jedem Projekt zu sammeln. Dies könnte beinhalten: Projektziele, Aufgabenlisten, Links zu relevanten Notizen, Zeitpläne und Meilensteine.    
- **Wissensdatenbanken**: Nutze Folder Notes, um für jeden Ordner eine strukturierte Übersicht zu erstellen, z. B. zu verschiedenen Themenbereichen (z. B. Geschichte, Technologie, Gesundheit, etc.).  
- **To-Do-Listen und Aufgabenverwaltung**: Erstelle eine Folder Note für jedes Aufgabenpaket oder jede To-Do-Liste. Verlinke die Aufgaben in dieser Folder Note und verwalte sie effizient.  
--- 
### **5. Tipps und Best Practices**  
- **Benutzerdefinierte Templates**: Definiere benutzerdefinierte Templates für deine Folder Notes, um eine einheitliche Struktur zu gewährleisten, die du bei allen Projekten, Aufgaben oder Themen verwenden kannst.    
- **Verlinkungen**: Stelle sicher, dass du Folder Notes so nutzt, dass du alle relevanten Notizen innerhalb des Ordners direkt verlinken kannst, um die Navigation zu erleichtern.  
- **Automatisierung**: Kombiniere Folder Notes mit Plugins wie **Templater** und **Dataview**, um deine Ordnernotizen automatisch zu füllen und zu aktualisieren.  
- **Integration von Tags**: Wenn du viele Notizen in einem Ordner hast, kannst du Tags verwenden, um verschiedene Themen zu kennzeichnen. Verwende die Folder Notes, um alle relevanten Tags anzuzeigen und filtere deine Notizen damit.



4o mini