"use strict";
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

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => WordGoalWebhookPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian8 = require("obsidian");

// src/daily-progress.ts
var DEBUG_PROGRESS_DIAGNOSTICS = false;
function logProgressDiagnostic(event, details) {
  if (!DEBUG_PROGRESS_DIAGNOSTICS)
    return;
  console.debug(`[word-goal][daily-progress] ${event}`, details);
}
function createEmptyActiveDay(date) {
  return { date, files: {} };
}
function normalizeActiveDay(date, value) {
  const normalized = {
    date: typeof value?.date === "string" && value.date.length > 0 ? value.date : date,
    files: {}
  };
  for (const [path, file] of Object.entries(value?.files ?? {})) {
    if (!file || typeof file !== "object")
      continue;
    const latestCandidate = typeof file.latestWords === "number" && Number.isFinite(file.latestWords) ? file.latestWords : 0;
    const baselineWords = typeof file.baselineWords === "number" && Number.isFinite(file.baselineWords) ? file.baselineWords : latestCandidate;
    normalized.files[path] = {
      baselineWords,
      latestWords: Math.max(baselineWords, latestCandidate),
      latestObservedAt: typeof file.latestObservedAt === "number" && Number.isFinite(file.latestObservedAt) ? file.latestObservedAt : 0
    };
    logProgressDiagnostic("normalize-file-progress", {
      path,
      rawBaselineWords: file.baselineWords,
      rawLatestWords: file.latestWords,
      baselineWords,
      latestWords: normalized.files[path].latestWords
    });
  }
  return normalized;
}
function recordFileObservation(activeDay, dateKey, path, words, observedAt, baselineOverride) {
  const normalizedWords = Math.max(0, Math.floor(words));
  const next = activeDay.date === dateKey ? normalizeActiveDay(dateKey, activeDay) : createEmptyActiveDay(dateKey);
  const existing = next.files[path];
  if (!existing) {
    const baselineWords2 = typeof baselineOverride === "number" && Number.isFinite(baselineOverride) ? Math.max(0, Math.floor(baselineOverride)) : normalizedWords;
    next.files[path] = {
      baselineWords: baselineWords2,
      latestWords: normalizedWords,
      latestObservedAt: observedAt
    };
    logProgressDiagnostic("create-file-progress", {
      path,
      words: normalizedWords,
      observedAt,
      baselineOverride,
      baselineWords: baselineWords2
    });
    return next;
  }
  const baselineWords = Math.min(existing.baselineWords, normalizedWords);
  next.files[path] = {
    baselineWords,
    latestWords: normalizedWords,
    latestObservedAt: Math.max(existing.latestObservedAt, observedAt)
  };
  logProgressDiagnostic("update-file-progress", {
    path,
    words: normalizedWords,
    observedAt,
    existingBaselineWords: existing.baselineWords,
    existingLatestWords: existing.latestWords,
    nextBaselineWords: baselineWords,
    nextLatestWords: next.files[path].latestWords
  });
  return next;
}
function removeFileProgress(activeDay, path) {
  const next = normalizeActiveDay(activeDay.date, activeDay);
  if (!next.files[path])
    return activeDay;
  delete next.files[path];
  return next;
}
function chooseMergedBaseline(local, incoming) {
  const localLooksLikePartial = local.baselineWords === 0 && local.latestWords === incoming.latestWords && incoming.baselineWords > 0;
  const incomingLooksLikePartial = incoming.baselineWords === 0 && incoming.latestWords === local.latestWords && local.baselineWords > 0;
  const localLooksLikeEmptySnapshot = local.baselineWords === 0 && local.latestWords === 0 && incoming.baselineWords > 0;
  const incomingLooksLikeEmptySnapshot = incoming.baselineWords === 0 && incoming.latestWords === 0 && local.baselineWords > 0;
  if (localLooksLikePartial || localLooksLikeEmptySnapshot) {
    return incoming.baselineWords;
  }
  if (incomingLooksLikePartial || incomingLooksLikeEmptySnapshot) {
    return local.baselineWords;
  }
  return Math.min(local.baselineWords, incoming.baselineWords);
}
function mergeFileProgress(local, incoming) {
  if (!local)
    return incoming ? { ...incoming } : void 0;
  if (!incoming)
    return { ...local };
  const localTimestamp = local.latestObservedAt ?? 0;
  const incomingTimestamp = incoming.latestObservedAt ?? 0;
  const latest = incomingTimestamp > localTimestamp ? incoming.latestWords : local.latestWords;
  const baselineWords = chooseMergedBaseline(local, incoming);
  logProgressDiagnostic("merge-file-progress", {
    local,
    incoming,
    baselineWords,
    latestWords: Math.max(0, latest)
  });
  return {
    baselineWords,
    latestWords: Math.max(0, latest),
    latestObservedAt: Math.max(localTimestamp, incomingTimestamp)
  };
}
function mergeActiveDay(local, incoming, today) {
  if (incoming.date !== today)
    return normalizeActiveDay(today, local.date === today ? local : createEmptyActiveDay(today));
  const base = local.date === today ? normalizeActiveDay(today, local) : createEmptyActiveDay(today);
  for (const [path, progress] of Object.entries(incoming.files)) {
    const merged = mergeFileProgress(base.files[path], progress);
    if (merged)
      base.files[path] = merged;
  }
  return base;
}
function renameFileProgress(activeDay, oldPath, newPath) {
  if (oldPath === newPath)
    return activeDay;
  const next = normalizeActiveDay(activeDay.date, activeDay);
  const existing = next.files[oldPath];
  if (!existing)
    return next;
  const target = next.files[newPath];
  if (target && target.latestWords === existing.latestWords && existing.baselineWords < target.baselineWords) {
    next.files[newPath] = {
      baselineWords: existing.baselineWords,
      latestWords: target.latestWords,
      latestObservedAt: Math.max(target.latestObservedAt, existing.latestObservedAt)
    };
  } else {
    next.files[newPath] = mergeFileProgress(target, existing) ?? existing;
  }
  delete next.files[oldPath];
  return next;
}
function getTodayTotal(activeDay) {
  let total = 0;
  for (const progress of Object.values(activeDay.files)) {
    total += Math.max(progress.latestWords - progress.baselineWords, 0);
  }
  return total;
}

// src/settings.ts
var DEFAULT_SETTINGS = {
  webhookUrl: "",
  dailyGoal: 500,
  heatmapColor: "#39d353",
  showGoalMetCue: true,
  excludedFolders: []
};
var PLUGIN_DATA_VERSION = 2;
var COLOR_PRESETS = [
  { label: "Green", hex: "#39d353" },
  { label: "Teal", hex: "#4ce0b3" },
  { label: "Blue", hex: "#4a9eff" },
  { label: "Purple", hex: "#a78bfa" },
  { label: "Pink", hex: "#f472b6" },
  { label: "Orange", hex: "#fb923c" },
  { label: "Yellow", hex: "#facc15" },
  { label: "Red", hex: "#f87171" }
];
function normalizeExcludedFolder(path) {
  const trimmed = path.trim().replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/g, "");
  return trimmed.length > 0 ? `${trimmed}/` : "";
}
function normalizeExcludedFolders(paths) {
  const normalized = [];
  const seen = /* @__PURE__ */ new Set();
  for (const path of paths) {
    const folder = normalizeExcludedFolder(path);
    if (!folder || seen.has(folder))
      continue;
    seen.add(folder);
    normalized.push(folder);
  }
  return normalized;
}
function isPathInExcludedFolder(path, excludedFolders) {
  const normalizedPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
  return normalizeExcludedFolders(excludedFolders).some((folder) => normalizedPath.startsWith(folder));
}

// src/plugin-data.ts
var DEBUG_PLUGIN_DATA_DIAGNOSTICS = false;
function logPluginDataDiagnostic(event, details) {
  if (!DEBUG_PLUGIN_DATA_DIAGNOSTICS)
    return;
  console.debug(`[word-goal][plugin-data] ${event}`, details);
}
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeHistoryEntry(record, dailyGoal) {
  if (!record || typeof record.totalWords !== "number" || !Number.isFinite(record.totalWords))
    return void 0;
  const totalWords = Math.max(0, Math.floor(record.totalWords));
  return {
    totalWords,
    goalMet: record.goalMet === true || totalWords >= dailyGoal,
    updatedAt: typeof record.updatedAt === "number" && Number.isFinite(record.updatedAt) ? record.updatedAt : 0
  };
}
function compareHistory(local, incoming) {
  if (!local)
    return incoming ? { ...incoming } : void 0;
  if (!incoming)
    return { ...local };
  const localUpdated = local.updatedAt ?? 0;
  const incomingUpdated = incoming.updatedAt ?? 0;
  if (incomingUpdated > localUpdated)
    return { ...incoming };
  if (localUpdated > incomingUpdated)
    return { ...local };
  return incoming.totalWords > local.totalWords ? { ...incoming } : { ...local };
}
function migrateLegacyActiveDay(loaded, today) {
  if (loaded?.activeDay) {
    return normalizeActiveDay(today, loaded.activeDay);
  }
  const legacyDate = typeof loaded?.todaysDate === "string" ? loaded.todaysDate : "";
  if (legacyDate.length === 0)
    return createEmptyActiveDay(today);
  const activeDay = createEmptyActiveDay(legacyDate);
  for (const [path, snapshot] of Object.entries(loaded?.todaysWordCount ?? {})) {
    if (!snapshot || typeof snapshot !== "object")
      continue;
    const latestCandidate = typeof snapshot.current === "number" && Number.isFinite(snapshot.current) ? snapshot.current : typeof snapshot.peak === "number" && Number.isFinite(snapshot.peak) ? snapshot.peak : 0;
    const baselineWords = typeof snapshot.initial === "number" && Number.isFinite(snapshot.initial) ? snapshot.initial : latestCandidate;
    activeDay.files[path] = {
      baselineWords,
      latestWords: Math.max(baselineWords, latestCandidate),
      latestObservedAt: 0
    };
    logPluginDataDiagnostic("migrate-legacy-file-progress", {
      path,
      initial: snapshot.initial,
      peak: snapshot.peak,
      current: snapshot.current,
      baselineWords,
      latestWords: activeDay.files[path].latestWords
    });
  }
  return legacyDate === today ? activeDay : createEmptyActiveDay(today);
}
function normalizePluginData(loadedInput, defaultSettings, today, version) {
  const loaded = isPlainObject(loadedInput) ? loadedInput : null;
  const settings = Object.assign({}, defaultSettings, isPlainObject(loaded?.settings) ? loaded?.settings : {});
  const settingsRecord = settings;
  const defaultSettingsRecord = defaultSettings;
  if (Array.isArray(settingsRecord.excludedFolders)) {
    settingsRecord.excludedFolders = normalizeExcludedFolders(
      settingsRecord.excludedFolders.filter((path) => typeof path === "string")
    );
  } else if (Array.isArray(defaultSettingsRecord.excludedFolders)) {
    settingsRecord.excludedFolders = normalizeExcludedFolders(
      defaultSettingsRecord.excludedFolders.filter((path) => typeof path === "string")
    );
  }
  const history = {};
  for (const [dateKey, record] of Object.entries(loaded?.history ?? {})) {
    const normalized = normalizeHistoryEntry(record, settings.dailyGoal ?? 0);
    if (normalized)
      history[dateKey] = normalized;
  }
  return {
    version,
    settings,
    history,
    activeDay: migrateLegacyActiveDay(loaded, today),
    lastWebhookSentDate: typeof loaded?.lastWebhookSentDate === "string" ? loaded.lastWebhookSentDate : ""
  };
}
function mergePluginData(local, incoming, today) {
  const merged = {
    ...local,
    history: { ...local.history },
    activeDay: mergeActiveDay(local.activeDay, incoming.activeDay, today),
    lastWebhookSentDate: (incoming.lastWebhookSentDate ?? "") > (local.lastWebhookSentDate ?? "") ? incoming.lastWebhookSentDate : local.lastWebhookSentDate
  };
  for (const dateKey of Object.keys(incoming.history)) {
    merged.history[dateKey] = compareHistory(local.history[dateKey], incoming.history[dateKey]) ?? merged.history[dateKey];
  }
  return merged;
}
var PluginDataStore = class {
  constructor(adapter, primaryPath, defaultSettings, version, getTodayKey) {
    this.adapter = adapter;
    this.primaryPath = primaryPath;
    this.defaultSettings = defaultSettings;
    this.version = version;
    this.getTodayKey = getTodayKey;
  }
  async readAndValidate(path) {
    try {
      if (!await this.adapter.exists(path))
        return null;
      const raw = await this.adapter.read(path);
      if (raw.trim().length === 0)
        return null;
      const parsed = JSON.parse(raw);
      return normalizePluginData(parsed, this.defaultSettings, this.getTodayKey(), this.version);
    } catch {
      return null;
    }
  }
  async loadBestAvailable() {
    const data = await this.readAndValidate(this.primaryPath);
    if (data)
      return { data, sourcePath: this.primaryPath };
    return {
      data: normalizePluginData(null, this.defaultSettings, this.getTodayKey(), this.version),
      sourcePath: null
    };
  }
  merge(local, incoming) {
    return mergePluginData(local, incoming, this.getTodayKey());
  }
  async saveSafely(data) {
    await this.adapter.write(this.primaryPath, JSON.stringify(data, null, 2));
  }
};

