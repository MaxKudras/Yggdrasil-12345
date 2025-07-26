import os
import tkinter as tk
from tkinter import ttk
from tkinter import messagebox
from collections import defaultdict
from tkcalendar import Calendar

# Ordner für die Notizen und Vorlagen
TICKET_NOTIZEN_VERZEICHNIS = r'C:\Obsidian.mdVaults\Brain-Notes\-Ticketsystem\Tickets'
VORLAGEN_ORDNER = r'C:\Obsidian.mdVaults\Brain-Notes\🎛-Obsidian-\🎛Templates\Ticketsystem'  # Ordner, in dem die Vorlagen gespeichert sind

# Falls das Notizen-Verzeichnis nicht existiert, wird es erstellt
if not os.path.exists(TICKET_NOTIZEN_VERZEICHNIS):
    os.makedirs(TICKET_NOTIZEN_VERZEICHNIS)

# Diese Funktion gibt die nächste Ticketnummer basierend auf den existierenden Dateien zurück
def get_naechste_ticketnummer():
    vorhandene_tickets = [f for f in os.listdir(TICKET_NOTIZEN_VERZEICHNIS) if f.endswith('.md')]
    ticketnummern = []

    for f in vorhandene_tickets:
        try:
            # Versuche, die Ticketnummer aus dem Dateinamen zu extrahieren
            nummer = int(f.split('-')[1].split('.')[0])
            ticketnummern.append(nummer)
        except (IndexError, ValueError):
            # Ignoriere Dateien, die nicht dem Format entsprechen
            continue

    return max(ticketnummern, default=0) + 1

# Diese Funktion lädt alle Vorlagen aus dem Vorlagen-Ordner
def lade_vorlagen():
    vorlagen = {}
    for datei in os.listdir(VORLAGEN_ORDNER):
        if datei.endswith('.md'):
            with open(os.path.join(VORLAGEN_ORDNER, datei), 'r') as f:
                vorlagen[datei] = f.read()
    return vorlagen

# Funktion, um das Ticket zu erstellen
def erstelle_ticket_notiz():
    # Lade alle Vorlagen
    vorlagen = lade_vorlagen()

    # Hole die Ticketnummer
    ticketnummer = get_naechste_ticketnummer()
    ticket_id = f'T-{ticketnummer:03}'

    # Benutzerabfragen über GUI
    name = name_entry.get()
    prioritaet = prioritaet_var.get()
    kategorie = kategorie_entry.get()
    vorlage_schluessel = vorlagen_combobox.get()

    if vorlage_schluessel not in vorlagen:
        messagebox.showerror("Fehler", "Vorlage nicht gefunden.")
        return

    # Hole die ausgewählte Vorlage
    vorlage = vorlagen[vorlage_schluessel]

    # Ersetze die Platzhalter in der Vorlage
    notizinhalt = vorlage.format(name=name, ticket_id=ticket_id, prioritaet=prioritaet, kategorie=kategorie)

    # Speichere die Notiz als .md Datei
    notiz_datei = os.path.join(TICKET_NOTIZEN_VERZEICHNIS, f'{ticket_id} - {name}.md')
    with open(notiz_datei, 'w') as datei:
        datei.write(notizinhalt)

    messagebox.showinfo("Erfolg", f"Notiz '{name}' mit Ticketnummer {ticket_id} wurde erfolgreich erstellt.")

# GUI erstellen
root = tk.Tk()
root.title("Ticket Erstellen")

# Name
tk.Label(root, text="Name des Tickets:").grid(row=0, column=0, padx=10, pady=10)
name_entry = tk.Entry(root, width=40)
name_entry.grid(row=0, column=1, padx=10, pady=10)

# Priorität
tk.Label(root, text="Priorität:").grid(row=1, column=0, padx=10, pady=10)
prioritaet_var = ttk.Combobox(root, values=["Hoch", "Mittel", "Niedrig"], width=37)
prioritaet_var.grid(row=1, column=1, padx=10, pady=10)

# Kategorie
tk.Label(root, text="Hauptkategorie:").grid(row=2, column=0, padx=10, pady=10)
kategorie_entry = tk.Entry(root, width=40)
kategorie_entry.grid(row=2, column=1, padx=10, pady=10)

# Vorlagen auswählen
vorlagen = lade_vorlagen()
vorlagen_namen = list(vorlagen.keys())

tk.Label(root, text="Vorlage auswählen:").grid(row=3, column=0, padx=10, pady=10)
vorlagen_combobox = ttk.Combobox(root, values=vorlagen_namen, width=37)
vorlagen_combobox.grid(row=3, column=1, padx=10, pady=10)

# Button zum Erstellen des Tickets
tk.Button(root, text="Ticket erstellen", command=erstelle_ticket_notiz).grid(row=4, column=0, columnspan=2, pady=20)

# Start der GUI
root.mainloop()
