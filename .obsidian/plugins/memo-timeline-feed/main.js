"use strict";

const {
  ItemView,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile
} = require("obsidian");

const VIEW_TYPE_MEMO_TIMELINE = "memo-timeline-feed-view";
const LANGUAGE_LABELS = {
  zh: "中文",
  en: "English"
};
const UI_TEXT = {
  zh: {
    viewName: "时间轴与日记流",
    ribbonTitle: "打开时间轴与日记流",
    openCommand: "打开时间轴与日记流",
    refreshCommand: "刷新时间轴与日记流",
    refreshed: "时间轴与日记流已刷新",
    composerPlaceholder: "写下此刻想记录的内容，支持多行文本。按 Cmd/Ctrl + Enter 发布。",
    publishButton: "发布日记",
    publishing: "发布中...",
    publishHint: "发布到今日日记文件",
    composerMediaHint: "支持拖入图片或粘贴截图",
    publishSuccess: "日记已发布",
    publishEmpty: "请输入内容后再发布",
    imageInsertFailed: "图片插入失败",
    tabTimeline: "时间线",
    tabFeed: "日记流",
    tabPhotos: "图片",
    tabRandom: "随机回归",
    statsNotes: "笔记",
    statsTimeline: "时间线",
    statsPhotos: "图片",
    searchPlaceholder: "搜索标题、正文、标签或链接",
    refreshButton: "刷新",
    noMatchTitle: "没有匹配结果",
    noMatchCopy: "试试其他关键词，或在设置中调整时间线标签和日记目录。",
    noTimelineTitle: "没有找到时间线笔记",
    noTimelineCopy: "给笔记添加配置中的时间线标签后，它就会出现在这里。",
    noDiaryTitle: "没有找到日记内容",
    noDiaryCopy: "日记流会读取设置中的日记标签、日记目录或符合日期格式的文件。",
    noPhotosTitle: "没有找到图片",
    noPhotosCopy: "在日记或时间线笔记中加入图片嵌入，这里就会显示。",
    noRandomTitle: "没有可回顾的日记",
    noRandomCopy: "先在日记目录里积累一些子日记，随机回归才会出现内容。",
    openNote: "打开笔记",
    previewClose: "关闭",
    activeTag: "当前焦点",
    diaryLens: "日记视角",
    spotlightPhotos: "图片模式会把所有内容压缩成视觉墙，方便先看图再回到笔记。",
    spotlightDefault: "这里保留时间线与日记流的聚合视图，同时支持快速记录新内容。",
    topTags: "高频标签",
    noTags: "还没有标签数据。",
    activity: "活跃度",
    activityRecent: "最近 3 个月",
    rules: "筛选规则",
    rulesText: "时间线使用 {timelineTag}。日记流使用 {diaryTag}、配置的日记目录，或文件名匹配日记格式的文件。",
    settingsTitle: "时间轴与日记流",
    settingLanguage: "界面语言",
    settingLanguageDesc: "设置插件界面语言，目前支持中文和 English。",
    settingTimelineTag: "时间线标签",
    settingTimelineTagDesc: "包含此标签的笔记会显示在时间线视图。",
    settingDiaryTag: "日记标签",
    settingDiaryTagDesc: "包含此标签的笔记也会显示在日记流。",
    settingDiaryFolder: "日记目录",
    settingDiaryFolderDesc: "可选。该目录中的笔记会显示在日记流，也会作为发布日记的目标目录。",
    settingPattern: "日记文件名正则",
    settingPatternDesc: "用于识别日记文件，例如 2026-03-20。",
    settingMaxCards: "最大卡片数",
    settingMaxCardsDesc: "限制渲染的笔记数量，避免界面过慢。",
    languageChanged: "界面语言已更新"
  },
  en: {
    viewName: "Timeline and Diary Feed",
    ribbonTitle: "Open Timeline and Diary Feed",
    openCommand: "Open Timeline and Diary Feed",
    refreshCommand: "Refresh Timeline and Diary Feed",
    refreshed: "Timeline and Diary Feed refreshed",
    composerPlaceholder: "Write what is happening right now. Multiline text is supported. Press Cmd/Ctrl + Enter to publish.",
    publishButton: "Publish diary",
    publishing: "Publishing...",
    publishHint: "Publishes into today's diary note",
    composerMediaHint: "Supports image drop and paste",
    publishSuccess: "Diary entry published",
    publishEmpty: "Write something before publishing",
    imageInsertFailed: "Failed to insert image",
    tabTimeline: "Timeline",
    tabFeed: "Diary Feed",
    tabPhotos: "Photos",
    tabRandom: "Random Recall",
    statsNotes: "Notes",
    statsTimeline: "Timeline",
    statsPhotos: "Photos",
    searchPlaceholder: "Search title, content, tags, or links",
    refreshButton: "Refresh",
    noMatchTitle: "No notes matched",
    noMatchCopy: "Try another search term, or adjust the timeline tag and diary folder in settings.",
    noTimelineTitle: "No timeline notes found",
    noTimelineCopy: "Add the configured timeline tag to a note and it will show up here.",
    noDiaryTitle: "No diary entries found",
    noDiaryCopy: "Diary feed uses the configured diary tag, diary folder, or date-like filenames.",
    noPhotosTitle: "No images found",
    noPhotosCopy: "Add image embeds to diary or timeline notes to populate this gallery.",
    noRandomTitle: "No diary entries to revisit",
    noRandomCopy: "Add some diary memos in your diary folder and random recall will show them here.",
    openNote: "Open note",
    previewClose: "Close",
    activeTag: "Active focus",
    diaryLens: "Diary Lens",
    spotlightPhotos: "Photo mode compresses everything into a visual wall so you can browse images first.",
    spotlightDefault: "This view keeps timeline and diary content together while letting you post new entries quickly.",
    topTags: "Top tags",
    noTags: "No tags found yet.",
    activity: "Activity",
    activityRecent: "Last 3 months",
    rules: "Rules",
    rulesText: "Timeline uses {timelineTag}. Diary feed uses {diaryTag}, the configured diary folder, or files whose names match the daily note pattern.",
    settingsTitle: "Timeline and Diary Feed",
    settingLanguage: "Interface language",
    settingLanguageDesc: "Choose the plugin UI language. Currently supports Chinese and English.",
    settingTimelineTag: "Timeline tag",
    settingTimelineTagDesc: "Notes containing this tag appear in the timeline view.",
    settingDiaryTag: "Diary tag",
    settingDiaryTagDesc: "Notes containing this tag also appear in the diary feed.",
    settingDiaryFolder: "Diary folder",
    settingDiaryFolderDesc: "Optional. Notes inside this folder appear in diary feed and are also used for publishing new diary entries.",
    settingPattern: "Daily note filename pattern",
    settingPatternDesc: "Regex used to detect diary-like filenames, for example 2026-03-20.",
    settingMaxCards: "Maximum cards",
    settingMaxCardsDesc: "Upper bound for rendered notes to keep the view responsive.",
    languageChanged: "Interface language updated"
  }
};