// src/data-sync.ts
var PluginDataCoordinator = class {
  constructor(options) {
    this.options = options;
    this.pluginDataMtime = null;
    this.saveTimer = null;
    this.dirty = false;
    this.pendingSidebarRefresh = false;
    this.saveInFlight = null;
    this.store = new PluginDataStore(
      options.adapter,
      options.primaryPath,
      options.defaultSettings,
      options.version,
      options.getTodayKey
    );
  }
  async load() {
    const { data, sourcePath } = await this.store.loadBestAvailable();
    const stat = await this.options.adapter.stat(this.options.primaryPath);
    const shouldOpenHeatmapOnFirstInstall = !stat && !sourcePath;
    if (stat) {
      this.pluginDataMtime = stat.mtime;
    } else if (sourcePath) {
      const sourceStat = await this.options.adapter.stat(sourcePath);
      this.pluginDataMtime = sourceStat?.mtime ?? null;
    } else {
      this.pluginDataMtime = null;
    }
    return { data, shouldOpenHeatmapOnFirstInstall };
  }
  markDirty(options) {
    this.dirty = true;
    if (options?.refreshSidebar) {
      this.pendingSidebarRefresh = true;
    }
  }
  scheduleFlush(flush) {
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
    }
    this.saveTimer = window.setTimeout(flush, 800);
  }
  async flush(currentData) {
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    if (this.saveInFlight) {
      return this.saveInFlight;
    }
    if (!this.dirty)
      return currentData;
    this.saveInFlight = this.performSaveLoop(currentData);
    try {
      return await this.saveInFlight;
    } finally {
      this.saveInFlight = null;
    }
  }
  async reloadIfChanged(currentData) {
    const stat = await this.options.adapter.stat(this.options.primaryPath);
    if (!stat)
      return { data: currentData, changed: false };
    if (this.pluginDataMtime !== null && stat.mtime <= this.pluginDataMtime) {
      return { data: currentData, changed: false };
    }
    const incoming = await this.store.readAndValidate(this.options.primaryPath);
    if (!incoming)
      return { data: currentData, changed: false };
    const data = this.store.merge(currentData, incoming);
    this.pluginDataMtime = stat.mtime;
    return { data, changed: true };
  }
  dispose() {
    if (this.saveTimer !== null) {
      window.clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  }
  async performSaveLoop(currentData) {
    let data = currentData;
    while (this.dirty) {
      this.dirty = false;
      data = await this.saveSafely(this.options.getCurrentData?.() ?? data);
    }
    if (this.pendingSidebarRefresh) {
      this.pendingSidebarRefresh = false;
      this.options.onPendingSidebarRefresh?.();
    }
    return data;
  }
  async saveSafely(currentData) {
    let data = currentData;
    const diskData = await this.store.loadBestAvailable();
    if (diskData.sourcePath) {
      data = this.store.merge(data, diskData.data);
      data = this.options.onDataMerged?.(data) ?? data;
    }
    await this.store.saveSafely(data);
    const stat = await this.options.adapter.stat(this.options.primaryPath);
    this.pluginDataMtime = stat?.mtime ?? this.pluginDataMtime;
    return data;
  }
};

// src/dates.ts
function dateToKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function todayKey() {
  return dateToKey(/* @__PURE__ */ new Date());
}
function isToday(date) {
  return dateToKey(date) === todayKey();
}
function runtimeLocale() {
  if (typeof window !== "undefined" && typeof window.navigator?.language === "string" && window.navigator.language.length > 0) {
    return window.navigator.language;
  }
  return Intl.DateTimeFormat().resolvedOptions().locale;
}
function formatLocalizedDate(date, options) {
  return date.toLocaleDateString(runtimeLocale(), options);
}
function formatLocalizedNumber(value) {
  return value.toLocaleString(runtimeLocale());
}

// src/daily-notes.ts
var import_obsidian2 = require("obsidian");

// src/daily-note-import.ts
var import_obsidian = require("obsidian");
function dateToKey2(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function parseDateKeyValue(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match)
    return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}
function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}
function buildDailyNoteImportDateKeys(startDate, endDate) {
  const start = parseDateKeyValue(startDate);
  const end = parseDateKeyValue(endDate);
  if (!start || !end || start > end) {
    throw new Error("Invalid daily note import date range.");
  }
  const dates = [];
  for (let date = start; date <= end; date = addDays(date, 1)) {
    dates.push(dateToKey2(date));
  }
  return dates;
}
function normalizeVaultPath(path) {
  return path.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\/+|\/+$/g, "");
}
function stripMarkdownExtension(path) {
  return path.replace(/\.md$/i, "");
}
function buildDailyNotePathForDate(date, config) {
  if (config.format.trim().length === 0)
    return null;
  const normalizedFormat = stripMarkdownExtension(normalizeVaultPath(config.format));
  const formatMoment = import_obsidian.moment;
  const formattedPath = formatMoment(date).format(normalizedFormat);
  if (formattedPath.trim().length === 0)
    return null;
  const combinedPath = config.folder ? normalizeVaultPath(`${config.folder}/${formattedPath}`) : normalizeVaultPath(formattedPath);
  return combinedPath.endsWith(".md") ? combinedPath : `${combinedPath}.md`;
}
function applyImportedDailyWordCount(history, dateKey, words, dailyGoal, updatedAt) {
  const totalWords = Math.max(0, Math.floor(words));
  if (totalWords <= 0)
    return false;
  const existing = history[dateKey];
  if (existing && existing.totalWords >= totalWords)
    return false;
  history[dateKey] = {
    totalWords,
    goalMet: existing?.goalMet === true || totalWords >= dailyGoal,
    updatedAt
  };
  return true;
}

// src/daily-notes.ts
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function getCoreDailyNotePathConfig(app) {
  const internalPlugins = app.internalPlugins;
  const plugin = internalPlugins?.getPluginById?.("daily-notes") ?? internalPlugins?.plugins?.["daily-notes"];
  const instance = plugin?.instance;
  const options = instance?.options ?? plugin?.options;
  if (typeof options?.format !== "string" || options.format.trim().length === 0) {
    return null;
  }
  return {
    format: options.format.trim(),
    folder: typeof options.folder === "string" ? options.folder.trim() : ""
  };
}
async function getPeriodicDailyNotePathConfig(app) {
  const plugins = app.plugins;
  const plugin = plugins?.plugins?.["periodic-notes"];
  const pluginDailySettings = plugin?.settings?.daily;
  if (typeof pluginDailySettings?.format === "string" && pluginDailySettings.format.trim().length > 0) {
    return {
      format: pluginDailySettings.format.trim(),
      folder: typeof pluginDailySettings.folder === "string" ? pluginDailySettings.folder.trim() : ""
    };
  }
  try {
    const path = `${app.vault.configDir}/plugins/periodic-notes/data.json`;
    const exists = await app.vault.adapter.exists(path);
    if (!exists)
      return null;
    const raw = await app.vault.adapter.read(path);
    const parsed = JSON.parse(raw);
    const daily = isRecord(parsed) && isRecord(parsed.daily) ? parsed.daily : null;
    if (typeof daily?.format !== "string" || daily.format.trim().length === 0) {
      return null;
    }
    return {
      format: daily.format.trim(),
      folder: typeof daily.folder === "string" ? daily.folder.trim() : ""
    };
  } catch (err) {
    console.error("Failed to read Periodic Notes settings:", err);
    return null;
  }
}
var buildDailyNotePathForDate2 = buildDailyNotePathForDate;
async function resolveDailyNotePathConfig(app) {
  const periodicConfig = await getPeriodicDailyNotePathConfig(app);
  if (periodicConfig) {
    return periodicConfig;
  }
  const coreConfig = getCoreDailyNotePathConfig(app);
  if (coreConfig) {
    return coreConfig;
  }
  return null;
}
async function resolveDailyNotePathForDate(app, date) {
  const config = await resolveDailyNotePathConfig(app);
  if (!config)
    return null;
  return buildDailyNotePathForDate2(date, config);
}
async function openDailyNoteForDate(app, date) {
  const path = await resolveDailyNotePathForDate(app, date);
  if (!path) {
    const config = await resolveDailyNotePathConfig(app);
    return { opened: false, reason: config ? "invalid-path" : "missing-config" };
  }
  const file = app.vault.getAbstractFileByPath(path);
  if (!(file instanceof import_obsidian2.TFile))
    return { opened: false, reason: "missing-file", path };
  const leaf = app.workspace.getMostRecentLeaf(app.workspace.rootSplit) ?? app.workspace.getLeaf(false);
  await leaf.openFile(file);
  app.workspace.setActiveLeaf(leaf, { focus: true });
  return { opened: true, path };
}

