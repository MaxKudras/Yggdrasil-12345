var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/constants.js
var require_constants = __commonJS({
  "src/constants.js"(exports2, module2) {
    var BUILTIN_CALLOUTS = [
      "note",
      "abstract",
      "info",
      "todo",
      "tip",
      "important",
      "success",
      "question",
      "warning",
      "failure",
      "danger",
      "bug",
      "example",
      "quote",
      "cite"
    ];
    var DEFAULT_CALLOUT_ICON = "message-square";
    var BUNDLED_CALLOUTS = [
      {
        id: "cluddle",
        group: "builtin",
        concept: "builtin",
        icon: "cloud"
      }
    ];
    var BUILTIN_CALLOUT_ICONS = {
      note: "pencil",
      abstract: "clipboard-list",
      info: "info",
      todo: "check-circle-2",
      tip: "flame",
      important: "flame",
      success: "check",
      question: "circle-help",
      warning: "triangle-alert",
      failure: "x",
      danger: "zap",
      bug: "bug",
      example: "list",
      quote: "quote",
      cite: "quote"
    };
    var DEFAULT_SETTINGS2 = {
      maxRowsPerColumn: 8,
      maxGroupColumns: 3,
      modalWidthRem: 42,
      modalHeightVh: 82,
      preferCustomInSearch: true,
      placeCursorOnNextLineAfterInsert: false,
      showBundledCluddleCallout: true,
      nonDefaultCalloutTitleColor: "#000000"
    };
    var GROUP_PROPERTY_PREFIX = "callout-group-";
    module2.exports = {
      BUILTIN_CALLOUTS,
      BUILTIN_CALLOUT_ICONS,
      BUNDLED_CALLOUTS,
      DEFAULT_CALLOUT_ICON,
      DEFAULT_SETTINGS: DEFAULT_SETTINGS2,
      GROUP_PROPERTY_PREFIX
    };
  }
});