const DEFAULT_SETTINGS = {
  language: detectDefaultLanguage(),
  timelineTag: "#timeline",
  diaryTag: "#diary",
  diaryFolder: "",
  dailyNotePattern: "^(\\d{4}-\\d{2}-\\d{2}|\\d{8})$",
  maxCards: 200
};

class MemoTimelineFeedPlugin extends Plugin {
  async onload() {
    await this.loadSettings();

    this.registerView(
      VIEW_TYPE_MEMO_TIMELINE,
      (leaf) => new MemoTimelineFeedView(leaf, this)
    );

    this.addRibbonIcon("gallery-horizontal", this.t("ribbonTitle"), async () => {
      await this.activateView();
    });

    this.addCommand({
      id: "open-memo-timeline-feed",
      name: this.t("openCommand"),
      callback: async () => {
        await this.activateView();
      }
    });

    this.addCommand({
      id: "refresh-memo-timeline-feed",
      name: this.t("refreshCommand"),
      callback: async () => {
        const views = this.getOpenViews();
        if (views.length) {
          await Promise.all(views.map((view) => view.refresh()));
          new Notice(this.t("refreshed"));
          return;
        }

        await this.activateView();
      }
    });

    this.registerEvent(
      this.app.vault.on("modify", () => this.refreshOpenView())
    );
    this.registerEvent(
      this.app.vault.on("create", () => this.refreshOpenView())
    );
    this.registerEvent(
      this.app.vault.on("delete", () => this.refreshOpenView())
    );
    this.registerEvent(
      this.app.metadataCache.on("changed", () => this.refreshOpenView())
    );

    this.addSettingTab(new MemoTimelineFeedSettingTab(this.app, this));
  }

  async onunload() {
    await this.app.workspace.detachLeavesOfType(VIEW_TYPE_MEMO_TIMELINE);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    await this.refreshOpenView();
  }

  async activateView() {
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({
      type: VIEW_TYPE_MEMO_TIMELINE,
      active: true
    });
    this.app.workspace.revealLeaf(leaf);
  }

  getOpenViews() {
    return this.app.workspace
      .getLeavesOfType(VIEW_TYPE_MEMO_TIMELINE)
      .map((leaf) => leaf.view)
      .filter(Boolean);
  }

  async refreshOpenView() {
    const views = this.getOpenViews();
    if (views.length) {
      await Promise.all(views.map((view) => view.refresh()));
    }
  }

  t(key, vars = {}) {
    const language = UI_TEXT[this.settings.language] ? this.settings.language : DEFAULT_SETTINGS.language;
    const template = UI_TEXT[language]?.[key] ?? UI_TEXT.en[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "");
  }
}

