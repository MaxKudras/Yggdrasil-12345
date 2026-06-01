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
  default: () => LocalGraphTagLinksPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/patch.ts
var import_obsidian = require("obsidian");
var PATCH_FLAG = "__localGraphTagLinksPatch";
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function hasPrototype(value) {
  return (typeof value === "function" || isRecord(value)) && "prototype" in value;
}
function isGraphEngine(value) {
  if (!isRecord(value)) return false;
  return typeof value.render === "function" && hasPrototype(value.constructor);
}
function isPatchableGraphPrototype(value) {
  return isRecord(value) && typeof value.render === "function";
}
function normalizeTag(raw) {
  const t = raw.trim();
  return (t.startsWith("#") ? t : "#" + t).toLowerCase();
}
function getFileTags(cache) {
  var _a, _b;
  const out = /* @__PURE__ */ new Set();
  for (const ref of (_a = cache.tags) != null ? _a : []) {
    if (ref == null ? void 0 : ref.tag) out.add(normalizeTag(ref.tag));
  }
  const fm = (_b = cache.frontmatter) == null ? void 0 : _b.tags;
  if (Array.isArray(fm)) {
    for (const t of fm) {
      if (typeof t === "string" && t.trim()) out.add(normalizeTag(t));
    }
  } else if (typeof fm === "string" && fm.trim()) {
    out.add(normalizeTag(fm));
  }
  return out;
}
function buildBacklinkIndex(app) {
  var _a;
  const idx = {};
  for (const [src, targets] of Object.entries(
    app.metadataCache.resolvedLinks
  )) {
    for (const tgt of Object.keys(targets)) {
      ((_a = idx[tgt]) != null ? _a : idx[tgt] = []).push(src);
    }
  }
  return idx;
}
function buildUnresolvedBacklinkIndex(app) {
  var _a;
  const idx = {};
  for (const [src, targets] of Object.entries(
    app.metadataCache.unresolvedLinks
  )) {
    for (const tgt of Object.keys(targets)) {
      ((_a = idx[tgt]) != null ? _a : idx[tgt] = []).push(src);
    }
  }
  return idx;
}
function shouldIncludeLinkedFile(app, path, showAttachments) {
  const file = app.vault.getAbstractFileByPath(path);
  if (!(file instanceof import_obsidian.TFile)) return false;
  return showAttachments ? true : file.extension === "md";
}
function injectTagLinks(app, options, data) {
  var _a, _b, _c, _d, _e, _f;
  const { nodes, weights } = data;
  const jumps = Math.max(1, (_a = options.localJumps) != null ? _a : 1);
  const step = 30 / jumps;
  const useFore = options.localForelinks !== false;
  const useBack = options.localBacklinks !== false;
  const useTags = options.showTags === true;
  const showAttachments = options.showAttachments === true;
  const showUnresolved = options.hideUnresolved !== true;
  const inGraph = (id) => Object.prototype.hasOwnProperty.call(nodes, id);
  const backlinkIdx = useBack ? buildBacklinkIndex(app) : {};
  const unresolvedBacklinkIdx = useBack && showUnresolved ? buildUnresolvedBacklinkIndex(app) : {};
  const queue = [];
  const queued = /* @__PURE__ */ new Set();
  function enqueue(id, w) {
    if (queued.has(id)) return;
    queued.add(id);
    queue.push({ id, w });
  }
  for (const id of Object.keys(nodes)) {
    if (nodes[id].type === "tag") enqueue(id, (_b = weights == null ? void 0 : weights[id]) != null ? _b : 0);
  }
  while (queue.length > 0) {
    const { id, w } = queue.shift();
    const node = nodes[id];
    if (!node) continue;
    const childW = Math.max(0, w - step);
    const canSpawn = w > 0;
    if (node.type === "tag") {
      if (!canSpawn) continue;
      const tagNorm = id.toLowerCase();
      for (const file of app.vault.getMarkdownFiles()) {
        const cache = app.metadataCache.getFileCache(file);
        if (!cache || !getFileTags(cache).has(tagNorm)) continue;
        if (inGraph(file.path)) {
          nodes[file.path].links[id] = true;
        } else {
          nodes[file.path] = { type: "", links: { [id]: true } };
          if (weights) weights[file.path] = childW;
          enqueue(file.path, childW);
        }
      }
    } else {
      if (useFore) {
        const outgoing = (_c = app.metadataCache.resolvedLinks[id]) != null ? _c : {};
        for (const tgt of Object.keys(outgoing)) {
          if (!shouldIncludeLinkedFile(app, tgt, showAttachments)) continue;
          if (inGraph(tgt)) {
            node.links[tgt] = true;
          } else if (canSpawn) {
            nodes[tgt] = { type: "", links: {} };
            if (weights) weights[tgt] = childW;
            node.links[tgt] = true;
            enqueue(tgt, childW);
          }
        }
      }
      if (useFore && showUnresolved) {
        const unresolved = (_d = app.metadataCache.unresolvedLinks[id]) != null ? _d : {};
        for (const tgt of Object.keys(unresolved)) {
          if (inGraph(tgt)) {
            node.links[tgt] = true;
          } else if (canSpawn) {
            nodes[tgt] = { type: "unresolved", links: {} };
            if (weights) weights[tgt] = childW;
            node.links[tgt] = true;
            if (useBack) enqueue(tgt, childW);
          }
        }
      }
      if (useBack) {
        const backSources = node.type === "unresolved" ? (_e = unresolvedBacklinkIdx[id]) != null ? _e : [] : (_f = backlinkIdx[id]) != null ? _f : [];
        for (const src of backSources) {
          if (!shouldIncludeLinkedFile(app, src, showAttachments)) continue;
          if (inGraph(src)) {
            nodes[src].links[id] = true;
          } else if (canSpawn) {
            nodes[src] = { type: "", links: { [id]: true } };
            if (weights) weights[src] = childW;
            enqueue(src, childW);
          }
        }
      }
      if (useTags) {
        const cache = app.metadataCache.getCache(id);
        if (cache) {
          for (const tagNorm of getFileTags(cache)) {
            const existingTagId = Object.keys(nodes).find(
              (k) => nodes[k].type === "tag" && k.toLowerCase() === tagNorm
            );
            if (existingTagId) {
              node.links[existingTagId] = true;
            } else if (canSpawn) {
              nodes[tagNorm] = { type: "tag", links: {} };
              if (weights) weights[tagNorm] = childW;
              node.links[tagNorm] = true;
              enqueue(tagNorm, childW);
            }
          }
        }
      }
    }
  }
}
function patchGraphEngine(app, engine) {
  const proto = engine.constructor.prototype;
  if (!isPatchableGraphPrototype(proto) || proto[PATCH_FLAG]) return null;
  const originalRender = proto.render;
  proto[PATCH_FLAG] = true;
  proto.render = function() {
    var _a, _b, _c;
    const opts = (_a = this.options) != null ? _a : {};
    const isLocal = ((_c = (_b = this.view) == null ? void 0 : _b.getViewType) == null ? void 0 : _c.call(_b)) === "localgraph";
    if (!isLocal || !opts.localFile || !opts.showTags) {
      return originalRender.call(this);
    }
    const renderer = this.renderer;
    if (!renderer) return originalRender.call(this);
    const originalSetData = renderer.setData;
    renderer.setData = function(data) {
      injectTagLinks(app, opts, data);
      originalSetData.call(this, data);
    };
    try {
      return originalRender.call(this);
    } finally {
      renderer.setData = originalSetData;
    }
  };
  return () => {
    proto.render = originalRender;
    delete proto[PATCH_FLAG];
  };
}