// src/callout-registry.js
var require_callout_registry = __commonJS({
  "src/callout-registry.js"(exports2, module2) {
    var {
      BUNDLED_CALLOUTS,
      BUILTIN_CALLOUTS,
      BUILTIN_CALLOUT_ICONS,
      DEFAULT_CALLOUT_ICON,
      GROUP_PROPERTY_PREFIX
    } = require_constants();
    var normalizeConfigPath = (value) => String(value || "").replace(/\\/g, "/");
    try {
      ({ normalizePath: normalizeConfigPath } = require("obsidian"));
    } catch (error) {
    }
    var CalloutRegistry2 = class {
      constructor(app, options = {}) {
        this.app = app;
        this.showBundledCluddleCallout = options.showBundledCluddleCallout || (() => true);
        this.customCallouts = [];
        this.aliasToPrimary = /* @__PURE__ */ new Map();
      }
      async refresh() {
        let enabledSnippets = [];
        try {
          const appearanceRaw = await this.readConfigFile("appearance.json");
          const appearance = JSON.parse(appearanceRaw);
          enabledSnippets = appearance.enabledCssSnippets || [];
        } catch (error) {
          enabledSnippets = [];
        }
        const customCallouts = [];
        const aliasToPrimary = /* @__PURE__ */ new Map();
        const seenPrimaryIds = /* @__PURE__ */ new Set();
        for (const snippetId of enabledSnippets) {
          let css = null;
          try {
            css = await this.readConfigFile(`snippets/${snippetId}.css`);
          } catch (error) {
            continue;
          }
          for (const block of this.parseCalloutBlocks(css, snippetId)) {
            const primaryId = block.ids[0];
            if (!primaryId) {
              continue;
            }
            for (const alias of block.ids) {
              aliasToPrimary.set(alias, primaryId);
            }
            if (seenPrimaryIds.has(primaryId) || BUILTIN_CALLOUTS.includes(primaryId)) {
              continue;
            }
            seenPrimaryIds.add(primaryId);
            customCallouts.push({
              id: primaryId,
              aliases: block.ids.slice(1),
              concept: block.concept || primaryId,
              icon: block.icon,
              groups: block.groups || [],
              snippetId
            });
          }
        }
        this.customCallouts = customCallouts;
        this.aliasToPrimary = aliasToPrimary;
      }
      async readConfigFile(relativePath) {
        const configPath = normalizeConfigPath(`${this.app.vault.configDir}/${relativePath}`);
        return this.app.vault.adapter.read(configPath);
      }
      getMenuOptions() {
        const options = [];
        const seen = /* @__PURE__ */ new Set();
        for (const customCallout of this.customCallouts) {
          const customOptions = this.buildMenuOptions(customCallout.id, true);
          for (const option of customOptions) {
            if (!option || seen.has(option.key)) {
              continue;
            }
            seen.add(option.key);
            options.push(option);
          }
        }
        if (this.showBundledCluddleCallout()) {
          const customIds = new Set(this.customCallouts.map((callout) => callout.id));
          for (const bundledCallout of BUNDLED_CALLOUTS) {
            if (customIds.has(bundledCallout.id)) {
              continue;
            }
            const option = this.buildBundledMenuOption(bundledCallout);
            if (!option || seen.has(option.key)) {
              continue;
            }
            seen.add(option.key);
            options.push(option);
          }
        }
        for (const builtinId of BUILTIN_CALLOUTS) {
          const option = this.buildMenuOptions(builtinId, false)[0];
          if (!option || seen.has(option.key)) {
            continue;
          }
          seen.add(option.key);
          options.push(option);
        }
        return options;
      }
      buildBundledMenuOption(callout) {
        return {
          key: `bundled:${callout.id}`,
          id: callout.id,
          group: callout.group,
          isBundled: true,
          isCustom: false,
          aliases: [callout.id],
          groupAliases: [callout.id],
          concept: callout.concept,
          icon: callout.icon,
          appearanceId: callout.id
        };
      }
      buildMenuOptions(id, isCustom) {
        const customCallout = isCustom ? this.customCallouts.find((callout) => callout.id === id) : null;
        if (!customCallout || !Array.isArray(customCallout.groups) || customCallout.groups.length === 0) {
          return [{
            key: isCustom ? `custom:${id}` : `builtin:${id}`,
            id,
            group: isCustom ? "custom" : "builtin",
            isCustom,
            aliases: customCallout ? [customCallout.id, ...customCallout.aliases] : [],
            groupAliases: [id, ...customCallout ? customCallout.aliases : []],
            concept: customCallout ? customCallout.concept : id,
            icon: customCallout ? customCallout.icon : this.getBuiltinIcon(id),
            appearanceId: id
          }];
        }
        return customCallout.groups.map((group) => {
          const insertId = group.aliases[0] || id;
          return {
            key: `custom:${id}:${group.name}`,
            id: insertId,
            appearanceId: id,
            group: group.name,
            isCustom: true,
            aliases: [customCallout.id, ...customCallout.aliases],
            groupAliases: group.aliases,
            concept: customCallout.concept,
            icon: customCallout.icon
          };
        });
      }
      getBuiltinIcon(id) {
        return BUILTIN_CALLOUT_ICONS[id] || DEFAULT_CALLOUT_ICON;
      }
      normalizeIconName(value) {
        const rawValue = String(value || "").trim();
        if (!rawValue) {
          return "";
        }
        const token = rawValue.split(/[\s,]+/)[0].trim();
        if (!/^lucide-[a-z0-9-]+$/i.test(token)) {
          return "";
        }
        return token.replace(/^lucide-/i, "").toLowerCase();
      }
      isOptionActive(option, activeType) {
        if (!option || !activeType) {
          return false;
        }
        const activeAliases = Array.isArray(option.groupAliases) && option.groupAliases.length > 0 ? [option.id, ...option.groupAliases] : [option.id, ...option.aliases || []];
        return activeAliases.includes(activeType);
      }
      unload() {
      }
      parseCalloutBlocks(css, snippetId) {
        const blocks = [];
        const blockRegex = /((?:\s*\.callout\[data-callout="[^"]+"\]\s*,?\s*\n?)+)\s*\{([\s\S]*?)\}/gm;
        let match;
        while ((match = blockRegex.exec(css)) !== null) {
          const selectors = Array.from(match[1].matchAll(/data-callout="([^"]+)"/g)).map((selectorMatch) => selectorMatch[1]);
          if (selectors.length === 0) {
            continue;
          }
          const metadata = this.parseCalloutMetadata(match[2]);
          blocks.push({
            ids: selectors,
            concept: metadata.concept,
            icon: metadata.icon,
            groups: metadata.groups,
            snippetId
          });
        }
        return blocks;
      }
      parseCalloutMetadata(body) {
        const properties = /* @__PURE__ */ new Map();
        const propertyRegex = /--([a-z0-9-]+)\s*:\s*([^;]+);/gim;
        let match;
        while ((match = propertyRegex.exec(body)) !== null) {
          properties.set(match[1].toLowerCase(), this.parseMetadataValue(match[2]));
        }
        const concept = properties.get("callout-concept") || "";
        const icon = this.normalizeIconName(properties.get("callout-icon") || "");
        const configuredGroups = this.parseMetadataList(properties.get("callout-groups") || "");
        const inferredGroups = Array.from(properties.keys()).filter((key) => key.startsWith(GROUP_PROPERTY_PREFIX)).map((key) => key.slice(GROUP_PROPERTY_PREFIX.length)).filter((groupName) => groupName.length > 0);
        const groupNames = [];
        for (const groupName of [...configuredGroups, ...inferredGroups]) {
          if (!groupName || groupNames.includes(groupName)) {
            continue;
          }
          groupNames.push(groupName);
        }
        const groups = groupNames.map((groupName) => ({
          name: groupName,
          aliases: this.parseMetadataList(properties.get(`${GROUP_PROPERTY_PREFIX}${groupName}`) || "")
        })).filter((group) => group.aliases.length > 0);
        return { concept, icon, groups };
      }
      parseMetadataValue(value) {
        return String(value || "").trim().replace(/^['"]|['"]$/g, "");
      }
      parseMetadataList(value) {
        return String(value || "").split(/[\s,]+/).map((entry) => entry.trim()).filter((entry) => entry.length > 0);
      }
    };
    module2.exports = {
      CalloutRegistry: CalloutRegistry2
    };
  }
});

// src/editor-callout-service.js
var require_editor_callout_service = __commonJS({
  "src/editor-callout-service.js"(exports2, module2) {
    var EditorCalloutService2 = class {
      findCalloutContext(editor) {
        const cursorLine = editor.getCursor("head").line;
        if (!this.isBlockquoteLine(editor.getLine(cursorLine))) {
          return null;
        }
        let headerContext = null;
        for (let lineNumber = cursorLine; lineNumber >= 0; lineNumber -= 1) {
          const line = editor.getLine(lineNumber);
          const parsedHeader = this.parseCalloutHeaderLine(line);
          if (parsedHeader) {
            headerContext = {
              ...parsedHeader,
              headerLine: line,
              lineStart: lineNumber
            };
            break;
          }
          if (!this.isBlockquoteLine(line)) {
            return null;
          }
        }
        if (!headerContext) {
          return null;
        }
        let lineEnd = headerContext.lineStart;
        for (let lineNumber = headerContext.lineStart + 1; lineNumber < editor.lineCount(); lineNumber += 1) {
          if (!this.isBlockquoteLine(editor.getLine(lineNumber))) {
            break;
          }
          lineEnd = lineNumber;
        }
        return {
          ...headerContext,
          lineEnd
        };
      }
      applyCalloutChoice(editor, calloutId, options = {}) {
        const context = this.findCalloutContext(editor);
        const linePrefix = this.getInsertedCalloutPrefix(editor, context);
        const selection = editor.getSelection();
        if (selection && selection.length > 0) {
          editor.replaceSelection(this.wrapSelectionAsCallout(selection, calloutId, linePrefix));
          this.focusEditor(editor);
          return;
        }
        const cursor = editor.getCursor();
        const placeCursorOnNextLine = options.placeCursorOnNextLine === true;
        const headerLine = placeCursorOnNextLine ? `${linePrefix}[!${calloutId}]` : `${linePrefix}[!${calloutId}] `;
        if (context && cursor.line !== context.lineStart) {
          const currentLine = editor.getLine(cursor.line);
          editor.setLine(cursor.line, headerLine);
          editor.replaceRange(`
${this.buildNestedBodyLine(currentLine, linePrefix)}`, {
            line: cursor.line,
            ch: headerLine.length
          });
          editor.setCursor(placeCursorOnNextLine ? { line: cursor.line + 1, ch: linePrefix.length } : { line: cursor.line, ch: headerLine.length });
          this.focusEditor(editor);
          return;
        }
        const insertionPoint = this.getCalloutInsertionPoint(editor, context);
        const insertsAfterCurrentLine = context !== null;
        const insertion = `${insertsAfterCurrentLine ? "\n" : ""}${headerLine}
${linePrefix}`;
        editor.replaceRange(insertion, insertionPoint);
        const headerLineNumber = insertsAfterCurrentLine ? insertionPoint.line + 1 : insertionPoint.line;
        editor.setCursor(placeCursorOnNextLine ? { line: headerLineNumber + 1, ch: linePrefix.length } : { line: headerLineNumber, ch: headerLine.length });
        this.focusEditor(editor);
      }
      renameCalloutType(editor, calloutId, existingContext = null) {
        const context = existingContext || this.findCalloutContext(editor);
        if (!context) {
          return;
        }
        editor.setLine(context.lineStart, this.replaceCalloutType(context.headerLine, calloutId));
        this.focusEditor(editor);
      }
      clearCalloutFromEditor(editor, existingContext = null) {
        const context = existingContext || this.findCalloutContext(editor);
        if (!context) {
          return;
        }
        editor.setLine(context.lineStart, this.removeCalloutHeader(context.headerLine));
        this.focusEditor(editor);
      }
      handleNestedCalloutEnter(editor) {
        const action = this.getNestedCalloutEnterAction(editor);
        if (!action) {
          return false;
        }
        if (action.type === "replace-line") {
          editor.setLine(action.line, action.text);
          editor.setCursor(action.cursor);
          this.focusEditor(editor);
          return true;
        }
        editor.replaceRange(action.text, action.from);
        editor.setCursor(action.cursor);
        this.focusEditor(editor);
        return true;
      }
      focusEditor(editor) {
        if (editor && typeof editor.focus === "function") {
          editor.focus();
        }
      }
      getNestedCalloutEnterAction(editor) {
        if (!editor) {
          return null;
        }
        const selectedText = typeof editor.getSelection === "function" ? editor.getSelection() : "";
        if (selectedText) {
          return null;
        }
        const cursor = editor.getCursor("head");
        const context = this.findCalloutContext(editor);
        if (!cursor || !context || !this.isNestedCalloutContext(editor, context)) {
          return null;
        }
        const contextDepth = this.getBlockquoteDepth(context.prefix);
        const currentLine = editor.getLine(cursor.line);
        if (this.getLineBlockquoteDepth(currentLine) < contextDepth) {
          return null;
        }
        const continuationPrefix = this.getBlockquotePrefix(context.headerLine);
        if (this.isEmptyBlockquoteLineAtPrefix(currentLine, continuationPrefix)) {
          const parentPrefix = this.getParentCalloutPrefix(editor, context);
          if (!parentPrefix) {
            return null;
          }
          return {
            type: "replace-line",
            line: cursor.line,
            text: parentPrefix,
            cursor: { line: cursor.line, ch: parentPrefix.length }
          };
        }
        return {
          type: "insert",
          text: `
${continuationPrefix}`,
          from: cursor,
          cursor: { line: cursor.line + 1, ch: continuationPrefix.length }
        };
      }
      isCalloutHeaderLine(line) {
        return this.parseCalloutHeaderLine(line) !== null;
      }
      isBlockquoteLine(line) {
        return /^\s*>/.test(line || "");
      }
      getBlockquotePrefix(line) {
        const match = /^(\s*(?:>\s*)+)/.exec(line || "");
        if (!match) {
          return "";
        }
        return match[1].replace(/\s*$/, " ");
      }
      getLineBlockquoteDepth(line) {
        return this.getBlockquoteDepth(this.getBlockquotePrefix(line));
      }
      getBlockquoteDepth(prefix) {
        const markers = String(prefix || "").match(/>/g);
        return markers ? markers.length : 0;
      }
      isNestedCalloutContext(editor, context) {
        const contextDepth = this.getBlockquoteDepth(context.prefix);
        if (contextDepth <= 1) {
          return false;
        }
        for (let lineNumber = context.lineStart - 1; lineNumber >= 0; lineNumber -= 1) {
          const line = editor.getLine(lineNumber);
          if (!this.isBlockquoteLine(line)) {
            return false;
          }
          const parsedHeader = this.parseCalloutHeaderLine(line);
          if (parsedHeader && this.getBlockquoteDepth(parsedHeader.prefix) < contextDepth) {
            return true;
          }
        }
        return false;
      }
      getParentCalloutPrefix(editor, context) {
        const contextDepth = this.getBlockquoteDepth(context.prefix);
        for (let lineNumber = context.lineStart - 1; lineNumber >= 0; lineNumber -= 1) {
          const line = editor.getLine(lineNumber);
          if (!this.isBlockquoteLine(line)) {
            return "";
          }
          const parsedHeader = this.parseCalloutHeaderLine(line);
          if (parsedHeader && this.getBlockquoteDepth(parsedHeader.prefix) < contextDepth) {
            return this.getBlockquotePrefix(line);
          }
        }
        return "";
      }
      isEmptyBlockquoteLineAtPrefix(line, prefix) {
        if (this.getLineBlockquoteDepth(line) !== this.getBlockquoteDepth(prefix)) {
          return false;
        }
        const linePrefix = this.getBlockquotePrefix(line);
        return line.slice(linePrefix.length).trim().length === 0;
      }
      parseCalloutHeaderLine(line) {
        const match = /^(\s*(?:>\s*)+)\[!([^\]|]+)(?:[^\]]*)\]([+-]?)(.*)$/.exec(line || "");
        if (!match) {
          return null;
        }
        return {
          prefix: match[1],
          calloutType: match[2],
          foldState: match[3] || "",
          remainder: match[4] || ""
        };
      }
      replaceCalloutType(line, calloutId) {
        const parsedHeader = this.parseCalloutHeaderLine(line);
        if (!parsedHeader) {
          return line;
        }
        return `${parsedHeader.prefix}[!${calloutId}]${parsedHeader.foldState}${parsedHeader.remainder}`;
      }
      removeCalloutHeader(line) {
        const parsedHeader = this.parseCalloutHeaderLine(line);
        if (!parsedHeader) {
          return line;
        }
        const trimmedPrefix = parsedHeader.prefix.replace(/\s+$/, "");
        const trimmedRemainder = parsedHeader.remainder.trimStart();
        if (!trimmedRemainder) {
          return trimmedPrefix.length > 0 ? trimmedPrefix : ">";
        }
        return `${trimmedPrefix} ${trimmedRemainder}`;
      }
      getActiveCalloutTypeFromEditor(editor) {
        return this.findCalloutContext(editor)?.calloutType || "";
      }
      getInsertedCalloutPrefix(editor, existingContext = null) {
        const context = existingContext || this.findCalloutContext(editor);
        if (!context) {
          return "> ";
        }
        return `${this.getBlockquotePrefix(editor.getLine(editor.getCursor("head").line))}> `;
      }
      getCalloutInsertionPoint(editor, existingContext = null) {
        const cursor = editor.getCursor();
        const context = existingContext || this.findCalloutContext(editor);
        if (!context) {
          return cursor;
        }
        return {
          line: cursor.line,
          ch: editor.getLine(cursor.line).length
        };
      }
      buildNestedBodyLine(currentLine, linePrefix) {
        const currentPrefix = this.getBlockquotePrefix(currentLine);
        const currentLineRemainder = currentLine.slice(currentPrefix.length);
        if (currentLineRemainder.length === 0) {
          return linePrefix;
        }
        return `${linePrefix}${currentLineRemainder}`;
      }
      wrapSelectionAsCallout(selection, calloutId, linePrefix = "> ") {
        const normalized = String(selection || "").replace(/\r\n/g, "\n");
        const lines = normalized.split("\n");
        const content = lines.map((line) => {
          if (line.length === 0) {
            return linePrefix.trimEnd();
          }
          return `${linePrefix}${line}`;
        }).join("\n");
        return `${linePrefix}[!${calloutId}]
${content}`;
      }
    };
    module2.exports = {
      EditorCalloutService: EditorCalloutService2
    };
  }
});

// src/navigation-utils.js
var require_navigation_utils = __commonJS({
  "src/navigation-utils.js"(exports2, module2) {
    function getRelativeIndex(currentIndex, itemCount, delta) {
      if (!Number.isInteger(itemCount) || itemCount <= 0) {
        return -1;
      }
      if (!Number.isInteger(currentIndex) || currentIndex < 0 || currentIndex >= itemCount) {
        return delta >= 0 ? 0 : itemCount - 1;
      }
      return (currentIndex + delta + itemCount) % itemCount;
    }
    function normalizeGridPosition(columnLengths, currentColumnIndex, currentRowIndex, preferEnd = false) {
      if (!Array.isArray(columnLengths) || columnLengths.length === 0) {
        return null;
      }
      const nonEmptyColumns = columnLengths.map((length, columnIndex) => ({ length, columnIndex })).filter((entry) => Number.isInteger(entry.length) && entry.length > 0);
      if (nonEmptyColumns.length === 0) {
        return null;
      }
      if (Number.isInteger(currentColumnIndex) && currentColumnIndex >= 0 && currentColumnIndex < columnLengths.length && Number.isInteger(currentRowIndex) && currentRowIndex >= 0 && currentRowIndex < columnLengths[currentColumnIndex]) {
        return { columnIndex: currentColumnIndex, rowIndex: currentRowIndex };
      }
      const fallback = preferEnd ? nonEmptyColumns[nonEmptyColumns.length - 1] : nonEmptyColumns[0];
      return {
        columnIndex: fallback.columnIndex,
        rowIndex: preferEnd ? fallback.length - 1 : 0
      };
    }
    function moveGridSelection(columnLengths, currentColumnIndex, currentRowIndex, direction) {
      const hasValidCurrentSelection = Array.isArray(columnLengths) && Number.isInteger(currentColumnIndex) && currentColumnIndex >= 0 && currentColumnIndex < columnLengths.length && Number.isInteger(currentRowIndex) && currentRowIndex >= 0 && currentRowIndex < columnLengths[currentColumnIndex];
      const start = normalizeGridPosition(
        columnLengths,
        currentColumnIndex,
        currentRowIndex,
        direction === "up" || direction === "left"
      );
      if (!start) {
        return null;
      }
      if (!hasValidCurrentSelection) {
        return start;
      }
      if (direction === "down") {
        if (start.rowIndex + 1 < columnLengths[start.columnIndex]) {
          return { columnIndex: start.columnIndex, rowIndex: start.rowIndex + 1 };
        }
        const nextColumnIndex = getRelativeIndex(start.columnIndex, columnLengths.length, 1);
        return { columnIndex: nextColumnIndex, rowIndex: 0 };
      }
      if (direction === "up") {
        if (start.rowIndex - 1 >= 0) {
          return { columnIndex: start.columnIndex, rowIndex: start.rowIndex - 1 };
        }
        const previousColumnIndex = getRelativeIndex(start.columnIndex, columnLengths.length, -1);
        return {
          columnIndex: previousColumnIndex,
          rowIndex: columnLengths[previousColumnIndex] - 1
        };
      }
      if (direction === "right" || direction === "left") {
        const delta = direction === "right" ? 1 : -1;
        const targetColumnIndex = getRelativeIndex(start.columnIndex, columnLengths.length, delta);
        return {
          columnIndex: targetColumnIndex,
          rowIndex: Math.min(start.rowIndex, columnLengths[targetColumnIndex] - 1)
        };
      }
      return start;
    }
    function normalizePickerPosition(rowColumnLengths, currentRowIndex, currentColumnIndex, currentItemIndex, preferEnd = false) {
      if (!Array.isArray(rowColumnLengths) || rowColumnLengths.length === 0) {
        return null;
      }
      const visibleRows = rowColumnLengths.map((columns, rowIndex) => ({
        rowIndex,
        columns: Array.isArray(columns) ? columns.map((length, columnIndex) => ({ length, columnIndex })).filter((entry) => Number.isInteger(entry.length) && entry.length > 0) : []
      })).filter((row) => row.columns.length > 0);
      if (visibleRows.length === 0) {
        return null;
      }
      if (Number.isInteger(currentRowIndex) && currentRowIndex >= 0 && currentRowIndex < rowColumnLengths.length && Array.isArray(rowColumnLengths[currentRowIndex]) && Number.isInteger(currentColumnIndex) && currentColumnIndex >= 0 && currentColumnIndex < rowColumnLengths[currentRowIndex].length && Number.isInteger(currentItemIndex) && currentItemIndex >= 0 && currentItemIndex < rowColumnLengths[currentRowIndex][currentColumnIndex]) {
        return {
          rowIndex: currentRowIndex,
          columnIndex: currentColumnIndex,
          itemIndex: currentItemIndex
        };
      }
      const fallbackRow = preferEnd ? visibleRows[visibleRows.length - 1] : visibleRows[0];
      const fallbackColumn = preferEnd ? fallbackRow.columns[fallbackRow.columns.length - 1] : fallbackRow.columns[0];
      return {
        rowIndex: fallbackRow.rowIndex,
        columnIndex: fallbackColumn.columnIndex,
        itemIndex: preferEnd ? fallbackColumn.length - 1 : 0
      };
    }
    function movePickerSelection(rowColumnLengths, currentRowIndex, currentColumnIndex, currentItemIndex, direction) {
      const hasValidCurrentSelection = Array.isArray(rowColumnLengths) && Number.isInteger(currentRowIndex) && currentRowIndex >= 0 && currentRowIndex < rowColumnLengths.length && Array.isArray(rowColumnLengths[currentRowIndex]) && Number.isInteger(currentColumnIndex) && currentColumnIndex >= 0 && currentColumnIndex < rowColumnLengths[currentRowIndex].length && Number.isInteger(currentItemIndex) && currentItemIndex >= 0 && currentItemIndex < rowColumnLengths[currentRowIndex][currentColumnIndex];
      const preferEnd = direction === "up" || direction === "left";
      const start = normalizePickerPosition(
        rowColumnLengths,
        currentRowIndex,
        currentColumnIndex,
        currentItemIndex,
        preferEnd
      );
      if (!start) {
        return null;
      }
      if (!hasValidCurrentSelection) {
        return start;
      }
      const currentRow = rowColumnLengths[start.rowIndex];
      const currentColumnLength = currentRow[start.columnIndex];
      if (direction === "down") {
        if (start.itemIndex + 1 < currentColumnLength) {
          return { rowIndex: start.rowIndex, columnIndex: start.columnIndex, itemIndex: start.itemIndex + 1 };
        }
        const nextColumnIndex = currentRow.findIndex((length, columnIndex) => columnIndex > start.columnIndex && length > 0);
        if (nextColumnIndex !== -1) {
          return { rowIndex: start.rowIndex, columnIndex: nextColumnIndex, itemIndex: 0 };
        }
        const nextRowIndex = rowColumnLengths.findIndex((columns, rowIndex) => rowIndex > start.rowIndex && Array.isArray(columns) && columns.some((length) => length > 0));
        if (nextRowIndex !== -1) {
          const firstColumnIndex = rowColumnLengths[nextRowIndex].findIndex((length) => length > 0);
          return { rowIndex: nextRowIndex, columnIndex: firstColumnIndex, itemIndex: 0 };
        }
        return normalizePickerPosition(rowColumnLengths, -1, -1, -1, false);
      }
      if (direction === "up") {
        if (start.itemIndex - 1 >= 0) {
          return { rowIndex: start.rowIndex, columnIndex: start.columnIndex, itemIndex: start.itemIndex - 1 };
        }
        for (let columnIndex = start.columnIndex - 1; columnIndex >= 0; columnIndex -= 1) {
          if (currentRow[columnIndex] > 0) {
            return {
              rowIndex: start.rowIndex,
              columnIndex,
              itemIndex: currentRow[columnIndex] - 1
            };
          }
        }
        for (let rowIndex = start.rowIndex - 1; rowIndex >= 0; rowIndex -= 1) {
          const row = rowColumnLengths[rowIndex];
          if (!Array.isArray(row)) {
            continue;
          }
          for (let columnIndex = row.length - 1; columnIndex >= 0; columnIndex -= 1) {
            if (row[columnIndex] > 0) {
              return {
                rowIndex,
                columnIndex,
                itemIndex: row[columnIndex] - 1
              };
            }
          }
        }
        return normalizePickerPosition(rowColumnLengths, -1, -1, -1, true);
      }
      if (direction === "right" || direction === "left") {
        const delta = direction === "right" ? 1 : -1;
        const currentVisibleColumns = currentRow.map((length, columnIndex) => ({ length, columnIndex })).filter((entry) => entry.length > 0);
        const visibleColumnPosition = currentVisibleColumns.findIndex((entry) => entry.columnIndex === start.columnIndex);
        const targetVisiblePosition = getRelativeIndex(visibleColumnPosition, currentVisibleColumns.length, delta);
        const targetColumn = currentVisibleColumns[targetVisiblePosition];
        return {
          rowIndex: start.rowIndex,
          columnIndex: targetColumn.columnIndex,
          itemIndex: Math.min(start.itemIndex, targetColumn.length - 1)
        };
      }
      return start;
    }
    module2.exports = {
      getRelativeIndex,
      moveGridSelection,
      movePickerSelection
    };
  }
});

// src/picker-layout.js
var require_picker_layout = __commonJS({
  "src/picker-layout.js"(exports2, module2) {
    function getSectionDescriptor(option) {
      if (!option) {
        return null;
      }
      if (option.id === "none") {
        return { key: "utility", label: "utility" };
      }
      if (option.isBundled) {
        const groupName = option.group || "builtin";
        if (groupName === "builtin") {
          return { key: "builtin", label: "builtin" };
        }
        return { key: `bundled:${groupName}`, label: groupName };
      }
      if (option.isCustom) {
        const groupName = option.group || "custom";
        return { key: `custom:${groupName}`, label: groupName };
      }
      return { key: "builtin", label: "builtin" };
    }
    function buildPickerSections(options, includeUtility = true) {
      const sections = [];
      const sectionMap = /* @__PURE__ */ new Map();
      const ensureSection = (descriptor) => {
        if (!descriptor) {
          return null;
        }
        if (!sectionMap.has(descriptor.key)) {
          const section = {
            key: descriptor.key,
            label: descriptor.label,
            options: []
          };
          sectionMap.set(descriptor.key, section);
          sections.push(section);
        }
        return sectionMap.get(descriptor.key);
      };
      for (const option of options || []) {
        const section = ensureSection(getSectionDescriptor(option));
        if (section) {
          section.options.push(option);
        }
      }
      if (includeUtility) {
        ensureSection({ key: "utility", label: "utility" });
      }
      return sections;
    }
    function chunkOptions(options, maxItemsPerColumn) {
      const normalizedMax = Math.max(1, Number(maxItemsPerColumn) || 1);
      const chunks = [];
      for (let index = 0; index < options.length; index += normalizedMax) {
        chunks.push(options.slice(index, index + normalizedMax));
      }
      return chunks;
    }
    function buildPickerColumnBlocks(options, maxItemsPerColumn, includeUtility = true) {
      const columnBlocks = [];
      for (const section of buildPickerSections(options, includeUtility)) {
        const chunks = section.options.length > 0 ? chunkOptions(section.options, maxItemsPerColumn) : [[]];
        chunks.forEach((chunk, chunkIndex) => {
          columnBlocks.push({
            key: `${section.key}:column:${chunkIndex}`,
            sectionKey: section.key,
            label: section.label,
            options: chunk,
            columnIndex: chunkIndex,
            showLabel: chunkIndex === 0
          });
        });
      }
      return columnBlocks;
    }
    function chunkBlocks(blocks, maxColumns) {
      const normalizedMax = Math.max(1, Number(maxColumns) || 1);
      const rows = [];
      for (let index = 0; index < blocks.length; index += normalizedMax) {
        rows.push(blocks.slice(index, index + normalizedMax));
      }
      return rows;
    }
    function buildPickerRows(options, maxItemsPerColumn, maxColumns, includeUtility = true) {
      const customBlocks = [];
      const builtinBlocks = [];
      const utilityBlocks = [];
      for (const block of buildPickerColumnBlocks(options, maxItemsPerColumn, includeUtility)) {
        if (block.sectionKey === "builtin") {
          builtinBlocks.push(block);
          continue;
        }
        if (block.sectionKey === "utility") {
          utilityBlocks.push(block);
          continue;
        }
        customBlocks.push(block);
      }
      const rows = [];
      chunkBlocks(customBlocks, maxColumns).forEach((blocks, rowIndex) => {
        rows.push({
          key: `custom-row:${rowIndex}`,
          kind: "custom",
          blocks
        });
      });
      const systemBlocks = [...builtinBlocks, ...utilityBlocks];
      chunkBlocks(systemBlocks, maxColumns).forEach((blocks, rowIndex) => {
        rows.push({
          key: `system-row:${rowIndex}`,
          kind: blocks.some((block) => block.sectionKey === "builtin") ? "builtin" : "utility",
          blocks
        });
      });
      return rows;
    }
    module2.exports = {
      buildPickerRows,
      buildPickerColumnBlocks,
      buildPickerSections,
      chunkBlocks,
      chunkOptions,
      getSectionDescriptor
    };
  }
});

// src/callout-picker-modal.js
var require_callout_picker_modal = __commonJS({
  "src/callout-picker-modal.js"(exports2, module2) {
    var { Modal, setIcon } = require("obsidian");
    var { DEFAULT_CALLOUT_ICON, DEFAULT_SETTINGS: DEFAULT_SETTINGS2 } = require_constants();
    var { movePickerSelection } = require_navigation_utils();
    var { buildPickerRows } = require_picker_layout();
    var CalloutPickerModal = class extends Modal {
      constructor(app, options) {
        super(app);
        this.controller = options.controller;
        this.options = options.options;
        this.activeType = options.activeType || "";
        this.onChoose = options.onChoose;
        this.onClear = options.onClear;
        this.includeUtility = options.includeUtility !== false;
        this.itemNodeActions = /* @__PURE__ */ new WeakMap();
      }
      runItemAction(itemNode, useAlternateInsertionMode = false) {
        if (!itemNode) {
          return;
        }
        const action = this.itemNodeActions.get(itemNode);
        if (typeof action === "function") {
          action(useAlternateInsertionMode);
        }
      }
      setCalloutIcon(iconEl, iconName) {
        setIcon(iconEl, iconName || DEFAULT_CALLOUT_ICON);
        if (!iconEl.querySelector("svg") && iconName && iconName !== DEFAULT_CALLOUT_ICON) {
          setIcon(iconEl, DEFAULT_CALLOUT_ICON);
        }
      }
      onOpen() {
        this.itemNodeActions = /* @__PURE__ */ new WeakMap();
        this.modalEl.addClass("custom-callout-picker-modal");
        this.contentEl.empty();
        const shell = this.contentEl.createDiv({ cls: "custom-callout-context-menu-shell custom-callout-picker-shell" });
        const searchWrap = shell.createDiv({ cls: "custom-callout-context-menu-search" });
        const searchInput = searchWrap.createEl("input", {
          cls: "custom-callout-context-menu-search-input",
          attr: {
            type: "text",
            placeholder: "Search callouts"
          }
        });
        const content = shell.createDiv({ cls: "custom-callout-context-menu-content" });
        let itemIndex = 0;
        const columnBlocks = [];
        const rowEntries = [];
        const maxRowsPerColumn = typeof this.controller.getMaxRowsPerColumn === "function" ? this.controller.getMaxRowsPerColumn() : DEFAULT_SETTINGS2.maxRowsPerColumn;
        for (const row of buildPickerRows(
          this.options,
          maxRowsPerColumn,
          DEFAULT_SETTINGS2.maxGroupColumns,
          this.includeUtility
        )) {
          const rowEl = content.createDiv({
            cls: "custom-callout-context-menu-row",
            attr: { "data-row-kind": row.kind }
          });
          const rowEntry = { rowEl, blocks: [] };
          for (const block of row.blocks) {
            const wrapper = rowEl.createDiv({
              cls: "custom-callout-context-menu-group",
              attr: {
                "data-section": block.sectionKey,
                "data-column-index": String(block.columnIndex)
              }
            });
            wrapper.toggleClass("is-label-hidden", !block.showLabel);
            const labelEl = wrapper.createDiv({
              cls: "custom-callout-context-menu-group-label",
              text: this.controller.formatTitle(block.label || block.sectionKey)
            });
            labelEl.toggleClass("is-placeholder", !block.showLabel);
            if (!block.showLabel) {
              labelEl.setAttribute("aria-hidden", "true");
            }
            const section = wrapper.createDiv({
              cls: "custom-callout-context-menu-section",
              attr: { "data-section": block.sectionKey }
            });
            if (block.sectionKey === "utility") {
              const itemNode = this.createUtilityNode(itemIndex);
              itemIndex += 1;
              section.appendChild(itemNode);
            } else {
              for (const option of block.options) {
                const itemNode = this.createItemNode(option, itemIndex);
                itemIndex += 1;
                section.appendChild(itemNode);
              }
            }
            const blockEntry = { wrapper, section };
            columnBlocks.push(blockEntry);
            rowEntry.blocks.push(blockEntry);
          }
          rowEntries.push(rowEntry);
        }
        let selectedItemNode = null;
        let lastAppliedQuery = null;
        let activeQuery = "";
        let scoreByItem = /* @__PURE__ */ new Map();
        const getVisibleMenuItems = () => Array.from(this.contentEl.querySelectorAll(".custom-callout-context-menu-item")).filter((itemNode) => !itemNode.hasClass("is-search-hidden"));
        const compareVisibleItems = (a, b) => {
          if (activeQuery.length > 0) {
            const scoreDelta = (scoreByItem.get(b) || 0) - (scoreByItem.get(a) || 0);
            if (scoreDelta !== 0) {
              return scoreDelta;
            }
          }
          return this.controller.compareMenuItems(a, b);
        };
        const getVisibleRows = () => rowEntries.map((rowEntry) => rowEntry.blocks.map((block) => Array.from(block.section.querySelectorAll(".custom-callout-context-menu-item")).filter((itemNode) => !itemNode.hasClass("is-search-hidden")).sort(compareVisibleItems)).filter((items) => items.length > 0)).filter((columns) => columns.length > 0);
        const setSelectedItem = (itemNode) => {
          const menuItems = Array.from(this.contentEl.querySelectorAll(".custom-callout-context-menu-item"));
          for (const currentItem of menuItems) {
            currentItem.removeClass("is-search-top-result");
          }
          selectedItemNode = itemNode || null;
          if (!selectedItemNode) {
            return;
          }
          selectedItemNode.addClass("is-search-top-result");
          selectedItemNode.scrollIntoView({ block: "nearest", inline: "nearest" });
        };
        const moveSelectionInGrid = (direction) => {
          const visibleRows = getVisibleRows();
          if (visibleRows.length === 0) {
            return;
          }
          let currentVisibleRowIndex = -1;
          let currentVisibleColumnIndex = -1;
          let currentItemIndex = -1;
          if (selectedItemNode) {
            visibleRows.some((columns, rowIndex) => {
              return columns.some((columnItems, columnIndex) => {
                const itemIndex2 = columnItems.indexOf(selectedItemNode);
                if (itemIndex2 === -1) {
                  return false;
                }
                currentVisibleRowIndex = rowIndex;
                currentVisibleColumnIndex = columnIndex;
                currentItemIndex = itemIndex2;
                return true;
              });
            });
          }
          const target = movePickerSelection(
            visibleRows.map((columns) => columns.map((items) => items.length)),
            currentVisibleRowIndex,
            currentVisibleColumnIndex,
            currentItemIndex,
            direction
          );
          if (target) {
            setSelectedItem(visibleRows[target.rowIndex][target.columnIndex][target.itemIndex]);
          }
        };
        const applyFilter = () => {
          const query = searchInput.value.trim().toLowerCase();
          const queryChanged = query !== lastAppliedQuery;
          activeQuery = query;
          const menuItems = Array.from(this.contentEl.querySelectorAll(".custom-callout-context-menu-item"));
          scoreByItem = /* @__PURE__ */ new Map();
          let bestMatch = null;
          for (const itemNode of menuItems) {
            itemNode.removeClass("is-search-top-result");
            const score = this.controller.getMenuItemSearchScore(itemNode, query);
            scoreByItem.set(itemNode, score);
            const isVisible = score > 0;
            itemNode.toggleClass("is-search-hidden", !isVisible);
            if (!isVisible) {
              continue;
            }
            if (bestMatch === null || score > bestMatch.score || score === bestMatch.score && this.controller.compareMenuItems(itemNode, bestMatch.itemNode) < 0) {
              bestMatch = { itemNode, score };
            }
          }
          for (const block of columnBlocks) {
            const items = Array.from(block.section.querySelectorAll(".custom-callout-context-menu-item"));
            items.sort(compareVisibleItems);
            for (const itemNode of items) {
              block.section.appendChild(itemNode);
            }
            const visibleItems2 = items.filter((itemNode) => !itemNode.hasClass("is-search-hidden"));
            block.wrapper.toggleClass("is-empty", visibleItems2.length === 0);
          }
          for (const rowEntry of rowEntries) {
            rowEntry.rowEl.toggleClass("is-empty", rowEntry.blocks.every((block) => block.wrapper.hasClass("is-empty")));
          }
          const visibleItems = getVisibleMenuItems();
          if (visibleItems.length === 0) {
            setSelectedItem(null);
            lastAppliedQuery = query;
            return;
          }
          if (!queryChanged && selectedItemNode && visibleItems.includes(selectedItemNode)) {
            setSelectedItem(selectedItemNode);
            lastAppliedQuery = query;
            return;
          }
          setSelectedItem(bestMatch ? bestMatch.itemNode : visibleItems.sort(compareVisibleItems)[0]);
          lastAppliedQuery = query;
        };
        searchInput.addEventListener("input", applyFilter);
        searchInput.addEventListener("keydown", (event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            moveSelectionInGrid("down");
            return;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            moveSelectionInGrid("up");
            return;
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            moveSelectionInGrid("right");
            return;
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveSelectionInGrid("left");
            return;
          }
          if (event.key === "Enter") {
            if (selectedItemNode) {
              event.preventDefault();
              event.stopPropagation();
              this.runItemAction(selectedItemNode, event.altKey === true);
            }
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            this.close();
          }
        });
        window.setTimeout(() => {
          searchInput.focus();
          searchInput.select();
        }, 0);
        applyFilter();
      }
      createItemNode(option, defaultOrder) {
        const itemNode = this.contentEl.createDiv({ cls: "menu-item custom-callout-context-menu-item" });
        itemNode.setAttribute("data-callout-id", option.id);
        itemNode.setAttribute("data-callout-custom", String(option.isCustom));
        itemNode.setAttribute("data-callout-group", option.group || "");
        itemNode.setAttribute("data-callout-concept", option.concept || "");
        itemNode.setAttribute("data-callout-search", this.controller.buildSearchText(option));
        itemNode.setAttribute("data-default-order", String(defaultOrder));
        const appearanceEl = itemNode.createDiv({ cls: "custom-callout-context-menu-appearance callout" });
        appearanceEl.setAttribute("data-callout", option.appearanceId || option.id);
        const iconEl = appearanceEl.createDiv({ cls: "menu-item-icon custom-callout-context-menu-icon" });
        this.setCalloutIcon(iconEl, option.icon);
        appearanceEl.createDiv({
          cls: "menu-item-title",
          text: this.controller.formatTitle(option.id)
        });
        if (this.controller.isOptionActive(option, this.activeType)) {
          const checkEl = appearanceEl.createDiv({ cls: "menu-item-icon menu-item-icon-end" });
          setIcon(checkEl, "check");
        }
        this.itemNodeActions.set(itemNode, (useAlternateInsertionMode) => {
          this.close();
          this.onChoose(option, { useAlternateInsertionMode });
        });
        itemNode.addEventListener("click", (event) => {
          this.runItemAction(itemNode, event.altKey === true);
        });
        return itemNode;
      }
      createUtilityNode(defaultOrder) {
        const itemNode = this.contentEl.createDiv({ cls: "menu-item custom-callout-context-menu-item" });
        itemNode.setAttribute("data-callout-id", "none");
        itemNode.setAttribute("data-callout-custom", "false");
        itemNode.setAttribute("data-callout-search", "none clear remove");
        itemNode.setAttribute("data-default-order", String(defaultOrder));
        const appearanceEl = itemNode.createDiv({ cls: "custom-callout-context-menu-appearance" });
        const iconEl = appearanceEl.createDiv({ cls: "menu-item-icon" });
        setIcon(iconEl, "eraser");
        appearanceEl.createDiv({ cls: "menu-item-title", text: "None" });
        this.itemNodeActions.set(itemNode, () => {
          this.close();
          if (typeof this.onClear === "function") {
            this.onClear();
          }
        });
        itemNode.addEventListener("click", () => {
          this.runItemAction(itemNode);
        });
        return itemNode;
      }
    };
    module2.exports = {
      CalloutPickerModal
    };
  }
});

// src/insertion-mode.js
var require_insertion_mode = __commonJS({
  "src/insertion-mode.js"(exports2, module2) {
    function resolvePlaceCursorOnNextLine(defaultInsertStartsOnNextLine, useAlternateInsertionMode = false) {
      return useAlternateInsertionMode ? !defaultInsertStartsOnNextLine : defaultInsertStartsOnNextLine;
    }
    function resolveDefaultPlaceCursorOnNextLine(configuredDefault, isInsideCallout, hasSelection) {
      if (isInsideCallout && !hasSelection) {
        return true;
      }
      return configuredDefault;
    }
    module2.exports = {
      resolveDefaultPlaceCursorOnNextLine,
      resolvePlaceCursorOnNextLine
    };
  }
});

// src/search-utils.js
var require_search_utils = __commonJS({
  "src/search-utils.js"(exports2, module2) {
    function normalizeSearchText(value) {
      return String(value || "").toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
    }
    function getFuzzyScore(query, candidate) {
      const normalizedQuery = normalizeSearchText(query);
      const normalizedCandidate = normalizeSearchText(candidate);
      if (!normalizedQuery || !normalizedCandidate) {
        return 0;
      }
      if (normalizedCandidate === normalizedQuery) {
        return 1e3 - Math.max(0, normalizedCandidate.length - normalizedQuery.length);
      }
      if (normalizedCandidate.startsWith(normalizedQuery)) {
        return 800 - Math.max(0, normalizedCandidate.length - normalizedQuery.length);
      }
      const containsIndex = normalizedCandidate.indexOf(normalizedQuery);
      if (containsIndex >= 0) {
        return 650 - containsIndex * 4 - Math.max(0, normalizedCandidate.length - normalizedQuery.length);
      }
      let score = 0;
      let queryIndex = 0;
      let consecutive = 0;
      let firstMatchIndex = -1;
      let lastMatchIndex = -1;
      for (let candidateIndex = 0; candidateIndex < normalizedCandidate.length; candidateIndex += 1) {
        if (normalizedCandidate[candidateIndex] !== normalizedQuery[queryIndex]) {
          consecutive = 0;
          continue;
        }
        if (firstMatchIndex === -1) {
          firstMatchIndex = candidateIndex;
        }
        const isWordBoundary = candidateIndex === 0 || normalizedCandidate[candidateIndex - 1] === " ";
        score += isWordBoundary ? 35 : 18;
        consecutive += 1;
        score += consecutive * 12;
        lastMatchIndex = candidateIndex;
        queryIndex += 1;
        if (queryIndex === normalizedQuery.length) {
          break;
        }
      }
      if (queryIndex !== normalizedQuery.length) {
        return 0;
      }
      const spreadPenalty = Math.max(0, lastMatchIndex - firstMatchIndex - normalizedQuery.length);
      const startPenalty = Math.max(0, firstMatchIndex);
      return 300 + score - spreadPenalty * 3 - startPenalty * 2;
    }
    function getBestFuzzyScore(query, candidates) {
      let bestScore = 0;
      for (const candidate of candidates) {
        const score = getFuzzyScore(query, candidate);
        if (score > bestScore) {
          bestScore = score;
        }
      }
      return bestScore;
    }
    module2.exports = {
      normalizeSearchText,
      getFuzzyScore,
      getBestFuzzyScore
    };
  }
});

// src/callout-menu-controller.js
var require_callout_menu_controller = __commonJS({
  "src/callout-menu-controller.js"(exports2, module2) {
    var { CalloutPickerModal } = require_callout_picker_modal();
    var {
      resolveDefaultPlaceCursorOnNextLine,
      resolvePlaceCursorOnNextLine
    } = require_insertion_mode();
    var { normalizeSearchText, getBestFuzzyScore } = require_search_utils();
    var CalloutMenuController2 = class {
      constructor(options) {
        this.app = options.app;
        this.registry = options.registry;
        this.editorService = options.editorService;
        this.getMaxRowsPerColumn = options.getMaxRowsPerColumn;
        this.preferCustomInSearch = options.preferCustomInSearch;
        this.placeCursorOnNextLineAfterInsert = options.placeCursorOnNextLineAfterInsert;
      }
      unload() {
      }
      addEditorMenuItems(menu, editor) {
        const options = this.registry.getMenuOptions();
        if (options.length === 0) {
          return;
        }
        const context = this.editorService.findCalloutContext(editor);
        const hasSelection = editor.getSelection().length > 0;
        const title = context ? hasSelection ? "Wrap selection in nested callout" : "Insert nested callout" : hasSelection ? "Wrap selection in callout" : "Insert callout";
        menu.addItem((item) => {
          item.setTitle(title).setIcon("panel-top-open").setSection("callouts").onClick(() => {
            this.openCalloutPicker(editor);
          });
        });
        if (!context) {
          return;
        }
        menu.addItem((item) => {
          item.setTitle("Change current callout type").setIcon("pencil").setSection("callouts").onClick(() => {
            this.openRenameCalloutPicker(editor, context);
          });
        });
        menu.addItem((item) => {
          item.setTitle("Remove callout").setIcon("eraser").setSection("callouts").onClick(() => {
            this.editorService.clearCalloutFromEditor(editor, context);
          });
        });
      }
      openCalloutPicker(editor, pickerOptions = {}) {
        const options = this.registry.getMenuOptions();
        if (options.length === 0) {
          return;
        }
        const modal = new CalloutPickerModal(this.app, {
          controller: this,
          options,
          activeType: "",
          includeUtility: false,
          onChoose: (option, chooseOptions = {}) => {
            const defaultPlaceCursorOnNextLine = this.getDefaultPlaceCursorOnNextLine(editor);
            const useAlternateInsertionMode = pickerOptions.useAlternateInsertionMode === true || chooseOptions.useAlternateInsertionMode === true;
            this.editorService.applyCalloutChoice(editor, option.id, {
              placeCursorOnNextLine: resolvePlaceCursorOnNextLine(
                defaultPlaceCursorOnNextLine,
                useAlternateInsertionMode
              )
            });
          }
        });
        modal.open();
      }
      openRenameCalloutPicker(editor, existingContext = null) {
        const context = existingContext || this.editorService.findCalloutContext(editor);
        if (!context) {
          return;
        }
        const options = this.registry.getMenuOptions();
        if (options.length === 0) {
          return;
        }
        const modal = new CalloutPickerModal(this.app, {
          controller: this,
          options,
          activeType: context.calloutType,
          includeUtility: true,
          onChoose: (option) => {
            this.editorService.renameCalloutType(editor, option.id, context);
          },
          onClear: () => {
            this.editorService.clearCalloutFromEditor(editor, context);
          }
        });
        modal.open();
      }
      formatTitle(id) {
        const normalized = String(id || "").replace(/[-_]+/g, " ");
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
      }
      isOptionActive(option, activeType) {
        return this.registry.isOptionActive(option, activeType);
      }
      getDefaultPlaceCursorOnNextLine(editor) {
        const context = this.editorService.findCalloutContext(editor);
        const hasSelection = editor.getSelection().length > 0;
        return resolveDefaultPlaceCursorOnNextLine(
          this.placeCursorOnNextLineAfterInsert(),
          context !== null,
          hasSelection
        );
      }
      buildSearchText(option) {
        return [
          option.id,
          option.concept || "",
          option.group || "",
          ...option.groupAliases || [],
          ...option.aliases || []
        ].join(" ").toLowerCase();
      }
      getMenuItemSearchScore(itemNode, query) {
        if (!itemNode) {
          return 0;
        }
        const normalizedQuery = normalizeSearchText(query);
        let score = 1;
        if (normalizedQuery.length > 0) {
          const candidates = [
            itemNode.getAttribute("data-callout-id") || "",
            itemNode.getAttribute("data-callout-search") || "",
            itemNode.querySelector(".menu-item-title")?.textContent || ""
          ];
          score = getBestFuzzyScore(normalizedQuery, candidates);
        }
        if (score > 0 && this.preferCustomInSearch() && itemNode.getAttribute("data-callout-custom") === "true") {
          score += 75;
        }
        return score;
      }
      compareMenuItems(a, b) {
        if (this.preferCustomInSearch()) {
          const aIsCustom = a.getAttribute("data-callout-custom") === "true";
          const bIsCustom = b.getAttribute("data-callout-custom") === "true";
          if (aIsCustom !== bIsCustom) {
            return aIsCustom ? -1 : 1;
          }
        }
        const aOrder = Number(a.getAttribute("data-default-order") || "0");
        const bOrder = Number(b.getAttribute("data-default-order") || "0");
        return aOrder - bOrder;
      }
    };
    module2.exports = {
      CalloutMenuController: CalloutMenuController2
    };
  }
});

// src/callout-title-style.js
var require_callout_title_style = __commonJS({
  "src/callout-title-style.js"(exports2, module2) {
    function formatDefaultCalloutTitle(calloutId) {
      const normalized = String(calloutId || "").trim().replace(/[-_]+/g, " ");
      if (normalized.length === 0) {
        return "";
      }
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }
    function extractCalloutId2(rawValue) {
      const match = String(rawValue || "").trim().match(/^[A-Za-z0-9_+-]+/);
      return match ? match[0] : "";
    }
    function normalizeRenderedCalloutTitle(titleText) {
      return String(titleText || "").replace(/\s+/g, " ").trim();
    }
    function hasNonDefaultCalloutTitle2(calloutId, titleText) {
      const normalizedTitle = normalizeRenderedCalloutTitle(titleText);
      if (normalizedTitle.length === 0) {
        return false;
      }
      return normalizedTitle !== formatDefaultCalloutTitle(calloutId);
    }
    module2.exports = {
      extractCalloutId: extractCalloutId2,
      formatDefaultCalloutTitle,
      normalizeRenderedCalloutTitle,
      hasNonDefaultCalloutTitle: hasNonDefaultCalloutTitle2
    };
  }
});

// src/layout-settings.js
var require_layout_settings = __commonJS({
  "src/layout-settings.js"(exports2, module2) {
    var MAX_ROWS_PER_COLUMN = 24;
    var MAX_GROUP_COLUMNS = 3;
    var MIN_MODAL_WIDTH_REM = 24;
    var MAX_MODAL_WIDTH_REM = 72;
    var MIN_MODAL_HEIGHT_VH = 40;
    var MAX_MODAL_HEIGHT_VH = 95;
    function clampRowsPerColumn2(value, fallback) {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return fallback;
      }
      return Math.min(MAX_ROWS_PER_COLUMN, Math.max(1, Math.round(parsed)));
    }
    function clampGroupColumns(value, fallback) {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return fallback;
      }
      return Math.min(MAX_GROUP_COLUMNS, Math.max(1, Math.round(parsed)));
    }
    function clampModalWidthRem(value, fallback) {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return fallback;
      }
      return Math.min(MAX_MODAL_WIDTH_REM, Math.max(MIN_MODAL_WIDTH_REM, Math.round(parsed)));
    }
    function clampModalHeightVh(value, fallback) {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        return fallback;
      }
      return Math.min(MAX_MODAL_HEIGHT_VH, Math.max(MIN_MODAL_HEIGHT_VH, Math.round(parsed)));
    }
    module2.exports = {
      MAX_ROWS_PER_COLUMN,
      MAX_GROUP_COLUMNS,
      MAX_MODAL_HEIGHT_VH,
      MAX_MODAL_WIDTH_REM,
      MIN_MODAL_HEIGHT_VH,
      MIN_MODAL_WIDTH_REM,
      clampRowsPerColumn: clampRowsPerColumn2,
      clampGroupColumns,
      clampModalHeightVh,
      clampModalWidthRem
    };
  }
});

