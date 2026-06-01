const { Modal, Notice, Plugin, PluginSettingTab, Setting } = require("obsidian");

const DEFAULT_SETTINGS = {
  dailyFolderName: "02_Daily",
  moodProperty: "mood",
  moodDetailProperties: "mood_detail,mood_note,mood_detail_cn",
  dailyNotePathPattern: "{YYYY}/02_journal/02_Daily/{MMMM}/{date}.md",
  defaultYear: "",
  writeMoodTag: true,
  showEmptyDays: true
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const MOODS = [
  {
    key: "happy",
    label: "开心",
    color: "#FFD166",
    stroke: "#2F2A1F",
    svg: `<svg viewBox="0 0 64 64" aria-label="happy"><circle cx="32" cy="32" r="26" fill="#FFD166" stroke="#2F2A1F" stroke-width="3"/><circle cx="23" cy="26" r="3.5" fill="#2F2A1F"/><circle cx="41" cy="26" r="3.5" fill="#2F2A1F"/><path d="M21 38 Q32 49 43 38" fill="none" stroke="#2F2A1F" stroke-width="4" stroke-linecap="round"/></svg>`
  },
  {
    key: "calm",
    label: "平静",
    color: "#9DD9D2",
    stroke: "#203331",
    svg: `<svg viewBox="0 0 64 64" aria-label="calm"><circle cx="32" cy="32" r="26" fill="#9DD9D2" stroke="#203331" stroke-width="3"/><path d="M20 27 Q23 25 26 27" fill="none" stroke="#203331" stroke-width="3" stroke-linecap="round"/><path d="M38 27 Q41 25 44 27" fill="none" stroke="#203331" stroke-width="3" stroke-linecap="round"/><path d="M24 40 H40" fill="none" stroke="#203331" stroke-width="4" stroke-linecap="round"/></svg>`
  },
  {
    key: "sad",
    label: "难过",
    color: "#7EC8E3",
    stroke: "#183847",
    svg: `<svg viewBox="0 0 64 64" aria-label="sad"><circle cx="32" cy="32" r="26" fill="#7EC8E3" stroke="#183847" stroke-width="3"/><circle cx="23" cy="27" r="3.2" fill="#183847"/><circle cx="41" cy="27" r="3.2" fill="#183847"/><path d="M22 44 Q32 35 42 44" fill="none" stroke="#183847" stroke-width="4" stroke-linecap="round"/><path d="M45 32 C49 37 49 41 45 43 C41 41 41 37 45 32Z" fill="#EAF8FF"/></svg>`
  },
  {
    key: "angry",
    label: "生气",
    color: "#EF6F6C",
    stroke: "#401513",
    svg: `<svg viewBox="0 0 64 64" aria-label="angry"><circle cx="32" cy="32" r="26" fill="#EF6F6C" stroke="#401513" stroke-width="3"/><path d="M18 22 L27 26" stroke="#401513" stroke-width="4" stroke-linecap="round"/><path d="M46 22 L37 26" stroke="#401513" stroke-width="4" stroke-linecap="round"/><circle cx="24" cy="29" r="3" fill="#401513"/><circle cx="40" cy="29" r="3" fill="#401513"/><path d="M23 44 Q32 37 41 44" fill="none" stroke="#401513" stroke-width="4" stroke-linecap="round"/></svg>`
  },
  {
    key: "anxious",
    label: "焦虑",
    color: "#F4A261",
    stroke: "#3B2414",
    svg: `<svg viewBox="0 0 64 64" aria-label="anxious"><circle cx="32" cy="32" r="26" fill="#F4A261" stroke="#3B2414" stroke-width="3"/><circle cx="23" cy="27" r="3" fill="#3B2414"/><circle cx="41" cy="27" r="3" fill="#3B2414"/><path d="M24 42 C28 38 36 46 40 42" fill="none" stroke="#3B2414" stroke-width="3.5" stroke-linecap="round"/><path d="M14 18 L20 14" stroke="#3B2414" stroke-width="3" stroke-linecap="round"/><path d="M44 14 L50 18" stroke="#3B2414" stroke-width="3" stroke-linecap="round"/></svg>`
  },
  {
    key: "tired",
    label: "疲惫",
    color: "#B8B8FF",
    stroke: "#282845",
    svg: `<svg viewBox="0 0 64 64" aria-label="tired"><circle cx="32" cy="32" r="26" fill="#B8B8FF" stroke="#282845" stroke-width="3"/><path d="M19 27 H27" stroke="#282845" stroke-width="4" stroke-linecap="round"/><path d="M37 27 H45" stroke="#282845" stroke-width="4" stroke-linecap="round"/><path d="M24 43 Q32 37 40 43" fill="none" stroke="#282845" stroke-width="4" stroke-linecap="round"/><path d="M47 16 L53 16 L47 22 L53 22" fill="none" stroke="#282845" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  {
    key: "excited",
    label: "兴奋",
    color: "#FFB703",
    stroke: "#35230A",
    svg: `<svg viewBox="0 0 64 64" aria-label="excited"><circle cx="32" cy="32" r="26" fill="#FFB703" stroke="#35230A" stroke-width="3"/><path d="M19 25 L23 18 L27 25 Z" fill="#35230A"/><path d="M37 25 L41 18 L45 25 Z" fill="#35230A"/><path d="M20 37 Q32 53 44 37" fill="#FFFFFF" stroke="#35230A" stroke-width="3" stroke-linejoin="round"/><path d="M22 39 H42" stroke="#35230A" stroke-width="2"/><path d="M14 15 L10 9" stroke="#35230A" stroke-width="3" stroke-linecap="round"/><path d="M50 15 L54 9" stroke="#35230A" stroke-width="3" stroke-linecap="round"/></svg>`
  },
  {
    key: "numb",
    label: "麻木",
    color: "#D5D8DC",
    stroke: "#31363B",
    svg: `<svg viewBox="0 0 64 64" aria-label="numb"><circle cx="32" cy="32" r="26" fill="#D5D8DC" stroke="#31363B" stroke-width="3"/><circle cx="24" cy="28" r="2.7" fill="#31363B"/><circle cx="40" cy="28" r="2.7" fill="#31363B"/><path d="M24 41 H40" stroke="#31363B" stroke-width="4" stroke-linecap="round"/><path d="M15 18 H22" stroke="#F7F8F9" stroke-width="2.5" stroke-linecap="round" opacity="0.75"/><path d="M42 47 H50" stroke="#F7F8F9" stroke-width="2.5" stroke-linecap="round" opacity="0.75"/></svg>`
  }
];

const MOOD_ALIASES = {
  开心: "happy",
  高兴: "happy",
  happy: "happy",
  平静: "calm",
  calm: "calm",
  难过: "sad",
  伤心: "sad",
  sad: "sad",
  生气: "angry",
  angry: "angry",
  焦虑: "anxious",
  anxious: "anxious",
  疲惫: "tired",
  累: "tired",
  tired: "tired",
  兴奋: "excited",
  excited: "excited",
  麻木: "numb",
  没感觉: "numb",
  numb: "numb"
};

module.exports = class MoodQuarterCalendarPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.moodByKey = Object.fromEntries(MOODS.map((mood) => [mood.key, mood]));

    this.addSettingTab(new MoodQuarterCalendarSettingTab(this.app, this));

    this.addCommand({
      id: "record-today-mood",
      name: "Record today's mood",
      callback: () => this.openMoodModal(formatDate(new Date()))
    });

    this.addCommand({
      id: "insert-mood-calendar-codeblock",
      name: "Insert mood quarter calendar block",
      editorCallback: (editor) => {
        const year = this.getDefaultYear();
        editor.replaceSelection(`\n\`\`\`mood-quarter-calendar\nyear: ${year}\n\`\`\`\n`);
      }
    });

    this.registerMarkdownCodeBlockProcessor("mood-quarter-calendar", async (source, el, ctx) => {
      const options = this.parseOptions(source, ctx);
      await this.renderCalendar(el, options);
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  parseOptions(source, ctx) {
    const options = Object.assign({}, this.settings);
    for (const rawLine of String(source || "").split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*?)\s*$/);
      if (!match) continue;
      const key = match[1];
      const value = match[2].replace(/^["']|["']$/g, "");
      if (key === "year") options.year = Number(value);
      if (key === "dailyFolderName") options.dailyFolderName = value;
      if (key === "moodProperty") options.moodProperty = value;
      if (key === "moodDetailProperties") options.moodDetailProperties = value;
      if (key === "showEmptyDays") options.showEmptyDays = value !== "false";
    }

    if (!Number.isFinite(options.year)) {
      const fileName = ctx?.sourcePath?.split("/").pop()?.replace(/\.md$/i, "") || "";
      const yearFromFile = Number(fileName.match(/(\d{4})/)?.[1]);
      options.year = Number.isFinite(yearFromFile) ? yearFromFile : this.getDefaultYear();
    }
    return options;
  }

  getDefaultYear() {
    const configured = Number(this.settings.defaultYear);
    return Number.isFinite(configured) && configured > 1900 ? configured : new Date().getFullYear();
  }

  async renderCalendar(container, options) {
    container.empty();
    container.addClass("mqc-root");

    const year = options.year;
    const dailyFiles = this.findDailyFiles(options.dailyFolderName, year);
    const moodsByDate = await this.collectMoods(dailyFiles, options.moodProperty, options.moodDetailProperties);
    const today = formatDate(new Date());

    const header = container.createDiv({ cls: "mqc-header" });
    header.createEl("h2", { text: `${year} Mood Quarter Calendar` });
    const recordedDays = Object.keys(moodsByDate).length;
    header.createDiv({
      cls: "mqc-summary",
      text: `已记录 ${recordedDays} 天 | 每行一个季度 | 点击已记录日期查看 100 字心情便签`
    });

    const legend = container.createDiv({ cls: "mqc-legend" });
    for (const mood of MOODS) {
      const item = legend.createDiv({ cls: "mqc-legend-item" });
      item.createSpan({ cls: "mqc-legend-face" }).innerHTML = mood.svg;
      item.createSpan({ text: `${mood.label} ${mood.key}` });
    }

    const quarters = container.createDiv({ cls: "mqc-quarters" });
    for (let quarter = 0; quarter < 4; quarter += 1) {
      const row = quarters.createDiv({ cls: "mqc-quarter-row" });
      row.createDiv({ cls: "mqc-quarter-label", text: `Q${quarter + 1}` });
      for (let month = quarter * 3; month < quarter * 3 + 3; month += 1) {
        this.renderMonth(row, year, month, moodsByDate, today, options, () => this.renderCalendar(container, options));
      }
    }
  }

  renderMonth(parent, year, month, moodsByDate, today, options, refresh) {
    const monthEl = parent.createDiv({ cls: "mqc-month" });
    monthEl.createDiv({ cls: "mqc-month-title", text: MONTH_LABELS[month] });

    const grid = monthEl.createDiv({ cls: "mqc-month-grid" });
    for (const day of WEEKDAY_LABELS) {
      grid.createDiv({ cls: "mqc-weekday", text: day });
    }

    const firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i += 1) {
      grid.createDiv({ cls: "mqc-day mqc-day-empty" });
    }

    const count = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= count; day += 1) {
      const date = `${year}-${pad2(month + 1)}-${pad2(day)}`;
      const entry = moodsByDate[date];
      const mood = this.moodByKey[entry?.moodKey];
      const button = grid.createEl("button", {
        cls: `mqc-day${mood ? " is-recorded" : ""}${date === today ? " is-today" : ""}`,
        attr: { type: "button", "aria-label": `${date}${mood ? ` ${mood.label}` : ""}` }
      });
      button.title = mood ? `${date} ${mood.label}${entry.detail ? `：${entry.detail}` : ""}` : `${date} 未记录`;
      button.dataset.date = date;
      if (mood) {
        button.createSpan({ cls: "mqc-face" }).innerHTML = mood.svg;
      } else if (options.showEmptyDays) {
        button.createSpan({ cls: "mqc-day-number", text: String(day) });
      }
      button.addEventListener("click", () => {
        if (mood) {
          this.openMoodNoteModal(date, mood, entry.detail);
        } else {
          this.openMoodModal(date, refresh);
        }
      });
    }
  }

  findDailyFiles(dailyFolderName, year) {
    const normalizedName = String(dailyFolderName || "").trim();
    return this.app.vault.getMarkdownFiles()
      .filter((file) => {
        const parts = file.path.split("/");
        return parts.includes(normalizedName) && new RegExp(`^${year}-\\d{2}-\\d{2}$`).test(file.basename);
      })
      .sort((a, b) => a.basename.localeCompare(b.basename));
  }

  async collectMoods(files, moodProperty, moodDetailProperties) {
    const moodsByDate = {};
    const detailProperties = parseList(moodDetailProperties);
    for (const file of files) {
      const cache = this.app.metadataCache.getFileCache(file);
      let rawMood = cache?.frontmatter?.[moodProperty];
      let moodKey = normalizeMood(rawMood);
      let detail = readMoodDetailFromFrontmatter(cache, detailProperties);
      let raw = null;

      if (!moodKey) {
        moodKey = readMoodFromCachedTags(cache);
      }

      if (!rawMood) {
        raw = await this.app.vault.cachedRead(file);
        rawMood = readInlineMood(raw, moodProperty);
        moodKey = moodKey || normalizeMood(rawMood);
      }

      if (!detail) {
        if (raw === null) raw = await this.app.vault.cachedRead(file);
        detail = readInlineMoodDetail(raw, detailProperties);
      }

      if (!moodKey) {
        if (raw === null) raw = await this.app.vault.cachedRead(file);
        moodKey = readMoodFromRawTags(raw);
      }

      if (moodKey) moodsByDate[file.basename] = { moodKey, detail };
    }
    return moodsByDate;
  }

  openMoodModal(date, onSaved) {
    new MoodPickerModal(this.app, this, date, onSaved).open();
  }

  openMoodNoteModal(date, mood, detail) {
    new MoodNoteModal(this.app, date, mood, detail).open();
  }

  async setMoodForDate(date, moodKey) {
    let file = this.app.vault.getMarkdownFiles().find((candidate) => candidate.basename === date && candidate.path.split("/").includes(this.settings.dailyFolderName));
    if (!file) {
      const path = this.buildDailyPath(date);
      await ensureFolder(this.app, path.split("/").slice(0, -1).join("/"));
      file = await this.app.vault.create(path, this.buildNewDailyNote(date, moodKey));
      new Notice(`已创建日记并记录心情：${date}`);
      return;
    }

    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter[this.settings.moodProperty] = moodKey;
      if (this.settings.writeMoodTag) {
        const moodTag = `mood/${moodKey}`;
        const tags = normalizeFrontmatterTags(frontmatter.tags);
        if (!tags.includes(moodTag)) tags.push(moodTag);
        frontmatter.tags = tags;
      }
    });
    new Notice(`已记录 ${date}：${this.moodByKey[moodKey]?.label || moodKey}`);
  }

  buildDailyPath(date) {
    const [year, month] = date.split("-");
    const monthIndex = Number(month) - 1;
    return this.settings.dailyNotePathPattern
      .replaceAll("{YYYY}", year)
      .replaceAll("{MM}", month)
      .replaceAll("{MMMM}", MONTH_NAMES[monthIndex])
      .replaceAll("{date}", date);
  }

  buildNewDailyNote(date, moodKey) {
    const tags = this.settings.writeMoodTag ? `tags: [mood/${moodKey}]\n` : "tags: []\n";
    return `---\nschema: v1.0.0\ntype: journal\ndate: ${date}\n${this.settings.moodProperty}: ${moodKey}\n${tags}---\n\n## 时间块\n\n## 今日心情\n\n`;
  }
};