// src/main.ts
function isRecord2(value) {
  return typeof value === "object" && value !== null;
}
function getGraphEngine(leaf) {
  const view = leaf.view;
  if (!isRecord2(view)) return null;
  const { engine } = view;
  return isGraphEngine(engine) ? engine : null;
}
var LocalGraphTagLinksPlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.unpatch = null;
  }
  async onload() {
    this.app.workspace.onLayoutReady(() => this.tryPatch());
    this.registerEvent(
      this.app.workspace.on("layout-change", () => this.tryPatch())
    );
  }
  onunload() {
    var _a, _b;
    (_a = this.unpatch) == null ? void 0 : _a.call(this);
    this.unpatch = null;
    for (const leaf of this.app.workspace.getLeavesOfType("localgraph")) {
      (_b = getGraphEngine(leaf)) == null ? void 0 : _b.render();
    }
  }
  tryPatch() {
    var _a;
    if (this.unpatch) return;
    const engine = this.getLocalGraphEngine();
    if (!engine) return;
    this.unpatch = patchGraphEngine(this.app, engine);
    if (this.unpatch) {
      for (const leaf of this.app.workspace.getLeavesOfType("localgraph")) {
        (_a = getGraphEngine(leaf)) == null ? void 0 : _a.render();
      }
    }
  }
  getLocalGraphEngine() {
    const leaf = this.app.workspace.getLeavesOfType("localgraph")[0];
    return leaf ? getGraphEngine(leaf) : null;
  }
};

/* nosourcemap */