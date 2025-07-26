---
Ticket: Zimmer&Wochnungs Möbelplan
TicketID: T-001
Priorität: Mittel
Hauptkategorie: Organisation
---
# Ticket Zimmer/Wochnungs Möbelplan
Ticket Zimmer/Wochnungs Möbelplan
```mermaid  
graph TD;  
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]
```
Ticket für Zimmer/Wochnungs Möbelplan - Priorität: Mittel, Kategorie: Organisation, Ticket ID: T-001
```mermaid 
graph LR;

%% Class Definitions
%% =================

classDef FixFont font-size:11px;

%% Nodes
%% =====

QuickStart(Quick Start):::FixFont -->
    CmdPalette(Command<BR>Palette):::FixFont;
QuickStart --> 
    CreateNotes("Create notes"):::FixFont;
QuickStart --> 
    InternalLinks("Internal Links"):::FixFont;

click CreateNotes "/Create notes";
click CmdPalette "/Command palette";
click InternalLinks "/Internal link";

%% Internal links
%% ==============

class CmdPalette internal-link;
class CreateNotes internal-link;
class InternalLinks internal-link;

%% Node styles
%% ===========

style CmdPalette fill:#383;  
style QuickStart fill:#A00;
style CreateNotes fill:#03C;
style InternalLinks fill:#C097;!
```


```mermaid 
graph LR;

QuickStart(Quick Start) --> CmdPalette(Command<BR>Palette);
QuickStart --> CreateNotes("Create notes");
QuickStart --> InternalLinks("Internal Links");

click CreateNotes "/Create notes";
click CmdPalette "/Command palette";
click InternalLinks "/Internal link";
```



```mermaid 
graph LR;
bash --> onedrive --> systemctl;

click bash href "obsidian://open?vault=Brain-Notes&file=-Ticketsystem%2FTickets%2FT-002%20-%20Bett%20planen";
click onedrive href "obsidian://vault/Brain-Notes/-Ticketsystem/Tickets/T-002-Bettplanen";
click systemctl "obsidian://vault/Reference/systemctl";
```
```gantt
section Home
Shopping: shopping, 03-06, 5h

click shopping href "obsidian://vault/brain/shopping.md"
```

<h1>&#x2192</h1>
<center href="T-002 - Bett planen.md" class="internal-link">
tecz
</center>

<a href="my file.md" class="internal-link">my file</a>