class MoodPickerModal extends Modal {
  constructor(app, plugin, date, onSaved) {
    super(app);
    this.plugin = plugin;
    this.date = date;
    this.onSaved = onSaved;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("mqc-modal");
    contentEl.createEl("h2", { text: `记录心情：${this.date}` });

    const grid = contentEl.createDiv({ cls: "mqc-picker-grid" });
    for (const mood of MOODS) {
      const button = grid.createEl("button", {
        cls: "mqc-picker-button",
        attr: { type: "button", "aria-label": `${mood.label} ${mood.key}` }
      });
      button.createSpan({ cls: "mqc-picker-face" }).innerHTML = mood.svg;
      button.createSpan({ cls: "mqc-picker-label", text: `${mood.label}` });
      button.createSpan({ cls: "mqc-picker-key", text: mood.key });
      button.addEventListener("click", async () => {
        await this.plugin.setMoodForDate(this.date, mood.key);
        if (this.onSaved) await this.onSaved();
        this.close();
      });
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}

class MoodNoteModal extends Modal {
  constructor(app, date, mood, detail) {
    super(app);
    this.date = date;
    this.mood = mood;
    this.detail = detail;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("mqc-note-modal");

    const note = contentEl.createDiv({ cls: "mqc-sticky-note" });
    const header = note.createDiv({ cls: "mqc-sticky-header" });
    header.createSpan({ cls: "mqc-sticky-face" }).innerHTML = this.mood.svg;
    const title = header.createDiv({ cls: "mqc-sticky-title" });
    title.createDiv({ text: this.date });
    title.createDiv({ cls: "mqc-sticky-mood", text: `${this.mood.label} ${this.mood.key}` });

    note.createDiv({
      cls: `mqc-sticky-body${this.detail ? "" : " is-empty"}`,
      text: this.detail || "这天还没有写 100 字以内的心情详情。可以在日记里写 mood_detail:: 今天……"
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

class MoodQuarterCalendarSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Mood Quarter Calendar" });

    new Setting(containerEl)
      .setName("Daily folder segment")
      .setDesc("Only notes whose path contains this folder name are treated as daily notes.")
      .addText((text) => text
        .setPlaceholder("02_Daily")
        .setValue(this.plugin.settings.dailyFolderName)
        .onChange(async (value) => {
          this.plugin.settings.dailyFolderName = value.trim() || "02_Daily";
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Mood property")
      .setDesc("Frontmatter property used to store the mood key.")
      .addText((text) => text
        .setPlaceholder("mood")
        .setValue(this.plugin.settings.moodProperty)
        .onChange(async (value) => {
          this.plugin.settings.moodProperty = value.trim() || "mood";
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Mood detail properties")
      .setDesc("Comma-separated frontmatter or inline fields for a short mood note. The display is capped at 100 characters.")
      .addText((text) => text
        .setPlaceholder("mood_detail,mood_note,mood_detail_cn")
        .setValue(this.plugin.settings.moodDetailProperties)
        .onChange(async (value) => {
          this.plugin.settings.moodDetailProperties = value.trim() || DEFAULT_SETTINGS.moodDetailProperties;
          await this.plugin.saveSettings();
        }));


    new Setting(containerEl)
      .setName("Daily note path pattern")
      .setDesc("Used only when the plugin creates a missing daily note. Tokens: {YYYY}, {MM}, {MMMM}, {date}.")
      .addText((text) => text
        .setPlaceholder("{YYYY}/02_journal/02_Daily/{MMMM}/{date}.md")
        .setValue(this.plugin.settings.dailyNotePathPattern)
        .onChange(async (value) => {
          this.plugin.settings.dailyNotePathPattern = value.trim() || DEFAULT_SETTINGS.dailyNotePathPattern;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Default year")
      .setDesc("Leave blank to use the current year.")
      .addText((text) => text
        .setPlaceholder(String(new Date().getFullYear()))
        .setValue(String(this.plugin.settings.defaultYear || ""))
        .onChange(async (value) => {
          this.plugin.settings.defaultYear = value.trim();
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Also write mood tag")
      .setDesc("When recording from the picker, write both frontmatter mood and a tag like mood/happy.")
      .addToggle((toggle) => toggle
        .setValue(Boolean(this.plugin.settings.writeMoodTag))
        .onChange(async (value) => {
          this.plugin.settings.writeMoodTag = value;
          await this.plugin.saveSettings();
        }));
  }
}

function normalizeMood(value) {
  if (Array.isArray(value)) value = value[0];
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return MOOD_ALIASES[text] || MOOD_ALIASES[text.toLowerCase()] || null;
}

function readInlineMood(raw, moodProperty) {
  const escaped = String(moodProperty).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`(?:^|\\n)${escaped}::\\s*([^\\n]+)`, "i"),
    /(?:^|\n)心情::\s*([^\n]+)/i
  ];
  for (const pattern of patterns) {
    const match = String(raw || "").match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

function readMoodDetailFromFrontmatter(cache, detailProperties) {
  const frontmatter = cache?.frontmatter || {};
  for (const property of detailProperties) {
    const value = frontmatter[property];
    const detail = normalizeMoodDetail(value);
    if (detail) return detail;
  }
  return null;
}

function readInlineMoodDetail(raw, detailProperties) {
  const patterns = [
    ...detailProperties.map((property) => new RegExp(`(?:^|\\n)${escapeRegex(property)}::\\s*([^\\n]+)`, "i")),
    /(?:^|\n)心情详情::\s*([^\n]+)/i,
    /(?:^|\n)心情便签::\s*([^\n]+)/i,
    /(?:^|\n)心情记录::\s*([^\n]+)/i
  ];
  for (const pattern of patterns) {
    const match = String(raw || "").match(pattern);
    const detail = normalizeMoodDetail(match?.[1]);
    if (detail) return detail;
  }
  return null;
}

function normalizeMoodDetail(value) {
  if (Array.isArray(value)) value = value.join(" ");
  if (value === null || value === undefined) return null;
  const text = String(value).replace(/\s+/g, " ").trim();
  if (!text) return null;
  return Array.from(text).slice(0, 100).join("");
}

function readMoodFromCachedTags(cache) {
  const tags = [];
  for (const item of cache?.tags || []) {
    if (item?.tag) tags.push(item.tag);
  }
  const frontmatterTags = cache?.frontmatter?.tags;
  if (Array.isArray(frontmatterTags)) {
    for (const tag of frontmatterTags) tags.push(String(tag));
  } else if (typeof frontmatterTags === "string") {
    for (const tag of frontmatterTags.split(/[,\s]+/)) tags.push(tag);
  }
  return readMoodFromTags(tags);
}

function readMoodFromRawTags(raw) {
  const tags = String(raw || "").match(/#[^\s#，。,.!?;:()[\]{}]+/g) || [];
  return readMoodFromTags(tags);
}

function readMoodFromTags(tags) {
  for (const tag of tags) {
    const clean = String(tag || "").replace(/^#/, "").trim();
    const parts = clean.split("/");
    const head = parts[0]?.toLowerCase();
    const tail = parts.slice(1).join("/");
    if (["mood", "心情", "emotion", "情绪"].includes(head)) {
      const mood = normalizeMood(tail);
      if (mood) return mood;
    }
  }
  return null;
}

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeFrontmatterTags(value) {
  if (Array.isArray(value)) return value.map((tag) => String(tag).replace(/^#/, ""));
  if (typeof value === "string" && value.trim()) {
    return value.split(/[,\s]+/).map((tag) => tag.replace(/^#/, "")).filter(Boolean);
  }
  return [];
}

async function ensureFolder(app, folderPath) {
  if (!folderPath) return;
  const parts = folderPath.split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!app.vault.getAbstractFileByPath(current)) {
      await app.vault.createFolder(current);
    }
  }
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

/* nosourcemap */