// src/settings-tab.js
var require_settings_tab = __commonJS({
  "src/settings-tab.js"(exports2, module2) {
    var { PluginSettingTab, Setting } = require("obsidian");
    var { DEFAULT_SETTINGS: DEFAULT_SETTINGS2 } = require_constants();
    var { clampRowsPerColumn: clampRowsPerColumn2 } = require_layout_settings();
    var CustomCalloutContextMenuSettingTab2 = class extends PluginSettingTab {
      constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
      }
      display() {
        const { containerEl } = this;
        containerEl.empty();
        new Setting(containerEl).setName("Prefer custom callouts in search").setDesc("Biases fuzzy search toward your CSS-defined custom callouts before built-in Obsidian ones.").addToggle((toggle) => {
          toggle.setValue(this.plugin.preferCustomInSearch()).onChange(async (value) => {
            this.plugin.settings.preferCustomInSearch = value;
            await this.plugin.savePluginSettings();
          });
        });
        new Setting(containerEl).setName("Default insert starts on next line").setDesc("Controls the normal insert behavior for a brand-new callout. Press Alt+Enter in the picker to use the opposite behavior once.").addToggle((toggle) => {
          toggle.setValue(this.plugin.placeCursorOnNextLineAfterInsert()).onChange(async (value) => {
            this.plugin.settings.placeCursorOnNextLineAfterInsert = value;
            await this.plugin.savePluginSettings();
          });
        });
        new Setting(containerEl).setName("Max callouts per column").setDesc("Controls how many callout options appear before the picker spills into another column.").addText((text) => {
          text.setPlaceholder(String(DEFAULT_SETTINGS2.maxRowsPerColumn)).setValue(String(this.plugin.getMaxRowsPerColumn())).onChange(async (value) => {
            this.plugin.settings.maxRowsPerColumn = clampRowsPerColumn2(
              value,
              DEFAULT_SETTINGS2.maxRowsPerColumn
            );
            await this.plugin.savePluginSettings();
          });
        });
        new Setting(containerEl).setName("Show bundled Cluddle callout").setDesc("Adds the bundled Cluddle callout to the built-in picker group with a cloud icon and matching colors.").addToggle((toggle) => {
          toggle.setValue(this.plugin.showBundledCluddleCallout()).onChange(async (value) => {
            this.plugin.settings.showBundledCluddleCallout = value;
            await this.plugin.savePluginSettings();
          });
        });
        new Setting(containerEl).setName("Edited callout title color").setDesc("Applies to rendered callout title text when the visible title differs from the default label for that callout.").addColorPicker((colorPicker) => {
          colorPicker.setValue(this.plugin.nonDefaultCalloutTitleColor()).onChange(async (value) => {
            this.plugin.settings.nonDefaultCalloutTitleColor = value;
            await this.plugin.savePluginSettings();
          });
        });
      }
    };
    module2.exports = {
      CustomCalloutContextMenuSettingTab: CustomCalloutContextMenuSettingTab2
    };
  }
});

