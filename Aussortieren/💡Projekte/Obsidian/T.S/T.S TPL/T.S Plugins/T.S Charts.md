# Zusammenfassung Funktion
visuelle Darstellungn deiner Daten durch Charts.js
# Verwendung im T.S
## **1. Grundaufbau eines Diagramms**

Ein Diagramm wird in Markdown mit folgendem Codeblock erstellt:
```chart
type: [chart_type]
labels: [label1, label2, ...]
datasets:
  - label: [dataset_name]
    data: [value1, value2, ...]
options:
  [chart_options]
  ```
  - **`type`**: Der Diagrammtyp (z. B. `bar`, `line`, `pie`, etc.).
- **`labels`**: Die Beschriftungen der X-Achse oder Kategorien.
- **`datasets`**: Die Datenreihen, die dargestellt werden sollen.
- **`options`**: Zusätzliche Optionen für Styling und Verhalten.

## **2. Unterstützte Diagrammtypen**

### Balkendiagramm (`bar`)

Zeigt Daten als Balken.
```chart
type: bar
labels: ["Januar", "Februar", "März"]
datasets:
  - label: "Umsatz"
    data: [500, 700, 900]
```
### Liniendiagramm (`line`)

Zeigt Trends über Zeit oder kontinuierliche Daten.
```chart
type: line
labels: ["Montag", "Dienstag", "Mittwoch"]
datasets:
  - label: "Schritte"
    data: [4000, 8000, 10000]
```
### Kreisdiagramm (`pie`) oder Donutdiagramm (`doughnut`)

Ideal für prozentuale Verteilungen.
```chart
type: pie
labels: ["Training", "Arbeit", "Freizeit"]
datasets:
  - label: "Zeitaufwand"
    data: [2, 8, 14]
```
### Streudiagramm (`scatter`)

Zeigt Datenpunkte in einem kartesischen Koordinatensystem.
```chart
type: scatter
datasets:
  - label: "Messwerte"
    data:
      - x: 1
        y: 2
      - x: 2
        y: 4
      - x: 3
        y: 6
```
## **3. Dynamische Datenintegration**

### Dateneinbindung mit Variablen

Du kannst dynamische Daten aus anderen Plugins wie **Dataview** oder **Templater** integrieren.

```chart
type: bar
labels: <% tp.date.now("YYYY-MM-DD") %>
datasets:
  - label: "Dynamischer Wert"
    data: <% tp.random.number(10, 100) %>
```

### Automatisches Datenladen

Mit dem **Dataview-Plugin** kannst du Daten aus deinen Notizen extrahieren:

```chart
type: line
labels: ["<% tp.date.now("YYYY-MM-DD", -7) %>", "<% tp.date.now("YYYY-MM-DD", -6) %>", "<% tp.date.now("YYYY-MM-DD", -5) %>"]
datasets:
  - label: "Schlafdauer"
    data: [7, 6.5, 8]
```

---

## **4. Anpassungen und Styling**

Das `options`-Feld erlaubt eine feine Kontrolle über das Aussehen des Diagramms.

### Achsenanpassung

options:
  scales:
    y:
      title:
        display: true
        text: "Schlafstunden"
    x:
      title:
        display: true
        text: "Datum"


### Farben und Transparenz

datasets:
  - label: "Verkauf"
    data: [500, 700, 900]
    backgroundColor: "rgba(54, 162, 235, 0.5)"
    borderColor: "rgba(54, 162, 235, 1)"
    borderWidth: 2

---

## **5. Kombinationsdiagramme**

Du kannst verschiedene Diagrammtypen kombinieren.

markdown

Code kopieren

```chart
type: bar
labels: ["Januar", "Februar", "März"]
datasets:
  - label: "Umsatz"
    data: [500, 700, 900]
    type: line
  - label: "Besucher"
    data: [200, 300, 400]
    type: bar
```

---

## **6. Interaktivität**

Das Charts-Plugin unterstützt Hover- und Klick-Events für zusätzliche Interaktivität.

options:
  plugins:
    tooltip:
      callbacks:
        label: "function(context) { return 'Wert: ' + context.raw; }"

---

## **7. Beispiele für dein Ticketsystem**

### **Tickets nach Priorität**

Zeigt die Anzahl von Tickets in verschiedenen Prioritätsstufen.

```chart
type: pie
labels: ["Hoch", "Mittel", "Niedrig"]
datasets:
  - label: "Ticket Prioritäten"
    data: [10, 25, 50]
```

### **Erledigte vs. offene Tickets**

Vergleicht erledigte und offene Tickets.

```chart
type: doughnut
labels: ["Erledigt", "Offen"]
datasets:
  - label: "Ticket Status"
    data: [30, 70]
```wie nutze ich den Charts Plugin so gut wie es geht

---

## **8. Tipps zur optimalen Nutzung**

1. **Dataview-Kombination:** Verwende Dataview, um Daten aus deinen Notizen automatisch zu visualisieren.
2. **Vorlagen erstellen:** Lege häufig verwendete Diagrammstrukturen als Templates an.
3. **CSS-Styling:** Passe das Aussehen deiner Diagramme an, um sie besser in dein Dashboard zu integrieren.
4. **Interaktive Dashboards:** Nutze Diagramme in Dashboards, um schnelle Einblicke in den Status deiner Tickets oder Projekte zu erhalten.