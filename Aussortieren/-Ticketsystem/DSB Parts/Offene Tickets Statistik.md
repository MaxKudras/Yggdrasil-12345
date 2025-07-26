# 📊 Ticket-Statistik

- **Offene Tickets:** =dv.sum(dv.pages("Projekte/Ticketsystem").where(t => t.status == "offen").length)
- **Fällige Tickets:** `=dv.pages("Projekte/Ticketsystem").where(t => t.due <= date(today)).length`
- **Abgeschlossene Tickets:** `=dv.sum(dv.pages("Tickets").where(t => t.status == "abgeschlossen").length)`

- **Kategorien Übersicht:**
  - Gesundheit: `=dv.pages("Tickets/Gesundheit").length` Tickets
  - Hobbys: `=dv.pages("Tickets/Hobbys").length` Tickets