// src/main.js
var { MarkdownView, Plugin } = require("obsidian");
var { DEFAULT_SETTINGS } = require_constants();
var { CalloutRegistry } = require_callout_registry();
var { EditorCalloutService } = require_editor_callout_service();
var { CalloutMenuController } = require_callout_menu_controller();
var { extractCalloutId, hasNonDefaultCalloutTitle } = require_callout_title_style();
var { clampRowsPerColumn } = require_layout_settings();
var { CustomCalloutContextMenuSettingTab } = require_settings_tab();
module.exports = class CustomCalloutContextMenuPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.calloutTitleObserver = null;
    this.calloutTitleRefreshFrame = 0;
    this.registry = new CalloutRegistry(this.app, {
      showBundledCluddleCallout: () => this.showBundledCluddleCallout()
    });
    this.editorService = new EditorCalloutService();
    this.menuController = new CalloutMenuController({
      app: this.app,
      registry: this.registry,
      editorService: this.editorService,
      getMaxRowsPerColumn: () => this.getMaxRowsPerColumn(),
      preferCustomInSearch: () => this.preferCustomInSearch(),
      placeCursorOnNextLineAfterInsert: () => this.placeCursorOnNextLineAfterInsert()
    });
    await this.registry.refresh();
    this.registerEvent(this.app.workspace.on("css-change", () => {
      this.registry.refresh();
    }));
    this.registerEvent(this.app.workspace.on("editor-menu", (menu, editor) => {
      this.menuController.addEditorMenuItems(menu, editor);
    }));
    this.registerEvent(this.app.workspace.on("layout-change", () => {
      this.scheduleRefreshRenderedCalloutTitles();
    }));
    this.registerDomEvent(document, "keydown", (event) => {
      this.handleNestedCalloutEnterKey(event);
    }, { capture: true });
    this.addCommand({
      id: "open-callout-picker",
      name: "Open callout picker",
      editorCallback: (editor) => {
        this.menuController.openCalloutPicker(editor);
      }
    });
    this.addCommand({
      id: "open-callout-picker-alternate-insertion-mode",
      name: "Open callout picker (alternate insertion mode)",
      editorCallback: (editor) => {
        this.menuController.openCalloutPicker(editor, {
          useAlternateInsertionMode: true
        });
      }
    });
    this.addCommand({
      id: "rename-current-callout-type",
      name: "Rename current callout type",
      editorCallback: (editor) => {
        this.menuController.openRenameCalloutPicker(editor);
      }
    });
    this.addSettingTab(new CustomCalloutContextMenuSettingTab(this.app, this));
    this.applyBundledCluddleCalloutSetting();
    this.applyConfiguredCalloutTitleColor();
    this.startCalloutTitleObserver();
  }
  onunload() {
    this.stopCalloutTitleObserver();
    this.clearBundledCluddleCalloutSetting();
    this.clearConfiguredCalloutTitleColor();
    this.menuController?.unload();
    this.registry?.unload();
  }
  async savePluginSettings() {
    await this.saveData(this.settings);
    this.applyBundledCluddleCalloutSetting();
    this.applyConfiguredCalloutTitleColor();
    this.scheduleRefreshRenderedCalloutTitles();
  }
  preferCustomInSearch() {
    return this.settings.preferCustomInSearch !== false;
  }
  getMaxRowsPerColumn() {
    return clampRowsPerColumn(this.settings.maxRowsPerColumn, DEFAULT_SETTINGS.maxRowsPerColumn);
  }
  placeCursorOnNextLineAfterInsert() {
    return this.settings.placeCursorOnNextLineAfterInsert === true;
  }
  showBundledCluddleCallout() {
    return this.settings.showBundledCluddleCallout !== false;
  }
  handleNestedCalloutEnterKey(event) {
    if (event.key !== "Enter" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) {
      return;
    }
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    const target = event.target;
    if (!activeView || !(target instanceof Element) || !activeView.containerEl.contains(target) || !target.closest(".cm-editor")) {
      return;
    }
    if (this.editorService.handleNestedCalloutEnter(activeView.editor)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  nonDefaultCalloutTitleColor() {
    return this.settings.nonDefaultCalloutTitleColor || DEFAULT_SETTINGS.nonDefaultCalloutTitleColor;
  }
  startCalloutTitleObserver() {
    if (typeof document === "undefined" || typeof MutationObserver === "undefined" || !document.body) {
      return;
    }
    this.stopCalloutTitleObserver();
    this.calloutTitleObserver = new MutationObserver((mutationRecords) => {
      if (mutationRecords.some((record) => this.mutationTouchesCallouts(record))) {
        this.scheduleRefreshRenderedCalloutTitles();
      }
    });
    this.calloutTitleObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
    this.scheduleRefreshRenderedCalloutTitles();
  }
  stopCalloutTitleObserver() {
    if (this.calloutTitleObserver) {
      this.calloutTitleObserver.disconnect();
      this.calloutTitleObserver = null;
    }
    if (this.calloutTitleRefreshFrame) {
      window.cancelAnimationFrame(this.calloutTitleRefreshFrame);
      this.calloutTitleRefreshFrame = 0;
    }
    if (typeof document !== "undefined") {
      for (const calloutEl of document.querySelectorAll(".custom-callout-has-edited-title")) {
        calloutEl.classList.remove("custom-callout-has-edited-title");
      }
    }
  }
  mutationTouchesCallouts(record) {
    if (!record) {
      return false;
    }
    if (record.type === "characterData") {
      return this.nodeTouchesCallouts(record.target);
    }
    return [...record.addedNodes, ...record.removedNodes].some((node) => this.nodeTouchesCallouts(node));
  }
  nodeTouchesCallouts(node) {
    if (!node) {
      return false;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      return this.nodeTouchesCallouts(node.parentElement || null);
    }
    if (!(node instanceof Element)) {
      return false;
    }
    return node.matches(".callout, .callout-title, .callout-title-inner, .callout-title-text, .callout-title-content, .cm-callout-title") || Boolean(node.querySelector(".callout, .callout-title, .callout-title-inner, .callout-title-text, .callout-title-content, .cm-callout-title"));
  }
  scheduleRefreshRenderedCalloutTitles() {
    if (typeof document === "undefined" || !document.body || this.calloutTitleRefreshFrame) {
      return;
    }
    this.calloutTitleRefreshFrame = window.requestAnimationFrame(() => {
      this.calloutTitleRefreshFrame = 0;
      this.refreshRenderedCalloutTitles();
    });
  }
  refreshRenderedCalloutTitles() {
    if (typeof document === "undefined") {
      return;
    }
    for (const calloutEl of document.querySelectorAll(".callout")) {
      const calloutId = extractCalloutId(
        calloutEl.getAttribute("data-callout") || calloutEl.getAttribute("data-callout-metadata") || ""
      );
      const titleTextEl = this.getRenderedCalloutTitleTextElement(calloutEl);
      if (!calloutId || !titleTextEl) {
        calloutEl.classList.remove("custom-callout-has-edited-title");
        continue;
      }
      calloutEl.classList.toggle(
        "custom-callout-has-edited-title",
        hasNonDefaultCalloutTitle(calloutId, titleTextEl.textContent || "")
      );
    }
  }
  getRenderedCalloutTitleTextElement(calloutEl) {
    if (!calloutEl) {
      return null;
    }
    return calloutEl.querySelector(
      ".callout-title-text, .callout-title-inner, .callout-title-content, .cm-callout-title, .callout-title"
    );
  }
  applyConfiguredCalloutTitleColor() {
    if (typeof document === "undefined") {
      return;
    }
    document.documentElement.style.setProperty(
      "--custom-callout-nondefault-title-color",
      this.nonDefaultCalloutTitleColor()
    );
  }
  applyBundledCluddleCalloutSetting() {
    if (typeof document === "undefined" || !document.documentElement) {
      return;
    }
    document.documentElement.classList.toggle(
      "custom-callout-bundled-cluddle-enabled",
      this.showBundledCluddleCallout()
    );
  }
  clearBundledCluddleCalloutSetting() {
    if (typeof document === "undefined" || !document.documentElement) {
      return;
    }
    document.documentElement.classList.remove("custom-callout-bundled-cluddle-enabled");
  }
  clearConfiguredCalloutTitleColor() {
    if (typeof document === "undefined") {
      return;
    }
    document.documentElement.style.removeProperty("--custom-callout-nondefault-title-color");
  }
};

/* nosourcemap */