// src/counting.ts
var DEFAULT_COUNT_OPTIONS = {
  excludeFrontmatter: true,
  excludeComments: true,
  excludeCodeBlocks: true
};
var wordMatcher = null;
function getWordMatcher() {
  if (wordMatcher)
    return wordMatcher;
  try {
    wordMatcher = /[\p{L}\p{N}]+(?:[-_'’][\p{L}\p{N}]+)*/gu;
  } catch {
    wordMatcher = /[A-Za-z0-9]+(?:[-_'’][A-Za-z0-9]+)*/g;
  }
  return wordMatcher;
}
function removeFrontmatterByMetadata(content, metadata) {
  const typedMetadata = metadata;
  const position = typedMetadata?.frontmatterPosition ?? typedMetadata?.frontmatter?.position;
  const start = position?.start?.offset;
  const end = position?.end?.offset;
  if (typeof start === "number" && typeof end === "number" && start >= 0 && end > start) {
    return `${content.slice(0, start)}${content.slice(end)}`;
  }
  if (!content.startsWith("---\n") && !content.startsWith("---\r\n"))
    return content;
  const normalized = content.replace(/\r\n/g, "\n");
  const closingIndex = normalized.indexOf("\n---\n", 4);
  if (closingIndex === -1)
    return content;
  return normalized.slice(closingIndex + 5);
}
function removeComments(content) {
  return content.replace(/%%[\s\S]*?%%/g, " ").replace(/<!--[\s\S]*?-->/g, " ");
}
function removeCodeBlocks(content) {
  return content.replace(/(^|\n)```[\s\S]*?\n```(?=\n|$)/g, "$1");
}
function replaceMarkdownLinks(content) {
  return content.replace(/!\[([^\]]*)\]\([^)]*\)/g, " $1 ").replace(/\[([^\]]+)\]\([^)]*\)/g, " $1 ").replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target, alias) => {
    const text = alias ?? target.split("/").pop() ?? target;
    return ` ${text.replace(/\.[^.]+$/, "")} `;
  }).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target, alias) => {
    const text = alias ?? target.split("/").pop() ?? target;
    return ` ${text.replace(/\.[^.]+$/, "")} `;
  });
}
function stripMarkdownSyntax(content) {
  let stripped = content;
  stripped = replaceMarkdownLinks(stripped);
  stripped = stripped.replace(/^\s{0,3}(#{1,6}|>|[-*+] |\d+\. )/gm, "");
  stripped = stripped.replace(/`([^`]+)`/g, " $1 ");
  stripped = stripped.replace(/\|/g, " ");
  stripped = stripped.replace(/[*_~]/g, " ");
  stripped = stripped.replace(/<[^>]+>/g, " ");
  stripped = stripped.replace(/\^\[[^\]]+\]/g, " ");
  stripped = stripped.replace(/\{#[^}]+\}/g, " ");
  stripped = stripped.replace(/!?(?=\[\])/g, " ");
  return stripped;
}
function extractMeaningfulText(content, metadata, options = DEFAULT_COUNT_OPTIONS) {
  let meaningful = content;
  if (options.excludeFrontmatter) {
    meaningful = removeFrontmatterByMetadata(meaningful, metadata);
  }
  if (options.excludeComments) {
    meaningful = removeComments(meaningful);
  }
  if (options.excludeCodeBlocks) {
    meaningful = removeCodeBlocks(meaningful);
  }
  meaningful = stripMarkdownSyntax(meaningful);
  return meaningful;
}
function countMeaningfulWords(content, metadata, options = DEFAULT_COUNT_OPTIONS) {
  const meaningful = extractMeaningfulText(content, metadata, options);
  const matches = meaningful.match(getWordMatcher());
  return matches?.length ?? 0;
}

// src/imports/daily-note-word-count-import.ts
function isMarkdownFile(file) {
  return typeof file === "object" && file !== null && "path" in file && "extension" in file && typeof file.path === "string" && file.extension === "md";
}
async function importDailyNoteWordCounts(app, history, dailyGoal, range, updatedAt = Date.now()) {
  const config = await resolveDailyNotePathConfig(app);
  if (!config)
    return null;
  const dateKeys = buildDailyNoteImportDateKeys(range.startDate, range.endDate);
  let checked = 0;
  let imported = 0;
  let missing = 0;
  let skipped = 0;
  for (const dateKey of dateKeys) {
    checked++;
    const path = buildDailyNotePathForDate(/* @__PURE__ */ new Date(`${dateKey}T00:00:00`), config);
    if (!path) {
      missing++;
      continue;
    }
    const file = app.vault.getAbstractFileByPath(path);
    if (!isMarkdownFile(file)) {
      missing++;
      continue;
    }
    const content = await app.vault.cachedRead(file);
    const words = countMeaningfulWords(content, app.metadataCache.getCache(file.path));
    if (applyImportedDailyWordCount(history, dateKey, words, dailyGoal, updatedAt)) {
      imported++;
    } else {
      skipped++;
    }
  }
  return {
    imported,
    missing,
    skipped,
    checked,
    startDate: dateKeys[0],
    endDate: dateKeys[dateKeys.length - 1]
  };
}

// src/imports/daily-stats-import.ts
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function parseDailyStatsDayCounts(raw) {
  const parsed = JSON.parse(raw);
  if (!isRecord2(parsed) || !isRecord2(parsed.dayCounts))
    return {};
  const dayCounts = {};
  for (const [key, value] of Object.entries(parsed.dayCounts)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      dayCounts[key] = value;
    }
  }
  return dayCounts;
}
function dailyStatsKeyToDateKey(key) {
  const parts = key.split("/");
  if (parts.length !== 3)
    return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) + 1;
  const day = parseInt(parts[2], 10);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function importDailyStatsHistory(history, dayCounts, dailyGoal) {
  let imported = 0;
  for (const [dailyStatsKey, words] of Object.entries(dayCounts)) {
    if (typeof words !== "number" || words <= 0)
      continue;
    const dateKey = dailyStatsKeyToDateKey(dailyStatsKey);
    if (!dateKey)
      continue;
    if (!history[dateKey] || history[dateKey].totalWords === 0) {
      history[dateKey] = {
        totalWords: words,
        goalMet: words >= dailyGoal,
        updatedAt: 0
      };
      imported++;
    }
  }
  return { imported };
}

// src/settings-tab.ts
var import_obsidian3 = require("obsidian");

// src/color.ts
var LEVEL_ALPHA = [0, 0.3, 0.5, 0.75, 1];
function normalizeHexColor(value) {
  const trimmed = value.trim();
  const match = trimmed.match(/^#?([0-9a-fA-F]{6})$/);
  return match ? `#${match[1].toLowerCase()}` : null;
}
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function lerpColor(from, to, t) {
  const f = [parseInt(from.slice(1, 3), 16), parseInt(from.slice(3, 5), 16), parseInt(from.slice(5, 7), 16)];
  const tC = [parseInt(to.slice(1, 3), 16), parseInt(to.slice(3, 5), 16), parseInt(to.slice(5, 7), 16)];
  const r = Math.round(f[0] + (tC[0] - f[0]) * t);
  const g = Math.round(f[1] + (tC[1] - f[1]) * t);
  const b = Math.round(f[2] + (tC[2] - f[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

// src/settings-tab.ts
var WordGoalSettingTab = class extends import_obsidian3.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  async persistWebhookUrl(value) {
    this.plugin.settings.webhookUrl = value;
    this.plugin.markDirty({ refreshSidebar: false });
    await this.plugin.flushSave();
  }
  async runTestWebhook(button) {
    button.setDisabled(true);
    try {
      await this.plugin.sendTestWebhook();
    } finally {
      button.setDisabled(false);
    }
  }
  async persistDailyWordGoal(value) {
    const n = parseInt(value, 10);
    if (isNaN(n) || n <= 0)
      return;
    this.plugin.settings.dailyGoal = n;
    this.plugin.syncTodayHistory();
    this.plugin.markDirty({ refreshSidebar: true });
    await this.plugin.flushSave();
    this.plugin.refreshUi();
  }
  async applyHeatmapColor(hex) {
    const normalized = normalizeHexColor(hex);
    if (!normalized)
      return;
    this.plugin.settings.heatmapColor = normalized;
    this.plugin.markDirty({ refreshSidebar: true });
    await this.plugin.flushSave();
    this.plugin.refreshUi();
    this.display();
  }
  updateCustomColorInput(inputEl, value) {
    const hasValue = value.trim().length > 0;
    inputEl.toggleClass("wg-custom-color-invalid", hasValue && normalizeHexColor(value) === null);
  }
  async persistGoalMetCue(value) {
    this.plugin.settings.showGoalMetCue = value;
    this.plugin.markDirty({ refreshSidebar: true });
    await this.plugin.flushSave();
    this.plugin.refreshUi();
  }
  async persistExcludedFolders(value) {
    this.plugin.settings.excludedFolders = normalizeExcludedFolders(value.split(/\r?\n/));
    this.plugin.pruneExcludedTrackedFiles();
    this.plugin.syncTodayHistory();
    this.plugin.markDirty({ refreshSidebar: true });
    await this.plugin.flushSave();
    this.plugin.refreshUi();
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian3.Setting(containerEl).setName("Webhook").setHeading();
    new import_obsidian3.Setting(containerEl).setName("Webhook URL").setDesc("POST endpoint for the daily goal notification. Requests are sent only to the URL you enter.").addText(
      (t) => t.setPlaceholder("https://hook.example.com/...").setValue(this.plugin.settings.webhookUrl).onChange((v) => {
        void this.persistWebhookUrl(v).catch((err) => console.error("Failed to save webhook URL:", err));
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Test webhook").setDesc("Send one test payload to the configured webhook URL.").addButton(
      (button) => button.setButtonText("Send test webhook").onClick(() => {
        void this.runTestWebhook(button).catch((err) => console.error("Failed to send test webhook:", err));
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Daily word goal").setDesc("New words needed to trigger the webhook").addText(
      (t) => t.setPlaceholder("500").setValue(String(this.plugin.settings.dailyGoal)).onChange((v) => {
        void this.persistDailyWordGoal(v).catch((err) => console.error("Failed to save daily word goal:", err));
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Heatmap").setHeading();
    const colorSetting = new import_obsidian3.Setting(containerEl).setName("Heatmap colour").setDesc("Choose a colour for the heatmap");
    const swatchContainer = colorSetting.controlEl.createDiv({ cls: "wg-color-swatches" });
    const currentColor = normalizeHexColor(this.plugin.settings.heatmapColor) ?? COLOR_PRESETS[0].hex;
    const presetColors = new Set(COLOR_PRESETS.map((preset) => preset.hex));
    const currentIsPreset = presetColors.has(currentColor);
    for (const preset of COLOR_PRESETS) {
      const swatch = swatchContainer.createDiv({ cls: "wg-color-swatch" });
      swatch.style.backgroundColor = preset.hex;
      swatch.setAttribute("aria-label", preset.label);
      if (currentColor === preset.hex) {
        swatch.addClass("wg-swatch-active");
      }
      swatch.addEventListener("click", () => {
        void this.applyHeatmapColor(preset.hex).catch((err) => console.error("Failed to save heatmap colour:", err));
      });
    }
    if (!currentIsPreset) {
      const customSwatch = swatchContainer.createDiv({ cls: "wg-color-swatch wg-swatch-active" });
      customSwatch.style.backgroundColor = currentColor;
      customSwatch.setAttribute("aria-label", `Custom ${currentColor}`);
      customSwatch.addEventListener("click", () => {
        void this.applyHeatmapColor(currentColor).catch((err) => console.error("Failed to save custom heatmap colour:", err));
      });
    }
    new import_obsidian3.Setting(containerEl).setName("Custom hex colour").setDesc("Enter a 6-digit hex colour").addText((text) => {
      const initialValue = currentIsPreset ? "" : currentColor;
      text.setPlaceholder("#ff6b6b").setValue(initialValue).onChange((value) => {
        this.updateCustomColorInput(text.inputEl, value);
        const normalized = normalizeHexColor(value);
        if (!normalized)
          return;
        void this.applyHeatmapColor(normalized).catch((err) => console.error("Failed to save custom heatmap colour:", err));
      });
      this.updateCustomColorInput(text.inputEl, initialValue);
    });
    new import_obsidian3.Setting(containerEl).setName("Goal-met visual cue").setDesc("Show the small marker on days where the daily word goal was met").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.showGoalMetCue).onChange((value) => {
        void this.persistGoalMetCue(value).catch((err) => console.error("Failed to save goal-met cue setting:", err));
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Counting").setHeading();
    new import_obsidian3.Setting(containerEl).setName("Excluded folders").setDesc("One folder path per line. Notes inside these folders do not count toward daily progress.").addTextArea((text) => {
      text.setPlaceholder("Zettelkasten/Notes/").setValue(this.plugin.settings.excludedFolders.join("\n")).onChange((value) => {
        void this.persistExcludedFolders(value).catch((err) => console.error("Failed to save excluded folders:", err));
      });
      text.inputEl.rows = 4;
    });
  }
};

// src/tracking-controller.ts
var import_obsidian4 = require("obsidian");

// src/path-inflight.ts
var PathInFlightGate = class {
  constructor() {
    this.inFlight = /* @__PURE__ */ new Map();
  }
  async run(path, work) {
    const existing = this.inFlight.get(path);
    if (existing) {
      await existing;
      return false;
    }
    const pending = (async () => {
      await work();
    })();
    this.inFlight.set(path, pending);
    try {
      await pending;
      return true;
    } finally {
      if (this.inFlight.get(path) === pending) {
        this.inFlight.delete(path);
      }
    }
  }
};

// src/tracking-state.ts
function normalizeWordCount(words) {
  return typeof words === "number" && Number.isFinite(words) ? Math.max(0, Math.floor(words)) : 0;
}
function cloneLastObserved(lastObservedWordsByPath) {
  return new Map(lastObservedWordsByPath);
}
function createTrackingState(activeDay) {
  return {
    activeDay: normalizeActiveDay(activeDay.date, activeDay),
    lastObservedWordsByPath: /* @__PURE__ */ new Map()
  };
}
function getTrackingTotal(state) {
  return getTodayTotal(state.activeDay);
}
function rollTrackingStateToDate(state, dateKey) {
  if (state.activeDay.date === dateKey) {
    return {
      state,
      previousDate: null,
      previousTotal: 0,
      changed: false
    };
  }
  const previousDate = state.activeDay.date || null;
  const previousTotal = previousDate ? getTodayTotal(state.activeDay) : 0;
  return {
    state: {
      activeDay: createEmptyActiveDay(dateKey),
      lastObservedWordsByPath: /* @__PURE__ */ new Map()
    },
    previousDate,
    previousTotal,
    changed: true
  };
}
function hasDuplicateObservation(state, path, words) {
  const normalizedWords = normalizeWordCount(words);
  return state.lastObservedWordsByPath.get(path) === normalizedWords && state.activeDay.files[path]?.latestWords === normalizedWords;
}
function recordObservedFileWords(state, dateKey, path, words, observedAt) {
  const normalizedWords = normalizeWordCount(words);
  const currentState = state.activeDay.date === dateKey ? state : rollTrackingStateToDate(state, dateKey).state;
  if (hasDuplicateObservation(currentState, path, normalizedWords)) {
    return { state: currentState, changed: false, duplicate: true };
  }
  const existing = currentState.activeDay.files[path];
  const previousWords = currentState.lastObservedWordsByPath.get(path);
  const baselineOverride = existing ? void 0 : previousWords;
  const activeDay = recordFileObservation(
    currentState.activeDay,
    dateKey,
    path,
    normalizedWords,
    observedAt,
    baselineOverride
  );
  const lastObservedWordsByPath = cloneLastObserved(currentState.lastObservedWordsByPath);
  lastObservedWordsByPath.set(path, normalizedWords);
  return {
    state: { activeDay, lastObservedWordsByPath },
    changed: true,
    duplicate: false
  };
}
function shouldRepairStoredBaseline(existing, storedWords) {
  if (!existing)
    return false;
  const normalizedStoredWords = normalizeWordCount(storedWords);
  return normalizedStoredWords < existing.baselineWords && existing.latestWords === existing.baselineWords;
}
function initializeFileBaselineFromStoredSnapshot(state, dateKey, path, storedWords, observedAt, liveWords) {
  const normalizedStoredWords = normalizeWordCount(storedWords);
  const normalizedLiveWords = normalizeWordCount(liveWords);
  const currentState = state.activeDay.date === dateKey ? state : rollTrackingStateToDate(state, dateKey).state;
  const activeDay = normalizeActiveDay(dateKey, currentState.activeDay);
  const existing = activeDay.files[path];
  const lastObservedWordsByPath = cloneLastObserved(currentState.lastObservedWordsByPath);
  if (!existing) {
    activeDay.files[path] = {
      baselineWords: normalizedStoredWords,
      latestWords: normalizedStoredWords,
      latestObservedAt: observedAt
    };
    lastObservedWordsByPath.set(path, liveWords === void 0 ? normalizedStoredWords : normalizedLiveWords);
    return {
      state: { activeDay, lastObservedWordsByPath },
      initialized: true,
      repaired: false,
      nextLastObservedWords: liveWords === void 0 ? normalizedStoredWords : normalizedLiveWords
    };
  }
  if (shouldRepairStoredBaseline(existing, normalizedStoredWords)) {
    activeDay.files[path] = {
      baselineWords: normalizedStoredWords,
      latestWords: Math.max(
        normalizedStoredWords,
        existing.latestWords > existing.baselineWords ? existing.latestWords : normalizedStoredWords
      ),
      latestObservedAt: Math.max(existing.latestObservedAt, observedAt)
    };
    const nextLastObservedWords2 = Math.max(existing.latestWords, normalizedLiveWords);
    lastObservedWordsByPath.set(path, nextLastObservedWords2);
    return {
      state: { activeDay, lastObservedWordsByPath },
      initialized: false,
      repaired: true,
      nextLastObservedWords: nextLastObservedWords2
    };
  }
  const nextLastObservedWords = Math.max(existing.latestWords, normalizedLiveWords);
  lastObservedWordsByPath.set(path, nextLastObservedWords);
  return {
    state: { activeDay, lastObservedWordsByPath },
    initialized: false,
    repaired: false,
    nextLastObservedWords
  };
}
function renameTrackedFile(state, oldPath, newPath) {
  if (oldPath === newPath)
    return { state, changed: false };
  const activeDay = renameFileProgress(state.activeDay, oldPath, newPath);
  const lastObservedWordsByPath = cloneLastObserved(state.lastObservedWordsByPath);
  const previousWords = lastObservedWordsByPath.get(oldPath);
  if (previousWords !== void 0) {
    lastObservedWordsByPath.delete(oldPath);
    lastObservedWordsByPath.set(newPath, previousWords);
  }
  return {
    state: { activeDay, lastObservedWordsByPath },
    changed: activeDay !== state.activeDay || previousWords !== void 0
  };
}
function removeTrackedFile(state, path) {
  const activeDay = removeFileProgress(state.activeDay, path);
  const lastObservedWordsByPath = cloneLastObserved(state.lastObservedWordsByPath);
  const hadObservedWords = lastObservedWordsByPath.delete(path);
  return {
    state: { activeDay, lastObservedWordsByPath },
    changed: activeDay !== state.activeDay || hadObservedWords
  };
}
function removeTrackedFilesWhere(state, shouldRemove) {
  let nextState = state;
  let changed = false;
  const paths = /* @__PURE__ */ new Set([
    ...Object.keys(state.activeDay.files),
    ...state.lastObservedWordsByPath.keys()
  ]);
  for (const path of paths) {
    if (!shouldRemove(path))
      continue;
    const result = removeTrackedFile(nextState, path);
    nextState = result.state;
    changed = result.changed || changed;
  }
  return { state: nextState, changed };
}

// src/tracking-controller.ts
var DEBUG_OBSERVATION_DIAGNOSTICS = false;
function logObservationDiagnostic(event, details) {
  if (!DEBUG_OBSERVATION_DIAGNOSTICS)
    return;
  console.debug(`[word-goal][tracking] ${event}`, details);
}
function setTrackedEditorPath(filePathByEditor, editorByFilePath, editor, path) {
  const previousPath = filePathByEditor.get(editor);
  if (previousPath && previousPath !== path && editorByFilePath.get(previousPath) === editor) {
    editorByFilePath.delete(previousPath);
  }
  const previousEditor = editorByFilePath.get(path);
  if (previousEditor && previousEditor !== editor && filePathByEditor.get(previousEditor) === path) {
    filePathByEditor.delete(previousEditor);
  }
  filePathByEditor.set(editor, path);
  editorByFilePath.set(path, editor);
}
var TrackingController = class {
  constructor(deps) {
    this.deps = deps;
    this.filePathByEditor = /* @__PURE__ */ new Map();
    this.editorByFilePath = /* @__PURE__ */ new Map();
    this.fileInitializationGate = new PathInFlightGate();
    this.openViewSnapshotRetryTimer = null;
    this.hasCompletedInitialHydration = false;
    this.state = createTrackingState(deps.getActiveDay());
  }
  total() {
    this.ensureCurrentDay();
    return getTrackingTotal(this.state);
  }
  replaceActiveDay(activeDay, options) {
    const lastObservedWordsByPath = options.preserveLastObserved ? this.state.lastObservedWordsByPath : /* @__PURE__ */ new Map();
    this.applyState({ activeDay, lastObservedWordsByPath });
  }
  async handleLayoutReady() {
    await this.deps.reloadSyncedData();
    this.hasCompletedInitialHydration = true;
    const initialized = await this.finalizeOpenViewSnapshotsIfChanged("layout ready");
    if (!initialized) {
      this.scheduleOpenViewSnapshotRetry();
    }
    return initialized;
  }
  handleEditorChange(editor) {
    if (!this.hasCompletedInitialHydration)
      return;
    this.ensureCurrentDay();
    const view = this.resolveMarkdownViewForEditor(editor);
    const file = view?.file;
    if (!file || !(file instanceof import_obsidian4.TFile))
      return;
    const previousPath = this.filePathByEditor.get(editor);
    if (this.deps.isFileExcluded(file.path)) {
      const result = removeTrackedFilesWhere(
        this.state,
        (path) => path === file.path || path === previousPath
      );
      this.applyState(result.state);
      this.filePathByEditor.delete(editor);
      if (previousPath)
        this.editorByFilePath.delete(previousPath);
      this.editorByFilePath.delete(file.path);
      if (result.changed)
        this.deps.onProgressChanged();
      return;
    }
    if (previousPath && previousPath !== file.path) {
      const result = renameTrackedFile(this.state, previousPath, file.path);
      this.applyState(result.state);
      if (result.changed) {
        this.deps.onProgressChanged();
      }
    }
    setTrackedEditorPath(this.filePathByEditor, this.editorByFilePath, editor, file.path);
    void this.observeLiveEditorWords(file, editor, "editor-change").catch((err) => console.error("Failed to track editor change:", err));
  }
  handleActiveLeafChange(leaf) {
    this.refreshMarkdownEditorCache();
    void this.finalizeSnapshotFromLeafIfChanged(leaf, "active leaf").catch((err) => console.error("Failed to initialize snapshot from active leaf:", err));
  }
  handleFileOpen(file) {
    if (file.extension !== "md")
      return;
    if (this.deps.isFileExcluded(file.path)) {
      this.removeFileIfTracked(file.path);
      return;
    }
    this.refreshMarkdownEditorCache();
    const leaf = this.findMarkdownLeafByPath(file.path);
    void this.finalizeSnapshotFromLeafIfChanged(leaf, "file open").catch((err) => console.error("Failed to initialize snapshot from opened file:", err));
  }
  async handleVaultModify(file) {
    if (!this.hasCompletedInitialHydration || file.extension !== "md")
      return;
    if (this.deps.isFileExcluded(file.path)) {
      this.removeFileIfTracked(file.path);
      return;
    }
    await this.deps.reloadSyncedData();
    const liveEditor = this.editorByFilePath.get(file.path);
    if (liveEditor) {
      await this.observeLiveEditorWords(file, liveEditor, "vault-modify-live-editor");
    } else {
      const words = await this.countStoredFileWords(file);
      if (hasDuplicateObservation(this.state, file.path, words))
        return;
      if (!this.state.activeDay.files[file.path]) {
        const changed = await this.ensureFileProgressInitializedFromStorage(file, "vault-modify-stored-file", words);
        if (changed) {
          this.deps.onProgressChanged();
        }
        return;
      }
      if (this.observeFileWords(file, words, "vault-modify-stored-file")) {
        this.deps.onProgressChanged();
      }
    }
  }
  handleFileRename(file, oldPath) {
    if (!this.hasCompletedInitialHydration)
      return;
    this.ensureCurrentDay();
    if (this.deps.isFileExcluded(file.path)) {
      const result2 = removeTrackedFilesWhere(
        this.state,
        (path) => path === oldPath || path === file.path
      );
      this.applyState(result2.state);
      const editor2 = this.editorByFilePath.get(oldPath);
      if (editor2) {
        this.editorByFilePath.delete(oldPath);
        this.filePathByEditor.delete(editor2);
      }
      this.editorByFilePath.delete(file.path);
      if (result2.changed) {
        this.deps.onProgressChanged();
      }
      return;
    }
    if (this.deps.isFileExcluded(oldPath)) {
      this.editorByFilePath.delete(oldPath);
      this.refreshMarkdownEditorCache();
      return;
    }
    const result = renameTrackedFile(this.state, oldPath, file.path);
    this.applyState(result.state);
    const editor = this.editorByFilePath.get(oldPath);
    if (editor) {
      this.editorByFilePath.delete(oldPath);
      setTrackedEditorPath(this.filePathByEditor, this.editorByFilePath, editor, file.path);
    }
    if (result.changed) {
      this.deps.onProgressChanged();
    }
  }
  pruneExcludedFiles() {
    const result = removeTrackedFilesWhere(this.state, (path) => this.deps.isFileExcluded(path));
    this.applyState(result.state);
    if (result.changed) {
      this.deps.onProgressChanged();
    }
    return result.changed;
  }
  finalizeToday() {
    if (this.state.activeDay.date) {
      this.deps.onPreviousDayFinalized(this.state.activeDay.date, getTrackingTotal(this.state));
    }
  }
  dispose() {
    if (this.openViewSnapshotRetryTimer !== null) {
      window.clearTimeout(this.openViewSnapshotRetryTimer);
      this.openViewSnapshotRetryTimer = null;
    }
  }
  applyState(state) {
    this.state = state;
    this.deps.setActiveDay(state.activeDay);
  }
  ensureCurrentDay() {
    const today = this.deps.todayKey();
    if (this.state.activeDay.date === today)
      return;
    const result = rollTrackingStateToDate(this.state, today);
    if (result.previousDate) {
      this.deps.onPreviousDayFinalized(result.previousDate, result.previousTotal);
    }
    if (result.changed) {
      this.applyState(result.state);
      if (this.hasCompletedInitialHydration) {
        void this.finalizeOpenViewSnapshotsIfChanged("day rollover").catch((err) => console.error("Failed to initialize snapshots after day rollover:", err));
      }
    }
  }
  resolveMarkdownViewForEditor(editor) {
    const leaves = this.deps.app.workspace.getLeavesOfType("markdown");
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view instanceof import_obsidian4.MarkdownView && view.file && view.editor === editor) {
        return view;
      }
    }
    return null;
  }
  findMarkdownLeafByPath(path) {
    for (const leaf of this.deps.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (view instanceof import_obsidian4.MarkdownView && view.file?.path === path) {
        return leaf;
      }
    }
    return null;
  }
  async observeLiveEditorWords(file, editor, source) {
    if (this.deps.isFileExcluded(file.path)) {
      this.removeFileIfTracked(file.path);
      return;
    }
    const words = this.countEditorWords(file, editor);
    if (hasDuplicateObservation(this.state, file.path, words))
      return;
    if (!this.state.activeDay.files[file.path]) {
      await this.ensureFileProgressInitializedFromStorage(file, source, words);
    }
    if (this.observeFileWords(file, words, source)) {
      this.deps.onProgressChanged();
    }
  }
  observeFileWords(file, words, source, observedAt = Date.now()) {
    if (this.deps.isFileExcluded(file.path)) {
      this.removeFileIfTracked(file.path);
      return false;
    }
    this.ensureCurrentDay();
    const result = recordObservedFileWords(
      this.state,
      this.deps.todayKey(),
      file.path,
      words,
      observedAt
    );
    this.applyState(result.state);
    logObservationDiagnostic("observe-file-words", {
      path: file.path,
      source,
      words,
      observedAt,
      changed: result.changed,
      duplicate: result.duplicate,
      baselineWords: this.state.activeDay.files[file.path]?.baselineWords,
      latestWords: this.state.activeDay.files[file.path]?.latestWords
    });
    return result.changed;
  }
  async ensureFileProgressInitializedFromStorage(file, source, liveWords) {
    if (this.deps.isFileExcluded(file.path)) {
      this.removeFileIfTracked(file.path);
      return false;
    }
    this.ensureCurrentDay();
    const path = file.path;
    const dateKey = this.deps.todayKey();
    let changed = false;
    await this.fileInitializationGate.run(path, async () => {
      const storedWords = await this.countStoredFileWords(file);
      const result = initializeFileBaselineFromStoredSnapshot(
        this.state,
        dateKey,
        path,
        storedWords,
        Date.now(),
        liveWords
      );
      this.applyState(result.state);
      if (!result.initialized && !result.repaired) {
        logObservationDiagnostic("skip-storage-backed-initialization", {
          path,
          source,
          storedWords,
          liveWords,
          existingBaselineWords: this.state.activeDay.files[path]?.baselineWords,
          existingLatestWords: this.state.activeDay.files[path]?.latestWords
        });
        return;
      }
      changed = true;
      logObservationDiagnostic("apply-storage-backed-initialization", {
        path,
        source,
        storedWords,
        liveWords,
        initialized: result.initialized,
        repaired: result.repaired,
        baselineWords: this.state.activeDay.files[path]?.baselineWords,
        latestWords: this.state.activeDay.files[path]?.latestWords,
        nextLastObservedWords: result.nextLastObservedWords
      });
    });
    return changed;
  }
  async initializeSnapshotFromLeaf(leaf) {
    if (!leaf)
      return false;
    const view = leaf.view;
    if (!(view instanceof import_obsidian4.MarkdownView))
      return false;
    const file = view.file;
    if (!file)
      return false;
    if (this.deps.isFileExcluded(file.path)) {
      this.removeFileIfTracked(file.path);
      return false;
    }
    if (!this.hasCompletedInitialHydration)
      return false;
    try {
      return await this.ensureFileProgressInitializedFromStorage(file, "initialize-snapshot-from-leaf");
    } catch (err) {
      console.error("Failed to initialize snapshot from stored file:", err);
      return false;
    }
  }
  async finalizeSnapshotFromLeafIfChanged(leaf, source) {
    try {
      const changed = await this.initializeSnapshotFromLeaf(leaf);
      if (changed)
        this.deps.onProgressChanged();
      return changed;
    } catch (err) {
      console.error(`Failed to initialize snapshot from ${source}:`, err);
      return false;
    }
  }
  async initializeOpenViewSnapshots() {
    let changed = false;
    const leavesByPath = /* @__PURE__ */ new Map();
    for (const leaf of this.deps.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (!(view instanceof import_obsidian4.MarkdownView) || !view.file)
        continue;
      if (this.deps.isFileExcluded(view.file.path))
        continue;
      leavesByPath.set(view.file.path, leaf);
    }
    for (const leaf of leavesByPath.values()) {
      changed = await this.initializeSnapshotFromLeaf(leaf) || changed;
    }
    return changed;
  }
  async finalizeOpenViewSnapshotsIfChanged(source) {
    try {
      const changed = await this.initializeOpenViewSnapshots();
      if (changed)
        this.deps.onProgressChanged();
      return changed;
    } catch (err) {
      console.error(`Failed to initialize open view snapshots from ${source}:`, err);
      return false;
    }
  }
  scheduleOpenViewSnapshotRetry() {
    if (this.openViewSnapshotRetryTimer !== null) {
      window.clearTimeout(this.openViewSnapshotRetryTimer);
    }
    this.openViewSnapshotRetryTimer = window.setTimeout(() => {
      this.openViewSnapshotRetryTimer = null;
      void this.finalizeOpenViewSnapshotsIfChanged("post-layout retry").catch((err) => console.error("Failed to initialize snapshots after layout retry:", err));
    }, 1e3);
  }
  refreshMarkdownEditorCache() {
    this.filePathByEditor.clear();
    this.editorByFilePath.clear();
    for (const leaf of this.deps.app.workspace.getLeavesOfType("markdown")) {
      const view = leaf.view;
      if (!(view instanceof import_obsidian4.MarkdownView) || !view.file)
        continue;
      if (this.deps.isFileExcluded(view.file.path))
        continue;
      setTrackedEditorPath(this.filePathByEditor, this.editorByFilePath, view.editor, view.file.path);
    }
  }
  removeFileIfTracked(path) {
    const result = removeTrackedFile(this.state, path);
    this.applyState(result.state);
    if (result.changed) {
      this.deps.onProgressChanged();
    }
    return result.changed;
  }
  countEditorWords(file, editor) {
    return countMeaningfulWords(editor.getValue(), this.deps.app.metadataCache.getCache(file.path));
  }
  async countStoredFileWords(file) {
    const content = await this.deps.app.vault.cachedRead(file);
    return countMeaningfulWords(content, this.deps.app.metadataCache.getCache(file.path));
  }
};

// src/ui/status-bar.ts
function renderStatusBar(statusBarEl, total, settings) {
  if (!statusBarEl)
    return;
  const goal = settings.dailyGoal;
  const pct = Math.min(total / goal, 1);
  const dotColor = lerpColor("#555555", settings.heatmapColor, pct);
  statusBarEl.empty();
  const dot = statusBarEl.createSpan({ cls: "wg-sb-dot" });
  dot.style.backgroundColor = dotColor;
  statusBarEl.createSpan({ text: ` ${total} / ${goal}`, cls: "wg-sb-text" });
}

// src/webhook.ts
function getWebhookDependencies() {
  const obsidian = require("obsidian");
  return {
    Notice: obsidian.Notice,
    requestUrl: obsidian.requestUrl
  };
}
function isWebhookConfigured(settings) {
  return settings.webhookUrl.trim().length > 0;
}
function shouldMarkWebhookHandled(settings, sent) {
  return sent || !isWebhookConfigured(settings);
}
function buildWebhookPayload(options) {
  return {
    event: "daily_word_goal_reached",
    goal: options.settings.dailyGoal,
    actual: options.actual,
    date: options.date,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    test: options.test
  };
}
async function sendWebhook(options, dependencies) {
  const url = options.settings.webhookUrl.trim();
  if (!url) {
    return false;
  }
  const { Notice: Notice4, requestUrl } = dependencies ?? getWebhookDependencies();
  try {
    await requestUrl({
      url,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildWebhookPayload(options))
    });
    new Notice4(options.test ? "Word Goal: Test Webhook Sent \u2713" : "Word Goal: Webhook Sent \u2713");
    return true;
  } catch (err) {
    console.error("Word Goal webhook error:", err);
    new Notice4(options.test ? "Word Goal: Test Webhook Failed." : "Word Goal: Webhook Failed.");
    return false;
  }
}

// src/views/sidebar-heatmap-view.ts
var import_obsidian6 = require("obsidian");

// src/stats.ts
var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function getStreakCardState(current, longest) {
  if (current <= 0)
    return "idle";
  return current === longest ? "best-active" : "active";
}
function intensityLevel(words, max) {
  if (words === 0)
    return 0;
  const ratio = words / max;
  if (ratio <= 0.25)
    return 1;
  if (ratio <= 0.5)
    return 2;
  if (ratio <= 0.75)
    return 3;
  return 4;
}
function historyKeysByPredicate(history, matches, year) {
  return Object.entries(history).filter(([key, rec]) => matches(rec) && (year === void 0 || key.startsWith(`${year}-`))).map(([key]) => key).sort();
}
function previousDayKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return dateToKey(date);
}
function calcCurrentStreakFromSet(keys, anchor) {
  let current = 0;
  let cursor = new Date(anchor);
  let skippedAnchor = false;
  while (true) {
    const key = dateToKey(cursor);
    if (keys.has(key)) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (current === 0 && !skippedAnchor) {
      skippedAnchor = true;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    return current;
  }
}
function calcLongestStreak(keys) {
  let longest = 0;
  let streak = 0;
  let prev = null;
  for (const key of keys) {
    if (prev && previousDayKey(key) === prev) {
      streak++;
    } else {
      streak = 1;
    }
    if (streak > longest)
      longest = streak;
    prev = key;
  }
  return longest;
}
function calcStreaksFromKeys(keys, year) {
  if (keys.length === 0)
    return { current: 0, longest: 0 };
  const keySet = new Set(keys);
  const anchor = year === void 0 || year === (/* @__PURE__ */ new Date()).getFullYear() ? /* @__PURE__ */ new Date() : new Date(year, 11, 31);
  return {
    current: calcCurrentStreakFromSet(keySet, anchor),
    longest: calcLongestStreak(keys)
  };
}
function calcStreaks(history, matches, year) {
  return calcStreaksFromKeys(historyKeysByPredicate(history, matches, year), year);
}
function isWritingDay(record) {
  return record.totalWords > 0;
}
function isGoalMetDay(record) {
  return record.goalMet === true;
}
function yearMax(history, year) {
  let max = 1;
  for (const [key, rec] of Object.entries(history)) {
    if (key.startsWith(`${year}-`) && rec.totalWords > max)
      max = rec.totalWords;
  }
  return max;
}
function yearStats(history, year) {
  let total = 0, days = 0;
  for (const [key, rec] of Object.entries(history)) {
    if (!key.startsWith(`${year}-`))
      continue;
    if (rec.totalWords > 0) {
      total += rec.totalWords;
      days++;
    }
  }
  return { total, days, avg: days > 0 ? Math.round(total / days) : 0 };
}
function getMonthlySums(history, year) {
  const sums = Array.from({ length: 12 }, () => 0);
  for (const [key, rec] of Object.entries(history)) {
    if (!key.startsWith(`${year}-`))
      continue;
    sums[parseInt(key.slice(5, 7), 10) - 1] += rec.totalWords;
  }
  return sums;
}
function getHeatmapCellState(history, date, max) {
  const key = dateToKey(date);
  const record = history[key];
  const words = record?.totalWords ?? 0;
  return {
    words,
    level: intensityLevel(words, max),
    goalMet: record?.goalMet === true
  };
}
function buildYearGrid(year) {
  const jan1 = new Date(year, 0, 1);
  const startDow = (jan1.getDay() + 6) % 7;
  const dec31 = new Date(year, 11, 31);
  const totalDays = Math.floor((dec31.getTime() - jan1.getTime()) / 864e5) + 1;
  const totalSlots = startDow + totalDays;
  const totalWeeks = Math.ceil(totalSlots / 7);
  const weeks = [];
  for (let w = 0; w < totalWeeks; w++) {
    const week = [];
    for (let dow = 0; dow < 7; dow++) {
      const di = w * 7 + dow - startDow;
      if (di < 0 || di >= totalDays) {
        week.push({ dayIndex: -1, date: null });
      } else {
        week.push({ dayIndex: di, date: new Date(year, 0, 1 + di) });
      }
    }
    weeks.push(week);
  }
  return weeks;
}

// src/views/detail-modal.ts
var import_obsidian5 = require("obsidian");
var DetailModal = class extends import_obsidian5.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.displayYear = (/* @__PURE__ */ new Date()).getFullYear();
  }
  onOpen() {
    this.modalEl.addClass("wg-detail-modal");
    this.render();
  }
  onClose() {
    this.contentEl.empty();
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    const history = this.plugin.data.history;
    const year = this.displayYear;
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const color = this.plugin.settings.heatmapColor;
    const nav = contentEl.createDiv({ cls: "wg-dt-nav" });
    const btnPrev = nav.createEl("button", { text: "\u2190", cls: "wg-dt-nav-btn" });
    btnPrev.addEventListener("click", () => {
      this.displayYear--;
      this.render();
    });
    nav.createSpan({ text: `${year}`, cls: "wg-dt-year" });
    const btnNext = nav.createEl("button", { text: "\u2192", cls: "wg-dt-nav-btn" });
    btnNext.disabled = year >= currentYear;
    btnNext.addEventListener("click", () => {
      if (this.displayYear >= currentYear)
        return;
      this.displayYear++;
      this.render();
    });
    const stats = yearStats(history, year);
    const statsRow = contentEl.createDiv({ cls: "wg-dt-stats" });
    this.statCard(statsRow, formatLocalizedNumber(stats.total), "Total Words", color);
    this.statCard(statsRow, `${stats.days}`, "Days Written", color);
    this.statCard(statsRow, formatLocalizedNumber(stats.avg), "Daily Average", color);
    const max = yearMax(history, year);
    const weeks = buildYearGrid(year);
    const scrollWrap = contentEl.createDiv({ cls: "wg-dt-scroll-wrap" });
    const scrollInner = scrollWrap.createDiv({ cls: "wg-dt-scroll-inner" });
    const heatWrap = scrollInner.createDiv({ cls: "wg-dt-heatmap" });
    const dayLabels = heatWrap.createDiv({ cls: "wg-dt-daylabels" });
    for (const d of ["Mon", "", "Wed", "", "Fri", "", ""]) {
      dayLabels.createDiv({ cls: "wg-dt-daylabel", text: d });
    }
    const grid = heatWrap.createDiv({ cls: "wg-dt-grid" });
    for (let w = 0; w < weeks.length; w++) {
      const col = grid.createDiv({ cls: "wg-dt-col" });
      for (const slot of weeks[w]) {
        if (!slot.date) {
          col.createDiv({ cls: "wg-dt-cell wg-dt-blank" });
          continue;
        }
        const { words, level, goalMet } = getHeatmapCellState(history, slot.date, max);
        const cell = col.createDiv({ cls: "wg-dt-cell" });
        if (level > 0) {
          cell.style.backgroundColor = hexToRgba(color, LEVEL_ALPHA[level]);
        } else {
          cell.addClass("wg-dt-cell-zero");
        }
        if (goalMet && this.plugin.settings.showGoalMetCue)
          cell.addClass("wg-cell-goal-met");
        if (isToday(slot.date)) {
          cell.addClass("wg-day-today");
          cell.style.setProperty("--wg-today-accent", color);
        }
        const dateStr = formatLocalizedDate(slot.date, {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric"
        });
        cell.dataset.tooltip = `${dateStr}: ${words} Words`;
        cell.addClass("wg-tooltip");
      }
    }
    const legend = contentEl.createDiv({ cls: "wg-dt-legend" });
    legend.createSpan({ text: "Less", cls: "wg-dt-legend-text" });
    for (let i = 0; i <= 4; i++) {
      const c = legend.createDiv({ cls: "wg-dt-cell wg-dt-legend-cell" });
      if (i > 0)
        c.style.backgroundColor = hexToRgba(color, LEVEL_ALPHA[i]);
      else
        c.addClass("wg-dt-cell-zero");
    }
    legend.createSpan({ text: "More", cls: "wg-dt-legend-text" });
    const sums = getMonthlySums(history, year);
    const maxMonth = Math.max(...sums, 1);
    const monthlyWrap = contentEl.createDiv({ cls: "wg-dt-monthly" });
    monthlyWrap.createEl("h4", { text: "Monthly breakdown", cls: "wg-dt-monthly-title" });
    const monthGrid = monthlyWrap.createDiv({ cls: "wg-dt-month-grid" });
    for (let i = 0; i < 12; i++) {
      const row = monthGrid.createDiv({ cls: "wg-dt-month-row" });
      row.createSpan({ text: MONTHS[i], cls: "wg-dt-month-name" });
      const barWrap = row.createDiv({ cls: "wg-dt-bar-wrap" });
      const bar = barWrap.createDiv({ cls: "wg-dt-bar" });
      bar.style.width = `${sums[i] / maxMonth * 100}%`;
      bar.style.backgroundColor = hexToRgba(color, 0.7);
      row.createSpan({ text: formatLocalizedNumber(sums[i]), cls: "wg-dt-month-val" });
    }
  }
  statCard(parent, value, label, color) {
    const card = parent.createDiv({ cls: "wg-dt-stat" });
    const num = card.createDiv({ text: value, cls: "wg-dt-stat-num" });
    num.style.color = color;
    for (const line of label.split("\n")) {
      card.createDiv({ text: line, cls: "wg-dt-stat-label" });
    }
  }
};

// src/views/sidebar-heatmap-view.ts
var VIEW_TYPE_HEATMAP = "word-goal-heatmap-view";
var SidebarHeatmapView = class extends import_obsidian6.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.shouldScrollToToday = false;
  }
  getViewType() {
    return VIEW_TYPE_HEATMAP;
  }
  getDisplayText() {
    return "Writing heatmap";
  }
  getIcon() {
    return "flame";
  }
  onOpen() {
    this.shouldScrollToToday = true;
    this.refresh();
    return Promise.resolve();
  }
  refresh() {
    const root = this.contentEl;
    const shouldScrollToToday = this.shouldScrollToToday;
    const previousRootScrollTop = shouldScrollToToday ? 0 : root.scrollTop;
    const previousGridScrollTop = shouldScrollToToday ? 0 : root.querySelector(".wg-sb-grid-container")?.scrollTop ?? 0;
    root.empty();
    root.addClass("wg-sidebar");
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const history = this.plugin.data.history;
    const color = this.plugin.settings.heatmapColor;
    const topBar = root.createDiv({ cls: "wg-sb-topbar" });
    topBar.createDiv({ text: "Writing heatmap", cls: "wg-sb-title" });
    const expandBtn = topBar.createEl("button", { cls: "wg-sb-expand-btn" });
    (0, import_obsidian6.setIcon)(expandBtn, "maximize-2");
    expandBtn.setAttribute("aria-label", "Open detailed stats");
    expandBtn.addEventListener("click", () => new DetailModal(this.app, this.plugin).open());
    const todayWords = this.plugin.todaysTotal();
    const goal = this.plugin.settings.dailyGoal;
    const isOverGoal = todayWords > goal;
    const fillRatio = Math.min(todayWords / goal, 1);
    const goalRatio = isOverGoal ? goal / todayWords : 1;
    const todayEl = root.createDiv({ cls: "wg-sb-today" });
    todayEl.style.setProperty("--wg-progress-color", color);
    todayEl.style.setProperty("--wg-progress-color-soft", hexToRgba(color, 0.18));
    todayEl.style.setProperty("--wg-progress-color-glow", hexToRgba(color, 0.32));
    if (this.plugin.isGoalCelebrating()) {
      todayEl.addClass("wg-sb-today-celebrate");
    }
    todayEl.createSpan({ text: `${todayWords}`, cls: "wg-sb-today-num" });
    const goalEl = todayEl.createSpan({ text: ` / ${goal}`, cls: "wg-sb-today-goal" });
    if (isOverGoal) {
      goalEl.addClass("wg-sb-today-goal-overflow");
    }
    const progressBar = todayEl.createDiv({ cls: "wg-sb-progress" });
    if (isOverGoal) {
      progressBar.addClass("wg-sb-progress-overgoal");
    }
    progressBar.style.setProperty("--wg-progress-fill-ratio", String(fillRatio));
    progressBar.style.setProperty("--wg-progress-goal-ratio", String(goalRatio));
    progressBar.setAttribute("role", "progressbar");
    progressBar.setAttribute("aria-label", "Today's writing progress");
    progressBar.setAttribute("aria-valuemin", "0");
    progressBar.setAttribute("aria-valuemax", String(Math.max(todayWords, goal)));
    progressBar.setAttribute("aria-valuenow", String(todayWords));
    progressBar.setAttribute("aria-valuetext", `${formatLocalizedNumber(todayWords)} Words Written, ${formatLocalizedNumber(goal)} Word Goal`);
    const progressFill = progressBar.createDiv({ cls: "wg-sb-progress-fill" });
    progressFill.setAttribute("aria-hidden", "true");
    const progressDivider = progressBar.createDiv({ cls: "wg-sb-progress-divider" });
    progressDivider.setAttribute("aria-hidden", "true");
    const max = yearMax(history, year);
    const weeks = buildYearGrid(year);
    const gridContainer = root.createDiv({ cls: "wg-sb-grid-container" });
    const grid = gridContainer.createDiv({ cls: "wg-sb-grid" });
    for (let w = 0; w < weeks.length; w++) {
      const row = grid.createDiv({ cls: "wg-sb-row" });
      for (const slot of weeks[w]) {
        if (!slot.date) {
          row.createDiv({ cls: "wg-sb-cell wg-sb-blank" });
          continue;
        }
        const slotDate = slot.date;
        const { words, level, goalMet: goalMet2 } = getHeatmapCellState(history, slotDate, max);
        const cell = row.createDiv({ cls: "wg-sb-cell" });
        if (level > 0) {
          cell.style.backgroundColor = hexToRgba(color, LEVEL_ALPHA[level]);
        } else {
          cell.addClass("wg-sb-cell-empty");
        }
        if (goalMet2 && this.plugin.settings.showGoalMetCue)
          cell.addClass("wg-cell-goal-met");
        if (isToday(slotDate)) {
          cell.addClass("wg-day-today");
          cell.style.setProperty("--wg-today-accent", color);
        }
        const dateStr = formatLocalizedDate(slotDate, { day: "numeric", month: "short" });
        cell.dataset.tooltip = `${dateStr}: ${words}`;
        cell.addClass("wg-tooltip");
        cell.addClass("wg-sb-cell-clickable");
        cell.tabIndex = 0;
        cell.setAttribute("role", "button");
        const openDailyNote = () => {
          void this.openDailyNoteFromSidebar(slotDate).catch((err) => {
            console.error("Failed to open daily note from sidebar:", err);
          });
        };
        cell.addEventListener("click", openDailyNote);
        cell.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " ")
            return;
          event.preventDefault();
          openDailyNote();
        });
      }
    }
    if (shouldScrollToToday) {
      this.shouldScrollToToday = false;
      window.requestAnimationFrame(() => {
        const todayCell = gridContainer.querySelector(".wg-day-today");
        todayCell?.scrollIntoView({ block: "center", inline: "nearest" });
      });
    } else {
      window.requestAnimationFrame(() => {
        root.scrollTop = previousRootScrollTop;
        gridContainer.scrollTop = previousGridScrollTop;
      });
    }
    const streakSection = root.createDiv({ cls: "wg-sb-streak-section" });
    const writing = calcStreaks(history, isWritingDay);
    const goalMet = calcStreaks(history, isGoalMetDay);
    const streakRow = streakSection.createDiv({ cls: "wg-sb-streaks" });
    this.streakCard(streakRow, "\u270D", "Writing Streak", writing.current, writing.longest, color);
    this.streakCard(streakRow, "\u{1F3AF}", "Goal Streak", goalMet.current, goalMet.longest, color);
  }
  async openDailyNoteFromSidebar(date) {
    const result = await this.plugin.openDailyNoteForDate(date);
    if (!result.opened) {
      this.showDailyNoteOpenFailure(date, result);
      return;
    }
    if (!this.app.isMobile)
      return;
    this.collapseMobileSidebar();
  }
  showDailyNoteOpenFailure(date, result) {
    const dateStr = formatLocalizedDate(date, { day: "numeric", month: "short", year: "numeric" });
    if (result.reason === "missing-file") {
      new import_obsidian6.Notice(`No daily note found for ${dateStr}: ${result.path}`);
      return;
    }
    if (result.reason === "invalid-path") {
      new import_obsidian6.Notice(`Could not build a daily note path for ${dateStr}. Check your daily note format.`);
      return;
    }
    new import_obsidian6.Notice("Configure Daily Notes or Periodic Notes to open heatmap days.");
  }
  collapseMobileSidebar() {
    if (this.leaf.parent instanceof import_obsidian6.WorkspaceMobileDrawer) {
      this.leaf.parent.collapse();
      return;
    }
    this.app.workspace.rightSplit.collapse();
  }
  streakCard(parent, icon, title, current, longest, color) {
    const state = getStreakCardState(current, longest);
    const card = parent.createDiv({ cls: "wg-sb-streak-card" });
    card.addClass(`wg-sb-streak-card-${state}`);
    card.style.setProperty("--wg-streak-accent", color);
    card.style.setProperty("--wg-streak-accent-soft", hexToRgba(color, 0.35));
    card.style.setProperty("--wg-streak-accent-strong", hexToRgba(color, 0.95));
    card.style.setProperty("--wg-streak-text-accent", state === "best-active" ? color : hexToRgba(color, 0.8));
    const header = card.createDiv({ cls: "wg-sb-streak-card-header" });
    header.createSpan({ text: icon, cls: "wg-sb-streak-card-icon" });
    header.createSpan({ text: title, cls: "wg-sb-streak-card-title" });
    card.createDiv({ text: `${current} Days`, cls: "wg-sb-streak-card-current" });
    card.createDiv({ text: `Best: ${longest} Days`, cls: "wg-sb-streak-card-best" });
  }
};

// src/views/daily-note-import-modal.ts
var import_obsidian7 = require("obsidian");
function startOfCurrentYear() {
  const now = /* @__PURE__ */ new Date();
  return dateToKey(new Date(now.getFullYear(), 0, 1));
}
function isValidRange(startDate, endDate) {
  try {
    buildDailyNoteImportDateKeys(startDate, endDate);
    return true;
  } catch {
    return false;
  }
}
var DailyNoteImportModal = class extends import_obsidian7.Modal {
  constructor(app, onImport) {
    super(app);
    this.onImport = onImport;
    this.startDate = startOfCurrentYear();
    this.endDate = todayKey();
    this.isImporting = false;
  }
  onOpen() {
    this.render();
  }
  onClose() {
    this.contentEl.empty();
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    const form = contentEl.createEl("form");
    form.createEl("h2", { text: "Import daily note word counts" });
    new import_obsidian7.Setting(form).setName("Start date").setDesc("First daily note date to check").addText((text) => {
      text.inputEl.type = "date";
      text.setValue(this.startDate).onChange((value) => {
        this.startDate = value;
      });
    });
    new import_obsidian7.Setting(form).setName("End date").setDesc("Last daily note date to check").addText((text) => {
      text.inputEl.type = "date";
      text.setValue(this.endDate).onChange((value) => {
        this.endDate = value;
      });
    });
    const actions = form.createDiv({ cls: "modal-button-container" });
    const cancelButton = actions.createEl("button", { text: "Cancel", type: "button" });
    cancelButton.addEventListener("click", () => this.close());
    const importButton = actions.createEl("button", { text: "Import", type: "submit", cls: "mod-cta" });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.submit(importButton);
    });
  }
  async submit(importButton) {
    if (this.isImporting)
      return;
    if (!isValidRange(this.startDate, this.endDate)) {
      new import_obsidian7.Notice("Choose a valid daily note import date range.");
      return;
    }
    this.isImporting = true;
    if (importButton) {
      importButton.disabled = true;
      importButton.textContent = "Importing...";
    }
    try {
      await this.onImport({
        startDate: this.startDate,
        endDate: this.endDate
      });
      this.close();
    } catch (err) {
      console.error("Failed to import daily notes:", err);
      new import_obsidian7.Notice("Daily note import failed.");
      this.isImporting = false;
      if (importButton) {
        importButton.disabled = false;
        importButton.textContent = "Import";
      }
    }
  }
};

