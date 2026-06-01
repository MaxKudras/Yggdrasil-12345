var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => Harmony
});
module.exports = __toCommonJS(main_exports);
var import_obsidian10 = require("obsidian");

// src/core/ModuleRegistry.ts
var ModuleRegistry = class {
  constructor() {
    this.modules = /* @__PURE__ */ new Map();
    this.activeModuleIds = /* @__PURE__ */ new Set();
  }
  register(module2) {
    this.modules.set(module2.id, module2);
  }
  getAll() {
    return Array.from(this.modules.values());
  }
  initAll() {
    for (const module2 of this.modules.values()) {
      if (typeof module2.init === "function") {
        module2.init();
      }
    }
    console.log("[Harmony] Tous les modules sont initialis\xE9s (Vues enregistr\xE9es).");
  }
  async enable(moduleId) {
    const module2 = this.modules.get(moduleId);
    if (!module2) return;
    if (module2 && !this.activeModuleIds.has(moduleId)) {
      try {
        await module2.onload();
        this.activeModuleIds.add(moduleId);
        console.log(`[Harmony] Module "${moduleId}" activ\xE9.`);
      } catch (e) {
        console.error(`[Harmony] Erreur fatale \xE0 l'activation de ${moduleId} :`, e);
        this.activeModuleIds.delete(moduleId);
      }
    }
    for (const mod of this.getAll()) {
      if (mod.id !== moduleId && !this.activeModuleIds.has(mod.id)) {
        try {
          mod.onunload();
          console.log(`[Harmony] Nettoyage : D\xE9sactivation forc\xE9e du module "${mod.id}" avant d'activer "${moduleId}".`);
        } catch (e) {
        }
        const ghostIcon = document.querySelector(`[data-harmony-module="${mod.id}"]`);
        if (ghostIcon) {
          console.log(`[Harmony] Bulldozer : Suppression du logo fant\xF4me de "${mod.id}".`);
          ghostIcon.remove();
        }
      }
    }
  }
  disable(moduleId) {
    const module2 = this.modules.get(moduleId);
    if (module2 && this.activeModuleIds.has(moduleId)) {
      try {
        module2.onunload();
        this.activeModuleIds.delete(moduleId);
        console.log(`[Harmony] ${moduleId} d\xE9sactiv\xE9.`);
      } catch (e) {
        console.error(`Erreur lors du onunload de ${moduleId}`, e);
      }
    }
    const ghostIcon = document.querySelector(`[data-harmony-module="${moduleId}"]`);
    if (ghostIcon) {
      ghostIcon.remove();
    }
  }
  unloadAll() {
    for (const module2 of this.modules.values()) {
      this.disable(module2.id);
    }
  }
};

// src/core/SettingsTab.ts
var import_obsidian = require("obsidian");

// src/core/i18n.ts
var EN = {
  //Core Settings
  1: "Harmony",
  2: "Activate or deactivate the modules below. Changes are immediate.",
  3: "Community",
  4: "Vote for the next feature",
  5: "Tell us what you want to see in the next update!",
  6: "\u{1F5F3}\uFE0F Vote",
  7: "Roadmap",
  8: "See the next features planned",
  9: "\u{1F4CB} Roadmap",
  10: "Modules",
  11: "No module available.",
  12: "ID",
  13: "Language",
  14: "Interface language",
  15: "Select the interface language",
  //Kanban
  100: "Kanban",
  101: "Open Kanban",
  102: "New board",
  103: "Open",
  104: "Delete this board",
  105: "No board. Create one!",
  106: "+ New board",
  107: "Board name",
  108: "Add a task",
  109: "Card title",
  110: "+ column",
  111: "Column name",
  112: "Edit task",
  113: "Title",
  114: "Note link",
  115: "Due date (YYYY-MM-DD)",
  116: "Tags (comma separated)",
  117: "Priority",
  118: "Save",
  119: "Cancel",
  120: "Archive",
  121: "Unarchive",
  122: "Delete",
  123: "Archives",
  124: "Hide the archives",
  125: "No task archived.",
  126: "\u21A9 Unarchive",
  127: "\u2191 Priority",
  128: "\u2193 Priority",
  129: "\u21C5 Priority",
  130: "\u2190 Since",
  131: "Delete this board?",
  132: "Confirm",
  133: "In progress",
  134: "To be done",
  135: "Finished",
  136: "Delete this column?",
  137: "\u2190 Shift left",
  138: "Shift right \u2192",
  139: "Change color",
  140: "Task Title",
  141: "Delete this task?",
  142: "Urgent",
  143: "High",
  144: "Normal",
  145: "Bass",
  146: "Move to",
  147: "in :",
  //Dashboard
  200: "Dashboard",
  201: "Open Dashboard",
  202: "Search in vault\u2026",
  203: "No results",
  204: "notes",
  205: "\u2699\uFE0F Settings",
  206: "Show clock",
  207: "Show seconds",
  208: "Show note count",
  209: "Open on startup",
  210: "Wallpaper",
  211: "Choose\u2026",
  212: "Remove wallpaper",
  213: "Overlay opacity",
  214: "Close",
  215: "None",
  216: "Quick links",
  217: "+ Add",
  218: "Link name",
  219: "Note path",
  220: "Add link",
  221: "Priority Tasks",
  222: "Open in the calendar",
  223: "Open in Kanban",
  224: "Open in the Todo list",
  //for time
  250: "Monday",
  251: "Tuesday",
  252: "Wednesday",
  253: "Thursday",
  254: "Friday",
  255: "Saturday",
  256: "Sunday",
  257: "January",
  258: "February",
  259: "March",
  260: "April",
  261: "May",
  262: "June",
  263: "July",
  264: "August",
  265: "September",
  266: "October",
  267: "November",
  268: "December",
  //To-Do List
  300: "My Tasks",
  301: "New Task...",
  302: "Add a task...",
  //Calendar
  400: "Calendar",
  401: "Open Calendar",
  402: "No task for this period",
  403: "Add task",
  404: "Filter",
  405: "Sources",
  406: "Today",
  407: "Month",
  408: "Week",
  409: "Previous",
  410: "Next",
  411: "New task",
  412: "Edit task",
  413: "Title",
  414: "Due date",
  415: "Priority",
  416: "Tags (comma separated)",
  417: "Note link",
  418: "Description",
  419: "Completed",
  420: "Show / hide done tasks",
  421: "Cancel",
  422: "Delete",
  423: "Save",
  424: "Start time",
  425: "Duration (minutes)",
  426: "Recurrence",
  427: "None",
  428: "Day(s)",
  429: "Week(s)",
  430: "Month",
  431: "Day",
  432: "All the day",
  433: "Status",
  434: "Delete this task?",
  435: "Yes",
  436: "No"
};
var FR = {
  //Core Settings
  1: "Harmony",
  2: "Active ou d\xE9sactive les modules ci-dessous. Les changements sont imm\xE9diats.",
  3: "Communaut\xE9",
  4: "Voter pour la prochaine feature",
  5: "Dis-nous ce que tu veux voir dans la prochaine mise \xE0 jour !",
  6: "\u{1F5F3}\uFE0F Voter",
  7: "Roadmap",
  8: "Voir les prochaines features pr\xE9vues",
  9: "\u{1F4CB} Roadmap",
  10: "Modules",
  11: "Aucun module disponible.",
  12: "ID",
  13: "Langue",
  14: "Langue de l'interface",
  15: "Selectionner la langue de l'interface",
  //Kanban
  100: "Kanban",
  101: "Ouvrir le Kanban",
  102: "Nouveau tableau",
  103: "Ouvrir",
  104: "Supprimer ce tableau",
  105: "Aucun tableau. Cr\xE9e-en un !",
  106: "+ Nouveau tableau",
  107: "Nom du tableau",
  108: "Ajouter une t\xE2che",
  109: "Titre de la carte",
  110: "+ colonne",
  111: "Nom de la colonne",
  112: "\xC9diter la t\xE2che",
  113: "Titre",
  114: "Lien note",
  115: "\xC9ch\xE9ance (YYYY-MM-DD)",
  116: "Tags (s\xE9par\xE9s par des virgules)",
  117: "Priorit\xE9",
  118: "Enregistrer",
  119: "Annuler",
  120: "Archiver",
  121: "D\xE9sarchiver",
  122: "Supprimer",
  123: "Archives",
  124: "Cacher les archives",
  125: "Aucune t\xE2ches archiv\xE9e.",
  126: "\u21A9 D\xE9sarchiver",
  127: "\u2191 Priorit\xE9",
  128: "\u2193 Priorit\xE9",
  129: "\u21C5 Priorit\xE9",
  130: "\u2190 Depuis",
  131: "Supprimer ce tableau ?",
  132: "Confirmer",
  133: "En cours",
  134: "\xC0 faire",
  135: "Termin\xE9",
  136: "Supprimer cette colonne ?",
  137: "\u2190 D\xE9caler \xE0 gauche",
  138: "D\xE9caler \xE0 droite \u2192",
  139: "Changer couleur",
  140: "Titre de la t\xE2che",
  141: "Supprimer cette t\xE2che ?",
  142: "Urgent",
  143: "Haute",
  144: "Normale",
  145: "Basse",
  146: "D\xE9placer vers",
  147: "dans :",
  //Dashboard
  200: "Dashboard",
  201: "Ouvrir le Dashboard",
  202: "Rechercher dans le coffre\u2026",
  203: "Aucun r\xE9sultat",
  204: "notes",
  205: "\u2699\uFE0F Param\xE8tres",
  206: "Afficher l'horloge",
  207: "Afficher les secondes",
  208: "Afficher le nombre de notes",
  209: "Ouvrir au d\xE9marrage",
  210: "Fond d'\xE9cran",
  211: "Choisir\u2026",
  212: "Supprimer le fond",
  213: "Opacit\xE9 overlay",
  214: "Fermer",
  215: "Aucun",
  216: "Liens rapides",
  217: "+ Ajouter",
  218: "Nom du lien",
  219: "Chemin de la note",
  220: "Ajouter le lien",
  221: "T\xE2ches Prioritaires",
  222: "Ouvrir dans le Calendrier",
  223: "Ouvrir dans le Kanban",
  224: "Ouvrir dans la Todo list",
  //for time
  250: "Lundi",
  251: "Mardi",
  252: "Mercredi",
  253: "Jeudi",
  254: "Vendredi",
  255: "Samedi",
  256: "Dimanche",
  257: "janvier",
  258: "f\xE9vrier",
  259: "mars",
  260: "avril",
  261: "mai",
  262: "juin",
  263: "juillet",
  264: "ao\xFBt",
  265: "septembre",
  266: "octobre",
  267: "novembre",
  268: "decembre",
  //Todo list
  300: "Mes T\xE2ches",
  301: "Nouvelle t\xE2che...",
  302: "Ajouter une t\xE2che...",
  //Calendar
  400: "Calendrier",
  401: "Ouvrir le Calendrier",
  402: "Aucune t\xE2che pour cette p\xE9riode",
  403: "Ajouter une t\xE2che",
  404: "Filtrer",
  405: "Sources",
  406: "Aujourd'hui",
  407: "Mois",
  408: "Semaine",
  409: "Pr\xE9c\xE9dent",
  410: "Suivant",
  411: "Nouvelle t\xE2che",
  412: "Modifier la t\xE2che",
  413: "Titre",
  414: "\xC9ch\xE9ance",
  415: "Priorit\xE9",
  416: "Tags (s\xE9par\xE9s par des virgules)",
  417: "Lien note",
  418: "Description",
  419: "Termin\xE9e",
  420: "Afficher / masquer les t\xE2ches faites",
  421: "Annuler",
  422: "Supprimer",
  423: "Enregistrer",
  424: "Heure de d\xE9but",
  425: "Dur\xE9e (en minutes)",
  426: "R\xE9currence",
  427: "Aucune (Unique)",
  428: "Jour(s)",
  429: "Semaine(s)",
  430: "Mois",
  431: "Jour",
  432: "Toute la journ\xE9e",
  433: "Statut",
  434: "Supprimer cette t\xE2che ?",
  435: "Oui",
  436: "Non"
};
var ES = {
  // Core Settings
  1: "Harmon\xEDa",
  2: "Activa o desactiva los m\xF3dulos a continuaci\xF3n. Los cambios son inmediatos.",
  3: "Comunidad",
  4: "Votar por la pr\xF3xima funci\xF3n",
  5: "\xA1Dinos qu\xE9 te gustar\xEDa ver en la pr\xF3xima actualizaci\xF3n!",
  6: "\u{1F5F3}\uFE0F Votar",
  7: "Hoja de ruta",
  8: "Ver las pr\xF3ximas funciones planeadas",
  9: "\u{1F4CB} Hoja de ruta",
  10: "M\xF3dulos",
  11: "No hay m\xF3dulos disponibles.",
  12: "ID",
  13: "Idioma",
  14: "Idioma de la interfaz",
  15: "Seleccionar el idioma de la interfaz",
  // Kanban
  100: "Kanban",
  101: "Abrir el Kanban",
  102: "Nuevo tablero",
  103: "Abrir",
  104: "Eliminar este tablero",
  105: "No hay tableros. \xA1Crea uno!",
  106: "+ Nuevo tablero",
  107: "Nombre del tablero",
  108: "Agregar una tarea",
  109: "T\xEDtulo de la tarjeta",
  110: "+ columna",
  111: "Nombre de la columna",
  112: "Editar la tarea",
  113: "T\xEDtulo",
  114: "Enlace a la nota",
  115: "Fecha l\xEDmite (AAAA-MM-DD)",
  116: "Etiquetas (separadas por comas)",
  117: "Prioridad",
  118: "Guardar",
  119: "Cancelar",
  120: "Archivar",
  121: "Desarchivar",
  122: "Eliminar",
  123: "Archivos",
  124: "Ocultar archivos",
  125: "No hay tareas archivadas.",
  126: "\u21A9 Desarchivar",
  127: "\u2191 Prioridad",
  128: "\u2193 Prioridad",
  129: "\u21C5 Prioridad",
  130: "\u2190 Desde",
  131: "\xBFEliminar este tablero?",
  132: "Confirmar",
  133: "En curso",
  134: "Por hacer",
  135: "Terminado",
  136: "\xBFEliminar esta columna?",
  137: "\u2190 Mover a la izquierda",
  138: "Mover a la derecha \u2192",
  139: "Cambiar color",
  140: "T\xEDtulo de la tarea",
  141: "\xBFEliminar esta tarea?",
  142: "Urgente",
  143: "Alta",
  144: "Normal",
  145: "Baja",
  146: "Mover a",
  147: "en :",
  // Dashboard
  200: "Panel",
  201: "Abrir el Panel",
  202: "Buscar en la b\xF3veda\u2026",
  203: "Sin resultados",
  204: "notas",
  205: "\u2699\uFE0F Configuraci\xF3n",
  206: "Mostrar el reloj",
  207: "Mostrar segundos",
  208: "Mostrar el n\xFAmero de notas",
  209: "Abrir al iniciar",
  210: "Fondo de pantalla",
  211: "Seleccionar\u2026",
  212: "Eliminar fondo",
  213: "Opacidad de la superposici\xF3n",
  214: "Cerrar",
  215: "Ninguno",
  216: "Accesos directos",
  217: "+ Agregar",
  218: "Nombre del enlace",
  219: "Ruta de la nota",
  220: "Agregar enlace",
  221: "Tareas prioritarias",
  222: "Abrir en el calendario",
  223: "Abrir en el Kanban",
  224: "Abrir en la Todo list",
  // Days
  250: "Lunes",
  251: "Martes",
  252: "Mi\xE9rcoles",
  253: "Jueves",
  254: "Viernes",
  255: "S\xE1bado",
  256: "Domingo",
  // Months
  257: "enero",
  258: "febrero",
  259: "marzo",
  260: "abril",
  261: "mayo",
  262: "junio",
  263: "julio",
  264: "agosto",
  265: "septiembre",
  266: "octubre",
  267: "noviembre",
  268: "diciembre",
  // Todo list
  300: "Mis tareas",
  301: "Nueva tarea...",
  302: "Agregar una tarea...",
  // Calendar
  400: "Calendario",
  401: "Abrir el calendario",
  402: "No hay tareas para este per\xEDodo",
  403: "Agregar una tarea",
  404: "Filtrar",
  405: "Fuentes",
  406: "Hoy",
  407: "Mes",
  408: "Semana",
  409: "Anterior",
  410: "Siguiente",
  411: "Nueva tarea",
  412: "Editar tarea",
  413: "T\xEDtulo",
  414: "Fecha l\xEDmite",
  415: "Prioridad",
  416: "Etiquetas (separadas por comas)",
  417: "Enlace a la nota",
  418: "Descripci\xF3n",
  419: "Completada",
  420: "Mostrar / ocultar tareas completadas",
  421: "Cancelar",
  422: "Eliminar",
  423: "Guardar",
  424: "Hora de inicio",
  425: "Duraci\xF3n (minutos)",
  426: "Recurrencia",
  427: "Ninguna (\xDAnica)",
  428: "D\xEDa(s)",
  429: "Semana(s)",
  430: "Mes",
  431: "D\xEDa",
  432: "Todo el d\xEDa",
  433: "Estatuto",
  434: "\xBFEliminar esta tarea?",
  435: "S\xED",
  436: "No"
};
var TRANSLATIONS = {
  en: EN,
  fr: FR,
  es: ES
};
var currentLanguage = "en";
var changeListeners = [];
function t(key) {
  var _a, _b;
  return (_b = (_a = TRANSLATIONS[currentLanguage][key]) != null ? _a : EN[key]) != null ? _b : `[${key}]`;
}
function setLanguage(lang) {
  currentLanguage = lang;
  for (const l of changeListeners) l();
}
function onLanguageChange(listener) {
  changeListeners.push(listener);
  return () => {
    const i = changeListeners.indexOf(listener);
    if (i !== -1) changeListeners.splice(i, 1);
  };
}