class MemoTimelineFeedView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.activeTab = "timeline";
    this.activeTagFilter = "";
    this.searchTerm = "";
    this.searchDraft = "";
    this.searchTimer = null;
    this.records = [];
    this.composeText = "";
    this.isPublishing = false;
    this.composerTagState = null;
    this.isHandlingComposerMedia = false;
  }

  getViewType() {
    return VIEW_TYPE_MEMO_TIMELINE;
  }

  getDisplayText() {
    return this.plugin.t("viewName");
  }

  getIcon() {
    return "gallery-horizontal";
  }

  async onOpen() {
    this.contentEl.empty();
    this.contentEl.addClass("memo-feed-view");
    await this.refresh();
  }

  onClose() {
    if (this.searchTimer) {
      window.clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
  }

  async refresh() {
    this.records = await buildRecords(this.app, this.plugin.settings);
    this.render();
  }

  render() {
    const root = this.contentEl;
    root.empty();

    const shell = root.createDiv({ cls: "memo-shell" });
    const hero = shell.createDiv({ cls: "memo-hero" });
    const heroCopy = hero.createDiv({ cls: "memo-hero-copy" });
    this.renderComposer(heroCopy);

    const stats = buildStats(this.records);
    const heroStats = hero.createDiv({ cls: "memo-hero-stats" });
    renderStat(heroStats, this.plugin.t("statsNotes"), String(stats.totalNotes));
    renderStat(heroStats, this.plugin.t("statsTimeline"), String(stats.timelineCount));
    renderStat(heroStats, this.plugin.t("statsPhotos"), String(stats.imageCount));

    const controls = shell.createDiv({ cls: "memo-controls" });
    const tabs = controls.createDiv({ cls: "memo-tabs" });
    [
      ["timeline", this.plugin.t("tabTimeline")],
      ["feed", this.plugin.t("tabFeed")],
      ["photos", this.plugin.t("tabPhotos")],
      ["random", this.plugin.t("tabRandom")]
    ].forEach(([value, label]) => {
      const button = tabs.createEl("button", {
        cls: value === this.activeTab ? "memo-tab is-active" : "memo-tab",
        text: label
      });
      button.addEventListener("click", () => {
        this.activeTab = value;
        this.render();
      });
    });

    const searchWrap = controls.createDiv({ cls: "memo-search-wrap" });
    const search = searchWrap.createEl("input", {
      cls: "memo-search",
      attr: {
        type: "search",
        placeholder: this.plugin.t("searchPlaceholder")
      }
    });
    search.value = this.searchDraft || this.searchTerm;
    search.addEventListener("input", (event) => {
      this.searchDraft = event.target.value;
      if (this.searchTimer) {
        window.clearTimeout(this.searchTimer);
      }

      this.searchTimer = window.setTimeout(() => {
        this.searchTerm = this.searchDraft.toLowerCase().trim();
        this.searchTimer = null;
        this.render();
      }, 500);
    });

    const refreshButton = controls.createEl("button", {
      cls: "memo-refresh-button",
      text: this.plugin.t("refreshButton")
    });
    refreshButton.addEventListener("click", async () => {
      refreshButton.disabled = true;
      await this.refresh();
      refreshButton.disabled = false;
    });

    const layout = shell.createDiv({ cls: "memo-layout" });
    const main = layout.createDiv({ cls: "memo-main" });
    const aside = layout.createDiv({ cls: "memo-aside" });

    this.renderMain(main);
    this.renderAside(aside, stats);
  }

  renderMain(container) {
    const filtered = this.getFilteredRecords();

    if (!filtered.length) {
      const empty = container.createDiv({ cls: "memo-empty-card" });
      empty.createEl("div", { cls: "memo-empty-title", text: this.plugin.t("noMatchTitle") });
      empty.createEl("p", {
        cls: "memo-empty-copy",
        text: this.plugin.t("noMatchCopy")
      });
      return;
    }

    if (this.activeTab === "timeline") {
      this.renderTimeline(container, filtered.filter((record) => record.isTimeline));
      return;
    }

    if (this.activeTab === "photos") {
      this.renderPhotos(container, filtered.filter((record) => record.images.length));
      return;
    }

    if (this.activeTab === "random") {
      this.renderRandom(container, filtered.filter((record) => record.isDiary));
      return;
    }

    this.renderFeed(container, filtered.filter((record) => record.isDiary));
  }

  renderTimeline(container, records) {
    if (!records.length) {
      renderSectionEmpty(
        container,
        this.plugin.t("noTimelineTitle"),
        this.plugin.t("noTimelineCopy")
      );
      return;
    }

    const list = container.createDiv({ cls: "timeline-list" });
    records.forEach((record) => {
      const item = list.createDiv({ cls: "timeline-item" });
      item.createDiv({ cls: "timeline-rail" });
      item.createDiv({ cls: "timeline-dot" });

      const card = item.createDiv({ cls: "timeline-card memo-card" });
      const meta = card.createDiv({ cls: "memo-card-meta" });
      meta.createEl("span", {
        cls: "memo-card-date",
        text: formatDateTime(record.date)
      });
      meta.createEl("span", {
        cls: "memo-card-path",
        text: record.file.path
      });

      const title = card.createEl("h3", {
        cls: "memo-card-title",
        text: record.title
      });
      title.addEventListener("click", () => this.openRecord(record));

      renderRecordContent(card, record, this.app);

      if (record.tags.length) {
        renderTags(card, record.tags, record.primaryTag);
      }

      if (record.images.length) {
        renderImageStrip(card, record.images.slice(0, 3), (image) => this.openImagePreview(record, image));
      }
    });
  }

  renderFeed(container, records) {
    if (!records.length) {
      renderSectionEmpty(
        container,
        this.plugin.t("noDiaryTitle"),
        this.plugin.t("noDiaryCopy")
      );
      return;
    }

    const feed = container.createDiv({ cls: "feed-list" });
    records.forEach((record) => {
      const card = feed.createDiv({ cls: "feed-card memo-card" });

      const meta = card.createDiv({
        cls: "feed-date feed-meta",
        text: `${formatDateTime(record.date)} · ${record.file.path}`
      });
      meta.title = record.title;

      renderRecordContent(card, record, this.app);

      if (record.images.length) {
        const gallery = card.createDiv({
          cls: record.images.length === 1 ? "feed-gallery single" : "feed-gallery"
        });
        record.images.slice(0, 9).forEach((image) => {
          const button = gallery.createEl("button", { cls: "feed-image-button" });
          const img = button.createEl("img", {
            cls: "feed-image",
            attr: {
              src: image.src,
              alt: image.alt || record.title
            }
          });
          img.loading = "lazy";
          button.addEventListener("click", () => this.openImagePreview(record, image));
        });
      }

      const footer = card.createDiv({ cls: "feed-footer" });
      if (record.tags.length) {
        renderTags(footer, record.tags, record.primaryTag);
      }
      const openLink = footer.createEl("button", {
        cls: "feed-open-link",
        text: this.plugin.t("openNote")
      });
      openLink.addEventListener("click", () => this.openRecord(record));
    });
  }

  renderPhotos(container, records) {
    if (!records.length) {
      renderSectionEmpty(
        container,
        this.plugin.t("noPhotosTitle"),
        this.plugin.t("noPhotosCopy")
      );
      return;
    }

    const wall = container.createDiv({ cls: "photo-wall" });
    records.forEach((record) => {
      record.images.forEach((image) => {
        const tile = wall.createEl("button", { cls: "photo-tile" });
        const img = tile.createEl("img", {
          cls: "photo-tile-image",
          attr: {
            src: image.src,
            alt: image.alt || record.title
          }
        });
        img.loading = "lazy";

        const overlay = tile.createDiv({ cls: "photo-tile-overlay" });
        overlay.createEl("div", {
          cls: "photo-tile-title",
          text: record.title
        });
        overlay.createEl("div", {
          cls: "photo-tile-date",
          text: formatDateTime(record.date)
        });

        tile.addEventListener("click", () => this.openImagePreview(record, image));
      });
    });
  }

  renderRandom(container, records) {
    if (!records.length) {
      renderSectionEmpty(
        container,
        this.plugin.t("noRandomTitle"),
        this.plugin.t("noRandomCopy")
      );
      return;
    }

    const sampled = sampleRecords(records, 10);
    this.renderFeed(container, sampled);
  }

  renderAside(container, stats) {
    const spotlight = container.createDiv({ cls: "memo-side-card memo-spotlight" });
    spotlight.createEl("div", { cls: "memo-side-eyebrow", text: this.plugin.t("activeTag") });
    spotlight.createEl("h3", {
      cls: "memo-side-title",
      text: this.activeTab === "timeline" ? this.plugin.settings.timelineTag : this.plugin.t("diaryLens")
    });
    spotlight.createEl("p", {
      cls: "memo-side-copy",
      text: this.activeTab === "photos"
        ? this.plugin.t("spotlightPhotos")
        : this.plugin.t("spotlightDefault")
    });

    const tagCard = container.createDiv({ cls: "memo-side-card" });
    tagCard.createEl("div", { cls: "memo-side-eyebrow", text: this.plugin.t("topTags") });
    const tagWrap = tagCard.createDiv({ cls: "memo-tag-cloud" });
    stats.topTags.slice(0, 12).forEach(([tag, count], index) => {
      const isActive = this.activeTagFilter === tag;
      const chip = tagWrap.createEl("button", {
        cls: [
          "memo-chip",
          index === 0 && !isActive ? "is-accent" : "",
          isActive ? "is-selected" : ""
        ].filter(Boolean).join(" "),
        text: `${tag} · ${count}`
      });
      chip.type = "button";
      chip.addEventListener("click", () => {
        this.activeTagFilter = isActive ? "" : tag;
        this.activeTab = "feed";
        this.render();
      });
    });
    if (!stats.topTags.length) {
      tagCard.createEl("p", {
        cls: "memo-side-copy",
        text: this.plugin.t("noTags")
      });
    }

    const heatmap = container.createDiv({ cls: "memo-side-card" });
    heatmap.createEl("div", { cls: "memo-side-eyebrow", text: this.plugin.t("activity") });
    heatmap.createEl("div", { cls: "memo-activity-range", text: this.plugin.t("activityRecent") });
    const activity = buildActivityGrid(this.records);
    const labels = heatmap.createDiv({ cls: "memo-heatmap-labels" });
    activity.monthLabels.forEach((label) => {
      labels.createDiv({ cls: "memo-heatmap-label", text: label });
    });
    const grid = heatmap.createDiv({ cls: "memo-heatmap" });
    activity.cells.forEach((value) => {
      const cell = grid.createDiv({ cls: "memo-heatmap-cell" });
      cell.style.opacity = `${0.14 + value * 0.86}`;
    });

    const rule = container.createDiv({ cls: "memo-side-card memo-settings-hint" });
    rule.createEl("div", { cls: "memo-side-eyebrow", text: this.plugin.t("rules") });
    rule.createEl("p", {
      cls: "memo-side-copy",
      text: this.plugin.t("rulesText", {
        timelineTag: this.plugin.settings.timelineTag,
        diaryTag: this.plugin.settings.diaryTag
      })
    });
  }

  getFilteredRecords() {
    let records = this.records.slice(0, Math.max(this.plugin.settings.maxCards, 1));
    if (this.activeTagFilter) {
      records = records.filter((record) => record.tags.includes(this.activeTagFilter));
    }
    if (!this.searchTerm) {
      return records;
    }

    return records.filter((record) => {
      const haystack = [
        record.title,
        record.summary,
        record.file.path,
        record.tags.join(" "),
        (record.links || []).map((link) => link.url).join(" "),
        (record.links || []).map((link) => link.label).join(" ")
      ].join(" ").toLowerCase();
      return haystack.includes(this.searchTerm);
    });
  }

  async openRecord(record) {
    const leaf = this.app.workspace.getMostRecentLeaf() || this.app.workspace.getLeaf(true);
    await leaf.openFile(record.file);

    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      this.app.workspace.revealLeaf(activeView.leaf);
    }
  }

  openImagePreview(record, image) {
    new MemoImagePreviewModal(this.app, this.plugin, record, image, () => this.openRecord(record)).open();
  }

  renderComposer(container) {
    const composer = container.createDiv({ cls: "memo-composer" });
    const textarea = composer.createEl("textarea", {
      cls: "memo-composer-input",
      attr: {
        placeholder: this.plugin.t("composerPlaceholder")
      }
    });
    textarea.value = this.composeText;
    const tagMenu = composer.createDiv({ cls: "memo-composer-tags is-hidden" });

    const renderTagMenu = () => {
      const state = this.getComposerTagState(textarea.value, textarea.selectionStart || 0);
      this.composerTagState = state;
      tagMenu.empty();

      if (!state || !state.suggestions.length) {
        tagMenu.addClass("is-hidden");
        return;
      }

      tagMenu.removeClass("is-hidden");
      state.suggestions.forEach((tag, index) => {
        const item = tagMenu.createEl("button", {
          cls: index === state.selectedIndex ? "memo-composer-tag is-active" : "memo-composer-tag",
          text: tag
        });
        item.type = "button";
        item.addEventListener("mousedown", (event) => {
          event.preventDefault();
          this.applyComposerTag(textarea, tag);
          updatePublishState();
          renderTagMenu();
          textarea.focus();
        });
      });
    };

    const updatePublishState = () => {
      publishButton.disabled = this.isPublishing || !this.composeText.trim();
    };

    textarea.addEventListener("input", (event) => {
      this.composeText = event.target.value;
      updatePublishState();
      renderTagMenu();
    });
    textarea.addEventListener("dragover", (event) => {
      if (!hasImageFiles(event.dataTransfer?.files)) {
        return;
      }

      event.preventDefault();
      textarea.addClass("is-drag-over");
    });
    textarea.addEventListener("dragleave", () => {
      textarea.removeClass("is-drag-over");
    });
    textarea.addEventListener("drop", async (event) => {
      textarea.removeClass("is-drag-over");
      const files = Array.from(event.dataTransfer?.files || []);
      if (!hasImageFiles(files)) {
        return;
      }

      event.preventDefault();
      await this.insertComposerImages(textarea, files);
      updatePublishState();
      renderTagMenu();
    });
    textarea.addEventListener("paste", async (event) => {
      const files = Array.from(event.clipboardData?.files || []);
      if (!hasImageFiles(files)) {
        return;
      }

      event.preventDefault();
      await this.insertComposerImages(textarea, files);
      updatePublishState();
      renderTagMenu();
    });
    textarea.addEventListener("keydown", async (event) => {
      if (this.composerTagState?.suggestions?.length) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          this.composerTagState.selectedIndex =
            (this.composerTagState.selectedIndex + 1) % this.composerTagState.suggestions.length;
          renderTagMenu();
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          this.composerTagState.selectedIndex =
            (this.composerTagState.selectedIndex - 1 + this.composerTagState.suggestions.length) %
            this.composerTagState.suggestions.length;
          renderTagMenu();
          return;
        }

        if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          const tag = this.composerTagState.suggestions[this.composerTagState.selectedIndex];
          if (tag) {
            this.applyComposerTag(textarea, tag);
            updatePublishState();
            renderTagMenu();
          }
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          this.composerTagState = null;
          renderTagMenu();
          return;
        }
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        await this.publishDiaryEntry();
      }
    });
    textarea.addEventListener("click", renderTagMenu);
    textarea.addEventListener("keyup", renderTagMenu);
    textarea.addEventListener("blur", () => {
      window.setTimeout(() => tagMenu.addClass("is-hidden"), 120);
    });

    const actions = composer.createDiv({ cls: "memo-composer-actions" });
    actions.createEl("div", {
      cls: "memo-composer-hint",
      text: `${this.plugin.t("publishHint")} · ${this.getTodayDiaryPath()} · ${this.plugin.t("composerMediaHint")}`
    });
    const publishButton = actions.createEl("button", {
      cls: "memo-publish-button",
      text: this.isPublishing ? this.plugin.t("publishing") : this.plugin.t("publishButton")
    });
    publishButton.type = "button";
    updatePublishState();
    publishButton.addEventListener("click", async () => this.publishDiaryEntry());
    renderTagMenu();
  }

  async insertComposerImages(textarea, files) {
    if (this.isHandlingComposerMedia) {
      return;
    }

    const imageFiles = files.filter((file) => isImageFile(file));
    if (!imageFiles.length) {
      return;
    }

    this.isHandlingComposerMedia = true;

    try {
      const embeds = [];
      for (const file of imageFiles) {
        const saved = await this.saveComposerImage(file);
        embeds.push(`![[${saved.embedTarget}]]`);
      }

      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || start;
      const insertion = embeds.join(" ");
      const prefix = start > 0 && !/\s$/.test(textarea.value.slice(0, start)) ? "\n" : "";
      const suffix = end < textarea.value.length && !/^\s/.test(textarea.value.slice(end)) ? "\n" : "";
      const nextValue = `${textarea.value.slice(0, start)}${prefix}${insertion}${suffix}${textarea.value.slice(end)}`;
      const nextCursor = start + prefix.length + insertion.length + suffix.length;

      textarea.value = nextValue;
      textarea.setSelectionRange(nextCursor, nextCursor);
      this.composeText = nextValue;
    } catch (error) {
      new Notice(this.plugin.t("imageInsertFailed"));
    } finally {
      this.isHandlingComposerMedia = false;
    }
  }

  async saveComposerImage(file) {
    const diaryPath = this.getTodayDiaryPath();
    const folder = diaryPath.split("/").slice(0, -1).join("/");
    const extension = getImageExtension(file);
    const filename = `memo-${formatDateStamp(new Date())}-${Date.now().toString().slice(-5)}.${extension}`;
    const path = folder ? `${folder}/${filename}` : filename;

    await ensureFolderExists(this.app.vault, path);
    const bytes = await file.arrayBuffer();
    await this.app.vault.createBinary(path, bytes);

    return {
      path,
      embedTarget: filename
    };
  }

  getTodayDiaryPath() {
    const now = new Date();
    const filename = `${formatDateKey(now)}.md`;
    const folder = (this.plugin.settings.diaryFolder || "").trim().replace(/^\/+|\/+$/g, "");
    return folder ? `${folder}/${filename}` : filename;
  }

  async publishDiaryEntry() {
    const content = this.composeText.trim();
    if (!content || this.isPublishing) {
      if (!content) {
        new Notice(this.plugin.t("publishEmpty"));
      }
      return;
    }

    this.isPublishing = true;
    this.render();

    try {
      const now = new Date();
      const path = this.getTodayDiaryPath();
      await ensureFolderExists(this.app.vault, path);
      const formatted = formatDiaryEntry(content, now);
      const existing = this.app.vault.getAbstractFileByPath(path);

      if (existing instanceof TFile) {
        const current = await this.app.vault.cachedRead(existing);
        const prefix = current.trim() ? "\n\n" : "";
        await this.app.vault.modify(existing, `${current}${prefix}${formatted}\n`);
      } else {
        await this.app.vault.create(path, `${formatted}\n`);
      }

      this.composeText = "";
      await this.refresh();
      new Notice(this.plugin.t("publishSuccess"));
    } finally {
      this.isPublishing = false;
      this.render();
    }
  }

  getComposerTagState(text, cursor) {
    const beforeCursor = text.slice(0, cursor);
    const match = beforeCursor.match(/(^|\s)(#[\p{L}\p{N}_-]*)$/u);
    if (!match) {
      return null;
    }

    const trigger = match[2] || "#";
    const query = trigger.slice(1).toLowerCase();
    const suggestions = this.getAvailableTags()
      .filter((tag) => tag.startsWith("#"))
      .filter((tag) => !query || tag.slice(1).toLowerCase().includes(query))
      .slice(0, 8);

    if (!suggestions.length && query) {
      suggestions.push(normalizeTag(trigger));
    }

    return {
      start: cursor - trigger.length,
      end: cursor,
      suggestions,
      selectedIndex: Math.min(this.composerTagState?.selectedIndex || 0, Math.max(suggestions.length - 1, 0))
    };
  }

  getAvailableTags() {
    const tagSet = new Set([
      normalizeTag(this.plugin.settings.timelineTag),
      normalizeTag(this.plugin.settings.diaryTag)
    ]);

    this.records.forEach((record) => {
      record.tags.forEach((tag) => tagSet.add(normalizeTag(tag)));
    });

    return Array.from(tagSet).filter(Boolean).sort();
  }

  applyComposerTag(textarea, tag) {
    const state = this.composerTagState || this.getComposerTagState(textarea.value, textarea.selectionStart || 0);
    if (!state) {
      return;
    }

    const normalizedTag = normalizeTag(tag);
    const nextValue = `${textarea.value.slice(0, state.start)}${normalizedTag} ${textarea.value.slice(state.end)}`;
    const nextCursor = state.start + normalizedTag.length + 1;
    textarea.value = nextValue;
    textarea.setSelectionRange(nextCursor, nextCursor);
    this.composeText = nextValue;
    this.composerTagState = null;
  }
}

class MemoTimelineFeedSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: this.plugin.t("settingsTitle") });

    new Setting(containerEl)
      .setName(this.plugin.t("settingLanguage"))
      .setDesc(this.plugin.t("settingLanguageDesc"))
      .addDropdown((dropdown) => {
        Object.entries(LANGUAGE_LABELS).forEach(([value, label]) => dropdown.addOption(value, label));
        dropdown
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();
            this.display();
            new Notice(this.plugin.t("languageChanged"));
          });
      });

    new Setting(containerEl)
      .setName(this.plugin.t("settingTimelineTag"))
      .setDesc(this.plugin.t("settingTimelineTagDesc"))
      .addText((text) => text
        .setPlaceholder("#timeline")
        .setValue(this.plugin.settings.timelineTag)
        .onChange(async (value) => {
          this.plugin.settings.timelineTag = normalizeTagInput(value, "#timeline");
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(this.plugin.t("settingDiaryTag"))
      .setDesc(this.plugin.t("settingDiaryTagDesc"))
      .addText((text) => text
        .setPlaceholder("#diary")
        .setValue(this.plugin.settings.diaryTag)
        .onChange(async (value) => {
          this.plugin.settings.diaryTag = normalizeTagInput(value, "#diary");
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(this.plugin.t("settingDiaryFolder"))
      .setDesc(this.plugin.t("settingDiaryFolderDesc"))
      .addText((text) => text
        .setPlaceholder("Daily")
        .setValue(this.plugin.settings.diaryFolder)
        .onChange(async (value) => {
          this.plugin.settings.diaryFolder = value.trim().replace(/^\/+|\/+$/g, "");
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(this.plugin.t("settingPattern"))
      .setDesc(this.plugin.t("settingPatternDesc"))
      .addText((text) => text
        .setPlaceholder("^(\\d{4}-\\d{2}-\\d{2}|\\d{8})$")
        .setValue(this.plugin.settings.dailyNotePattern)
        .onChange(async (value) => {
          this.plugin.settings.dailyNotePattern = value.trim() || DEFAULT_SETTINGS.dailyNotePattern;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(this.plugin.t("settingMaxCards"))
      .setDesc(this.plugin.t("settingMaxCardsDesc"))
      .addText((text) => text
        .setPlaceholder("200")
        .setValue(String(this.plugin.settings.maxCards))
        .onChange(async (value) => {
          const next = Number.parseInt(value, 10);
          this.plugin.settings.maxCards = Number.isFinite(next) && next > 0 ? next : DEFAULT_SETTINGS.maxCards;
          await this.plugin.saveSettings();
        }));
  }
}

async function buildRecords(app, settings) {
  const files = app.vault.getMarkdownFiles();
  const pattern = safeRegex(settings.dailyNotePattern);
  const timelineTag = normalizeTag(settings.timelineTag);
  const diaryTag = normalizeTag(settings.diaryTag);

  const recordGroups = await Promise.all(files.map(async (file) => {
    const cache = app.metadataCache.getFileCache(file) || {};
    const content = await app.vault.cachedRead(file);
    const frontmatterTags = collectFrontmatterTags(cache.frontmatter || {});
    const tags = collectTags(cache);
    const frontmatter = cache.frontmatter || {};
    const baseDate = pickDate(file, frontmatter);
    const images = extractImages(app, file, content);
    const folder = file.parent?.path || "";
    const inDiaryFolder = matchesFolder(folder, settings.diaryFolder);
    const isTimeline = tags.includes(timelineTag);
    const isDiary = inDiaryFolder;
    const title = String(frontmatter.title || file.basename);
    const entries = extractTimedEntries(app, file, content, baseDate);

    if (entries.length) {
      return entries.map((entry) => {
        const entryTags = mergeTags(frontmatterTags, entry.tags);
        const entryIsTimeline = isTimeline || entryTags.includes(timelineTag);
        const entryIsDiary = inDiaryFolder;

        return {
        file,
        title,
        date: entry.date,
        contentText: extractDisplayText(rawEntryText(entry)),
        summary: entry.summary,
        links: entry.links,
        tags: entryTags,
        primaryTag: resolvePrimaryTag(entryTags, timelineTag, diaryTag, entryIsTimeline, entryIsDiary),
        isTimeline: entryIsTimeline,
        isDiary: entryIsDiary,
        images: entry.images
      };
      });
    }

    return [{
      file,
      title,
      date: baseDate,
      contentText: extractDisplayText(content),
      summary: summarize(content),
      links: extractLinks(content),
      tags,
      primaryTag: isTimeline ? timelineTag : diaryTag,
      isTimeline,
      isDiary,
      images
    }];
  }));

  return recordGroups
    .flat()
    .filter((record) => record.summary || record.images.length || record.tags.length)
    .sort((left, right) => right.date.getTime() - left.date.getTime());
}

function collectTags(cache) {
  const tagSet = new Set();
  (cache.tags || []).forEach((tag) => {
    if (tag.tag) {
      tagSet.add(normalizeTag(tag.tag));
    }
  });

  const frontmatterTags = cache.frontmatter?.tags;
  if (Array.isArray(frontmatterTags)) {
    frontmatterTags.forEach((tag) => tagSet.add(normalizeTag(tag)));
  } else if (typeof frontmatterTags === "string") {
    frontmatterTags
      .split(/[,\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .forEach((tag) => tagSet.add(normalizeTag(tag)));
  }

  return Array.from(tagSet);
}

function collectFrontmatterTags(frontmatter) {
  const tagSet = new Set();
  const frontmatterTags = frontmatter?.tags;

  if (Array.isArray(frontmatterTags)) {
    frontmatterTags.forEach((tag) => tagSet.add(normalizeTag(tag)));
  } else if (typeof frontmatterTags === "string") {
    frontmatterTags
      .split(/[,\s]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .forEach((tag) => tagSet.add(normalizeTag(tag)));
  }

  return Array.from(tagSet);
}

function pickDate(file, frontmatter) {
  const candidates = [
    frontmatter.date,
    frontmatter.day,
    frontmatter.created,
    frontmatter.published,
    file.basename
  ];

  for (const candidate of candidates) {
    const parsed = parseDateLike(candidate);
    if (parsed) {
      return parsed;
    }
  }

  return new Date(file.stat.mtime);
}

function parseDateLike(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  const text = String(value).trim();
  if (!text) {
    return null;
  }

  const normalized = text.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function extractImages(app, noteFile, content) {
  const images = [];
  const seen = new Set();
  const regex = /!\[\[(.+?)\]\]|!\[[^\]]*?\]\((.+?)\)/g;

  let match;
  while ((match = regex.exec(content)) !== null) {
    const rawTarget = match[1] || match[2] || "";
    const target = rawTarget.split("|")[0].trim();
    if (!target) {
      continue;
    }

    let src = "";
    if (/^(https?:)?\/\//i.test(target) || target.startsWith("data:")) {
      src = target;
    } else {
      const linked = app.metadataCache.getFirstLinkpathDest(target, noteFile.path);
      if (!linked) {
        continue;
      }

      if (!/\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(linked.path)) {
        continue;
      }

      src = app.vault.getResourcePath(linked);
    }

    if (!src || seen.has(src)) {
      continue;
    }

    seen.add(src);
    images.push({ src, alt: noteFile.basename });
  }

  return images;
}

function summarize(content) {
  const text = cleanMemoContent(content)
    .replace(/\[\[(.+?)\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\((.+?)\)/g, "$1")
    .replace(/<https?:\/\/[^>\s]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/`{1,3}[^`]*`{1,3}/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}[-*+]\s+/gm, "")
    .replace(/^\s{0,3}\d+\.\s+/gm, "")
    .replace(/[>*_~#]/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return "";
  }

  return text.length > 240 ? `${text.slice(0, 240)}...` : text;
}

function extractTimedEntries(app, noteFile, content, baseDate) {
  const lines = stripFrontmatter(content).split("\n");
  const entries = [];
  let current = null;

  lines.forEach((line) => {
    const match = line.match(/^\s*-\s*(\d{1,2}:\d{2})(?:\s+(.*))?\s*$/);
    if (match) {
      if (current) {
        finalizeTimedEntry(app, noteFile, entries, current, baseDate);
      }

      current = {
        time: match[1],
        lines: match[2] ? [match[2]] : []
      };
      return;
    }

    if (current) {
      current.lines.push(line);
    }
  });

  if (current) {
    finalizeTimedEntry(app, noteFile, entries, current, baseDate);
  }

  return entries;
}

function finalizeTimedEntry(app, noteFile, entries, entry, baseDate) {
  const rawContent = entry.lines.join("\n");
  const summary = summarize(rawContent);
  if (!summary && !entry.time) {
    return;
  }

  entries.push({
    date: applyTimeToDate(baseDate, entry.time),
    rawContent,
    summary,
    links: extractLinks(rawContent),
    tags: extractInlineTags(rawContent),
    images: extractImages(app, noteFile, rawContent)
  });
}

function applyTimeToDate(baseDate, timeText) {
  const date = new Date(baseDate);
  const match = String(timeText || "").match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return date;
  }

  date.setHours(Number.parseInt(match[1], 10), Number.parseInt(match[2], 10), 0, 0);
  return date;
}

function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\s*/m, "");
}

function cleanMemoContent(content) {
  return stripFrontmatter(content)
    .replace(/(?:^|\s)图片?\s*!\[\[(.+?)\]\]/g, " ")
    .replace(/(?:^|\s)图片?\s*!\[[^\]]*?\]\((.+?)\)/g, " ")
    .replace(/!\[\[\s*[^\]]+\s*\]\]/g, " ")
    .replace(/!\[\s*\]\[\s*\]/g, " ")
    .replace(/!\[\[(.+?)\]\]/g, " ")
    .replace(/!\[[^\]]*?\]\((.+?)\)/g, " ");
}

function extractDisplayText(content) {
  return cleanMemoContent(content)
    .replace(/\r/g, "")
    .replace(/(^|\s)#[\p{L}\p{N}_/-]+/gu, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .trim();
}

function extractInlineTags(content) {
  const tagSet = new Set();
  const matches = String(content || "").match(/(^|\s)#([\p{L}\p{N}_/-]+)/gu) || [];

  matches.forEach((match) => {
    const tag = match.trim();
    if (tag.startsWith("#")) {
      tagSet.add(normalizeTag(tag));
    }
  });

  return Array.from(tagSet);
}

function extractLinks(content) {
  const links = [];
  const seen = new Set();
  const patterns = [
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    /<((?:https?:\/\/)[^>\s]+)>/g,
    /(^|[\s(])((?:https?:\/\/)[^\s)]+)/g
  ];

  patterns.forEach((regex) => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const url = match[2] || match[1];
      const label = match[1] && match[2] ? match[1] : simplifyUrlLabel(url);
      if (!url || seen.has(url)) {
        continue;
      }

      seen.add(url);
      links.push({ url, label });
    }
  });

  return links;
}

function simplifyUrlLabel(url) {
  return String(url || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .slice(0, 64);
}

function matchesFolder(folderPath, diaryFolder) {
  const normalized = (diaryFolder || "").trim().replace(/^\/+|\/+$/g, "");
  if (!normalized) {
    return false;
  }

  return folderPath === normalized || folderPath.startsWith(`${normalized}/`);
}

function normalizeTagInput(value, fallback) {
  const normalized = normalizeTag(value);
  return normalized === "#" ? fallback : normalized;
}

function normalizeTag(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }

  return text.startsWith("#") ? text.toLowerCase() : `#${text.toLowerCase()}`;
}

function safeRegex(pattern) {
  try {
    return new RegExp(pattern || DEFAULT_SETTINGS.dailyNotePattern);
  } catch (error) {
    return new RegExp(DEFAULT_SETTINGS.dailyNotePattern);
  }
}

function buildStats(records) {
  const tagCount = new Map();
  let timelineCount = 0;
  let imageCount = 0;

  records.forEach((record) => {
    if (record.isTimeline) {
      timelineCount += 1;
    }

    imageCount += record.images.length;
    record.tags.forEach((tag) => {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    });
  });

  return {
    totalNotes: records.length,
    timelineCount,
    imageCount,
    topTags: Array.from(tagCount.entries()).sort((a, b) => b[1] - a[1])
  };
}

function buildActivityGrid(records) {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const counts = new Array(91).fill(0);

  records.forEach((record) => {
    const diff = Math.floor((now - record.date.getTime()) / day);
    if (diff >= 0 && diff < counts.length) {
      counts[counts.length - diff - 1] += 1;
    }
  });

  const max = Math.max(...counts, 1);
  const cells = counts.map((count) => count / max);
  const monthMap = new Map();

  counts.forEach((_, index) => {
    const date = new Date(now - (counts.length - index - 1) * day);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!monthMap.has(key)) {
      monthMap.set(key, formatMonthLabel(date));
    }
  });

  return {
    cells,
    monthLabels: Array.from(monthMap.values()).slice(-3)
  };
}

function sampleRecords(records, count) {
  const pool = records.slice();
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, Math.max(count, 0));
}

function mergeTags(...lists) {
  const tagSet = new Set();
  lists.flat().filter(Boolean).forEach((tag) => tagSet.add(normalizeTag(tag)));
  return Array.from(tagSet);
}

function resolvePrimaryTag(tags, timelineTag, diaryTag, isTimeline, isDiary) {
  if (tags.includes(timelineTag)) {
    return timelineTag;
  }

  if (tags.includes(diaryTag)) {
    return diaryTag;
  }

  if (isTimeline) {
    return timelineTag;
  }

  if (isDiary) {
    return diaryTag;
  }

  return "";
}

function renderStat(container, label, value) {
  const stat = container.createDiv({ cls: "memo-stat" });
  stat.createEl("div", { cls: "memo-stat-value", text: value });
  stat.createEl("div", { cls: "memo-stat-label", text: label });
}

function renderRecordContent(container, record, app) {
  const contentText = record.contentText || record.summary || "";
  if (contentText) {
    const content = container.createDiv({ cls: "memo-card-content feed-content" });
    renderMemoText(content, contentText, app, record.file);
  }

  if (!record.links?.length) {
    return;
  }

  const linkWrap = container.createDiv({ cls: "memo-link-list" });
  record.links.slice(0, 4).forEach((link) => {
    const anchor = linkWrap.createEl("a", {
      cls: "memo-link-chip",
      text: link.label,
      attr: { href: link.url }
    });
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
  });
}

function renderMemoText(container, text, app, file) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  if (!lines.length) {
    return;
  }

  lines.forEach((line) => {
    const lineEl = container.createDiv({ cls: "memo-content-line" });
    if (!line.length) {
      lineEl.innerHTML = "&nbsp;";
      return;
    }

    renderMemoInline(lineEl, line, app, file);
  });
}

function renderMemoInline(container, line, app, file) {
  const regex = /\[\[([^\]]+)\]\]/g;
  let cursor = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > cursor) {
      container.appendText(line.slice(cursor, match.index));
    }

    const raw = match[1].trim();
    const [target, alias] = raw.split("|").map((part) => part.trim());
    const label = alias || target;
    const button = container.createEl("button", {
      cls: "memo-inline-link",
      text: label
    });
    button.type = "button";
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await app.workspace.openLinkText(target, file.path, false);
    });

    cursor = match.index + match[0].length;
  }

  if (cursor < line.length) {
    container.appendText(line.slice(cursor));
  }
}

function rawEntryText(entry) {
  return entry.rawContent || entry.summary || "";
}

function renderTags(container, tags, primaryTag) {
  const wrap = container.createDiv({ cls: "memo-tags" });
  tags.slice(0, 8).forEach((tag) => {
    wrap.createDiv({
      cls: tag === primaryTag ? "memo-chip is-accent" : "memo-chip",
      text: tag
    });
  });
}

function renderImageStrip(container, images, onPreview) {
  const strip = container.createDiv({ cls: "memo-image-strip" });
  images.forEach((image) => {
    const button = strip.createEl("button", { cls: "memo-image-strip-button" });
    const img = button.createEl("img", {
      cls: "memo-image-strip-item",
      attr: { src: image.src, alt: image.alt || "" }
    });
    img.loading = "lazy";
    button.addEventListener("click", () => onPreview(image));
  });
}

class MemoImagePreviewModal extends Modal {
  constructor(app, plugin, record, image, onOpenNote) {
    super(app);
    this.plugin = plugin;
    this.record = record;
    this.image = image;
    this.onOpenNote = onOpenNote;
  }

  onOpen() {
    const { contentEl, modalEl } = this;
    modalEl.addClass("memo-image-preview-modal");
    contentEl.empty();
    contentEl.addClass("memo-image-preview");

    const chrome = contentEl.createDiv({ cls: "memo-image-preview-chrome" });
    const closeButton = chrome.createEl("button", {
      cls: "memo-image-preview-close",
      text: this.plugin.t("previewClose")
    });
    closeButton.addEventListener("click", () => this.close());

    const frame = contentEl.createDiv({ cls: "memo-image-preview-frame" });
    const img = frame.createEl("img", {
      cls: "memo-image-preview-image",
      attr: {
        src: this.image.src,
        alt: this.image.alt || this.record.title
      }
    });
    img.loading = "eager";
    img.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    const meta = contentEl.createDiv({ cls: "memo-image-preview-meta" });
    meta.createEl("div", {
      cls: "memo-image-preview-title",
      text: this.record.title
    });
    meta.createEl("div", {
      cls: "memo-image-preview-date",
      text: `${formatDateTime(this.record.date)} · ${this.record.file.path}`
    });

    const actions = contentEl.createDiv({ cls: "memo-image-preview-actions" });
    const openButton = actions.createEl("button", {
      cls: "feed-open-link",
      text: this.plugin.t("openNote")
    });
    openButton.addEventListener("click", async () => {
      this.close();
      await this.onOpenNote();
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

async function ensureFolderExists(vault, filePath) {
  const parts = filePath.split("/").slice(0, -1).filter(Boolean);
  let current = "";

  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!vault.getAbstractFileByPath(current)) {
      await vault.createFolder(current);
    }
  }
}

function hasImageFiles(files) {
  return Array.from(files || []).some((file) => isImageFile(file));
}

function isImageFile(file) {
  return Boolean(file && typeof file.type === "string" && file.type.startsWith("image/"));
}

function getImageExtension(file) {
  const fromName = String(file.name || "").split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/i.test(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  switch (String(file.type || "").toLowerCase()) {
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "png";
  }
}

function formatDiaryEntry(content, date) {
  const lines = content.replace(/\r/g, "").trim().split("\n");
  const firstLine = lines[0]?.trim() || "";
  const body = lines.slice(1).map((line) => `  ${line}`);
  return [`- ${formatTime(date)}${firstLine ? ` ${firstLine}` : ""}`, ...body].join("\n");
}

function formatDateKey(date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDateStamp(date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

function detectDefaultLanguage() {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale || "";
  return locale.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short"
  }).format(date);
}

function renderSectionEmpty(container, title, copy) {
  const empty = container.createDiv({ cls: "memo-empty-card" });
  empty.createEl("div", { cls: "memo-empty-title", text: title });
  empty.createEl("p", { cls: "memo-empty-copy", text: copy });
}

function formatDateTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

module.exports = MemoTimelineFeedPlugin;

/* nosourcemap */