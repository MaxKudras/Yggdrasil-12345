```ad-summary
title: Ticketname: {name}
collapse: closed
Sagt um was es in dem Ticket geht
```
```ad-summary
title: TicketID: {ticket_id}
collapse: closed
TicketID zum verweis zu diesem Ticket 

T-016Fc:
016 = 16 Ticketnummer 
F = 6 Subticketnummer des Tickets 
c = 3 Subtickets des Subtickets
```
```ad-summary
title: Status: {status}
collapse: closed
**aktive** = angezeigt zum bearbeiten (Durch TicketbearbeitungsDatum auf aktive gesetzt)
**inaktive** =  ausgeblendet (Durch Postpone,Bearbeitungsstatus auf geschlossen oder beim erstellen eines TicketbearbeitungsDatum auf inaktive gesetzt)

sagt aus ob das ticket angezeigt wird 
(soll durch ein skriptTicketbearbeitungsDatum wieder aktiviert werden)
```
```ad-summary
title: Bearbeitungsstatus: {bearbeitungsstatus}
collapse: closed
```
```ad-summary
title: 
collapse: closed
```
```ad-summary
title: 
collapse: closed
```
```ad-summary
title: 
collapse: closed
```
```ad-summary
title: 
collapse: closed
```
```ad-summary
title: 
collapse: closed
```


-Bearbeitungsstatus: {bearbeitungsstatus} -> offen/ in Bearbeitung/Überprüfen/Warten/geschlossen
TicketbearbeitungsDatum: {ticket_bearbeitungs_datum} -> sagt an wann das Ticket status aktive gesetzt wird und man es sieht zum bearbeiten (kann durch ein skript postponed werden wodurch der status auf inaktive gesetzt wird)
ErstellungsDatum: {erstellungs_datum} -> Datum wann das ticket erstellt wurde
ZielDatum: {ziel_datum} -> wann das ticket Bearbeitungsstatus am besten auf geschlossen gesetzt wird wenn es geht
LetztesDatum: {letztes_datum} -> Datum an dem das Ticket Bearbeitungsstatus auf geschlossen gesetzt werden muss
-Priorität: {prioritaet} -> Niedrige/Mittlere/hoche/Kritisch
-Kategorie: {kategorie} -> z. B. Gesundheit, Haushalt, Lernen, Organisation, Planen, Projekte, Dokumentation, Kaufen
-Nebenkategorie: {nebenkategorie}
-Bearbeitungs Gruppe: {bearbeitungs_gruppe} -> Gruppe die kategroein vereinen wie HAushalt, Organistaion und planen
-Tags: <{tags}> ->
-Verknüpfte Tickets: <{verknüpfte_tickets}>
Deadline-Typ: <{deadline_typ}> -> (Fix, Flexibel, Kein)
Verzögerungsgrund: (Warum wurde das Ticket verzögert?)
- **Schwierigkeitsgrad:** (Leicht, Mittel, Schwer, Komplex)
- **Abschlussbewertung:** (Erfolgreich, Teilweise gelöst, Nicht gelöst)




---
### **Kategorie (Zusätzliche Beispiele & Erweiterungen)**

Neben den von dir genannten könnten folgende Kategorien sinnvoll sein:

- **Finanzen & Verträge** (Bank, Versicherungen, Rechnungen)
- **Technik & IT** (Hardware, Software, Netzwerke, Automatisierung)
- **Gesundheit & Fitness** (Arzttermine, Sport, Ernährung)
- **Reisen & Ausflüge** (Urlaubsplanung, Tagesausflüge, Unterkunft)
- **Hobbies & Kreatives** (Musik, Kunst, Schreiben, Fotografie)
- **Weiterbildung & Lernen** (Kurse, Bücher, Notizen, neue Fähigkeiten)
- **Soziales & Familie** (Freunde treffen, Familientermine, Geschenke)

Falls du eine **Hierarchie** in Kategorien möchtest, könntest du so etwas nutzen:

- **Hauptkategorie:** (z. B. "Gesundheit")
- **Unterkategorie:** (z. B. "Ernährung", "Sport")
- **Detail-Kategorie:** (z. B. "Krafttraining", "Lauftraining")

### **Nebenkategorie (Erweiterungsmöglichkeiten)**

- Falls du sehr feine Unterteilungen brauchst, könnten Nebenkategorien auch als **Tags** genutzt werden (z. B. "#Ernährung", "#Kraftsport").
- Alternativ könnten sie spezifische Unterthemen innerhalb einer Hauptkategorie beschreiben (z. B. für "Lernen" → "Mathe", "Python", "Obsidian").


### **Bearbeitungsgruppe (Erweiterungsmöglichkeiten)**

Deine Idee, Gruppen über verschiedene Kategorien hinweg zu definieren, ist super!  
Hier ein paar weitere Gruppen, die du einbauen könntest:

- **Persönlich** (Alles, was nur dich betrifft: Lernen, Fitness, Finanzen)
- **Haushalt & Organisation** (Alles, was mit Alltagsaufgaben zu tun hat)
- **Langfristige Projekte** (Größere Dinge wie Umzug, Weiterbildung, ein Hobby-Projekt)
- **Teamarbeit** (Falls du Dinge mit anderen koordinierst)

Falls du mit **mehreren Ebenen von Gruppen** arbeiten willst, könntest du Gruppen-Tags nutzen wie:

- `Alltag | Haushalt`
- `Alltag | Gesundheit`
- `Projekte | IT`
- `Projekte | Kreativ`