// src/core/SettingsTab.ts
var Harmony_Settings_Tab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName(t(1)).setHeading();
    containerEl.createEl(
      "p",
      {
        text: t(2),
        cls: "setting-item-description"
      }
    );
    new import_obsidian.Setting(containerEl).setName(t(13)).setHeading();
    new import_obsidian.Setting(containerEl).setName(t(14)).setDesc(t(15)).addDropdown((drop) => {
      drop.addOption("en", "English").addOption("fr", "Fran\xE7ais").addOption("es", "Espa\xF1ol").setValue(this.plugin.settings.language).onChange(async (value) => {
        this.plugin.settings.language = value;
        await this.plugin.saveSettings();
        setLanguage(value);
        this.display();
      });
    });
    containerEl.createEl("hr");
    new import_obsidian.Setting(containerEl).setName(t(3)).setHeading();
    new import_obsidian.Setting(containerEl).setName(t(4)).setDesc(t(5)).addButton(
      (btn) => btn.setButtonText(t(6)).setCta().onClick(() => {
        window.open("https://github.com/yodavatar/Harmony/discussions", "_blank");
      })
    );
    new import_obsidian.Setting(containerEl).setName(t(7)).setDesc(t(8)).addButton(
      (btn) => btn.setButtonText(t(9)).setCta().onClick(() => {
        window.open("https://github.com/Yodavatar/Harmony/blob/main/ROADMAP.md", "_blank");
      })
    );
    containerEl.createEl("hr");
    new import_obsidian.Setting(containerEl).setName(t(10)).setHeading();
    const modules = this.plugin.registry.getAll();
    for (const module2 of modules) {
      new import_obsidian.Setting(containerEl).setName(module2.name).setDesc(`ID : ${module2.id}`).addToggle(
        (toggle) => {
          var _a;
          return toggle.setValue((_a = this.plugin.settings.enabledModules[module2.id]) != null ? _a : false).onChange(async (value) => {
            this.plugin.settings.enabledModules[module2.id] = value;
            await this.plugin.saveSettings();
            if (value) {
              await this.plugin.registry.enable(module2.id);
            } else {
              await this.plugin.registry.disable(module2.id);
            }
          });
        }
      );
    }
  }
};

// src/core/LinkerService.ts
var import_obsidian2 = require("obsidian");
var LinkService = class {
  constructor(app, taskStore) {
    this.app = app;
    this.taskStore = taskStore;
  }
  init() {
    this.app.vault.on("rename", (file, oldPath) => this.handleRename(file, oldPath));
  }
  async handleRename(file, oldPath) {
    if (!(file instanceof import_obsidian2.TFile)) return;
    const cleanOldPath = oldPath.replace(/\.md$/, "");
    const cleanNewPath = file.path.replace(/\.md$/, "");
    const allTasks = this.taskStore.getTasks();
    const tasksToUpdate = allTasks.filter((t2) => t2.noteLink === cleanOldPath);
    for (const task of tasksToUpdate) {
      console.log(`[LinkService] Match trouv\xE9 : ${task.noteLink} -> ${cleanNewPath}`);
      await this.taskStore.updateTask(task.id, { noteLink: cleanNewPath });
    }
  }
};

// src/shared/taskstore.ts
var import_obsidian3 = require("obsidian");
var DATA_PATH = (0, import_obsidian3.normalizePath)(".Harmony/tasks.json");
var TaskStore = class {
  constructor(app) {
    this.tasks = /* @__PURE__ */ new Map();
    this.listeners = [];
    this.loaded = false;
    //Init
    this.loadPromise = null;
    this.app = app;
  }
  async load() {
    if (this.loaded) return;
    if (this.loadPromise) return this.loadPromise;
    this.loadPromise = (async () => {
      const exists = await this.app.vault.adapter.exists(DATA_PATH);
      if (exists) {
        const raw = await this.app.vault.adapter.read(DATA_PATH);
        try {
          const rawData = JSON.parse(raw);
          if (Array.isArray(rawData)) {
            const arr = rawData;
            this.tasks.clear();
            for (const t2 of arr) {
              if (t2 && typeof t2 === "object" && "id" in t2) {
                this.tasks.set(t2.id, t2);
              }
            }
          }
        } catch (e) {
          console.error("[TaskStore] JSON error", e);
        }
      }
      this.loaded = true;
    })();
    return this.loadPromise;
  }
  async persist() {
    if (!this.loaded) {
      console.warn("[TaskStore] Tried to save before loading, canceled.");
      return;
    }
    const dir = (0, import_obsidian3.normalizePath)(".Harmony");
    if (!await this.app.vault.adapter.exists(dir))
      await this.app.vault.adapter.mkdir(dir);
    const arr = Array.from(this.tasks.values());
    await this.app.vault.adapter.write(DATA_PATH, JSON.stringify(arr, null, 2));
  }
  //read API
  /**
   * return the filter tasks.
   * All criteria are combine with AND.
   */
  getTasks(filter = {}) {
    return Array.from(this.tasks.values()).filter((t2) => {
      if (filter.source !== void 0 && t2.source !== filter.source) return false;
      if (filter.boardId !== void 0 && t2.boardId !== filter.boardId) return false;
      if (filter.columnId !== void 0 && t2.columnId !== filter.columnId) return false;
      if (filter.done !== void 0 && t2.done !== filter.done) return false;
      if (filter.archived !== void 0 && t2.archived !== filter.archived) return false;
      if (filter.dueDate !== void 0 && t2.dueDate !== filter.dueDate) return false;
      if (filter.tag !== void 0 && !t2.tags.includes(filter.tag)) return false;
      return true;
    });
  }
  getTask(id) {
    return this.tasks.get(id);
  }
  //Write API
  async addTask(task) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const full = { ...task, createdAt: now, updatedAt: now };
    this.tasks.set(full.id, full);
    await this.persist();
    this.emit("add", full);
    return full;
  }
  async updateTask(id, changes) {
    const existing = this.tasks.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...changes, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    this.tasks.set(id, updated);
    await this.persist();
    this.emit("update", updated);
    return updated;
  }
  async deleteTask(id) {
    const task = this.tasks.get(id);
    if (!task) return false;
    this.tasks.delete(id);
    await this.persist();
    this.emit("delete", task);
    return true;
  }
  //del all tasks link to a board
  async deleteTasksByBoard(boardId) {
    const toDelete = this.getTasks({ boardId });
    for (const t2 of toDelete) this.tasks.delete(t2.id);
    if (toDelete.length > 0) await this.persist();
  }
  //helpers
  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
  //event
  on(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
  emit(event, task) {
    for (const l of this.listeners) l(event, task);
  }
};
var PRIORITY_ORDER = ["urgent", "high", "normal", "low"];
var getPriorityLabels = () => ({
  urgent: "\u{1F534} " + t(142),
  high: "\u{1F7E0} " + t(143),
  normal: "\u{1F7E2} " + t(144),
  low: "\u{1FAD9} " + t(145)
});
var PRIORITY_COLORS = {
  urgent: "#e55",
  high: "#e96f00",
  normal: "#3a3",
  low: "#888"
};

// src/shared/types.ts
var DEFAULT_SETTINGS = {
  enabledModules: {
    "dashboard": true,
    "kanban": true,
    "todolist": true
  },
  moduleSettings: {
    "dashboard": {
      "wallpaper": "",
      "opacity": 0.8
    }
  },
  language: "en",
  version: "0.1.10"
};