// main.ts
var WordGoalWebhookPlugin = class extends import_obsidian8.Plugin {
  constructor() {
    super(...arguments);
    this.data = {
      version: PLUGIN_DATA_VERSION,
      settings: { ...DEFAULT_SETTINGS },
      history: {},
      activeDay: createEmptyActiveDay(todayKey()),
      lastWebhookSentDate: ""
    };
    this.statusBarEl = null;
    this.visibilityHandler = () => {
    };
    this.webhookSendInFlightDate = null;
    this.dataCoordinator = null;
    this.trackingController = null;
    this.celebrateGoalUntil = 0;
    this.celebrateGoalTimer = null;
    this.visibilityDocument = null;
    this.shouldOpenHeatmapOnFirstInstall = false;
  }
  get settings() {
    return this.data.settings;
  }
  get tracker() {
    if (!this.trackingController) {
      throw new Error("Tracking controller is not initialized.");
    }
    return this.trackingController;
  }
  createTrackingController() {
    return new TrackingController({
      app: this.app,
      getActiveDay: () => this.data.activeDay,
      setActiveDay: (activeDay) => {
        this.data.activeDay = activeDay;
      },
      todayKey: () => todayKey(),
      reloadSyncedData: () => this.reloadAndMergeSyncedPluginData(),
      onProgressChanged: () => this.finalizeProgressChange(),
      onPreviousDayFinalized: (dateKey, totalWords) => this.syncHistoryEntry(dateKey, totalWords),
      isFileExcluded: (path) => isPathInExcludedFolder(path, this.settings.excludedFolders)
    });
  }
  createDataCoordinator() {
    return new PluginDataCoordinator({
      adapter: this.app.vault.adapter,
      primaryPath: this.getPluginDataPath(),
      defaultSettings: DEFAULT_SETTINGS,
      version: PLUGIN_DATA_VERSION,
      getTodayKey: () => todayKey(),
      getCurrentData: () => this.data,
      onDataMerged: (data) => this.applyMergedData(data),
      onPendingSidebarRefresh: () => this.refreshSidebar()
    });
  }
  get dataSync() {
    if (!this.dataCoordinator) {
      throw new Error("Plugin data coordinator is not initialized.");
    }
    return this.dataCoordinator;
  }
  onload() {
    void this.loadPlugin().catch((err) => console.error("Failed to load Word Goal plugin:", err));
  }
  async loadPlugin() {
    this.dataCoordinator = this.createDataCoordinator();
    await this.loadPluginData();
    this.trackingController = this.createTrackingController();
    this.pruneExcludedTrackedFiles();
    this.todaysTotal();
    this.syncTodayHistory();
    this.addSettingTab(new WordGoalSettingTab(this.app, this));
    this.registerView(VIEW_TYPE_HEATMAP, (leaf) => new SidebarHeatmapView(leaf, this));
    this.addCommand({
      id: "open-writing-heatmap",
      name: "Open writing heatmap",
      callback: () => {
        void this.activateSidebar().catch((err) => console.error("Failed to open writing heatmap:", err));
      }
    });
    this.addCommand({ id: "open-writing-stats", name: "Open writing stats", callback: () => new DetailModal(this.app, this).open() });
    this.addCommand({ id: "show-daily-word-count", name: "Show today's word count", callback: () => new import_obsidian8.Notice(`Today: ${this.todaysTotal()} / ${this.settings.dailyGoal} Words`) });
    this.addCommand({
      id: "import-daily-stats",
      name: "Import history from daily stats plugin",
      callback: () => {
        void this.importDailyStats().catch((err) => console.error("Failed to import Daily Stats history:", err));
      }
    });
    this.addCommand({
      id: "import-daily-note-word-counts",
      name: "Import word counts from daily notes",
      callback: () => {
        new DailyNoteImportModal(this.app, (range) => this.importDailyNoteWordCounts(range)).open();
      }
    });
    this.registerEvent(
      this.app.workspace.on("editor-change", (editor) => {
        this.tracker.handleEditorChange(editor);
        this.updateStatusBar();
      })
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        this.tracker.handleActiveLeafChange(leaf);
        this.updateStatusBar();
      })
    );
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        if (!(file instanceof import_obsidian8.TFile))
          return;
        this.tracker.handleFileOpen(file);
        this.updateStatusBar();
      })
    );
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (!(file instanceof import_obsidian8.TFile))
          return;
        void this.tracker.handleVaultModify(file).catch((err) => console.error("Failed to handle vault modify:", err));
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        if (!(file instanceof import_obsidian8.TFile))
          return;
        this.tracker.handleFileRename(file, oldPath);
      })
    );
    this.statusBarEl = this.addStatusBarItem();
    this.statusBarEl.addClass("wg-statusbar");
    this.registerInterval(window.setInterval(() => this.updateStatusBar(), 1e3));
    this.updateStatusBar();
    const visibilityDocument = activeDocument;
    this.visibilityDocument = visibilityDocument;
    this.visibilityHandler = () => {
      if (visibilityDocument.visibilityState === "hidden") {
        this.syncTodayHistory();
        this.markDirty({ refreshSidebar: true });
        void this.flushSave().catch((err) => console.error("Failed to flush plugin data on background:", err));
        return;
      }
      void this.reloadSyncedDataAndRefreshUi().catch((err) => console.error("Failed to reload synced plugin data:", err));
    };
    visibilityDocument.addEventListener("visibilitychange", this.visibilityHandler);
    this.app.workspace.onLayoutReady(() => {
      void this.handleLayoutReady().catch((err) => console.error("Failed during layout-ready initialization:", err));
    });
  }
  onunload() {
    this.visibilityDocument?.removeEventListener("visibilitychange", this.visibilityHandler);
    this.visibilityDocument = null;
    if (this.celebrateGoalTimer !== null) {
      window.clearTimeout(this.celebrateGoalTimer);
      this.celebrateGoalTimer = null;
    }
    this.dataCoordinator?.dispose();
    this.trackingController?.dispose();
    this.finalizeToday();
    this.markDirty({ refreshSidebar: false });
    void this.flushSave().catch((err) => console.error("Failed to flush plugin data on unload:", err));
  }
  todaysTotal() {
    return this.trackingController ? this.tracker.total() : getTodayTotal(this.data.activeDay);
  }
  syncTodayHistory() {
    this.syncHistoryEntry(todayKey(), this.todaysTotal());
  }
  syncHistoryEntry(dateKey, totalWords) {
    const existing = this.data.history[dateKey];
    if (totalWords > 0) {
      this.data.history[dateKey] = {
        totalWords,
        goalMet: existing?.goalMet === true || totalWords >= this.settings.dailyGoal,
        updatedAt: Date.now()
      };
      return;
    }
    if (existing?.totalWords && existing.totalWords > 0)
      return;
    delete this.data.history[dateKey];
  }
  finalizeToday() {
    this.trackingController?.finalizeToday();
  }
  finalizeProgressChange() {
    this.syncTodayHistory();
    this.markDirty({ refreshSidebar: true });
    this.scheduleSave();
    this.refreshUi();
    this.maybeCelebrateGoal();
  }
  async handleLayoutReady() {
    const initialized = await this.tracker.handleLayoutReady();
    if (!initialized) {
      this.syncTodayHistory();
      this.refreshUi();
    }
    if (this.shouldOpenHeatmapOnFirstInstall) {
      this.shouldOpenHeatmapOnFirstInstall = false;
      await this.activateSidebar();
      this.markDirty({ refreshSidebar: false });
      await this.flushSave();
    }
  }
  maybeCelebrateGoal() {
    if (this.todaysTotal() >= this.settings.dailyGoal && this.data.lastWebhookSentDate !== this.data.activeDay.date && this.webhookSendInFlightDate !== this.data.activeDay.date) {
      this.webhookSendInFlightDate = this.data.activeDay.date;
      this.triggerGoalCelebration();
      new import_obsidian8.Notice(`\u{1F389} You Hit ${this.settings.dailyGoal} Words Today!`);
      void this.fireWebhook().catch((err) => console.error("Failed to send goal webhook:", err));
    }
  }
  isGoalCelebrating() {
    return this.celebrateGoalUntil > Date.now();
  }
  triggerGoalCelebration() {
    this.celebrateGoalUntil = Date.now() + 2200;
    if (this.celebrateGoalTimer !== null) {
      window.clearTimeout(this.celebrateGoalTimer);
    }
    this.refreshSidebar();
    this.celebrateGoalTimer = window.setTimeout(() => {
      this.celebrateGoalTimer = null;
      this.refreshSidebar();
    }, 2200);
  }
  refreshUi() {
    this.updateStatusBar();
    this.refreshSidebar();
  }
  pruneExcludedTrackedFiles() {
    return this.trackingController?.pruneExcludedFiles() ?? false;
  }
  getPluginDataPath() {
    return `${this.app.vault.configDir}/plugins/${this.manifest.id}/data.json`;
  }
  async reloadAndMergeSyncedPluginData() {
    try {
      const result = await this.dataSync.reloadIfChanged(this.data);
      if (!result.changed)
        return;
      this.applyMergedData(result.data);
    } catch (err) {
      console.error("Failed to reload synced plugin data:", err);
    }
  }
  async reloadSyncedDataAndRefreshUi() {
    await this.reloadAndMergeSyncedPluginData();
    this.refreshUi();
  }
  markDirty(options) {
    this.dataSync.markDirty(options);
  }
  scheduleSave() {
    this.dataSync.scheduleFlush(() => {
      void this.flushSave().catch((err) => console.error("Failed to flush scheduled plugin data save:", err));
    });
  }
  async flushSave() {
    this.data = await this.dataSync.flush(this.data);
  }
  async importDailyStats() {
    try {
      const adapter = this.app.vault.adapter;
      const path = `${this.app.vault.configDir}/plugins/obsidian-daily-stats/data.json`;
      const exists = await adapter.exists(path);
      if (!exists) {
        new import_obsidian8.Notice("Daily stats plugin data.json not found.");
        return;
      }
      const raw = await adapter.read(path);
      const dayCounts = parseDailyStatsDayCounts(raw);
      const { imported } = importDailyStatsHistory(this.data.history, dayCounts, this.settings.dailyGoal);
      this.markDirty({ refreshSidebar: true });
      await this.flushSave();
      new import_obsidian8.Notice(`Imported ${imported} Days From Daily Stats.`);
    } catch (err) {
      console.error("Import error:", err);
      new import_obsidian8.Notice("Import failed.");
    }
  }
  async importDailyNoteWordCounts(range) {
    try {
      const result = await importDailyNoteWordCounts(
        this.app,
        this.data.history,
        this.settings.dailyGoal,
        range
      );
      if (!result) {
        new import_obsidian8.Notice("Daily notes path is not configured.");
        return;
      }
      if (result.imported > 0) {
        this.markDirty({ refreshSidebar: true });
        await this.flushSave();
      }
      this.refreshUi();
      new import_obsidian8.Notice(
        `Checked ${result.checked} Daily Notes (${result.startDate} to ${result.endDate}). Imported ${result.imported}, skipped ${result.skipped}, missing ${result.missing}.`
      );
    } catch (err) {
      console.error("Daily note import error:", err);
      new import_obsidian8.Notice("Daily note import failed.");
    }
  }
  updateStatusBar() {
    renderStatusBar(this.statusBarEl, this.todaysTotal(), this.settings);
  }
  async activateSidebar() {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_HEATMAP);
    if (existing.length) {
      void this.app.workspace.revealLeaf(existing[0]).catch((err) => console.error("Failed to reveal writing heatmap leaf:", err));
      return;
    }
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: VIEW_TYPE_HEATMAP, active: true });
      void this.app.workspace.revealLeaf(leaf).catch((err) => console.error("Failed to reveal writing heatmap leaf:", err));
    }
  }
  refreshSidebar() {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_HEATMAP)) {
      leaf.view.refresh();
    }
  }
  async openDailyNoteForDate(date) {
    return openDailyNoteForDate(this.app, date);
  }
  async loadPluginData() {
    const { data, shouldOpenHeatmapOnFirstInstall } = await this.dataSync.load();
    this.data = data;
    this.shouldOpenHeatmapOnFirstInstall = shouldOpenHeatmapOnFirstInstall;
  }
  async savePluginData() {
    this.data = await this.dataSync.flush(this.data);
  }
  applyMergedData(data) {
    this.data = data;
    this.trackingController?.replaceActiveDay(this.data.activeDay, { preserveLastObserved: true });
    this.pruneExcludedTrackedFiles();
    this.syncTodayHistory();
    return this.data;
  }
  async fireWebhook() {
    try {
      const sent = await this.sendWebhook({ test: false });
      if (!shouldMarkWebhookHandled(this.settings, sent))
        return;
      this.data.lastWebhookSentDate = this.data.activeDay.date;
      this.markDirty({ refreshSidebar: true });
      await this.flushSave();
    } finally {
      this.webhookSendInFlightDate = null;
    }
  }
  async sendTestWebhook() {
    await this.sendWebhook({ test: true });
  }
  async sendWebhook({ test }) {
    return sendWebhook({
      settings: this.settings,
      actual: this.todaysTotal(),
      date: this.data.activeDay.date,
      test
    });
  }
};

/* nosourcemap */