// src/modules/kanban/KanbanStore.ts
var import_obsidian4 = require("obsidian");
var DATA_DIR = (0, import_obsidian4.normalizePath)(".Harmony/kanban");
var KanbanStore = class {
  constructor(app, taskStore) {
    this.app = app;
    this.taskStore = taskStore;
  }
  boardPath(boardId) {
    return (0, import_obsidian4.normalizePath)(`${DATA_DIR}/${boardId}.json`);
  }
  onTaskChange(callback) {
    return this.taskStore.on(callback);
  }
  async ensureDataDir() {
    if (!await this.app.vault.adapter.exists(DATA_DIR)) {
      await this.app.vault.adapter.mkdir(DATA_DIR);
    }
  }
  async loadBoard(boardId) {
    const path = this.boardPath(boardId);
    if (!await this.app.vault.adapter.exists(path)) return null;
    const raw = await this.app.vault.adapter.read(path);
    return JSON.parse(raw);
  }
  async saveBoard(board) {
    await this.ensureDataDir();
    board.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    const toWrite = {
      ...board,
      columns: board.columns.map(({ id, title, color }) => ({ id, title, color }))
    };
    await this.app.vault.adapter.write(
      this.boardPath(board.id),
      JSON.stringify(toWrite, null, 2)
    );
  }
  async listBoards() {
    await this.ensureDataDir();
    const files = await this.app.vault.adapter.list(DATA_DIR);
    const boards = [];
    for (const f of files.files.filter((f2) => f2.endsWith(".json"))) {
      const raw = await this.app.vault.adapter.read(f);
      try {
        const data = JSON.parse(raw);
        for (const col of data.columns) {
          if ("cards" in col) {
            delete col.cards;
          }
        }
        boards.push(data);
      } catch (e) {
        console.warn(`[Harmony] Erreur de lecture du Kanban ${f}`, e);
      }
    }
    return boards.sort((a, b) => a.title.localeCompare(b.title));
  }
  async deleteBoard(boardId) {
    const confirmed = await new Promise((resolve) => {
      const m = new import_obsidian4.Modal(this.app);
      m.contentEl.createEl("p", { text: t(131) });
      m.contentEl.createEl("button", { text: t(132), cls: "mod-warning" }).addEventListener("click", () => {
        m.close();
        resolve(true);
      });
      m.contentEl.createEl("button", { text: t(119) }).addEventListener("click", () => {
        m.close();
        resolve(false);
      });
      m.open();
    });
    if (!confirmed) return;
    await this.taskStore.deleteTasksByBoard(boardId);
    const path = this.boardPath(boardId);
    if (await this.app.vault.adapter.exists(path)) {
      await this.app.vault.adapter.remove(path);
    }
  }
  createEmptyBoard(title) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const ts = Date.now();
    return {
      id: `board-${ts}`,
      title,
      createdAt: now,
      updatedAt: now,
      columns: [
        { id: `col-${ts}-1`, title: t(134), color: "#6c8ebf" },
        { id: `col-${ts}-2`, title: t(133), color: "#d6a94a" },
        { id: `col-${ts}-3`, title: t(135), color: "#5a9e6f" }
      ]
    };
  }
  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
  getCards(boardId, columnId) {
    return this.taskStore.getTasks({ source: "kanban", boardId, columnId, archived: false });
  }
  getArchivedCards(boardId) {
    return this.taskStore.getTasks({ source: "kanban", boardId, archived: true });
  }
  async addCard(boardId, columnId, title) {
    return this.taskStore.addTask({
      id: this.taskStore.generateId("card"),
      source: "kanban",
      boardId,
      columnId,
      title,
      done: false,
      archived: false,
      priority: "normal",
      tags: []
    });
  }
  async updateCard(cardId, changes) {
    return this.taskStore.updateTask(cardId, changes);
  }
  async deleteCard(cardId) {
    return this.taskStore.deleteTask(cardId);
  }
  async archiveCard(cardId) {
    return this.taskStore.updateTask(cardId, { archived: true });
  }
  async unarchiveCard(cardId) {
    return this.taskStore.updateTask(cardId, { archived: false });
  }
  async moveCard(cardId, targetColumnId) {
    return this.taskStore.updateTask(cardId, { columnId: targetColumnId });
  }
  async deleteCardsByColumn(boardId, columnId) {
    const tasks = this.taskStore.getTasks({ source: "kanban", boardId, columnId });
    for (const t2 of tasks) await this.taskStore.deleteTask(t2.id);
  }
};

// src/modules/kanban/KanbanView.ts
var import_obsidian6 = require("obsidian");

// src/modules/kanban/KanbanBoard.ts
var import_obsidian5 = require("obsidian");
var KanbanBoard = class {
  constructor(app, store, board, container) {
    this.showArchived = false;
    this.sortOrder = null;
    this.dragCard = null;
    this.dragSourceColId = null;
    this.app = app;
    this.store = store;
    this.board = board;
    this.container = container;
  }
  isDragging() {
    return this.dragCard !== null;
  }
  getDragCard() {
    return this.dragCard;
  }
  async persist() {
    await this.store.saveBoard(this.board);
  }
  render() {
    const labels = getPriorityLabels();
    this.container.empty();
    this.container.addClass("mkb-board");
    this.renderHeader();
    const columnsEl = this.container.createDiv("mkb-columns");
    for (const col of this.board.columns) {
      this.renderColumn(columnsEl, col, labels);
    }
    if (this.showArchived) {
      this.renderArchivedSection(labels);
    }
  }
  renderHeader() {
    const header = this.container.createDiv("mkb-board-header");
    const titleEl = header.createEl("h2", { text: this.board.title, cls: "mkb-board-title" });
    titleEl.addEventListener("dblclick", () => void this.editBoardTitle(titleEl));
    const actions = header.createDiv("mkb-header-actions");
    const sortBtn = actions.createEl("button", { cls: "mkb-btn mkb-btn-secondary", text: this.sortOrder === "asc" ? t(127) : this.sortOrder === "desc" ? t(128) : t(129) });
    sortBtn.addEventListener("click", () => {
      this.sortOrder = this.sortOrder === null ? "asc" : this.sortOrder === "asc" ? "desc" : null;
      this.render();
    });
    const archiveBtn = actions.createEl("button", { cls: `mkb-btn mkb-btn-secondary ${this.showArchived ? "mkb-active" : ""}`, text: this.showArchived ? t(124) : t(123) });
    archiveBtn.addEventListener("click", () => {
      this.showArchived = !this.showArchived;
      this.render();
    });
    const addColBtn = actions.createEl("button", { cls: "mkb-btn mkb-btn-secondary", text: t(110) });
    addColBtn.addEventListener("click", () => void this.addColumn());
  }
  getSortedCards(cards) {
    const active = cards.filter((c) => !c.archived);
    if (!this.sortOrder) return active;
    return [...active].sort((a, b) => {
      var _a, _b;
      const ai = PRIORITY_ORDER.indexOf((_a = a.priority) != null ? _a : "normal");
      const bi = PRIORITY_ORDER.indexOf((_b = b.priority) != null ? _b : "normal");
      return this.sortOrder === "asc" ? ai - bi : bi - ai;
    });
  }
  renderColumn(parent, col, labels) {
    const rawCards = this.store.getCards(this.board.id, col.id);
    const cards = this.getSortedCards(rawCards);
    const colEl = parent.createDiv("mkb-column");
    colEl.dataset.colId = col.id;
    const colHeader = colEl.createDiv("mkb-column-header");
    if (col.color) colHeader.setCssProps({ "--col-color": col.color });
    ;
    const titleEl = colHeader.createEl("span", { text: col.title, cls: "mkb-column-title" });
    titleEl.addEventListener("dblclick", () => void this.editColumnTitle(titleEl, col));
    colHeader.createEl("span", { text: String(cards.length), cls: "mkb-column-count" });
    const menuBtn = colHeader.createEl("button", { cls: "mkb-btn-icon mkb-column-menu" });
    (0, import_obsidian5.setIcon)(menuBtn, "ellipsis-vertical");
    menuBtn.addEventListener("click", () => this.openColumnMenu(menuBtn, col));
    const cardsEl = colEl.createDiv("mkb-cards");
    cardsEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      cardsEl.addClass("mkb-drag-over");
    });
    cardsEl.addEventListener("dragleave", () => cardsEl.removeClass("mkb-drag-over"));
    cardsEl.addEventListener("drop", (e) => {
      e.preventDefault();
      cardsEl.removeClass("mkb-drag-over");
      this.onDrop(col.id);
    });
    for (const card of cards) {
      this.renderCard(cardsEl, card, col.id, labels);
    }
    const addCardBtn = colEl.createEl("button", { cls: "mkb-btn mkb-btn-add-card", text: t(108) });
    addCardBtn.addEventListener("click", () => void this.addCard(col.id));
  }
  renderCard(parent, card, colId, labels) {
    var _a;
    const cardEl = parent.createDiv("mkb-card");
    cardEl.draggable = true;
    cardEl.dataset.cardId = card.id;
    const priority = (_a = card.priority) != null ? _a : "normal";
    cardEl.setCssProps({ "--prio-color": PRIORITY_COLORS[priority] });
    cardEl.addEventListener("dragstart", () => {
      this.dragCard = card;
      this.dragSourceColId = colId;
      cardEl.addClass("mkb-dragging");
    });
    cardEl.addEventListener("dragend", () => cardEl.removeClass("mkb-dragging"));
    const badge = cardEl.createEl("span", { text: labels[priority], cls: "mkb-priority-badge" });
    badge.setCssProps({ "--prio-color": PRIORITY_COLORS[priority] });
    const titleEl = cardEl.createEl("span", { text: card.title, cls: "mkb-card-title" });
    titleEl.addEventListener("dblclick", () => void this.editCardTitle(titleEl, card, colId));
    if (card.noteLink) {
      const linkEl = cardEl.createEl("a", { text: `\u{1F4C4} ${card.noteLink}`, cls: "mkb-card-note-link" });
      linkEl.addEventListener("click", (e) => {
        e.preventDefault();
        void this.app.workspace.openLinkText(card.noteLink, "", false);
      });
    }
    if (card.dueDate) {
      const due = new Date(card.dueDate);
      const isOverdue = due < /* @__PURE__ */ new Date();
      cardEl.createEl(
        "span",
        {
          text: `\u{1F4C5} ${due.toLocaleDateString("fr-FR")}`,
          cls: `mkb-card-due ${isOverdue ? "mkb-overdue" : ""}`
        }
      );
    }
    if (card.tags.length > 0) {
      const tagsEl = cardEl.createDiv("mkb-card-tags");
      for (const tag of card.tags) {
        tagsEl.createEl("span", { text: `#${tag}`, cls: "mkb-tag" });
      }
    }
    const actions = cardEl.createDiv("mkb-card-actions");
    const editBtn = actions.createEl("button", { cls: "mkb-btn-icon" });
    (0, import_obsidian5.setIcon)(editBtn, "pencil");
    editBtn.addEventListener("click", () => this.openCardEditor(card, colId, labels));
    const archiveBtn = actions.createEl("button", { cls: "mkb-btn-icon", title: t(120) });
    (0, import_obsidian5.setIcon)(archiveBtn, "archive");
    archiveBtn.addEventListener("click", () => void this.archiveCard(card, colId));
    const delBtn = actions.createEl("button", { cls: "mkb-btn-icon mkb-danger" });
    (0, import_obsidian5.setIcon)(delBtn, "trash");
    delBtn.addEventListener("click", () => void this.deleteCard(card.id, colId));
  }
  renderArchivedSection(labels) {
    var _a;
    const allArchived = this.store.getArchivedCards(this.board.id).map((card) => {
      var _a2, _b;
      const col = this.board.columns.find((c) => c.id === card.columnId);
      return { card, colId: (_a2 = card.columnId) != null ? _a2 : "", colTitle: (_b = col == null ? void 0 : col.title) != null ? _b : "" };
    });
    const section = this.container.createDiv("mkb-archive-section");
    section.createEl("h3", { text: t(123) + ` (${allArchived.length})`, cls: "mkb-archive-title" });
    if (allArchived.length === 0) {
      section.createEl("p", { text: t(125), cls: "mkb-empty" });
      return;
    }
    const grid = section.createDiv("mkb-archive-grid");
    for (const { card, colId, colTitle } of allArchived) {
      const cardEl = grid.createDiv("mkb-card mkb-card-archived");
      const priority = (_a = card.priority) != null ? _a : "normal";
      cardEl.setCssProps({ "--prio-color": PRIORITY_COLORS[priority] });
      const badge = cardEl.createEl("span", { text: labels[priority], cls: "mkb-priority-badge" });
      badge.setCssProps({ "--prio-color": PRIORITY_COLORS[priority] });
      cardEl.createEl("span", { text: card.title, cls: "mkb-card-title" });
      cardEl.createEl("span", { text: `\u2190 ${colTitle}`, cls: "mkb-card-due" });
      const actions = cardEl.createDiv("mkb-card-actions mkb-actions-visible");
      const restoreBtn = actions.createEl("button", { cls: "mkb-btn mkb-btn-secondary", text: t(121) });
      restoreBtn.addEventListener("click", () => void this.unarchiveCard(card, colId));
      const delBtn = actions.createEl("button", { cls: "mkb-btn-icon mkb-danger" });
      (0, import_obsidian5.setIcon)(delBtn, "trash");
      delBtn.addEventListener("click", () => void this.deleteCard(card.id, colId));
    }
  }
  onDrop(targetColId) {
    if (!this.dragCard || !this.dragSourceColId || this.dragSourceColId === targetColId) return;
    const card = this.dragCard;
    this.dragCard = null;
    this.dragSourceColId = null;
    void this.store.moveCard(card.id, targetColId).then(() => this.render());
  }
  async editBoardTitle(el) {
    const input = activeDocument.createElement("input");
    input.type = "text";
    input.value = this.board.title;
    input.className = "mkb-inline-input mkb-board-title-input";
    el.replaceWith(input);
    input.focus();
    const save = async () => {
      var _a;
      const val = input.value.trim();
      if (val) this.board.title = val;
      await this.persist();
      (_a = this.onBoardChange) == null ? void 0 : _a.call(this);
      this.render();
    };
    input.addEventListener("blur", () => void save());
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
      if (e.key === "Escape") this.render();
    });
  }
  async addColumn() {
    const title = await this.promptInline(t(111));
    if (!title) return;
    this.board.columns.push({ id: this.store.generateId("col"), title });
    await this.store.saveBoard(this.board);
    this.render();
  }
  async deleteColumn(colId) {
    const confirmed = await new Promise((resolve) => {
      const m = new import_obsidian5.Modal(this.app);
      m.contentEl.createEl("p", { text: t(136) });
      m.contentEl.createEl("button", { text: t(132), cls: "mod-warning" }).addEventListener("click", () => {
        m.close();
        resolve(true);
      });
      m.contentEl.createEl("button", { text: t(119) }).addEventListener("click", () => {
        m.close();
        resolve(false);
      });
      m.open();
    });
    if (!confirmed) return;
    else {
      this.board.columns = this.board.columns.filter((c) => c.id !== colId);
      await this.persist();
      this.render();
    }
  }
  async editColumnTitle(el, col) {
    const input = activeDocument.createElement("input");
    input.type = "text";
    input.value = col.title;
    input.className = "mkb-inline-input";
    el.replaceWith(input);
    input.focus();
    const save = async () => {
      col.title = input.value.trim() || col.title;
      await this.persist();
      this.render();
    };
    input.addEventListener("blur", () => void save());
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter")
        input.blur();
      if (e.key === "Escape")
        this.render();
    });
  }
  openColumnMenu(triggerEl, col) {
    const existing = activeDocument.querySelectorAll(".mkb-column-menu-popup");
    existing.forEach((el) => el.remove());
    const popup = activeDocument.createElement("div");
    popup.className = "mkb-column-menu-popup";
    const rect = triggerEl.getBoundingClientRect();
    popup.addClass("mkb-column-menu-popup");
    popup.setCssProps(
      {
        "--popup-top": `${rect.bottom + 4}px`,
        "--popup-left": `${rect.left - 150}px`
      }
    );
    const leftBtn = popup.createEl("button", { text: t(137), cls: "mkb-menu-item" });
    leftBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = this.board.columns.indexOf(col);
      if (idx > 0) {
        [this.board.columns[idx], this.board.columns[idx - 1]] = [this.board.columns[idx - 1], this.board.columns[idx]];
        void this.persist().then(() => this.render());
      }
    });
    const rightBtn = popup.createEl("button", { text: t(138), cls: "mkb-menu-item" });
    rightBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = this.board.columns.indexOf(col);
      if (idx < this.board.columns.length - 1) {
        [this.board.columns[idx], this.board.columns[idx + 1]] = [this.board.columns[idx + 1], this.board.columns[idx]];
        void this.persist().then(() => this.render());
      }
    });
    const colorBtn = popup.createEl("button", { text: t(139), cls: "mkb-menu-item" });
    colorBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const input = activeDocument.createElement("input");
      input.type = "color";
      input.value = col.color || "#6c8ebf";
      input.addEventListener("change", () => {
        void (async () => {
          col.color = input.value;
          await this.persist();
          this.render();
        })();
      });
      input.click();
    });
    const delBtn = popup.createEl("button", { text: t(122), cls: "mkb-menu-item mkb-menu-danger" });
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      void this.deleteColumn(col.id);
    });
    activeDocument.body.appendChild(popup);
    window.setTimeout(() => {
      activeDocument.addEventListener("click", function closeMenu() {
        popup.remove();
        activeDocument.removeEventListener("click", closeMenu);
      });
    }, 0);
  }
  async addCard(colId) {
    const title = await this.promptInline(t(140));
    if (!title) return;
    await this.store.addCard(this.board.id, colId, title);
    this.render();
  }
  async deleteCard(cardId, colId) {
    const confirmed = await new Promise((resolve) => {
      const m = new import_obsidian5.Modal(this.app);
      m.contentEl.createEl("p", { text: t(141) });
      m.contentEl.createEl("button", { text: t(132), cls: "mod-warning" }).addEventListener("click", () => {
        m.close();
        resolve(true);
      });
      m.contentEl.createEl("button", { text: t(119) }).addEventListener("click", () => {
        m.close();
        resolve(false);
      });
      m.open();
    });
    if (!confirmed) return;
    await this.store.deleteCard(cardId);
    this.render();
  }
  async archiveCard(card, colId) {
    card.archived = true;
    await this.persist();
    this.render();
  }
  async unarchiveCard(card, colId) {
    card.archived = false;
    await this.persist();
    this.render();
  }
  async editCardTitle(el, card, colId) {
    const input = activeDocument.createElement("input");
    input.type = "text";
    input.value = card.title;
    input.className = "mkb-inline-input";
    el.replaceWith(input);
    input.focus();
    const save = async () => {
      card.title = input.value.trim() || card.title;
      await this.persist();
      this.render();
    };
    input.addEventListener("blur", () => void save());
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
      if (e.key === "Escape") this.render();
    });
  }
  openCardEditor(card, colId, labels) {
    var _a, _b, _c;
    const overlay = this.container.createDiv("mkb-editor-overlay");
    const modal = overlay.createDiv("mkb-editor-modal");
    modal.createEl("h3", { text: t(112) });
    const field = (label, value, onchange) => {
      const row = modal.createDiv("mkb-editor-row");
      row.createEl("label", { text: label });
      const input = row.createEl("input", { type: "text", value });
      input.addEventListener("input", () => onchange(input.value));
      return input;
    };
    field(t(113), card.title, (v) => card.title = v);
    field(t(114), (_a = card.noteLink) != null ? _a : "", (v) => card.noteLink = v || void 0);
    field(t(115), (_b = card.dueDate) != null ? _b : "", (v) => card.dueDate = v || void 0);
    field(t(116), card.tags.join(", "), (v) => {
      card.tags = v.split(",").map((t2) => t2.trim()).filter(Boolean);
    });
    const priorityRow = modal.createDiv("mkb-editor-row");
    priorityRow.createEl("label", { text: t(117) });
    const select = priorityRow.createEl("select", { cls: "mkb-select" });
    for (const p of PRIORITY_ORDER) {
      const opt = select.createEl("option", { text: labels[p], value: p });
      if (p === ((_c = card.priority) != null ? _c : "normal")) opt.selected = true;
    }
    select.addEventListener("change", () => {
      card.priority = select.value;
      void (async () => {
        await this.persist();
      })();
    });
    const btns = modal.createDiv("mkb-editor-btns");
    const saveBtn = btns.createEl("button", { text: t(118), cls: "mkb-btn mkb-btn-primary" });
    saveBtn.addEventListener("click", async () => {
      await this.store.updateCard(card.id, {
        title: card.title,
        noteLink: card.noteLink,
        dueDate: card.dueDate,
        tags: card.tags,
        priority: card.priority
      });
      overlay.remove();
      this.render();
    });
    const cancelBtn = btns.createEl("button", { text: t(119), cls: "mkb-btn mkb-btn-secondary" });
    cancelBtn.addEventListener("click", () => {
      overlay.remove();
      this.render();
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
        this.render();
      }
    });
  }
  promptInline(placeholder) {
    return new Promise((resolve) => {
      const overlay = this.container.createDiv("mkb-editor-overlay");
      const box = overlay.createDiv("mkb-prompt-box");
      const input = box.createEl("input", { type: "text", placeholder });
      input.className = "mkb-inline-input";
      input.focus();
      const confirm = () => {
        const val = input.value.trim();
        overlay.remove();
        resolve(val || null);
      };
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") confirm();
        if (e.key === "Escape") {
          overlay.remove();
          resolve(null);
        }
      });
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.remove();
          resolve(null);
        }
      });
    });
  }
};

// src/modules/kanban/KanbanView.ts
var KANBAN_VIEW_TYPE = "Harmony-kanban";
var KanbanView = class extends import_obsidian6.ItemView {
  constructor(leaf, store) {
    super(leaf);
    this.currentBoard = null;
    this.boardComponent = null;
    this.store = store;
  }
  getViewType() {
    return KANBAN_VIEW_TYPE;
  }
  getDisplayText() {
    var _a, _b;
    return (_b = (_a = this.currentBoard) == null ? void 0 : _a.title) != null ? _b : t(100);
  }
  getIcon() {
    return "kanban";
  }
  async loadBoard(boardId, root) {
    const boardData = await this.store.loadBoard(boardId);
    if (!boardData) return;
    const select = root.querySelector(".mkb-select");
    if (select) select.value = boardId;
    this.openBoard(boardData, root);
  }
  async onOpen() {
    await this.renderBoardSelector();
    const unsubscribe = this.store.onTaskChange(async (event, task) => {
      if (this.currentBoard) {
        const root = this.containerEl.children[1];
        const freshBoard = await this.store.loadBoard(this.currentBoard.id);
        if (freshBoard) this.openBoard(freshBoard, root);
      }
    });
    this.register(() => unsubscribe());
  }
  async onClose() {
  }
  async renderBoardSelector() {
    var _a;
    const root = this.containerEl.children[1];
    root.empty();
    root.addClass("mkb-view-root");
    const boards = await this.store.listBoards();
    if (boards.length === 0) {
      const empty = root.createDiv("mkb-selector-empty");
      empty.createEl("p", { text: t(105) });
      const btn = empty.createEl("button", { text: t(106), cls: "mkb-btn mkb-btn-primary" });
      btn.addEventListener("click", () => void this.createBoard(root));
      return;
    }
    const bar = root.createDiv("mkb-selector-bar");
    const select = bar.createEl("select", { cls: "mkb-select" });
    for (const b of boards) {
      const opt = select.createEl("option", { text: b.title, value: b.id });
      if (this.currentBoard && b.id === this.currentBoard.id) opt.selected = true;
    }
    select.addEventListener("change", () => {
      void (async () => {
        const board = await this.store.loadBoard(select.value);
        if (board) {
          this.openBoard(board, root);
          await this.renderBoardSelector();
        }
      })();
    });
    const dragZoneContainer = bar.createDiv("mkb-interboard-dropzone mkb-hidden");
    for (const b of boards) {
      if (this.currentBoard && String(b.id) === String(this.currentBoard.id)) continue;
      if (select && String(b.id) === String(select.value)) continue;
      const zone = dragZoneContainer.createEl(
        "button",
        {
          cls: "mkb-btn mkb-btn-secondary mkb-drop-target",
          text: `${b.title}`
        }
      );
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.addClass("mkb-drag-over");
      });
      zone.addEventListener("dragleave", () => {
        zone.removeClass("mkb-drag-over");
      });
      zone.addEventListener("drop", async (e) => {
        e.preventDefault();
        zone.removeClass("mkb-drag-over");
        dragZoneContainer.addClass("mkb-hidden");
        if (this.boardComponent && this.boardComponent.isDragging()) {
          const cardToMove = this.boardComponent.getDragCard();
          if (cardToMove) {
            const targetBoardData = await this.store.loadBoard(b.id);
            if (!targetBoardData || targetBoardData.columns.length === 0) {
              console.error("[Harmony] The target table has no columns!");
              return;
            }
            const overlay = root.createDiv("mkb-editor-overlay");
            const menu = overlay.createDiv("mkb-prompt-box mkb-column-selector-menu");
            menu.createEl("h3", { text: `${t(146)} "${b.title}" ${t(147)}`, cls: "mkb-menu-title" });
            const optionsContainer = menu.createDiv("mkb-menu-options");
            for (const col of targetBoardData.columns) {
              const colBtn = optionsContainer.createEl(
                "button",
                {
                  cls: "mkb-btn mkb-btn-secondary mkb-menu-option-btn",
                  text: col.title
                }
              );
              if (col.color) {
                colBtn.setAttribute("style", `border-left: 4px solid ${col.color};`);
              }
              colBtn.addEventListener("click", async () => {
                await this.store.updateCard(
                  cardToMove.id,
                  {
                    columnId: col.id,
                    boardId: b.id
                  }
                );
                overlay.remove();
                if (this.currentBoard) {
                  const rootContainer = this.containerEl.children[1];
                  const freshBoardData = await this.store.loadBoard(this.currentBoard.id);
                  if (freshBoardData) this.openBoard(freshBoardData, rootContainer);
                }
              });
            }
            const cancelBtn = menu.createEl("button", { text: t(119), cls: "mkb-btn mkb-btn-ghost" });
            cancelBtn.addEventListener("click", () => overlay.remove());
            overlay.addEventListener("click", (evt) => {
              if (evt.target === overlay) overlay.remove();
            });
          }
        }
      });
    }
    root.addEventListener("dragenter", (e) => {
      var _a2;
      if ((_a2 = this.boardComponent) == null ? void 0 : _a2.isDragging()) {
        dragZoneContainer.setCssStyles({ display: "flex" });
      }
    });
    root.addEventListener("dragend", () => {
      dragZoneContainer.setCssStyles({ display: "none" });
    });
    root.addEventListener("drop", () => {
      dragZoneContainer.setCssStyles({ display: "none" });
    });
    const newBtn = bar.createEl("button", { cls: "mkb-btn mkb-btn-secondary", text: t(106) });
    newBtn.addEventListener("click", () => void this.createBoard(root));
    const delBtn = bar.createEl("button", { cls: "mkb-btn-icon mkb-danger", title: t(104) });
    (0, import_obsidian6.setIcon)(delBtn, "trash");
    delBtn.addEventListener("click", () => {
      void (async () => {
        await this.store.deleteBoard(select.value);
        this.currentBoard = null;
        await this.renderBoardSelector();
      })();
    });
    const boardContainer = root.createDiv("mkb-board-container");
    const toOpen = this.currentBoard ? (_a = await this.store.loadBoard(this.currentBoard.id)) != null ? _a : boards[0] : boards[0];
    if (toOpen) {
      select.value = toOpen.id;
      this.openBoard(toOpen, root, boardContainer);
    }
  }
  openBoard(board, root, existingContainer) {
    this.currentBoard = board;
    this.app.workspace.requestSaveLayout();
    let boardContainer = existingContainer != null ? existingContainer : root.querySelector(".mkb-board-container");
    if (!boardContainer) {
      boardContainer = root.createDiv("mkb-board-container");
    }
    boardContainer.empty();
    this.boardComponent = new KanbanBoard(this.app, this.store, board, boardContainer);
    this.boardComponent.onBoardChange = () => {
      const select = root.querySelector(".mkb-select");
      if (select) {
        const opt = select.querySelector(`option[value="${board.id}"]`);
        if (opt) opt.text = board.title;
      }
      this.app.workspace.requestSaveLayout();
    };
    this.boardComponent.render();
  }
  async createBoard(root) {
    const title = await new Promise((resolve) => {
      const overlay = this.containerEl.children[1].createDiv("mkb-editor-overlay");
      const box = overlay.createDiv("mkb-prompt-box");
      box.createEl("p", { text: t(107) });
      const input = box.createEl("input", { type: "text", placeholder: t(113) });
      input.className = "mkb-inline-input";
      input.focus();
      const confirm = () => {
        overlay.remove();
        resolve(input.value.trim() || null);
      };
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") confirm();
        if (e.key === "Escape") {
          overlay.remove();
          resolve(null);
        }
      });
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.remove();
          resolve(null);
        }
      });
    });
    if (!title) return;
    const board = this.store.createEmptyBoard(title);
    await this.store.saveBoard(board);
    this.currentBoard = board;
    await this.renderBoardSelector();
  }
};

// src/modules/kanban/KanbanModule.ts
var KanbanModule = class {
  constructor(app, plugin, taskStore) {
    this.id = "kanban";
    this.name = "Kanban";
    this.ribbonIconEl = null;
    this.app = app;
    this.plugin = plugin;
    this.taskStore = taskStore;
    this.store = new KanbanStore(app, taskStore);
  }
  init() {
    this.plugin.registerView(
      KANBAN_VIEW_TYPE,
      (leaf) => new KanbanView(leaf, this.store)
    );
    this.plugin.addCommand(
      {
        id: "open-kanban",
        name: t(101),
        callback: () => void this.activateView()
      }
    );
  }
  async onload() {
    this.unsubLang = onLanguageChange(() => {
      const leaves = this.app.workspace.getLeavesOfType(KANBAN_VIEW_TYPE);
      for (const leaf of leaves) {
        void leaf.view.renderBoardSelector();
      }
    });
    this.ribbonIconEl = this.plugin.addRibbonIcon("kanban", "Kanban", () => void this.activateView());
    this.ribbonIconEl.setAttribute("data-harmony-module", this.id);
    console.log("[KanbanModule] Activ\xE9.");
  }
  onunload() {
    var _a;
    (_a = this.unsubLang) == null ? void 0 : _a.call(this);
    if (this.ribbonIconEl) {
      this.ribbonIconEl.remove();
      this.ribbonIconEl = null;
    }
    const existingLeaves = this.app.workspace.getLeavesOfType(KANBAN_VIEW_TYPE);
    if (existingLeaves.length > 0) {
      this.app.workspace.detachLeavesOfType(KANBAN_VIEW_TYPE);
    }
    console.log("[KanbanModule] D\xE9sactiv\xE9.");
  }
  async activateView() {
    const existing = this.app.workspace.getLeavesOfType(KANBAN_VIEW_TYPE);
    if (existing.length > 0) {
      await this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({ type: KANBAN_VIEW_TYPE, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }
};

// src/modules/dashboard/DashboardView.ts
var import_obsidian7 = require("obsidian");
var DashboardView = class extends import_obsidian7.ItemView {
  constructor(leaf, module2, taskstore) {
    super(leaf);
    this.clockInterval = null;
    this.searchTimeout = null;
    this.module = module2;
    this.taskstore = taskstore;
  }
  getViewType() {
    return DASHBOARD_VIEW_TYPE;
  }
  getDisplayText() {
    return "Dashboard";
  }
  getIcon() {
    return "home";
  }
  get s() {
    return this.module.getDashboardSettings();
  }
  async onOpen() {
    const unsubscribe = this.module.taskstore.on(() => {
      this.render();
    });
    this.register(() => unsubscribe());
    this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE).forEach((leaf) => {
      if (leaf !== this.leaf) leaf.detach();
    });
    this.render();
  }
  async onClose() {
    if (this.clockInterval) window.clearInterval(this.clockInterval);
  }
  render() {
    const labels = getPriorityLabels();
    if (this.clockInterval) {
      window.clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
    const root = this.containerEl.children[1];
    root.empty();
    root.addClass("dash-root");
    this.applyWallpaper(root);
    const overlay = root.createDiv("dash-overlay");
    overlay.style.setProperty("--dash-op", String(this.s.wallpaperOpacity));
    const btn = overlay.createEl("button", { cls: "dash-gear-btn" });
    (0, import_obsidian7.setIcon)(btn, "settings");
    btn.addEventListener("click", () => this.openSettings());
    const center = overlay.createDiv("dash-center");
    if (this.s.showClock) this.renderClock(center);
    this.renderSearch(center);
    this.renderTasks(center, labels);
  }
  renderTasks(parent, labels) {
    var _a;
    const tasks = this.module.taskstore.getTasks({ done: false, archived: false });
    tasks.sort((a, b) => {
      var _a2, _b;
      const priorityA = PRIORITY_ORDER.indexOf((_a2 = a.priority) != null ? _a2 : "normal");
      const priorityB = PRIORITY_ORDER.indexOf((_b = b.priority) != null ? _b : "normal");
      if (priorityA !== priorityB) return priorityA - priorityB;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });
    const urgentTasks = tasks.slice(0, 6);
    if (urgentTasks.length === 0) return;
    const tasksContainer = parent.createDiv("dash-tasks-container");
    tasksContainer.createEl("h4", { text: t(221), cls: "dash-section-title" });
    const tasksGrid = tasksContainer.createDiv("dash-tasks-horizontal");
    for (const task of urgentTasks) {
      const taskCard = tasksGrid.createDiv("dash-task-card");
      taskCard.style.cursor = "pointer";
      taskCard.addEventListener("click", (e) => {
        this.handleTaskClick(e, task);
      });
      const header = taskCard.createDiv("dash-card-header");
      const priority = (_a = task.priority) != null ? _a : "normal";
      const prioritySpan = header.createSpan({
        cls: "dash-task-priority",
        text: labels[priority]
      });
      prioritySpan.style.setProperty("--priority-color", PRIORITY_COLORS[priority]);
      prioritySpan.addClass("hp-task-priority");
      taskCard.createDiv({ text: task.title, cls: "dash-task-title" });
      const footer = taskCard.createDiv("dash-card-footer");
      if (task.dueDate) {
        const date = new Date(task.dueDate);
        footer.createSpan(
          {
            text: date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
            cls: "dash-task-date"
          }
        );
      }
    }
  }
  applyWallpaper(root) {
    if (!this.s.wallpaperPath) return;
    const adapter = this.app.vault.adapter;
    if (!(adapter instanceof import_obsidian7.FileSystemAdapter)) return;
    const url = adapter.getResourcePath(this.s.wallpaperPath);
    root.style.backgroundImage = `url("${url}")`;
  }
  renderClock(parent) {
    const wrap = parent.createDiv("dash-clock");
    const time = wrap.createDiv("dash-time");
    const date = wrap.createDiv("dash-date");
    const DAYS = [t(256), t(250), t(251), t(252), t(253), t(254), t(255)];
    const MONTHS = [t(257), t(258), t(259), t(260), t(261), t(262), t(263), t(264), t(265), t(266), t(267), t(268)];
    const tick = () => {
      const now = /* @__PURE__ */ new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      time.textContent = this.s.showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
      date.textContent = `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    };
    tick();
    this.clockInterval = window.setInterval(tick, 1e3);
  }
  renderSearch(parent) {
    const wrap = parent.createDiv("dash-search-wrap");
    const input = wrap.createEl(
      "input",
      {
        type: "text",
        placeholder: t(202),
        cls: "dash-search"
      }
    );
    const results = wrap.createDiv("dash-results is-hidden");
    input.addEventListener("input", () => {
      if (this.searchTimeout) window.clearTimeout(this.searchTimeout);
      this.searchTimeout = window.setTimeout(() => {
        var _a, _b;
        results.empty();
        const q = input.value.trim().toLowerCase();
        if (!q) {
          results.addClass("is-hidden");
          return;
        }
        const files = this.app.vault.getMarkdownFiles().filter((f) => f.basename.toLowerCase().includes(q)).slice(0, 8);
        results.removeClass("is-hidden");
        if (files.length === 0) {
          results.createDiv({ text: t(203), cls: "dash-result-empty" });
          return;
        }
        for (const f of files) {
          const item = results.createDiv("dash-result-item");
          item.createSpan({ text: f.basename, cls: "dash-result-name" });
          item.createSpan({ text: (_b = (_a = f.parent) == null ? void 0 : _a.path) != null ? _b : "/", cls: "dash-result-path" });
          item.addEventListener("click", () => {
            void this.leaf.openFile(f);
            results.addClass("is-hidden");
            input.value = "";
          });
        }
      }, 150);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        input.value = "";
        results.addClass("is-hidden");
      }
    });
    activeDocument.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) results.addClass("is-hidden");
    });
    setTimeout(() => {
      input.focus();
    }, 50);
  }
  openSettings() {
    const root = this.containerEl.children[1];
    const existing = root.querySelector(".dash-overlay-modal");
    if (existing) {
      existing.remove();
      return;
    }
    const overlay = this.makeOverlay();
    const panel = overlay.createDiv("dash-modal dash-settings");
    panel.createEl("h3", { text: t(205) });
    this.settingToggle(panel, t(206), "showClock");
    this.settingToggle(panel, t(207), "showSeconds");
    this.settingToggle(panel, t(209), "openOnStartup");
    const wr = panel.createDiv("dash-setting-row");
    wr.createSpan({ text: t(210), cls: "dash-setting-label" });
    const wpRight = wr.createDiv("dash-setting-right");
    const wpName = wpRight.createSpan({
      text: this.s.wallpaperPath ? this.s.wallpaperPath.split("/").pop() : "Aucun",
      cls: "dash-setting-val"
    });
    const wpBtn = wpRight.createEl("button", { text: t(211), cls: "dash-btn" });
    wpBtn.addEventListener("click", () => {
      const fileInput = activeDocument.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.addEventListener("change", () => {
        void (async () => {
          var _a;
          const file = (_a = fileInput.files) == null ? void 0 : _a[0];
          if (!file) return;
          const destDir = ".Harmony/dashboard";
          const destPath = `${destDir}/${file.name}`;
          if (!await this.app.vault.adapter.exists(destDir)) {
            await this.app.vault.adapter.mkdir(destDir);
          }
          await this.app.vault.adapter.writeBinary(destPath, await file.arrayBuffer());
          this.s.wallpaperPath = destPath;
          wpName.textContent = file.name;
          await this.module.saveDashboardSettings();
          const dashRoot = this.containerEl.children[1];
          this.applyWallpaper(dashRoot);
        })();
      });
      fileInput.click();
    });
    const clearBtn = wpRight.createEl("button", { text: "\u2715", cls: "dash-btn", title: t(212) });
    clearBtn.addEventListener("click", () => {
      void (async () => {
        this.s.wallpaperPath = "";
        wpName.textContent = "Aucun";
        await this.module.saveDashboardSettings();
        const rootEl = this.containerEl.children[1];
        rootEl.style.setProperty("--dash-bg", "none");
      })();
    });
    const or = panel.createDiv("dash-setting-row");
    or.createSpan({ text: t(213), cls: "dash-setting-label" });
    const orRight = or.createDiv("dash-setting-right");
    const opInput = orRight.createEl("input", { type: "range", value: String(this.s.wallpaperOpacity) });
    opInput.min = "0";
    opInput.max = "1";
    opInput.step = "0.05";
    const opVal = orRight.createSpan({ text: String(this.s.wallpaperOpacity), cls: "dash-setting-val" });
    opInput.addEventListener("input", () => {
      void (async () => {
        this.s.wallpaperOpacity = parseFloat(opInput.value);
        opVal.textContent = opInput.value;
        await this.module.saveDashboardSettings();
      })();
    });
    panel.createEl("button", { text: t(214), cls: "dash-btn dash-btn-primary" }).addEventListener("click", () => {
      overlay.remove();
      this.render();
    });
  }
  settingToggle(parent, label, key) {
    const row = parent.createDiv("dash-setting-row");
    row.createSpan({ text: label, cls: "dash-setting-label" });
    const toggle = row.createEl("input", { type: "checkbox" });
    toggle.checked = this.s[key];
    toggle.addEventListener("change", () => {
      void (async () => {
        const settings = this.s;
        settings[key] = toggle.checked;
        await this.module.saveDashboardSettings();
      })();
    });
  }
  makeOverlay() {
    const root = this.containerEl.children[1];
    const overlay = root.createDiv("dash-overlay-modal");
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.remove();
        this.render();
      }
    });
    return overlay;
  }
  handleTaskClick(e, task) {
    const options = [];
    if (task.boardId || task.source === "kanban") {
      options.push({ id: "calendar", title: t(222), icon: "calendar" });
    }
    if (task.boardId || task.source === "calendar") {
      options.push({ id: "kanban", title: t(223), icon: "columns" });
    }
    if (task.source === "todo" || options.length === 0) {
      options.push({ id: "todo", title: t(224), icon: "check-square" });
    }
    if (options.length === 1) {
      this.openTaskInModule(task, options[0].id);
      return;
    }
    const menu = new import_obsidian7.Menu();
    options.forEach((opt) => {
      menu.addItem((item) => {
        item.setTitle(opt.title).setIcon(opt.icon).onClick(() => {
          this.openTaskInModule(task, opt.id);
        });
      });
    });
    menu.showAtMouseEvent(e);
  }
  async openTaskInModule(task, moduleId) {
    let viewType = "";
    switch (moduleId) {
      case "calendar":
        viewType = "Harmony-calendar";
        break;
      case "kanban":
        viewType = "Harmony-kanban";
        break;
      case "todo":
        viewType = "Harmony-todo";
        break;
    }
    if (!viewType) return;
    const existingLeaves = this.app.workspace.getLeavesOfType(viewType);
    if (existingLeaves.length > 0) {
      await this.app.workspace.revealLeaf(existingLeaves[0]);
    } else {
      const leaf = this.app.workspace.getLeaf("tab");
      await leaf.setViewState({ type: viewType, active: true });
      await this.app.workspace.revealLeaf(leaf);
    }
  }
};

// src/modules/dashboard/DashboardSettings.ts
var DEFAULT_DASHBOARD_SETTINGS = {
  wallpaperPath: "",
  wallpaperOpacity: 0.5,
  showClock: true,
  showSeconds: false,
  openOnStartup: true
};

// src/modules/dashboard/DashboardModule.ts
var DASHBOARD_VIEW_TYPE = "Harmony-dashboard";
var DashboardModule2 = class {
  constructor(app, plugin, taskstore) {
    this.id = "dashboard";
    this.name = "Dashboard";
    this.layoutEventRef = null;
    var _a;
    this.app = app;
    this.plugin = plugin;
    this.taskstore = taskstore;
    this.settings = {
      ...DEFAULT_DASHBOARD_SETTINGS,
      ...(_a = plugin.settings.moduleSettings["dashboard"]) != null ? _a : {}
    };
  }
  getDashboardSettings() {
    return this.settings;
  }
  async saveDashboardSettings() {
    this.plugin.settings.moduleSettings["dashboard"] = this.settings;
    await this.plugin.saveSettings();
  }
  init() {
    this.plugin.registerView(
      DASHBOARD_VIEW_TYPE,
      (leaf) => new DashboardView(leaf, this, this.taskstore)
    );
    this.plugin.addCommand(
      {
        id: "open-dashboard",
        name: t(201),
        callback: () => {
          this.activateView();
        }
      }
    );
  }
  async onload() {
    this.unsubLang = onLanguageChange(() => {
      const leaves = this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE);
      for (const leaf of leaves) leaf.view.render();
    });
    this.layoutEventRef = this.app.workspace.on("layout-change", () => {
      const emptyLeaves = this.app.workspace.getLeavesOfType("empty");
      for (const leaf of emptyLeaves) {
        void leaf.setViewState({ type: DASHBOARD_VIEW_TYPE, active: false });
      }
    });
    if (this.layoutEventRef) {
      this.plugin.registerEvent(this.layoutEventRef);
    }
    if (this.settings.openOnStartup) {
      this.app.workspace.onLayoutReady(() => this.activateView());
    }
    console.log("[DashboardModule] Activ\xE9.");
  }
  onunload() {
    var _a;
    (_a = this.unsubLang) == null ? void 0 : _a.call(this);
    if (this.layoutEventRef) {
      this.app.workspace.offref(this.layoutEventRef);
      this.layoutEventRef = null;
    }
    const existingLeaves = this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE);
    if (existingLeaves.length > 0) {
      this.app.workspace.detachLeavesOfType(DASHBOARD_VIEW_TYPE);
    }
    console.log("[DashboardModule] D\xE9sactiv\xE9.");
  }
  async activateView() {
    const existing = this.app.workspace.getLeavesOfType(DASHBOARD_VIEW_TYPE);
    if (existing.length > 0) {
      await this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState(
      {
        type: DASHBOARD_VIEW_TYPE,
        active: true
      }
    );
    await this.app.workspace.revealLeaf(leaf);
  }
};

// src/modules/todolist/TodoStore.ts
var TodoStore = class {
  constructor(taskStore) {
    this.taskStore = taskStore;
  }
  //Get the tasks
  async getTasks() {
    return this.taskStore.getTasks({ source: "todo", archived: false });
  }
  async addTask(title) {
    return this.taskStore.addTask(
      {
        id: this.taskStore.generateId("todo"),
        source: "todo",
        title,
        done: false,
        archived: false,
        priority: "normal",
        tags: []
      }
    );
  }
  async updateTaskPriority(id, priority) {
    await this.taskStore.updateTask(id, { priority });
  }
  async toggleTask(id, done) {
    await this.taskStore.updateTask(id, { done });
  }
  async deleteTask(id) {
    await this.taskStore.deleteTask(id);
  }
  async cyclePriority(id, current) {
    const currentIndex = PRIORITY_ORDER.indexOf(current);
    const nextIndex = (currentIndex + 1) % PRIORITY_ORDER.length;
    const nextPriority = PRIORITY_ORDER[nextIndex];
    await this.taskStore.updateTask(id, { priority: nextPriority });
  }
};

// src/modules/todolist/Todoview.ts
var import_obsidian8 = require("obsidian");
var TODO_VIEW_TYPE = "Harmony-todo";
var TodoView = class extends import_obsidian8.ItemView {
  constructor(leaf, store) {
    super(leaf);
    this.store = store;
    this.activeMenu = null;
    this.labels = getPriorityLabels();
  }
  getViewType() {
    return TODO_VIEW_TYPE;
  }
  getDisplayText() {
    return "Todo List";
  }
  getIcon() {
    return "check-check";
  }
  async onOpen() {
    await this.render();
  }
  async render() {
    const root = this.contentEl;
    root.empty();
    root.addClass("utodo-view");
    const centralContainer = root.createDiv("utodo-central-container");
    centralContainer.createEl("h2", { text: t(300) || "Todo List", cls: "utodo-main-title" });
    const inputContainer = centralContainer.createDiv("utodo-input-container");
    const input = inputContainer.createEl(
      "input",
      {
        type: "text",
        placeholder: t(301) || t(302)
      }
    );
    input.onkeydown = async (e) => {
      if (e.key === "Enter" && input.value.trim()) {
        await this.store.addTask(input.value.trim());
        input.value = "";
        await this.render();
      }
    };
    const listEl = centralContainer.createDiv("utodo-list");
    const tasks = await this.store.getTasks();
    tasks.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
    });
    tasks.forEach((task) => {
      const itemEl = listEl.createDiv({
        cls: `utodo-item ${task.done ? "is-done" : ""}`
      });
      const checkBtn = itemEl.createDiv("utodo-checkbox");
      if (task.done) {
        (0, import_obsidian8.setIcon)(checkBtn, "check");
        checkBtn.addClass("is-checked");
      }
      checkBtn.onclick = async () => {
        await this.store.toggleTask(task.id, !task.done);
        await this.render();
      };
      const prioWrapper = itemEl.createDiv("utodo-prio-wrapper");
      const dot = prioWrapper.createDiv("utodo-prio-dot");
      dot.setCssProps({ "--prio-color": PRIORITY_COLORS[task.priority] || "#ccc" });
      prioWrapper.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openRadialMenu(e, task.id);
      };
      itemEl.createDiv({ text: task.title, cls: "utodo-title" });
      const del = itemEl.createDiv("utodo-action-del");
      (0, import_obsidian8.setIcon)(del, "trash");
      del.onclick = async () => {
        await this.store.deleteTask(task.id);
        await this.render();
      };
    });
  }
  openRadialMenu(e, taskId) {
    this.closeMenu();
    const menu = activeDocument.body.createDiv("utodo-radial-container");
    this.activeMenu = menu;
    menu.setCssProps(
      {
        "left": `${e.clientX}px`,
        "top": `${e.clientY}px`
      }
    );
    menu.addClass("radial-menu");
    menu.setCssProps({
      "--menu-x": `${e.clientX}px`,
      "--menu-y": `${e.clientY}px`
    });
    const radius = 80;
    PRIORITY_ORDER.forEach((prio, index) => {
      const angle = (index * (360 / PRIORITY_ORDER.length) - 90) * (Math.PI / 180);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const btn = menu.createDiv("utodo-radial-btn");
      btn.style.backgroundColor = PRIORITY_COLORS[prio];
      btn.style.transform = `translate(${x}px, ${y}px)`;
      const labelText = this.labels[prio] || prio;
      btn.createSpan({ text: labelText });
      btn.addEventListener("mouseup", (ev) => {
        ev.stopPropagation();
        void (async () => {
          await this.store.updateTaskPriority(taskId, prio);
          this.closeMenu();
          await this.render();
        })();
      });
      btn.onmouseenter = () => btn.addClass("is-hovered");
      btn.onmouseleave = () => btn.removeClass("is-hovered");
    });
    const onGlobalMouseUp = () => {
      window.setTimeout(() => this.closeMenu(), 50);
      activeDocument.removeEventListener("mouseup", onGlobalMouseUp);
    };
    activeDocument.addEventListener("mouseup", onGlobalMouseUp);
  }
  closeMenu() {
    if (this.activeMenu) {
      this.activeMenu.remove();
      this.activeMenu = null;
    }
  }
};

// src/modules/todolist/TodoModule.ts
var TodoModule = class {
  constructor(app, plugin, taskStore) {
    this.id = "todo";
    this.name = "Todo List";
    this.ribbonIconEl = null;
    this.app = app;
    this.plugin = plugin;
    this.store = new TodoStore(taskStore);
  }
  init() {
    this.plugin.registerView(
      TODO_VIEW_TYPE,
      (leaf) => new TodoView(leaf, this.store)
    );
  }
  async onload() {
    this.unsubLang = onLanguageChange(() => {
      const leaves = this.app.workspace.getLeavesOfType(TODO_VIEW_TYPE);
      for (const leaf of leaves) {
        void leaf.view.render();
      }
    });
    this.ribbonIconEl = this.plugin.addRibbonIcon("check-check", "Todo List", () => void this.activateView());
    this.ribbonIconEl.setAttribute("data-harmony-module", this.id);
    console.log("[TodoModule] Activ\xE9.");
  }
  onunload() {
    var _a;
    (_a = this.unsubLang) == null ? void 0 : _a.call(this);
    if (this.ribbonIconEl) {
      this.ribbonIconEl.remove();
      this.ribbonIconEl = null;
    }
    const existingLeaves = this.app.workspace.getLeavesOfType(TODO_VIEW_TYPE);
    if (existingLeaves.length > 0) {
      this.app.workspace.detachLeavesOfType(TODO_VIEW_TYPE);
    }
    console.log("[TodoModule] D\xE9sactiv\xE9.");
  }
  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(TODO_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getLeaf("tab");
      await leaf.setViewState({ type: TODO_VIEW_TYPE, active: true });
    }
    await workspace.revealLeaf(leaf);
  }
};

// src/modules/calendar/CalendarStore.ts
var CalendarStore = class {
  constructor(app, taskStore) {
    this.app = app;
    this.taskStore = taskStore;
  }
  getTasksForDate(date, includeArchived = false) {
    const all = this.taskStore.getTasks({ archived: includeArchived ? void 0 : false });
    return all.filter((task) => {
      if (!task.dueDate) return false;
      if (task.endDate) {
        return date >= task.dueDate && date <= task.endDate;
      }
      if (task.dueDate === date) return true;
      if (task.recurrence && typeof task.recurrence === "object") {
        const { frequency, unit } = task.recurrence;
        if (!frequency || !unit) return false;
        if (date < task.dueDate) return false;
        const targetParts = date.split("-").map(Number);
        const baseParts = task.dueDate.split("-").map(Number);
        const targetTime = new Date(targetParts[0], targetParts[1] - 1, targetParts[2]).getTime();
        const baseTime = new Date(baseParts[0], baseParts[1] - 1, baseParts[2]).getTime();
        const diffTime = targetTime - baseTime;
        const diffDays = Math.round(diffTime / (1e3 * 60 * 60 * 24));
        if (unit === "daily") {
          return diffDays % frequency === 0;
        }
        if (unit === "weekly") {
          return diffDays % (frequency * 7) === 0;
        }
        if (unit === "monthly") {
          const monthsDiff = (targetParts[0] - baseParts[0]) * 12 + (targetParts[1] - baseParts[1]);
          if (monthsDiff < 0 || monthsDiff % frequency !== 0) return false;
          const maxDayInTargetMonth = new Date(targetParts[0], targetParts[1], 0).getDate();
          if (baseParts[2] === targetParts[2]) return true;
          if (baseParts[2] > maxDayInTargetMonth && targetParts[2] === maxDayInTargetMonth) return true;
        }
      }
      return false;
    });
  }
  getTasksForMonth(year, month) {
    const result = /* @__PURE__ */ new Map();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      result.set(ds, this.getTasksForDate(ds));
    }
    return result;
  }
  getAvailableSources() {
    const all = this.taskStore.getTasks();
    const sources = new Set(all.map((t2) => t2.source).filter(Boolean));
    return Array.from(sources);
  }
  async createFullTask(date, title, priority, time, duration, done, recurrence) {
    try {
      return await this.taskStore.addTask(
        {
          id: this.taskStore.generateId("cal"),
          source: "calendar",
          title,
          done: done != null ? done : false,
          archived: false,
          priority,
          tags: [],
          dueDate: date,
          time,
          duration,
          recurrence
        }
      );
    } catch (e) {
      console.error("[CalendarStore] \xC9chec cr\xE9ation t\xE2che :", e);
      throw e;
    }
  }
  async addTask(date, title, priority = "normal") {
    return this.taskStore.addTask(
      {
        id: this.taskStore.generateId("cal"),
        source: "calendar",
        title,
        done: false,
        archived: false,
        priority,
        tags: [],
        dueDate: date
      }
    );
  }
  async updateTask(id, changes) {
    return this.taskStore.updateTask(id, changes);
  }
  async deleteTask(id) {
    return this.taskStore.deleteTask(id);
  }
  async toggleDone(id, done) {
    return this.taskStore.updateTask(id, { done, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
  }
};

// src/modules/calendar/CalendarView.ts
var import_obsidian9 = require("obsidian");
var CALENDAR_VIEW_TYPE = "harmony-calendar";
var CalendarView = class extends import_obsidian9.ItemView {
  constructor(leaf, store) {
    super(leaf);
    this.currentDate = /* @__PURE__ */ new Date();
    this.viewMode = "monthly";
    this.showDone = true;
    this.activeSources = /* @__PURE__ */ new Set();
    this.monthPagination = /* @__PURE__ */ new Map();
    this.lastRenderedMonthKey = "";
    this.isSidebarCollapsed = false;
    this.isScrolling = false;
    this.store = store;
    this.store.getAvailableSources().forEach((s) => this.activeSources.add(s));
  }
  getViewType() {
    return CALENDAR_VIEW_TYPE;
  }
  getDisplayText() {
    return t(400);
  }
  getIcon() {
    return "calendar-days";
  }
  async onOpen() {
    this.renderCalendar();
    this.containerEl.setAttribute("tabindex", "0");
    this.containerEl.addEventListener("keydown", (e) => {
      var _a, _b;
      if (this.containerEl.querySelector(".mcal-overlay")) return;
      if (((_a = document.activeElement) == null ? void 0 : _a.tagName) === "INPUT" || ((_b = document.activeElement) == null ? void 0 : _b.tagName) === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.navigate(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        this.navigate(1);
      }
    });
  }
  async onClose() {
  }
  refresh() {
    this.renderCalendar();
  }
  renderCalendar() {
    const root = this.containerEl.children[1];
    root.empty();
    root.addClass("mcal-root");
    this.renderToolbar(root);
    const workspace = root.createDiv("mcal-workspace");
    this.renderSidebar(workspace);
    const mainView = workspace.createDiv("mcal-main-view");
    mainView.addEventListener("wheel", (e) => {
      const target = e.target;
      if (target.closest(".mcal-day-scroll-area")) return;
      if (this.isScrolling) return;
      if (Math.abs(e.deltaY) < 10) return;
      this.isScrolling = true;
      if (e.deltaY < 0) {
        this.navigate(1);
      } else {
        this.navigate(-1);
      }
      window.setTimeout(() => {
        this.isScrolling = false;
      }, 250);
    });
    if (this.viewMode === "monthly") this.renderMonthView(mainView);
    else if (this.viewMode === "weekly") this.renderWeekView(mainView);
    else this.renderDayView(mainView);
  }
  renderSidebar(container) {
    if (this.isSidebarCollapsed) return;
    const sidebar = container.createDiv("mcal-sidebar");
    const miniCal = sidebar.createDiv("mcal-mini-cal");
    const mY = this.currentDate.getFullYear();
    const mM = this.currentDate.getMonth();
    const header = miniCal.createDiv("mcal-mini-header");
    header.setText(`${t(257 + mM)} ${mY}`);
    const grid = miniCal.createDiv("mcal-mini-grid");
    const first = new Date(mY, mM, 1);
    const last = new Date(mY, mM + 1, 0);
    const offset = (first.getDay() + 6) % 7;
    for (let i = 0; i < offset; i++) grid.createDiv("mcal-mini-empty");
    for (let d = 1; d <= last.getDate(); d++) {
      const cell = grid.createDiv("mcal-mini-day");
      cell.setText(String(d));
      if (this.currentDate.getDate() === d) cell.addClass("mcal-mini-active");
      cell.addEventListener("click", () => {
        this.currentDate = new Date(mY, mM, d);
        this.renderCalendar();
      });
    }
    const filters = sidebar.createDiv("mcal-filters");
    filters.createEl("h4", { text: "Sources" });
    const sources = this.store.getAvailableSources();
    for (const source of sources) {
      const lbl = filters.createEl("label", { cls: "mcal-filter-lbl" });
      const cb = lbl.createEl("input", { type: "checkbox" });
      cb.checked = this.activeSources.has(source);
      cb.addEventListener("change", () => {
        cb.checked ? this.activeSources.add(source) : this.activeSources.delete(source);
        this.renderCalendar();
      });
      lbl.createSpan({ text: source });
    }
  }
  renderToolbar(root) {
    const bar = root.createDiv("mcal-toolbar");
    const sidebarBtn = bar.createEl("button", { cls: "mcal-btn-icon", title: "Afficher/Masquer le panneau" });
    (0, import_obsidian9.setIcon)(sidebarBtn, "panel-left");
    sidebarBtn.addEventListener("click", () => {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
      this.renderCalendar();
    });
    const prevBtn = bar.createEl("button", { cls: "mcal-btn-icon" });
    (0, import_obsidian9.setIcon)(prevBtn, "chevron-left");
    prevBtn.addEventListener("click", () => this.navigate(-1));
    const titleEl = bar.createDiv("mcal-toolbar-title");
    titleEl.setText(this.formatHeaderTitle());
    const nextBtn = bar.createEl("button", { cls: "mcal-btn-icon" });
    (0, import_obsidian9.setIcon)(nextBtn, "chevron-right");
    nextBtn.addEventListener("click", () => this.navigate(1));
    const todayBtn = bar.createEl("button", { cls: "mcal-btn mcal-btn-secondary", text: t(406) });
    todayBtn.addEventListener("click", () => {
      this.currentDate = /* @__PURE__ */ new Date();
      this.renderCalendar();
    });
    const modeGroup = bar.createDiv("mcal-mode-group");
    const dayBtn = modeGroup.createEl("button", { cls: `mcal-btn ${this.viewMode === "daily" ? "mcal-btn-active" : "mcal-btn-secondary"}`, text: t(431) });
    dayBtn.addEventListener("click", () => {
      this.viewMode = "daily";
      this.renderCalendar();
    });
    const weekBtn = modeGroup.createEl("button", { cls: `mcal-btn ${this.viewMode === "weekly" ? "mcal-btn-active" : "mcal-btn-secondary"}`, text: t(408) });
    weekBtn.addEventListener("click", () => {
      this.viewMode = "weekly";
      this.renderCalendar();
    });
    const monthBtn = modeGroup.createEl("button", { cls: `mcal-btn ${this.viewMode === "monthly" ? "mcal-btn-active" : "mcal-btn-secondary"}`, text: t(407) });
    monthBtn.addEventListener("click", () => {
      this.viewMode = "monthly";
      this.renderCalendar();
    });
    const doneBtn = bar.createEl("button", { cls: `mcal-btn ${this.showDone ? "mcal-btn-active" : "mcal-btn-secondary"}`, title: t(420) });
    (0, import_obsidian9.setIcon)(doneBtn, "check");
    doneBtn.addEventListener("click", () => {
      this.showDone = !this.showDone;
      this.renderCalendar();
    });
  }
  formatHeaderTitle() {
    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth();
    const monthName = t(257 + m);
    if (this.viewMode === "monthly") return `${monthName} ${y}`;
    if (this.viewMode === "daily") return `${this.currentDate.getDate()} ${monthName} ${y}`;
    const ws = this.getWeekStart(this.currentDate);
    const we = new Date(ws);
    we.setDate(we.getDate() + 6);
    const wsYear = ws.getFullYear();
    const weYear = we.getFullYear();
    if (wsYear !== weYear)
      return `${ws.getDate()} ${t(257 + ws.getMonth())} ${wsYear} \u2013 ${we.getDate()} ${t(257 + we.getMonth())} ${weYear}`;
    return `${ws.getDate()} ${t(257 + ws.getMonth())} \u2013 ${we.getDate()} ${t(257 + we.getMonth())} ${weYear}`;
  }
  navigate(dir) {
    const d = new Date(this.currentDate);
    if (this.viewMode === "monthly") {
      d.setDate(1);
      d.setMonth(d.getMonth() + dir);
    } else if (this.viewMode === "weekly") {
      d.setDate(d.getDate() + dir * 7);
    } else d.setDate(d.getDate() + dir);
    this.currentDate = d;
    this.renderCalendar();
  }
  setupDraggable(el, task) {
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", (e) => {
      var _a;
      (_a = e.dataTransfer) == null ? void 0 : _a.setData("text/plain", task.id);
      el.addClass("mcal-dragging");
    });
    el.addEventListener("dragend", () => el.removeClass("mcal-dragging"));
  }
  setupDropZone(el, targetDate) {
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      el.addClass("mcal-drag-over");
    });
    el.addEventListener("dragleave", () => el.removeClass("mcal-drag-over"));
    el.addEventListener("drop", async (e) => {
      var _a;
      e.preventDefault();
      el.removeClass("mcal-drag-over");
      const taskId = (_a = e.dataTransfer) == null ? void 0 : _a.getData("text/plain");
      if (taskId) {
        await this.store.updateTask(taskId, { dueDate: targetDate });
        this.renderCalendar();
      }
    });
  }
  renderMonthView(root) {
    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth();
    const monthKey = `${y}-${m}`;
    if (monthKey !== this.lastRenderedMonthKey) {
      this.monthPagination.clear();
      this.lastRenderedMonthKey = monthKey;
    }
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const today = this.dateStr(/* @__PURE__ */ new Date());
    const grid = root.createDiv("mcal-month-grid");
    for (let i = 0; i < 7; i++)
      grid.createDiv({ cls: "mcal-day-header", text: t(250 + i).slice(0, 3) });
    const offset = (first.getDay() + 6) % 7;
    for (let i = 0; i < offset; i++) grid.createDiv("mcal-day-cell mcal-day-empty");
    for (let d = 1; d <= last.getDate(); d++) {
      const ds = `${y}-${pad(m + 1)}-${pad(d)}`;
      const cell = grid.createDiv(`mcal-day-cell${ds === today ? " mcal-today" : ""}`);
      this.setupDropZone(cell, ds);
      cell.createDiv({ cls: "mcal-day-num", text: String(d) });
      const addBtn = cell.createEl("button", { cls: "mcal-quick-add-btn", text: "+" });
      addBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openTaskEditor(null, ds, root);
      });
      let tasks = this.store.getTasksForDate(ds).filter((tk) => this.activeSources.has(tk.source));
      if (!this.showDone) tasks = tasks.filter((tk) => !tk.done);
      if (tasks.length > 0) {
        const sorted = this.sortByPriority(tasks);
        let pageIdx = this.monthPagination.get(ds) || 0;
        if (pageIdx >= sorted.length) pageIdx = 0;
        const task = sorted[pageIdx];
        const pill = cell.createDiv(`mcal-pill${task.done ? " mcal-done" : ""}`);
        pill.style.setProperty("--pill-color", PRIORITY_COLORS[task.priority]);
        pill.createSpan({ cls: "mcal-pill-text", text: task.title });
        this.setupDraggable(pill, task);
        pill.addEventListener("click", (e) => {
          var _a;
          e.stopPropagation();
          this.openTaskEditor(task, (_a = task.dueDate) != null ? _a : "", root);
        });
        if (sorted.length > 1) {
          const nav = cell.createDiv("mcal-month-nav");
          const prev = nav.createEl("button", { cls: "mcal-nav-btn", text: "\u25C0" });
          nav.createSpan({ text: `${pageIdx + 1}/${sorted.length}`, cls: "mcal-nav-counter" });
          const next = nav.createEl("button", { cls: "mcal-nav-btn", text: "\u25B6" });
          prev.addEventListener("click", (e) => {
            e.stopPropagation();
            this.monthPagination.set(ds, pageIdx > 0 ? pageIdx - 1 : sorted.length - 1);
            this.renderCalendar();
          });
          next.addEventListener("click", (e) => {
            e.stopPropagation();
            this.monthPagination.set(ds, (pageIdx + 1) % sorted.length);
            this.renderCalendar();
          });
        }
      }
    }
  }
  renderWeekView(root) {
    const ws = this.getWeekStart(this.currentDate);
    const today = this.dateStr(/* @__PURE__ */ new Date());
    const weekRow = root.createDiv("mcal-week-row");
    for (let i = 0; i < 7; i++) {
      const day = new Date(ws);
      day.setDate(day.getDate() + i);
      const ds = this.dateStr(day);
      const col = weekRow.createDiv(`mcal-week-col${ds === today ? " mcal-today" : ""}`);
      this.setupDropZone(col, ds);
      const hdr = col.createDiv("mcal-week-col-hdr");
      hdr.createDiv({ cls: "mcal-week-day-name", text: t(250 + (day.getDay() + 6) % 7).slice(0, 3) });
      hdr.createDiv({ cls: "mcal-week-day-num", text: String(day.getDate()) });
      const weekAddBtn = hdr.createEl("button", { cls: "mcal-quick-add-btn", text: "+" });
      weekAddBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openTaskEditor(null, ds, root);
      });
      const colBody = col.createDiv("mcal-week-col-body");
      let tasks = this.store.getTasksForDate(ds).filter((tk) => this.activeSources.has(tk.source));
      if (!this.showDone) tasks = tasks.filter((tk) => !tk.done);
      for (const task of this.sortByPriority(tasks)) {
        const card = colBody.createDiv(`mcal-week-card${task.done ? " mcal-done" : ""}`);
        card.style.setProperty("--card-color", PRIORITY_COLORS[task.priority]);
        card.createSpan({ text: task.title });
        this.setupDraggable(card, task);
        card.addEventListener("click", () => {
          var _a;
          return this.openTaskEditor(task, (_a = task.dueDate) != null ? _a : "", root);
        });
      }
    }
  }
  renderDayView(root) {
    const ds = this.dateStr(this.currentDate);
    const dayCont = root.createDiv("mcal-day-view");
    this.setupDropZone(dayCont, ds);
    let allDayTasks = this.store.getTasksForDate(ds).filter((tk) => this.activeSources.has(tk.source));
    if (!this.showDone) allDayTasks = allDayTasks.filter((tk) => !tk.done);
    const timedTasks = allDayTasks.filter((tk) => tk.time && tk.time.trim() !== "");
    const continuousTasks = allDayTasks.filter((tk) => !tk.time || tk.time.trim() === "");
    if (continuousTasks.length > 0) {
      const allDaySection = dayCont.createDiv("mcal-day-allday-section");
      allDaySection.createDiv({ cls: "mcal-day-allday-title", text: t(432) || "Toute la journ\xE9e" });
      const pillsContainer = allDaySection.createDiv("mcal-day-allday-list");
      const sortedContinuous = this.sortByPriority(continuousTasks);
      for (const task of sortedContinuous) {
        const pill = pillsContainer.createDiv(`mcal-pill${task.done ? " mcal-done" : ""}`);
        pill.style.setProperty("--pill-color", PRIORITY_COLORS[task.priority]);
        pill.createSpan({ cls: "mcal-pill-text", text: task.title });
        this.setupDraggable(pill, task);
        pill.addEventListener("click", (e) => {
          var _a;
          e.stopPropagation();
          this.openTaskEditor(task, (_a = task.dueDate) != null ? _a : ds, root);
        });
      }
    }
    const scrollArea = dayCont.createDiv("mcal-day-scroll-area");
    const totalHours = 24;
    for (let h = 0; h < totalHours; h++) {
      const row = scrollArea.createDiv("mcal-time-row");
      row.createDiv({ cls: "mcal-time-label", text: `${pad(h)}:00` });
      const quickAdd = row.createDiv("mcal-time-quick-add");
      quickAdd.setText("+");
      quickAdd.addEventListener("click", () => {
        this.openTaskEditor(null, ds, root, `${pad(h)}:00`);
      });
    }
    const tasksContainer = scrollArea.createDiv("mcal-day-tasks");
    const tasksWithLayout = timedTasks.map((t2) => {
      const timeStr = t2.time || "12:00";
      const duration = t2.duration || 60;
      const [h, m] = timeStr.split(":").map(Number);
      const offsetH = isNaN(h) ? 12 : h + (isNaN(m) ? 0 : m / 60);
      const startPct = offsetH / totalHours * 100;
      const heightPct = duration / 60 / totalHours * 100;
      return {
        task: t2,
        start: startPct,
        end: startPct + heightPct,
        columns: 1,
        columnIndex: 0
      };
    });
    tasksWithLayout.sort((a, b) => a.start - b.start);
    const clusters = [];
    let currentCluster = [];
    let clusterEnd = 0;
    for (const item of tasksWithLayout) {
      if (currentCluster.length === 0 || item.start < clusterEnd) {
        currentCluster.push(item);
        if (item.end > clusterEnd) clusterEnd = item.end;
      } else {
        clusters.push(currentCluster);
        currentCluster = [item];
        clusterEnd = item.end;
      }
    }
    if (currentCluster.length > 0) clusters.push(currentCluster);
    for (const cluster of clusters) {
      const columnsEndTrack = [];
      for (const item of cluster) {
        let colIdx = 0;
        while (colIdx < columnsEndTrack.length && columnsEndTrack[colIdx] > item.start) {
          colIdx++;
        }
        columnsEndTrack[colIdx] = item.end;
        item.columnIndex = colIdx;
      }
      for (const item of cluster) {
        item.columns = columnsEndTrack.length;
      }
    }
    for (const item of tasksWithLayout) {
      const task = item.task;
      const card = tasksContainer.createDiv(`mcal-day-card${task.done ? " mcal-done" : ""}`);
      card.style.setProperty("--card-color", PRIORITY_COLORS[task.priority]);
      card.style.top = `${item.start}%`;
      card.style.height = `${item.end - item.start}%`;
      const cardWidth = 90 / item.columns;
      card.style.width = `${cardWidth}%`;
      card.style.left = `${item.columnIndex * cardWidth + 5}%`;
      const header = card.createDiv("mcal-day-card-header");
      header.createDiv({ cls: "mcal-day-card-title", text: task.title });
      if (task.time) {
        card.createDiv({ cls: "mcal-day-card-time", text: task.time });
      }
      this.setupDraggable(card, task);
      card.addEventListener("click", (e) => {
        var _a;
        e.stopPropagation();
        this.openTaskEditor(task, (_a = task.dueDate) != null ? _a : ds, root);
      });
    }
  }
  openTaskEditor(task, date, root, defaultTime) {
    var _a;
    const existing = root.querySelector(".mcal-overlay");
    if (existing) existing.remove();
    const overlay = root.createDiv("mcal-overlay");
    const modal = overlay.createDiv("mcal-modal");
    modal.createEl("h3", { cls: "mcal-modal-title", text: task ? t(412) : t(411) });
    const titleRow = modal.createDiv("mcal-editor-row");
    titleRow.createEl("label", { text: t(413) });
    const titleInput = titleRow.createEl("input", { type: "text", cls: "mcal-input" });
    titleInput.value = task ? task.title : "";
    const statusRow = modal.createDiv("mcal-editor-row");
    statusRow.createEl("label", { text: t(433) });
    const statusLabel = statusRow.createEl("label", { cls: "mcal-checkbox-label" });
    const doneInput = statusLabel.createEl("input", { type: "checkbox" });
    doneInput.checked = task ? task.done : false;
    statusLabel.createSpan({ text: t(419) });
    const priorityRow = modal.createDiv("mcal-editor-row");
    priorityRow.createEl("label", { text: t(415) });
    const prioritySelect = priorityRow.createEl("select", { cls: "mcal-input" });
    const labels = getPriorityLabels();
    for (const p of PRIORITY_ORDER) {
      const opt = prioritySelect.createEl("option", { value: p, text: labels[p] });
      if (task && task.priority === p) opt.selected = true;
      else if (!task && p === "normal") opt.selected = true;
    }
    const timeRow = modal.createDiv("mcal-editor-row");
    timeRow.createEl("label", { text: t(424) });
    const timeInput = timeRow.createEl("input", { type: "time", cls: "mcal-input" });
    timeInput.value = task ? task.time || "" : defaultTime || "";
    const durationRow = modal.createDiv("mcal-editor-row");
    durationRow.createEl("label", { text: t(425) });
    const durationInput = durationRow.createEl("input", { type: "number", cls: "mcal-input" });
    durationInput.value = task ? String(task.duration || 60) : "60";
    const recurrenceRow = modal.createDiv("mcal-editor-row");
    recurrenceRow.createEl("label", { text: t(426) });
    const recContainer = recurrenceRow.createDiv({ cls: "mcal-rec-group" });
    recContainer.style.display = "flex";
    recContainer.style.gap = "8px";
    const freqInput = recContainer.createEl("input", { type: "number", cls: "mcal-input", attr: { min: "1", style: "width: 70px;" } });
    freqInput.value = task && task.recurrence ? String(task.recurrence.frequency) : "1";
    const unitSelect = recContainer.createEl("select", { cls: "mcal-input" });
    const units = { "": t(427), daily: t(428), weekly: t(429), monthly: t(430) };
    for (const [val, text] of Object.entries(units)) {
      const opt = unitSelect.createEl("option", { value: val, text });
      if (task && ((_a = task.recurrence) == null ? void 0 : _a.unit) === val) opt.selected = true;
    }
    const actionsRow = modal.createDiv("mcal-editor-actions");
    if (task) {
      const deleteBtn = actionsRow.createEl("button", { cls: "mcal-btn mcal-btn-danger", text: t(434) });
      const confirmRow = actionsRow.createDiv("mcal-confirm-row");
      confirmRow.style.display = "none";
      confirmRow.createSpan({ cls: "mcal-confirm-label", text: t(434) });
      const yesBtn = confirmRow.createEl("button", { cls: "mcal-btn mcal-btn-danger", text: t(435) });
      const noBtn = confirmRow.createEl("button", { cls: "mcal-btn mcal-btn-secondary", text: t(436) });
      deleteBtn.addEventListener("click", () => {
        deleteBtn.style.display = "none";
        confirmRow.style.display = "flex";
      });
      noBtn.addEventListener("click", () => {
        confirmRow.style.display = "none";
        deleteBtn.style.display = "";
      });
      yesBtn.addEventListener("click", async () => {
        await this.store.deleteTask(task.id);
        overlay.remove();
        this.renderCalendar();
      });
    }
    const cancelBtn = actionsRow.createEl("button", { cls: "mcal-btn mcal-btn-secondary", text: t(421) });
    cancelBtn.addEventListener("click", () => overlay.remove());
    const saveBtn = actionsRow.createEl("button", { cls: "mcal-btn mcal-btn-primary", text: t(423) });
    saveBtn.addEventListener("click", async () => {
      const title = titleInput.value.trim();
      if (!title) return;
      const priority = prioritySelect.value;
      const time = timeInput.value || void 0;
      const duration = parseInt(durationInput.value, 10) || 60;
      const isDone = doneInput.checked;
      const recValue = unitSelect.value ? { frequency: parseInt(freqInput.value, 10) || 1, unit: unitSelect.value } : void 0;
      if (task) {
        await this.store.updateTask(
          task.id,
          {
            title,
            priority,
            time,
            duration,
            done: isDone,
            recurrence: recValue,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        );
      } else {
        await this.store.createFullTask(date, title, priority, time, duration, isDone, recValue);
      }
      overlay.remove();
      this.refresh();
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }
  sortByPriority(tasks) {
    return [...tasks].sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority));
  }
  getWeekStart(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    return d;
  }
  dateStr(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
};
function pad(n) {
  return String(n).padStart(2, "0");
}

// src/modules/calendar/CalendarModule.ts
var CalendarModule = class {
  constructor(app, plugin, taskStore) {
    this.id = "calendar";
    this.name = "Calendar";
    this.ribbonIconEl = null;
    this.app = app;
    this.plugin = plugin;
    this.taskStore = taskStore;
    this.store = new CalendarStore(app, taskStore);
  }
  async init() {
    this.plugin.registerView(
      CALENDAR_VIEW_TYPE,
      (leaf) => new CalendarView(leaf, this.store)
    );
    this.plugin.addCommand(
      {
        id: "open-calendar",
        name: t(401),
        callback: () => this.activateView()
      }
    );
  }
  async onload() {
    this.unsubLang = onLanguageChange(() => {
      const leaves = this.app.workspace.getLeavesOfType(CALENDAR_VIEW_TYPE);
      for (const leaf of leaves) leaf.view.refresh();
    });
    this.ribbonIconEl = this.plugin.addRibbonIcon("calendar-days", t(400), () => this.activateView());
    this.ribbonIconEl.setAttribute("data-harmony-module", this.id);
    console.log("[CalendarModule] Activ\xE9.");
  }
  onunload() {
    var _a;
    (_a = this.unsubLang) == null ? void 0 : _a.call(this);
    if (this.ribbonIconEl) {
      this.ribbonIconEl.remove();
      this.ribbonIconEl = null;
    }
    const existingLeaves = this.app.workspace.getLeavesOfType(CALENDAR_VIEW_TYPE);
    if (existingLeaves.length > 0) {
      this.app.workspace.detachLeavesOfType(CALENDAR_VIEW_TYPE);
    }
    console.log("[CalendarModule] D\xE9sactiv\xE9.");
  }
  async activateView() {
    const existing = this.app.workspace.getLeavesOfType(CALENDAR_VIEW_TYPE);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = this.app.workspace.getLeaf("tab");
    await leaf.setViewState({ type: CALENDAR_VIEW_TYPE, active: true });
    this.app.workspace.revealLeaf(leaf);
  }
};

// src/main.ts
var Harmony = class extends import_obsidian10.Plugin {
  async onload() {
    await this.loadSettings();
    setLanguage(this.settings.language);
    this.registry = new ModuleRegistry();
    this.taskStore = new TaskStore(this.app);
    try {
      await this.taskStore.load();
    } catch (e) {
      console.error("[Harmony] Error of the load of TaskStore :", e);
    }
    this.linkService = new LinkService(this.app, this.taskStore);
    this.linkService.init();
    this.registry.register(new DashboardModule2(this.app, this, this.taskStore));
    this.registry.register(new KanbanModule(this.app, this, this.taskStore));
    this.registry.register(new TodoModule(this.app, this, this.taskStore));
    this.registry.register(new CalendarModule(this.app, this, this.taskStore));
    this.registry.initAll();
    const moduleEntries = Object.entries(this.settings.enabledModules);
    for (const [moduleId, enabled] of moduleEntries) {
      if (enabled) {
        try {
          await this.registry.enable(moduleId);
        } catch (e) {
          console.error(`[Harmony] Impossible d'activer le module ${moduleId} :`, e);
        }
      }
    }
    this.addSettingTab(new Harmony_Settings_Tab(this.app, this));
    console.log("[Harmony] Plugin pr\xEAt.");
  }
  onunload() {
    this.registry.unloadAll();
    console.log("[Harmony] D\xE9chargement du plugin...");
  }
  async loadSettings() {
    const loadedData = await this.loadData();
    if (typeof loadedData === "object" && loadedData !== null) {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
    } else {
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};

/* nosourcemap */