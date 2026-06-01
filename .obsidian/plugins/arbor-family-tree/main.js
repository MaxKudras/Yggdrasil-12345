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
  default: () => ArborPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian7 = require("obsidian");

// src/constants.ts
var CARD_W = 130;
var CARD_H = 58;
var H_GAP = 20;
var SPOUSE_GAP = 12;
var V_GAP = 120;
var MAX_LEN = 18;
var SHOW_SIBLINGS = true;
var CURRENT_ARBOR_SCHEMA_VERSION = 0;
var DEFAULT_SETTINGS = {
  arborSchemaVersion: CURRENT_ARBOR_SCHEMA_VERSION
};

// src/view.ts
var import_obsidian = require("obsidian");

// src/loader.ts
function loadPeople(app, folder) {
  var _a;
  const byName = {};
  const prefix = folder.endsWith("/") ? folder : folder + "/";
  for (const file of app.vault.getMarkdownFiles()) {
    if (!file.path.startsWith(prefix)) continue;
    const cache = app.metadataCache.getFileCache(file);
    if (((_a = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _a.ar_type) === "person") {
      byName[file.basename] = {
        file: { name: file.basename, path: file.path },
        ...cache.frontmatter
      };
    }
  }
  return byName;
}
function buildNameIndex(byName) {
  const stemToDisplay = {};
  const displayToStem = {};
  for (const [stem, page] of Object.entries(byName)) {
    const display = ((page.first_names || "") + " " + (page.family_name || "")).trim() || stem;
    stemToDisplay[stem] = display;
    displayToStem[display] = stem;
  }
  return { stemToDisplay, displayToStem };
}
function buildGenderIndex(byName) {
  const gender = {};
  for (const [name, page] of Object.entries(byName)) {
    const s = String((page == null ? void 0 : page.sex) || "").toLowerCase().trim();
    gender[name] = s === "male" ? "m" : s === "female" ? "f" : "u";
  }
  return gender;
}

// src/tree.ts
function resolveName(val) {
  if (!val) return null;
  if (typeof val === "object" && val !== null && "path" in val) {
    const parts = val.path.split("/");
    return parts[parts.length - 1].replace(/\.md$/, "");
  }
  if (typeof val !== "string" && typeof val !== "number") return null;
  const s = String(val);
  const m = s.match(/\[\[(.+?)\]\]/);
  return m ? m[1] : s;
}
function resolveList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(resolveName).filter((x) => x !== null);
  const n = resolveName(val);
  return n ? [n] : [];
}
function getYear(val) {
  if (!val) return "";
  if (typeof val === "object" && val !== null && "year" in val) {
    return String(val.year);
  }
  if (typeof val !== "string" && typeof val !== "number") return "";
  const s = String(val).trim();
  const prefix = (s.match(/^[~c.]+/) || [""])[0];
  const digits = s.replace(/^[~c.]+/, "").slice(0, 4);
  return prefix + digits;
}
function trunc(s) {
  if (!s) return "";
  return s.length > MAX_LEN ? s.slice(0, MAX_LEN - 1) + "..." : s;
}
function getNameLines(name, page) {
  var _a;
  if (page && page.first_names !== void 0 && page.family_name !== void 0) {
    return { first: String(page.first_names || ""), last: String(page.family_name || "") };
  }
  const parts = name.split(" ");
  const last = (_a = parts.pop()) != null ? _a : "";
  return { first: parts.join(" "), last };
}
function findChildren(name, byName) {
  const children = [];
  for (const [cName, cPage] of Object.entries(byName)) {
    const f = resolveName(cPage == null ? void 0 : cPage.father);
    const m = resolveName(cPage == null ? void 0 : cPage.mother);
    if (f === name || m === name) children.push(cName);
  }
  return children.sort((a, b) => {
    var _a, _b;
    const pa = byName[a];
    const pb = byName[b];
    const ya = (pa == null ? void 0 : pa.DOB) && typeof pa.DOB === "object" && "year" in pa.DOB ? Number(pa.DOB.year) : typeof (pa == null ? void 0 : pa.DOB) === "object" ? 9999 : parseInt(String((_a = pa == null ? void 0 : pa.DOB) != null ? _a : 9999));
    const yb = (pb == null ? void 0 : pb.DOB) && typeof pb.DOB === "object" && "year" in pb.DOB ? Number(pb.DOB.year) : typeof (pb == null ? void 0 : pb.DOB) === "object" ? 9999 : parseInt(String((_b = pb == null ? void 0 : pb.DOB) != null ? _b : 9999));
    return (isNaN(ya) ? 9999 : ya) - (isNaN(yb) ? 9999 : yb);
  });
}
function buildTree(rootName, byName, siblingsBloodOnly) {
  const units = {};
  const people = {};
  const edges = [];
  const visited = /* @__PURE__ */ new Set();
  const bloodLine = /* @__PURE__ */ new Set();
  let uc = 0;
  let pedigreeCollapse = false;
  function newUnit(members, gen, dir) {
    var _a;
    const id = "u" + uc++;
    units[id] = { id, members, gen, dir };
    for (const name of members) {
      if (!people[name]) people[name] = { name, page: (_a = byName[name]) != null ? _a : null, unitId: id };
    }
    return id;
  }
  function dobYear(name) {
    const p = byName[name];
    if (!p) return Infinity;
    const v = p.DOB;
    if (!v) return Infinity;
    if (typeof v === "object" && "year" in v) return parseInt(String(v.year));
    const m = String(v).replace(/^[~c. ]+/, "").match(/(\d{4})/);
    return m ? parseInt(m[1]) : Infinity;
  }
  function addAncestors(name, gen, isBlood) {
    var _a;
    if (visited.has("anc-" + name)) return;
    visited.add("anc-" + name);
    if (isBlood) bloodLine.add(name);
    const p = byName[name];
    if (!p) return;
    const fName = resolveName(p.father);
    const mName = resolveName(p.mother);
    if (fName || mName) {
      const parentUid = newUnit([fName, mName].filter((x) => x !== null), gen - 1, "anc");
      if (SHOW_SIBLINGS && (!siblingsBloodOnly || isBlood)) {
        const sibSet = /* @__PURE__ */ new Set();
        for (const parentName of [fName, mName].filter((x) => x !== null)) {
          for (const cName of findChildren(parentName, byName)) sibSet.add(cName);
        }
        const allSibs = [...sibSet].sort((a, b) => {
          const d = dobYear(a) - dobYear(b);
          return isNaN(d) ? 0 : d;
        });
        for (const sibName of allSibs) {
          const isBloodLine = sibName === name;
          if (people[sibName]) {
            const existingUid = people[sibName].unitId;
            if (!edges.some((e) => e.fromUnit === parentUid && e.toUnit === existingUid)) {
              edges.push({ fromUnit: parentUid, toUnit: existingUid, toName: sibName, sibling: !isBloodLine });
            }
          } else {
            const sibPage = byName[sibName];
            const sibSpouses = sibPage ? resolveList(sibPage.married) : [];
            const unitDir = isBloodLine ? "anc" : "sibling";
            const uid = newUnit([sibName, ...sibSpouses.filter((s) => s !== sibName)], gen, unitDir);
            edges.push({ fromUnit: parentUid, toUnit: uid, toName: sibName, sibling: !isBloodLine });
          }
        }
      } else {
        const childUid = (_a = people[name]) == null ? void 0 : _a.unitId;
        if (childUid) {
          if (!edges.some((e) => e.fromUnit === parentUid && e.toUnit === childUid)) {
            edges.push({ fromUnit: parentUid, toUnit: childUid, toName: name, sibling: false });
          }
        }
      }
      if (fName) addAncestors(fName, gen - 1, true);
      if (mName) addAncestors(mName, gen - 1, true);
    }
  }
  function addDescendants(name, gen, isBlood) {
    var _a, _b;
    if (visited.has("desc-" + name)) return;
    visited.add("desc-" + name);
    if (isBlood) bloodLine.add(name);
    if (!people[name]) {
      const p = byName[name];
      const spouses = p ? resolveList(p.married) : [];
      newUnit([name, ...spouses.filter((s) => s !== name)], gen, "desc");
      if (!siblingsBloodOnly) {
        for (const spouse of spouses) addAncestors(spouse, gen, false);
      }
    }
    for (const cName of findChildren(name, byName)) {
      if (!visited.has("desc-" + cName)) addDescendants(cName, gen + 1, true);
      const parentUid = (_a = people[name]) == null ? void 0 : _a.unitId;
      const childUid = (_b = people[cName]) == null ? void 0 : _b.unitId;
      if (parentUid && childUid && parentUid !== childUid) {
        const parentGen = units[parentUid].gen;
        const childGen = units[childUid].gen;
        if (childGen <= parentGen) pedigreeCollapse = true;
        if (childGen > parentGen && !edges.some((e) => e.fromUnit === parentUid && e.toUnit === childUid)) {
          const cPage = byName[cName];
          const cFather = cPage ? resolveName(cPage.father) : null;
          const cMother = cPage ? resolveName(cPage.mother) : null;
          const otherParent = name === cFather ? cMother : cFather;
          const parentUnit = units[parentUid];
          const fromName = parentUnit.members.length > 2 && otherParent && parentUnit.members.includes(otherParent) ? otherParent : parentUnit.members.length > 2 ? name : void 0;
          edges.push({ fromUnit: parentUid, toUnit: childUid, fromName, toName: cName, sibling: false });
        }
      }
    }
  }
  bloodLine.add(rootName);
  const rootPage0 = byName[rootName];
  const rootSpouses0 = rootPage0 ? resolveList(rootPage0.married) : [];
  newUnit([rootName, ...rootSpouses0.filter((s) => s !== rootName)], 0, "root");
  addAncestors(rootName, 0, true);
  addDescendants(rootName, 0, true);
  if (!siblingsBloodOnly) {
    const rootPage = byName[rootName];
    const rootSpouses = rootPage ? resolveList(rootPage.married) : [];
    for (const member of rootSpouses.filter((s) => s !== rootName)) {
      addAncestors(member, 0, false);
    }
  }
  return { units, people, edges, bloodLine, pedigreeCollapse };
}

// src/layout.ts
function layout(units, edges, byName, layoutMode) {
  if (layoutMode === "vertical") {
    let unitH = function(u) {
      return u.members.length * CARD_H + (u.members.length - 1) * SPOUSE_GAP;
    }, unitDobV = function(u) {
      const name = u.members[0];
      const p = byName[name];
      if (!p) return Infinity;
      const v = p.DOB;
      if (!v) return Infinity;
      if (typeof v === "object" && "year" in v) return parseInt(String(v.year));
      const m = String(v).replace(/^[~c. ]+/, "").match(/(\d{4})/);
      return m ? parseInt(m[1]) : Infinity;
    }, isLeafV = function(uid) {
      const u = units[uid];
      if (!u || u.dir === "sibling") return false;
      const ch = (childrenOf2[uid] || []).filter((cid) => units[cid] && units[cid].dir !== "anc");
      return ch.length === 0;
    }, subtreeHeight = function(uid) {
      if (subtreeHeightCache[uid] !== void 0) return subtreeHeightCache[uid];
      const u = units[uid];
      if (!u) return 0;
      if (u.dir === "sibling") return subtreeHeightCache[uid] = unitH(u);
      if (isLeafV(uid)) return subtreeHeightCache[uid] = 0;
      const ch = (childrenOf2[uid] || []).filter((cid) => !isLeafV(cid)).sort((a, b) => {
        const d = unitDobV(units[a]) - unitDobV(units[b]);
        return isNaN(d) ? 0 : d;
      });
      if (ch.length === 0) return subtreeHeightCache[uid] = unitH(u);
      let h = ch.reduce((sum, cid) => sum + subtreeHeight(cid), 0) + (ch.length - 1) * H_GAP;
      h = Math.max(h, unitH(u));
      return subtreeHeightCache[uid] = h;
    }, assignY = function(uid, centerY) {
      const u = units[uid];
      if (!u) return;
      u.y = centerY - unitH(u) / 2;
      u.width = CARD_W;
      u.height = unitH(u);
      const eligible = (childrenOf2[uid] || []).filter((cid) => {
        const cu = units[cid];
        if (!cu) return false;
        if (cu.dir === "sibling") {
          const pid = parentOf2[cid];
          return pid && units[pid] && units[pid].gen >= 0 && units[pid].dir !== "anc";
        }
        return cu.dir !== "anc";
      }).sort((a, b) => {
        const d = unitDobV(units[a]) - unitDobV(units[b]);
        return isNaN(d) ? 0 : d;
      });
      if (eligible.length === 0) return;
      const totalSpan = eligible.reduce((sum, cid) => sum + (isLeafV(cid) ? unitH(units[cid]) : subtreeHeight(cid)), 0) + (eligible.length - 1) * H_GAP;
      let y = centerY - totalSpan / 2;
      for (const cid of eligible) {
        if (isLeafV(cid)) {
          units[cid].y = y;
          units[cid].width = CARD_W;
          units[cid].height = unitH(units[cid]);
          y += unitH(units[cid]) + H_GAP;
        } else {
          const span = subtreeHeight(cid);
          assignY(cid, y + span / 2);
          y += span + H_GAP;
        }
      }
    }, parentCentreY = function(id) {
      const pid = parentOf2[id];
      const parent = pid ? units[pid] : void 0;
      if (parent && parent.y !== void 0) {
        return parent.y + unitH(parent) / 2;
      }
      const u = units[id];
      return u.y + unitH(u) / 2;
    }, resolveOverlapsV = function(genIds) {
      const placed = genIds.filter((id) => units[id].y !== void 0).sort((a, b) => {
        const pa = parentCentreY(a), pb = parentCentreY(b);
        if (pa !== pb) return pa - pb;
        return units[a].y - units[b].y;
      });
      if (placed.length < 2) return;
      for (let i = 1; i < placed.length; i++) {
        const prev = units[placed[i - 1]], curr = units[placed[i]];
        if (curr.y < prev.y + unitH(prev) + H_GAP) curr.y = prev.y + unitH(prev) + H_GAP;
      }
      for (let i = placed.length - 2; i >= 0; i--) {
        const next = units[placed[i + 1]], curr = units[placed[i]];
        if (curr.y > next.y - unitH(curr) - H_GAP) curr.y = next.y - unitH(curr) - H_GAP;
      }
      const top = units[placed[0]].y;
      const bottom = units[placed[placed.length - 1]].y + unitH(units[placed[placed.length - 1]]);
      const shift = (top + bottom) / 2;
      for (const id of placed) units[id].y -= shift;
    };
    const childrenOf2 = {};
    const parentOf2 = {};
    for (const e of edges) {
      const pu = units[e.fromUnit], cu = units[e.toUnit];
      if (!pu || !cu) continue;
      const [ancId, descId] = pu.gen < cu.gen ? [e.fromUnit, e.toUnit] : [e.toUnit, e.fromUnit];
      if (!childrenOf2[ancId]) childrenOf2[ancId] = [];
      if (!childrenOf2[ancId].includes(descId)) childrenOf2[ancId].push(descId);
      const existing = parentOf2[descId];
      const ancDir = units[ancId].dir;
      if (!existing) {
        parentOf2[descId] = ancId;
      } else if (units[existing].dir === "sibling" && ancDir !== "sibling") {
        parentOf2[descId] = ancId;
      }
    }
    const subtreeHeightCache = {};
    const allUnitIds2 = Object.keys(units);
    const descUnits2 = allUnitIds2.filter((id) => units[id].gen >= 0 && units[id].dir !== "anc");
    const ancUnits2 = allUnitIds2.filter((id) => units[id].gen < 0 || units[id].dir === "anc");
    const descRoots2 = descUnits2.filter((id) => {
      const u = units[id];
      if (u.dir === "anc") return false;
      if (u.dir === "root") return true;
      const p = parentOf2[id];
      if (p && units[p].dir === "anc") return false;
      return !p || units[p].gen < 0;
    });
    {
      const totalSpan = descRoots2.reduce((sum, id) => sum + subtreeHeight(id), 0) + (descRoots2.length - 1) * H_GAP;
      let y = -totalSpan / 2;
      for (const id of descRoots2) {
        assignY(id, y + subtreeHeight(id) / 2);
        y += subtreeHeight(id) + H_GAP;
      }
    }
    const byGen2 = {};
    for (const id of allUnitIds2) {
      const g = String(units[id].gen);
      (byGen2[g] = byGen2[g] || []).push(id);
    }
    for (const [gen, ids] of Object.entries(byGen2)) {
      const x = parseInt(gen) * (CARD_W + V_GAP);
      for (const id of ids) {
        if (units[id].y !== void 0) {
          units[id].x = x;
          units[id].width = CARD_W;
          units[id].height = unitH(units[id]);
        }
      }
    }
    for (const [gen, ids] of Object.entries(byGen2)) {
      if (parseInt(gen) >= 0) resolveOverlapsV(ids);
    }
    const ancGens2 = [...new Set(ancUnits2.map((id) => units[id].gen))].sort((a, b) => b - a);
    for (const gen of ancGens2) {
      const ids = byGen2[String(gen)] || [];
      for (const id of ids) {
        const u = units[id];
        u.width = CARD_W;
        u.height = unitH(u);
        u.x = gen * (CARD_W + V_GAP);
        const placedCh = (childrenOf2[id] || []).filter((cid) => units[cid] && units[cid].y !== void 0);
        if (placedCh.length > 0) {
          const minY = Math.min(...placedCh.map((cid) => units[cid].y));
          const maxY = Math.max(...placedCh.map((cid) => units[cid].y + unitH(units[cid])));
          u.y = (minY + maxY) / 2 - unitH(u) / 2;
        } else {
          u.y = -unitH(u) / 2;
        }
        const sibCh = (childrenOf2[id] || []).filter((cid) => units[cid] && units[cid].dir === "sibling" && units[cid].y === void 0).sort((a, b) => {
          const d = unitDobV(units[a]) - unitDobV(units[b]);
          return isNaN(d) ? 0 : d;
        });
        if (sibCh.length > 0) {
          const bloodCh = (childrenOf2[id] || []).filter((cid) => units[cid] && units[cid].dir !== "sibling" && units[cid].y !== void 0).sort((a, b) => {
            const d = unitDobV(units[a]) - unitDobV(units[b]);
            return isNaN(d) ? 0 : d;
          });
          const allCh = [...bloodCh, ...sibCh].sort((a, b) => {
            const d = unitDobV(units[a]) - unitDobV(units[b]);
            return isNaN(d) ? 0 : d;
          });
          const totalH = allCh.reduce((s, cid) => s + unitH(units[cid]), 0) + (allCh.length - 1) * H_GAP;
          const ancCentreY = u.y + unitH(u) / 2;
          let y = ancCentreY - totalH / 2;
          for (const cid of allCh) {
            const childGen = units[cid].gen;
            units[cid].y = y;
            units[cid].x = childGen * (CARD_W + V_GAP);
            units[cid].width = CARD_W;
            units[cid].height = unitH(units[cid]);
            y += unitH(units[cid]) + H_GAP;
          }
        }
      }
      resolveOverlapsV(ids);
    }
    for (const [, ids] of Object.entries(byGen2)) {
      resolveOverlapsV(ids.filter((id) => units[id].y !== void 0));
    }
    return;
  }
  function unitW(u) {
    return u.members.length * CARD_W + (u.members.length - 1) * SPOUSE_GAP;
  }
  function unitDob(u) {
    const name = u.members[0];
    const p = byName[name];
    if (!p) return Infinity;
    const v = p.DOB;
    if (!v) return Infinity;
    if (typeof v === "object" && "year" in v) return parseInt(String(v.year));
    const m = String(v).replace(/^[~c. ]+/, "").match(/(\d{4})/);
    return m ? parseInt(m[1]) : Infinity;
  }
  const childrenOf = {};
  const parentOf = {};
  for (const e of edges) {
    const pu = units[e.fromUnit], cu = units[e.toUnit];
    if (!pu || !cu) continue;
    const [ancId, descId] = pu.gen < cu.gen ? [e.fromUnit, e.toUnit] : [e.toUnit, e.fromUnit];
    if (!childrenOf[ancId]) childrenOf[ancId] = [];
    if (!childrenOf[ancId].includes(descId)) childrenOf[ancId].push(descId);
    const existing = parentOf[descId];
    const ancDir = units[ancId].dir;
    if (!existing) {
      parentOf[descId] = ancId;
    } else if (units[existing].dir === "sibling" && ancDir !== "sibling") {
      parentOf[descId] = ancId;
    }
  }
  function isLeaf(uid) {
    const u = units[uid];
    if (!u || u.dir === "sibling") return false;
    const ch = (childrenOf[uid] || []).filter(
      (cid) => units[cid] && units[cid].dir !== "anc" && units[cid].dir !== "sibling"
    );
    return ch.length === 0;
  }
  const subtreeWidthCache = {};
  function subtreeWidth(uid) {
    if (subtreeWidthCache[uid] !== void 0) return subtreeWidthCache[uid];
    const u = units[uid];
    if (!u) return 0;
    if (u.dir === "sibling") return subtreeWidthCache[uid] = unitW(u);
    const allCh = (childrenOf[uid] || []).filter((cid) => units[cid] && units[cid].dir !== "anc");
    if (allCh.length === 0) return subtreeWidthCache[uid] = unitW(u);
    const nonLeafCh = allCh.filter((cid) => !isLeaf(cid));
    if (nonLeafCh.length === 0) return subtreeWidthCache[uid] = unitW(u);
    let w = nonLeafCh.reduce((sum, cid) => sum + subtreeWidth(cid), 0) + (nonLeafCh.length - 1) * H_GAP;
    w = Math.max(w, unitW(u));
    return subtreeWidthCache[uid] = w;
  }
  const allUnitIds = Object.keys(units);
  const descUnits = allUnitIds.filter((id) => units[id].gen >= 0 && units[id].dir !== "anc");
  const ancUnits = allUnitIds.filter((id) => units[id].gen < 0 || units[id].dir === "anc");
  const descRoots = descUnits.filter((id) => {
    const u = units[id];
    if (u.dir === "anc") return false;
    if (u.dir === "root") return true;
    const pid = parentOf[id];
    if (pid && units[pid].dir === "anc") return false;
    return !pid || units[pid].gen < 0;
  });
  function assignX(uid, centerX) {
    const u = units[uid];
    if (!u) return;
    u.x = centerX - unitW(u) / 2;
    u.width = unitW(u);
    u.height = CARD_H;
    const eligible = (childrenOf[uid] || []).filter((cid) => {
      const cu = units[cid];
      if (!cu || cu.dir === "anc") return false;
      return true;
    }).sort((a, b) => {
      const d = unitDob(units[a]) - unitDob(units[b]);
      return isNaN(d) ? 0 : d;
    });
    if (eligible.length === 0) return;
    const totalSpan = eligible.reduce((sum, cid) => sum + (isLeaf(cid) ? unitW(units[cid]) : subtreeWidth(cid)), 0) + (eligible.length - 1) * H_GAP;
    let x = centerX - totalSpan / 2;
    for (const cid of eligible) {
      if (isLeaf(cid)) {
        units[cid].x = x;
        units[cid].width = unitW(units[cid]);
        units[cid].height = CARD_H;
        x += unitW(units[cid]) + H_GAP;
      } else {
        const span = subtreeWidth(cid);
        assignX(cid, x + span / 2);
        x += span + H_GAP;
      }
    }
  }
  {
    const totalSpan = descRoots.reduce((sum, id) => sum + subtreeWidth(id), 0) + (descRoots.length - 1) * H_GAP;
    let x = -totalSpan / 2;
    for (const id of descRoots) {
      assignX(id, x + subtreeWidth(id) / 2);
      x += subtreeWidth(id) + H_GAP;
    }
  }
  const byGen = {};
  for (const id of allUnitIds) {
    const g = String(units[id].gen);
    (byGen[g] = byGen[g] || []).push(id);
  }
  for (const [gen, ids] of Object.entries(byGen)) {
    const y = parseInt(gen) * (CARD_H + V_GAP);
    for (const id of ids) {
      if (units[id].x !== void 0) units[id].y = y;
    }
  }
  function parentCentreX(id) {
    const pid = parentOf[id];
    const parent = pid ? units[pid] : void 0;
    if (parent && parent.x !== void 0) {
      return parent.x + unitW(parent) / 2;
    }
    const u = units[id];
    return u.x + unitW(u) / 2;
  }
  function resolveOverlaps(genIds) {
    const placed = genIds.filter((id) => units[id].x !== void 0).sort((a, b) => {
      const pa = parentCentreX(a), pb = parentCentreX(b);
      if (pa !== pb) return pa - pb;
      return units[a].x - units[b].x;
    });
    if (placed.length < 2) return;
    for (let i = 1; i < placed.length; i++) {
      const prev = units[placed[i - 1]], curr = units[placed[i]];
      const minX = prev.x + unitW(prev) + H_GAP;
      if (curr.x < minX) curr.x = minX;
    }
    for (let i = placed.length - 2; i >= 0; i--) {
      const next = units[placed[i + 1]], curr = units[placed[i]];
      const maxX = next.x - unitW(curr) - H_GAP;
      if (curr.x > maxX) curr.x = maxX;
    }
    const left = units[placed[0]].x;
    const right = units[placed[placed.length - 1]].x + unitW(units[placed[placed.length - 1]]);
    const shift = (left + right) / 2;
    for (const id of placed) units[id].x -= shift;
  }
  for (const [gen, ids] of Object.entries(byGen)) {
    if (parseInt(gen) >= 0) resolveOverlaps(ids);
  }
  const ancGens = [...new Set(ancUnits.map((id) => units[id].gen))].sort((a, b) => b - a);
  for (const gen of ancGens) {
    const ids = byGen[String(gen)] || [];
    for (const id of ids) {
      const u = units[id];
      u.width = unitW(u);
      u.height = CARD_H;
      u.y = gen * (CARD_H + V_GAP);
      const placedCh = (childrenOf[id] || []).filter((cid) => units[cid] && units[cid].x !== void 0);
      if (placedCh.length > 0) {
        const minX = Math.min(...placedCh.map((cid) => units[cid].x));
        const maxX = Math.max(...placedCh.map((cid) => units[cid].x + unitW(units[cid])));
        u.x = (minX + maxX) / 2 - unitW(u) / 2;
      } else {
        u.x = -unitW(u) / 2;
      }
      const unplacedSibs = (childrenOf[id] || []).filter((cid) => units[cid] && units[cid].dir === "sibling" && units[cid].x === void 0).sort((a, b) => {
        const d = unitDob(units[a]) - unitDob(units[b]);
        return isNaN(d) ? 0 : d;
      });
      if (unplacedSibs.length > 0) {
        const allCh = (childrenOf[id] || []).sort((a, b) => {
          const d = unitDob(units[a]) - unitDob(units[b]);
          return isNaN(d) ? 0 : d;
        });
        const totalW = allCh.reduce((s, cid) => s + unitW(units[cid]), 0) + (allCh.length - 1) * H_GAP;
        const ancCentreX = u.x + unitW(u) / 2;
        let cx = ancCentreX - totalW / 2;
        const childY = (parseInt(String(gen)) + 1) * (CARD_H + V_GAP);
        for (const cid of allCh) {
          units[cid].x = cx;
          units[cid].y = childY;
          units[cid].width = unitW(units[cid]);
          units[cid].height = CARD_H;
          cx += unitW(units[cid]) + H_GAP;
        }
      }
    }
    resolveOverlaps(ids);
  }
  for (const [, ids] of Object.entries(byGen)) {
    resolveOverlaps(ids.filter((id) => units[id].x !== void 0));
  }
}

// src/renderer.ts
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function cardColors(name, isRoot, isSpouse, isSib, genderIndex, theme) {
  var _a;
  const g = (_a = genderIndex[name]) != null ? _a : "u";
  const fill = g === "m" ? theme.maleFill : g === "f" ? theme.femaleFill : theme.unknownFill;
  const border = isRoot ? theme.rootBorder : isSib ? theme.sibBorder : g === "m" ? theme.maleBorder : g === "f" ? theme.femaleBorder : theme.unknownBorder;
  const text = isRoot ? theme.textRoot : isSib ? theme.textSib : theme.text;
  return { fill, border, text };
}
function buildSVG(units, edges, people, rootName, byName, genderIndex, theme, layoutMode, coloredEdges = true) {
  var _a, _b, _c, _d, _e;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const u of Object.values(units)) {
    if (u.x === void 0) continue;
    minX = Math.min(minX, u.x);
    maxX = Math.max(maxX, u.x + ((_a = u.width) != null ? _a : 0));
    minY = Math.min(minY, u.y);
    maxY = Math.max(maxY, u.y + ((_b = u.height) != null ? _b : 0));
  }
  const pad = 40;
  const svgW = maxX - minX + pad * 2;
  const svgH = maxY - minY + pad * 2;
  const ox = -minX + pad;
  const oy = -minY + pad;
  let edgeSVG = "";
  let cardSVG = "";
  const edgeSeen = /* @__PURE__ */ new Set();
  const ancGroups = /* @__PURE__ */ new Map();
  for (const e of edges) {
    const fromU = units[e.fromUnit];
    const toU = units[e.toUnit];
    if (!fromU || !toU || fromU.x === void 0 || toU.x === void 0) continue;
    const ancId = fromU.gen <= toU.gen ? e.fromUnit : e.toUnit;
    const chId = ancId === e.fromUnit ? e.toUnit : e.fromUnit;
    const fromName = ancId === e.fromUnit ? e.fromName : void 0;
    const key = `${ancId}|${chId}`;
    if (edgeSeen.has(key)) continue;
    edgeSeen.add(key);
    const groupKey = `${ancId}::${fromName != null ? fromName : ""}::${e.sibling}`;
    if (!ancGroups.has(groupKey)) ancGroups.set(groupKey, []);
    ancGroups.get(groupKey).push({ ancId, chId, fromName, toName: e.toName, sibling: e.sibling });
  }
  for (const group of ancGroups.values()) {
    const { ancId, fromName, sibling } = group[0];
    const ancU = units[ancId];
    const col = sibling ? theme.edgeSib : theme.edge;
    const dash = sibling ? " stroke-dasharray='5,3'" : "";
    if (layoutMode === "horizontal") {
      const fromIdx = fromName ? ancU.members.indexOf(fromName) : -1;
      const px = fromIdx >= 0 ? ancU.x + fromIdx * (CARD_W + SPOUSE_GAP) + CARD_W / 2 + ox : ancU.x + ((_c = ancU.width) != null ? _c : CARD_W) / 2 + ox;
      const py = ancU.y + CARD_H + oy;
      const withPos = group.map((ce) => {
        const chU = units[ce.chId];
        const toIdx = ce.toName ? chU.members.indexOf(ce.toName) : 0;
        const toOff = toIdx > 0 ? toIdx * (CARD_W + SPOUSE_GAP) : 0;
        return { ...ce, cx: chU.x + toOff + CARD_W / 2 + ox, cy: chU.y + oy };
      }).sort((a, b) => a.cx - b.cx);
      withPos.forEach(({ cx, cy }, i) => {
        const edgeCol = coloredEdges ? theme.edgePalette[i % theme.edgePalette.length] : col;
        const dy = cy - py;
        const d = `M${px},${py} C${px},${py + dy * 0.5} ${cx},${cy - dy * 0.5} ${cx},${cy}`;
        edgeSVG += `<path d='${d}' fill='none' stroke='${edgeCol}' stroke-width='1.5'${dash}/>`;
      });
    } else {
      const fromIdx = fromName ? ancU.members.indexOf(fromName) : -1;
      const px = ancU.x + ((_d = ancU.width) != null ? _d : 0) + ox;
      const py = fromIdx >= 0 ? ancU.y + fromIdx * (CARD_H + SPOUSE_GAP) + CARD_H / 2 + oy : ancU.y + ((_e = ancU.height) != null ? _e : CARD_H) / 2 + oy;
      const withPos = group.map((ce) => {
        const chU = units[ce.chId];
        const toIdx = ce.toName ? chU.members.indexOf(ce.toName) : 0;
        const toOff = toIdx > 0 ? toIdx * (CARD_H + SPOUSE_GAP) : 0;
        return { ...ce, cx: chU.x + ox, cy: chU.y + toOff + CARD_H / 2 + oy };
      }).sort((a, b) => a.cy - b.cy);
      withPos.forEach(({ cx, cy }, i) => {
        const edgeCol = coloredEdges ? theme.edgePalette[i % theme.edgePalette.length] : col;
        const dx = cx - px;
        const d = `M${px},${py} C${px + dx * 0.5},${py} ${cx - dx * 0.5},${cy} ${cx},${cy}`;
        edgeSVG += `<path d='${d}' fill='none' stroke='${edgeCol}' stroke-width='1.5'${dash}/>`;
      });
    }
  }
  for (const u of Object.values(units)) {
    if (u.x === void 0) continue;
    u.members.forEach((name, i) => {
      const p = byName[name];
      const cx = layoutMode === "horizontal" ? u.x + i * (CARD_W + SPOUSE_GAP) + ox : u.x + ox;
      const cy = layoutMode === "horizontal" ? u.y + oy : u.y + i * (CARD_H + SPOUSE_GAP) + oy;
      const isRoot = name === rootName;
      const isSpouse = i > 0;
      const isSib = u.dir === "sibling";
      const dob = getYear(p == null ? void 0 : p.DOB);
      const dod = getYear(p == null ? void 0 : p.DOD);
      const dates = escapeHtml(dob && dod ? `${dob} - ${dod}` : dob || dod || "");
      const { first, last } = getNameLines(name, p != null ? p : null);
      const { fill, border, text: textCol } = cardColors(name, isRoot, isSpouse, isSib, genderIndex, theme);
      const datesCol = isRoot ? "rgba(255,255,255,0.75)" : theme.dates;
      const sw = isRoot ? "4" : "1";
      const fw = isRoot ? "700" : "500";
      const mid = cx + CARD_W / 2;
      if (isSpouse) {
        if (layoutMode === "horizontal") {
          const lx1 = u.x + i * (CARD_W + SPOUSE_GAP) - SPOUSE_GAP + ox;
          const ly = u.y + CARD_H / 2 + oy;
          edgeSVG += `<line x1='${lx1}' y1='${ly}' x2='${lx1 + SPOUSE_GAP}' y2='${ly}' stroke='${theme.spouseLine}' stroke-width='2' stroke-dasharray='3,2'/>`;
        } else {
          const lx = u.x + CARD_W / 2 + ox;
          const ly1 = u.y + i * (CARD_H + SPOUSE_GAP) - SPOUSE_GAP + oy;
          edgeSVG += `<line x1='${lx}' y1='${ly1}' x2='${lx}' y2='${ly1 + SPOUSE_GAP}' stroke='${theme.spouseLine}' stroke-width='2' stroke-dasharray='3,2'/>`;
        }
      }
      const firstTxt = escapeHtml(trunc(first));
      const lastTxt = escapeHtml(trunc(last));
      cardSVG += `<g class='person-card' data-name='${escapeHtml(name)}' style='cursor:pointer'>`;
      cardSVG += `<rect x='${cx}' y='${cy}' width='${CARD_W}' height='${CARD_H}' rx='6' fill='${fill}' stroke='${border}' stroke-width='${sw}'/>`;
      cardSVG += `<text x='${mid}' y='${cy + 16}' text-anchor='middle' font-size='14' font-weight='${fw}' fill='${textCol}' font-family='var(--font-interface)'>${firstTxt}</text>`;
      cardSVG += `<text x='${mid}' y='${cy + 29}' text-anchor='middle' font-size='14' font-weight='${fw}' fill='${textCol}' font-family='var(--font-interface)'>${lastTxt}</text>`;
      cardSVG += `<text x='${mid}' y='${cy + 48}' text-anchor='middle' font-size='11' fill='${datesCol}' font-family='var(--font-interface)'>${dates}</text>`;
      cardSVG += `</g>`;
    });
  }
  return { svgW, svgH, edgeSVG, cardSVG };
}

// src/view.ts
var ARBOR_VIEW_TYPE = "arbor-family-tree";
function resolveTheme() {
  const cs = getComputedStyle(document.body);
  const g = (v) => cs.getPropertyValue(v).trim();
  return {
    containerBorder: g("--background-modifier-border"),
    edge: g("--arbor-edge"),
    edgeSib: g("--arbor-edge-sib"),
    edgePalette: [g("--arbor-edge-0"), g("--arbor-edge-1"), g("--arbor-edge-2"), g("--arbor-edge-3"), g("--arbor-edge-4")],
    spouseLine: g("--arbor-spouse-line"),
    rootBorder: g("--interactive-accent"),
    text: g("--text-normal"),
    textRoot: g("--arbor-text-root"),
    textSib: g("--text-muted"),
    dates: g("--text-muted"),
    maleFill: g("--arbor-male-fill"),
    maleBorder: g("--arbor-male-border"),
    femaleFill: g("--arbor-female-fill"),
    femaleBorder: g("--arbor-female-border"),
    unknownFill: g("--arbor-unknown-fill"),
    unknownBorder: g("--arbor-unknown-border"),
    sibFill: g("--arbor-sib-fill"),
    sibBorder: g("--arbor-sib-border"),
    toolbarBg: g("--background-secondary"),
    toolbarBorder: g("--background-modifier-border"),
    btnBg: g("--interactive-normal"),
    btnBorder: g("--background-modifier-border"),
    btnColor: g("--text-normal"),
    bodyBg: g("--background-primary")
  };
}
var FamilyTreeView = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.byName = {};
    this.nameIndex = { stemToDisplay: {}, displayToStem: {} };
    this.genderIndex = {};
    this.currentFolder = "";
    this.homeRoot = "";
    this.currentLayout = "horizontal";
    this.coloredEdges = false;
    this.siblingsBloodOnly = true;
    this.currentRoot = "";
    this.navHistory = [];
  }
  getViewType() {
    return ARBOR_VIEW_TYPE;
  }
  getDisplayText() {
    if (this.currentFolder) {
      const parts = this.currentFolder.split("/");
      const folderName = parts.length > 1 ? parts[parts.length - 2] : parts[0];
      return `Arbor: ${folderName}`;
    }
    return "Arbor";
  }
  getIcon() {
    return "trees";
  }
  onOpen() {
    const s = this.plugin.settings;
    if (s.lastLayout) this.currentLayout = s.lastLayout;
    if (s.coloredEdges !== void 0) this.coloredEdges = s.coloredEdges;
    if (s.siblingsBloodOnly !== void 0) this.siblingsBloodOnly = s.siblingsBloodOnly;
    this.registerEvent(
      this.app.workspace.on("css-change", () => {
        if (this.currentRoot) this.render(this.currentRoot);
      })
    );
    this.registerEvent(
      this.app.workspace.on("file-open", (file) => {
        if (file) this.onFileOpen(file);
      })
    );
    this.loadFromActiveFile();
    return Promise.resolve();
  }
  onClose() {
    this.contentEl.empty();
    return Promise.resolve();
  }
  // ── File context ──────────────────────────────────────────────────────────
  isPersonFile(file) {
    var _a;
    const cache = this.app.metadataCache.getFileCache(file);
    return ((_a = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _a.ar_type) === "person";
  }
  onFileOpen(file) {
    var _a, _b;
    if (!this.isPersonFile(file)) return;
    const newFolder = (_b = (_a = file.parent) == null ? void 0 : _a.path) != null ? _b : "";
    if (newFolder === this.currentFolder && this.currentFolder !== "") {
      if (file.basename !== this.currentRoot) {
        this.navHistory.push(this.currentRoot);
        this.render(file.basename);
      }
    } else {
      this.loadFromFile(file);
    }
  }
  loadFromActiveFile() {
    const file = this.app.workspace.getActiveFile();
    if (file && this.isPersonFile(file)) {
      this.loadFromFile(file);
    } else if (this.plugin.settings.lastRoot && this.plugin.settings.lastFolder) {
      this.currentFolder = this.plugin.settings.lastFolder;
      this.homeRoot = this.plugin.settings.lastRoot;
      this.loadData();
      this.render(this.plugin.settings.lastRoot);
    } else {
      this.showNoPersonMessage();
    }
  }
  loadFromFile(file) {
    var _a, _b;
    this.currentFolder = (_b = (_a = file.parent) == null ? void 0 : _a.path) != null ? _b : "";
    this.homeRoot = file.basename;
    this.loadData();
    this.navHistory = [];
    this.leaf.updateHeader();
    this.render(file.basename);
  }
  // ── Data ──────────────────────────────────────────────────────────────────
  loadData() {
    this.byName = loadPeople(this.app, this.currentFolder);
    this.nameIndex = buildNameIndex(this.byName);
    this.genderIndex = buildGenderIndex(this.byName);
  }
  displayName(stem) {
    return this.nameIndex.stemToDisplay[stem] || stem;
  }
  // ── Rendering ─────────────────────────────────────────────────────────────
  showNoPersonMessage() {
    this.contentEl.empty();
    const wrapper = this.contentEl.createEl("div", {
      attr: {
        style: "display:flex; align-items:center; justify-content:center;height:100%; color:var(--text-muted); font-size:14px; text-align:center; padding:2em;"
      }
    });
    wrapper.createEl("span", { text: "Open a person note to view their family tree." });
  }
  render(rootName) {
    this.currentRoot = rootName;
    const s = this.plugin.settings;
    s.lastRoot = this.currentRoot;
    s.lastFolder = this.currentFolder;
    s.lastLayout = this.currentLayout;
    s.coloredEdges = this.coloredEdges;
    s.siblingsBloodOnly = this.siblingsBloodOnly;
    void this.plugin.saveSettings();
    this.contentEl.empty();
    const outerContainer = this.contentEl.createEl("div", { cls: "arbor-outer" });
    const { units, people, edges, pedigreeCollapse } = buildTree(rootName, this.byName, this.siblingsBloodOnly);
    const effectiveSiblingsBloodOnly = pedigreeCollapse ? true : this.siblingsBloodOnly;
    const toolbar = outerContainer.createEl("div", { cls: "arbor-toolbar" });
    const parts = this.currentFolder.split("/");
    const folderName = parts.length > 1 ? parts[parts.length - 2] : parts[0];
    const titleEl = toolbar.createEl("span", { cls: "arbor-title" });
    titleEl.createEl("strong", { text: "Arbor" });
    titleEl.createEl("span", { text: `: ${folderName}` });
    toolbar.createEl("span", {
      text: ` - ${this.displayName(rootName)} (${Object.keys(people).length} people)`,
      cls: "arbor-root-label"
    });
    const backBtn = toolbar.createEl("button", {
      text: "\u2190 back",
      cls: "arbor-btn" + (this.navHistory.length === 0 ? " is-disabled" : "")
    });
    backBtn.addEventListener("click", () => {
      if (this.navHistory.length > 0) this.render(this.navHistory.pop());
    });
    const homeBtn = toolbar.createEl("button", { text: "\u2302 home", cls: "arbor-btn" });
    homeBtn.addEventListener("click", () => {
      this.navHistory.length = 0;
      this.render(this.homeRoot);
    });
    const sibBtn = toolbar.createEl("button", {
      text: effectiveSiblingsBloodOnly ? "Show All Siblings" : "Blood Siblings Only",
      cls: "arbor-btn" + (pedigreeCollapse ? " is-disabled" : ""),
      attr: pedigreeCollapse ? { title: "Show all siblings is unavailable \u2014 this tree contains pedigree collapse" } : {}
    });
    if (!pedigreeCollapse) {
      sibBtn.addEventListener("click", () => {
        this.siblingsBloodOnly = !this.siblingsBloodOnly;
        this.render(this.currentRoot);
      });
    }
    toolbar.createEl("span", { cls: "arbor-divider" });
    const layoutBtn = toolbar.createEl("button", {
      text: this.currentLayout === "horizontal" ? "\u21C4 Vertical" : "\u2195 Horizontal",
      cls: "arbor-btn"
    });
    layoutBtn.addEventListener("click", () => {
      this.currentLayout = this.currentLayout === "horizontal" ? "vertical" : "horizontal";
      this.render(this.currentRoot);
    });
    const edgeColBtn = toolbar.createEl("button", {
      text: this.coloredEdges ? "Mono Lines" : "Colour Lines",
      cls: "arbor-btn"
    });
    edgeColBtn.addEventListener("click", () => {
      this.coloredEdges = !this.coloredEdges;
      this.render(this.currentRoot);
    });
    toolbar.createEl("span", {
      text: `v${this.plugin.manifest.version}`,
      cls: "arbor-version"
    });
    const t = resolveTheme();
    layout(units, edges, this.byName, this.currentLayout);
    const { svgW, svgH, edgeSVG, cardSVG } = buildSVG(
      units,
      edges,
      people,
      rootName,
      this.byName,
      this.genderIndex,
      t,
      this.currentLayout,
      this.coloredEdges
    );
    const svgContainer = outerContainer.createEl("div", { cls: "arbor-body" });
    svgContainer.appendChild((0, import_obsidian.sanitizeHTMLToDom)(
      `<svg width='${svgW}' height='${svgH}' xmlns='http://www.w3.org/2000/svg'><g id='edges'>${edgeSVG}</g><g id='cards'>${cardSVG}</g></svg>`
    ));
    svgContainer.querySelectorAll(".person-card").forEach((el) => {
      el.addEventListener("click", () => {
        const name = el.getAttribute("data-name");
        if (name && name !== rootName) {
          this.navHistory.push(rootName);
          this.render(name);
        }
      });
      el.addEventListener("dblclick", (evt) => {
        evt.stopPropagation();
        const name = el.getAttribute("data-name");
        if (!name) return;
        const file = this.app.vault.getAbstractFileByPath(
          `${this.currentFolder}/${name}.md`
        );
        if (file instanceof import_obsidian.TFile) this.app.workspace.getLeaf(false).openFile(file);
      });
    });
  }
};

// src/commands/newPerson.ts
var import_obsidian2 = require("obsidian");
function randomSuffix(length = 4) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
function uniqueSuffix(existingStems, base, length = 4) {
  for (let i = 0; i < 1e3; i++) {
    const suffix = randomSuffix(length);
    if (!existingStems.has(`${base}_${suffix}`)) return suffix;
  }
  throw new Error(`Could not generate a unique suffix for '${base}' after 1000 attempts`);
}
function makePersonNote(first, family) {
  return [
    "---",
    "ar_type: person",
    `first_names: ${first}`,
    `family_name: ${family}`,
    "sex:",
    "DOB:",
    "DOD:",
    "birthplace:",
    "married: []",
    "father:",
    "mother:",
    "---",
    ""
  ].join("\n");
}
async function createPersonNote(app, folder, first, family) {
  const fullName = [first, family].filter(Boolean).join(" ");
  const existingStems = new Set(
    app.vault.getMarkdownFiles().filter((f) => {
      var _a, _b;
      return ((_b = (_a = f.parent) == null ? void 0 : _a.path) != null ? _b : "") === folder;
    }).map((f) => f.basename)
  );
  const suffix = uniqueSuffix(existingStems, fullName);
  const stem = `${fullName}_${suffix}`;
  const path = folder ? `${folder}/${stem}.md` : `${stem}.md`;
  return await app.vault.create(path, makePersonNote(first, family));
}
function findPersonFolders(app) {
  var _a, _b, _c;
  const folders = /* @__PURE__ */ new Set();
  for (const file of app.vault.getMarkdownFiles()) {
    const cache = app.metadataCache.getFileCache(file);
    if (((_a = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _a.ar_type) === "person") {
      folders.add((_c = (_b = file.parent) == null ? void 0 : _b.path) != null ? _c : "");
    }
  }
  return [...folders].sort();
}
async function resolveTargetFolder(app) {
  var _a, _b, _c;
  const active = app.workspace.getActiveFile();
  if (active) {
    const cache = app.metadataCache.getFileCache(active);
    if (((_a = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _a.ar_type) === "person") {
      return (_c = (_b = active.parent) == null ? void 0 : _b.path) != null ? _c : "";
    }
  }
  const folders = findPersonFolders(app);
  if (folders.length === 0) {
    new import_obsidian2.Notice("Arbor: no person notes found in vault. Create a person note manually first.");
    return null;
  }
  if (folders.length === 1) return folders[0];
  return new Promise((resolve) => new FolderPickerModal(app, folders, resolve).open());
}
var FolderPickerModal = class extends import_obsidian2.FuzzySuggestModal {
  constructor(app, folders, onPick) {
    super(app);
    this.folders = folders;
    this.onPick = onPick;
    this.selected = null;
    this.setPlaceholder("Choose a family tree folder\u2026");
  }
  getItems() {
    return this.folders;
  }
  getItemText(item) {
    return item;
  }
  onChooseItem(item) {
    this.selected = item;
  }
  onClose() {
    setTimeout(() => this.onPick(this.selected), 0);
  }
};
var NewPersonModal = class extends import_obsidian2.Modal {
  constructor(app, folder, onSubmit) {
    super(app);
    this.folder = folder;
    this.onSubmit = onSubmit;
    this.first = "";
    this.family = "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Create person note" });
    contentEl.createEl("p", {
      text: `Folder: ${this.folder || "(vault root)"}`,
      attr: { style: "color: var(--text-muted); font-size: 12px; margin: 0 0 12px;" }
    });
    let firstInput;
    let familyInput;
    new import_obsidian2.Setting(contentEl).setName("First name(s)").addText((text) => {
      firstInput = text.inputEl;
      text.setPlaceholder("John William").onChange((value) => {
        this.first = value.trim();
      });
    });
    new import_obsidian2.Setting(contentEl).setName("Family name").addText((text) => {
      familyInput = text.inputEl;
      text.setPlaceholder("Smith").onChange((value) => {
        this.family = value.trim();
      });
    });
    new import_obsidian2.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Create").setCta().onClick(() => this.submit())
    );
    firstInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        familyInput.focus();
      }
    });
    familyInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.submit();
      }
    });
    firstInput.focus();
  }
  submit() {
    if (!this.first && !this.family) {
      new import_obsidian2.Notice("Arbor: please enter at least a first name or family name.");
      return;
    }
    this.onSubmit(this.first, this.family);
    this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};
function registerNewPersonCommand(plugin) {
  plugin.addCommand({
    id: "create-person-note",
    name: "Create person note",
    callback: async () => {
      const folder = await resolveTargetFolder(plugin.app);
      if (folder === null) return;
      new NewPersonModal(plugin.app, folder, (first, family) => {
        void (async () => {
          try {
            const file = await createPersonNote(plugin.app, folder, first, family);
            new import_obsidian2.Notice(`Arbor: created ${file.basename}`);
            await plugin.app.workspace.getLeaf(false).openFile(file);
          } catch (err) {
            new import_obsidian2.Notice(`Arbor: failed to create note \u2014 ${err}`);
          }
        })();
      }).open();
    }
  });
}

// src/commands/bulkImport.ts
var import_obsidian3 = require("obsidian");

// src/csvUtils.ts
function splitCsvRow(row) {
  const cells = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        cell += '"';
        i++;
      } else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cells.push(cell);
      cell = "";
    } else {
      cell += ch;
    }
  }
  cells.push(cell);
  return cells;
}
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvRow(lines[0]).map((h) => h.toLowerCase().trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvRow(line);
    const row = {};
    headers.forEach((h, i) => {
      var _a;
      row[h] = ((_a = values[i]) != null ? _a : "").trim();
    });
    return row;
  });
}
function quoteCell(value) {
  if (/[",\n\r]/.test(value)) return '"' + value.replace(/"/g, '""') + '"';
  return value;
}
function joinMultiValue(values) {
  return values.join("|");
}
function serializeCSV(headers, rows) {
  const lines = [headers.map(quoteCell).join(",")];
  for (const row of rows) {
    lines.push(
      row.map((cell) => quoteCell(Array.isArray(cell) ? joinMultiValue(cell) : cell)).join(",")
    );
  }
  return lines.join("\n") + "\n";
}

// src/commands/bulkImport.ts
var TEMPLATE_FILENAME = "arbor-import-template.csv";
var TEMPLATE_CONTENT = [
  "first_names,family_name,sex,DOB,DOD,birthplace,married,father,mother",
  "John William,Smith,male,1923,,London,,Thomas Smith,Mary Jones",
  "Mary,Jones,female,~1925,2001-03-15,Manchester,Thomas Smith,,",
  "Thomas,Smith,male,c.1900,1965,,,,,"
].join("\n") + "\n";
async function saveTemplate(app) {
  const existing = app.vault.getAbstractFileByPath(TEMPLATE_FILENAME);
  if (existing instanceof import_obsidian3.TFile) {
    await app.vault.modify(existing, TEMPLATE_CONTENT);
  } else {
    await app.vault.create(TEMPLATE_FILENAME, TEMPLATE_CONTENT);
  }
  new import_obsidian3.Notice(`Arbor: template saved to ${TEMPLATE_FILENAME} in your vault`);
}
function splitList(value) {
  if (!value) return [];
  return value.split("|").map((v) => v.trim()).filter(Boolean);
}
function renderNote(first, family, sex, dob, dod, birthplace, marriedStems, fatherStem, motherStem) {
  const lines = [
    "---",
    "ar_type: person",
    `first_names: ${first}`,
    `family_name: ${family}`,
    `sex: ${sex}`,
    `DOB: ${dob}`,
    `DOD: ${dod}`,
    `birthplace: ${birthplace}`
  ];
  if (marriedStems.length > 0) {
    lines.push("married:");
    marriedStems.forEach((s) => lines.push(`  - "[[${s}]]"`));
  } else {
    lines.push("married: []");
  }
  lines.push(`father: ${fatherStem ? `"[[${fatherStem}]]"` : ""}`);
  lines.push(`mother: ${motherStem ? `"[[${motherStem}]]"` : ""}`);
  lines.push("---", "");
  return lines.join("\n");
}
function renderStub(first, family) {
  return renderNote(first, family, "", "", "", "", [], "", "");
}
function splitName(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return [parts[0], ""];
  return [parts.slice(0, -1).join(" "), parts[parts.length - 1]];
}
async function runImport(app, csvFile, folder, dryRun = false) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
  const raw = await app.vault.read(csvFile);
  const rows = parseCSV(raw);
  if (rows.length === 0) throw new Error("CSV is empty or has no data rows.");
  const missing = ["first_names", "family_name"].filter((col) => !(col in rows[0]));
  if (missing.length > 0) throw new Error(`CSV is missing required column(s): ${missing.join(", ")}`);
  const nameToStem = {};
  const stemsSet = /* @__PURE__ */ new Set();
  for (const file of app.vault.getMarkdownFiles()) {
    if (((_b = (_a = file.parent) == null ? void 0 : _a.path) != null ? _b : "") !== folder) continue;
    const cache = app.metadataCache.getFileCache(file);
    const fm = cache == null ? void 0 : cache.frontmatter;
    if ((fm == null ? void 0 : fm.ar_type) !== "person") continue;
    const name = [fm.first_names, fm.family_name].filter(Boolean).join(" ").trim();
    if (name) nameToStem[name] = file.basename;
    stemsSet.add(file.basename);
  }
  const allNames = /* @__PURE__ */ new Set();
  for (const row of rows) {
    const name = [row.first_names, row.family_name].filter(Boolean).join(" ").trim();
    if (name) allNames.add(name);
    for (const col of ["father", "mother"]) {
      const v = (_c = row[col]) == null ? void 0 : _c.trim();
      if (v) allNames.add(v);
    }
    for (const spouse of splitList((_d = row.married) != null ? _d : "")) allNames.add(spouse);
  }
  for (const name of [...allNames].sort()) {
    if (nameToStem[name]) continue;
    const suffix = uniqueSuffix(stemsSet, name);
    const stem = `${name}_${suffix}`;
    nameToStem[name] = stem;
    stemsSet.add(stem);
  }
  const csvNames = new Set(
    rows.map((r) => [r.first_names, r.family_name].filter(Boolean).join(" ").trim()).filter(Boolean)
  );
  const relationOnlyNames = [...allNames].filter((n) => !csvNames.has(n));
  let created = 0, stubs = 0, skipped = 0;
  for (const name of relationOnlyNames) {
    const stem = nameToStem[name];
    const path = folder ? `${folder}/${stem}.md` : `${stem}.md`;
    if (app.vault.getAbstractFileByPath(path)) {
      skipped++;
      continue;
    }
    if (!dryRun) {
      const [first, family] = splitName(name);
      await app.vault.create(path, renderStub(first, family));
    }
    stubs++;
  }
  for (const row of rows) {
    const name = [row.first_names, row.family_name].filter(Boolean).join(" ").trim();
    if (!name) continue;
    const stem = nameToStem[name];
    const path = folder ? `${folder}/${stem}.md` : `${stem}.md`;
    if (app.vault.getAbstractFileByPath(path)) {
      skipped++;
      continue;
    }
    if (!dryRun) {
      const marriedStems = splitList((_e = row.married) != null ? _e : "").map((n) => nameToStem[n]).filter(Boolean);
      const fatherStem = (_h = nameToStem[(_g = (_f = row.father) == null ? void 0 : _f.trim()) != null ? _g : ""]) != null ? _h : "";
      const motherStem = (_k = nameToStem[(_j = (_i = row.mother) == null ? void 0 : _i.trim()) != null ? _j : ""]) != null ? _k : "";
      await app.vault.create(path, renderNote(
        row.first_names,
        row.family_name,
        (_l = row.sex) != null ? _l : "",
        (_m = row.DOB) != null ? _m : "",
        (_n = row.DOD) != null ? _n : "",
        (_o = row.birthplace) != null ? _o : "",
        marriedStems,
        fatherStem,
        motherStem
      ));
    }
    created++;
  }
  return { created, stubs, skipped };
}
var ConfirmImportModal = class extends import_obsidian3.Modal {
  constructor(app, preview, onConfirm) {
    super(app);
    this.preview = preview;
    this.onConfirm = onConfirm;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Confirm import" });
    const { created, stubs, skipped } = this.preview;
    const rows = [
      ["Notes to create", String(created)],
      ["Stub notes to create", String(stubs)],
      ["Already exist (will skip)", String(skipped)]
    ];
    const table = contentEl.createEl("table", {
      attr: { style: "width:100%; border-collapse:collapse; margin-bottom:16px;" }
    });
    for (const [label, value] of rows) {
      const tr = table.createEl("tr");
      tr.createEl("td", { text: label, attr: { style: "padding:4px 8px; color:var(--text-muted);" } });
      tr.createEl("td", { text: value, attr: { style: "padding:4px 8px; font-weight:600; text-align:right;" } });
    }
    new import_obsidian3.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Cancel").onClick(() => this.close())
    ).addButton(
      (btn) => btn.setButtonText("Import").setCta().onClick(() => {
        this.onConfirm();
        this.close();
      })
    );
  }
  onClose() {
    this.contentEl.empty();
  }
};
var CsvPickerModal = class extends import_obsidian3.FuzzySuggestModal {
  constructor(app, onPick, onCancel = () => {
  }) {
    super(app);
    this.onPick = onPick;
    this.onCancel = onCancel;
    this.chosen = false;
    this.setPlaceholder("Choose a CSV file from your vault\u2026");
  }
  getItems() {
    return this.app.vault.getFiles().filter((f) => f.extension === "csv");
  }
  getItemText(file) {
    return file.path;
  }
  onChooseItem(file) {
    this.chosen = true;
    this.onPick(file);
  }
  onClose() {
    if (!this.chosen) this.onCancel();
  }
};
var BulkImportModal = class extends import_obsidian3.Modal {
  constructor(app, folder, onChooseFile) {
    super(app);
    this.folder = folder;
    this.onChooseFile = onChooseFile;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Import people from CSV" });
    contentEl.createEl("p", {
      text: `Folder: ${this.folder || "(vault root)"}`,
      attr: { style: "color: var(--text-muted); font-size: 12px; margin: 0 0 12px;" }
    });
    contentEl.createEl("p", {
      text: "The CSV must be saved inside your vault. Download the template, fill it in, then choose the file.",
      attr: { style: "font-size: 13px; margin-bottom: 16px;" }
    });
    new import_obsidian3.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Download CSV template").onClick(async () => {
        await saveTemplate(this.app);
      })
    ).addButton(
      (btn) => btn.setButtonText("Choose CSV file").setCta().onClick(() => {
        this.close();
        this.onChooseFile();
      })
    );
  }
  onClose() {
    this.contentEl.empty();
  }
};
function registerBulkImportCommand(plugin) {
  plugin.addCommand({
    id: "import-people-from-csv",
    name: "Import people from CSV",
    callback: async () => {
      const folder = await resolveTargetFolder(plugin.app);
      if (folder === null) return;
      const openPicker = () => new CsvPickerModal(plugin.app, (csvFile) => {
        void (async () => {
          try {
            const preview = await runImport(plugin.app, csvFile, folder, true);
            new ConfirmImportModal(plugin.app, preview, () => {
              void (async () => {
                try {
                  const { created, stubs, skipped } = await runImport(plugin.app, csvFile, folder);
                  new import_obsidian3.Notice(
                    `Arbor: import complete \u2014 ${created} created, ${stubs} stub(s), ${skipped} skipped`
                  );
                } catch (err) {
                  new import_obsidian3.Notice(`Arbor: import failed \u2014 ${err}`);
                }
              })();
            }).open();
          } catch (err) {
            new import_obsidian3.Notice(`Arbor: import failed \u2014 ${err}`);
          }
        })();
      }).open();
      new BulkImportModal(plugin.app, folder, openPicker).open();
    }
  });
}

// src/commands/exportHtml.ts
var import_obsidian4 = require("obsidian");

// src/htmlBundle.ts
var HTML_BUNDLE = `(()=>{var N=130,M=58,A=20,V=12,tt=120,gt=18,ut=!0;function J(t){if(!t)return null;if(typeof t=="object"&&t!==null&&"path"in t){let C=t.path.split("/");return C[C.length-1].replace(/\\.md$/,"")}if(typeof t!="string"&&typeof t!="number")return null;let g=String(t),U=g.match(/\\[\\[(.+?)\\]\\]/);return U?U[1]:g}function ct(t){if(!t)return[];if(Array.isArray(t))return t.map(J).filter(U=>U!==null);let g=J(t);return g?[g]:[]}function ht(t){if(!t)return"";if(typeof t=="object"&&t!==null&&"year"in t)return String(t.year);if(typeof t!="string"&&typeof t!="number")return"";let g=String(t).trim(),U=(g.match(/^[~c.]+/)||[""])[0],C=g.replace(/^[~c.]+/,"").slice(0,4);return U+C}function pt(t){return t?t.length>gt?t.slice(0,gt-1)+"...":t:""}function bt(t,g){var l;if(g&&g.first_names!==void 0&&g.family_name!==void 0)return{first:String(g.first_names||""),last:String(g.family_name||"")};let U=t.split(" "),C=(l=U.pop())!=null?l:"";return{first:U.join(" "),last:C}}function xt(t,g){let U=[];for(let[C,l]of Object.entries(g)){let p=J(l==null?void 0:l.father),m=J(l==null?void 0:l.mother);(p===t||m===t)&&U.push(C)}return U.sort((C,l)=>{var T,_;let p=g[C],m=g[l],k=p!=null&&p.DOB&&typeof p.DOB=="object"&&"year"in p.DOB?Number(p.DOB.year):typeof(p==null?void 0:p.DOB)=="object"?9999:parseInt(String((T=p==null?void 0:p.DOB)!=null?T:9999)),v=m!=null&&m.DOB&&typeof m.DOB=="object"&&"year"in m.DOB?Number(m.DOB.year):typeof(m==null?void 0:m.DOB)=="object"?9999:parseInt(String((_=m==null?void 0:m.DOB)!=null?_:9999));return(isNaN(k)?9999:k)-(isNaN(v)?9999:v)})}function yt(t,g,U){let C={},l={},p=[],m=new Set,k=new Set,v=0,T=!1;function _(x,I,P){var e;let B="u"+v++;C[B]={id:B,members:x,gen:I,dir:P};for(let n of x)l[n]||(l[n]={name:n,page:(e=g[n])!=null?e:null,unitId:B});return B}function F(x){let I=g[x];if(!I)return 1/0;let P=I.DOB;if(!P)return 1/0;if(typeof P=="object"&&"year"in P)return parseInt(String(P.year));let B=String(P).replace(/^[~c. ]+/,"").match(/(\\d{4})/);return B?parseInt(B[1]):1/0}function z(x,I,P){var a;if(m.has("anc-"+x))return;m.add("anc-"+x),P&&k.add(x);let B=g[x];if(!B)return;let e=J(B.father),n=J(B.mother);if(e||n){let o=_([e,n].filter(S=>S!==null),I-1,"anc");if(ut&&(!U||P)){let S=new Set;for(let i of[e,n].filter(r=>r!==null))for(let r of xt(i,g))S.add(r);let u=[...S].sort((i,r)=>{let b=F(i)-F(r);return isNaN(b)?0:b});for(let i of u){let r=i===x;if(l[i]){let b=l[i].unitId;p.some(w=>w.fromUnit===o&&w.toUnit===b)||p.push({fromUnit:o,toUnit:b,toName:i,sibling:!r})}else{let b=g[i],w=b?ct(b.married):[],E=r?"anc":"sibling",R=_([i,...w.filter(L=>L!==i)],I,E);p.push({fromUnit:o,toUnit:R,toName:i,sibling:!r})}}}else{let S=(a=l[x])==null?void 0:a.unitId;S&&(p.some(u=>u.fromUnit===o&&u.toUnit===S)||p.push({fromUnit:o,toUnit:S,toName:x,sibling:!1}))}e&&z(e,I-1,!0),n&&z(n,I-1,!0)}}function X(x,I,P){var B,e;if(!m.has("desc-"+x)){if(m.add("desc-"+x),P&&k.add(x),!l[x]){let n=g[x],a=n?ct(n.married):[];if(_([x,...a.filter(o=>o!==x)],I,"desc"),!U)for(let o of a)z(o,I,!1)}for(let n of xt(x,g)){m.has("desc-"+n)||X(n,I+1,!0);let a=(B=l[x])==null?void 0:B.unitId,o=(e=l[n])==null?void 0:e.unitId;if(a&&o&&a!==o){let S=C[a].gen,u=C[o].gen;if(u<=S&&(T=!0),u>S&&!p.some(i=>i.fromUnit===a&&i.toUnit===o)){let i=g[n],r=i?J(i.father):null,b=i?J(i.mother):null,w=x===r?b:r,E=C[a],R=E.members.length>2&&w&&E.members.includes(w)?w:E.members.length>2?x:void 0;p.push({fromUnit:a,toUnit:o,fromName:R,toName:n,sibling:!1})}}}}}k.add(t);let W=g[t],q=W?ct(W.married):[];if(_([t,...q.filter(x=>x!==t)],0,"root"),z(t,0,!0),X(t,0,!0),!U){let x=g[t],I=x?ct(x.married):[];for(let P of I.filter(B=>B!==t))z(P,0,!1)}return{units:C,people:l,edges:p,bloodLine:k,pedigreeCollapse:T}}function St(t,g,U,C){if(C==="vertical"){let e=function(c){return c.members.length*M+(c.members.length-1)*V},n=function(c){let d=c.members[0],f=U[d];if(!f)return 1/0;let s=f.DOB;if(!s)return 1/0;if(typeof s=="object"&&"year"in s)return parseInt(String(s.year));let $=String(s).replace(/^[~c. ]+/,"").match(/(\\d{4})/);return $?parseInt($[1]):1/0},S=function(c){let d=t[c];return!d||d.dir==="sibling"?!1:(a[c]||[]).filter(s=>t[s]&&t[s].dir!=="anc").length===0},i=function(c){if(u[c]!==void 0)return u[c];let d=t[c];if(!d)return 0;if(d.dir==="sibling")return u[c]=e(d);if(S(c))return u[c]=0;let f=(a[c]||[]).filter($=>!S($)).sort(($,y)=>{let h=n(t[$])-n(t[y]);return isNaN(h)?0:h});if(f.length===0)return u[c]=e(d);let s=f.reduce(($,y)=>$+i(y),0)+(f.length-1)*A;return s=Math.max(s,e(d)),u[c]=s},R=function(c,d){let f=t[c];if(!f)return;f.y=d-e(f)/2,f.width=N,f.height=e(f);let s=(a[c]||[]).filter(h=>{let O=t[h];if(!O)return!1;if(O.dir==="sibling"){let D=o[h];return D&&t[D]&&t[D].gen>=0&&t[D].dir!=="anc"}return O.dir!=="anc"}).sort((h,O)=>{let D=n(t[h])-n(t[O]);return isNaN(D)?0:D});if(s.length===0)return;let $=s.reduce((h,O)=>h+(S(O)?e(t[O]):i(O)),0)+(s.length-1)*A,y=d-$/2;for(let h of s)if(S(h))t[h].y=y,t[h].width=N,t[h].height=e(t[h]),y+=e(t[h])+A;else{let O=i(h);R(h,y+O/2),y+=O+A}},H=function(c){let d=o[c],f=d?t[d]:void 0;if(f&&f.y!==void 0)return f.y+e(f)/2;let s=t[c];return s.y+e(s)/2},j=function(c){let d=c.filter(y=>t[y].y!==void 0).sort((y,h)=>{let O=H(y),D=H(h);return O!==D?O-D:t[y].y-t[h].y});if(d.length<2)return;for(let y=1;y<d.length;y++){let h=t[d[y-1]],O=t[d[y]];O.y<h.y+e(h)+A&&(O.y=h.y+e(h)+A)}for(let y=d.length-2;y>=0;y--){let h=t[d[y+1]],O=t[d[y]];O.y>h.y-e(O)-A&&(O.y=h.y-e(O)-A)}let f=t[d[0]].y,s=t[d[d.length-1]].y+e(t[d[d.length-1]]),$=(f+s)/2;for(let y of d)t[y].y-=$},a={},o={};for(let c of g){let d=t[c.fromUnit],f=t[c.toUnit];if(!d||!f)continue;let[s,$]=d.gen<f.gen?[c.fromUnit,c.toUnit]:[c.toUnit,c.fromUnit];a[s]||(a[s]=[]),a[s].includes($)||a[s].push($);let y=o[$],h=t[s].dir;y?t[y].dir==="sibling"&&h!=="sibling"&&(o[$]=s):o[$]=s}let u={},r=Object.keys(t),b=r.filter(c=>t[c].gen>=0&&t[c].dir!=="anc"),w=r.filter(c=>t[c].gen<0||t[c].dir==="anc"),E=b.filter(c=>{let d=t[c];if(d.dir==="anc")return!1;if(d.dir==="root")return!0;let f=o[c];return f&&t[f].dir==="anc"?!1:!f||t[f].gen<0});{let d=-(E.reduce((f,s)=>f+i(s),0)+(E.length-1)*A)/2;for(let f of E)R(f,d+i(f)/2),d+=i(f)+A}let L={};for(let c of r){let d=String(t[c].gen);(L[d]=L[d]||[]).push(c)}for(let[c,d]of Object.entries(L)){let f=parseInt(c)*(N+tt);for(let s of d)t[s].y!==void 0&&(t[s].x=f,t[s].width=N,t[s].height=e(t[s]))}for(let[c,d]of Object.entries(L))parseInt(c)>=0&&j(d);let Y=[...new Set(w.map(c=>t[c].gen))].sort((c,d)=>d-c);for(let c of Y){let d=L[String(c)]||[];for(let f of d){let s=t[f];s.width=N,s.height=e(s),s.x=c*(N+tt);let $=(a[f]||[]).filter(h=>t[h]&&t[h].y!==void 0);if($.length>0){let h=Math.min(...$.map(D=>t[D].y)),O=Math.max(...$.map(D=>t[D].y+e(t[D])));s.y=(h+O)/2-e(s)/2}else s.y=-e(s)/2;let y=(a[f]||[]).filter(h=>t[h]&&t[h].dir==="sibling"&&t[h].y===void 0).sort((h,O)=>{let D=n(t[h])-n(t[O]);return isNaN(D)?0:D});if(y.length>0){let O=[...(a[f]||[]).filter(G=>t[G]&&t[G].dir!=="sibling"&&t[G].y!==void 0).sort((G,K)=>{let Z=n(t[G])-n(t[K]);return isNaN(Z)?0:Z}),...y].sort((G,K)=>{let Z=n(t[G])-n(t[K]);return isNaN(Z)?0:Z}),D=O.reduce((G,K)=>G+e(t[K]),0)+(O.length-1)*A,et=s.y+e(s)/2-D/2;for(let G of O){let K=t[G].gen;t[G].y=et,t[G].x=K*(N+tt),t[G].width=N,t[G].height=e(t[G]),et+=e(t[G])+A}}}j(d)}for(let[,c]of Object.entries(L))j(c.filter(d=>t[d].y!==void 0));return}function l(e){return e.members.length*N+(e.members.length-1)*V}function p(e){let n=e.members[0],a=U[n];if(!a)return 1/0;let o=a.DOB;if(!o)return 1/0;if(typeof o=="object"&&"year"in o)return parseInt(String(o.year));let S=String(o).replace(/^[~c. ]+/,"").match(/(\\d{4})/);return S?parseInt(S[1]):1/0}let m={},k={};for(let e of g){let n=t[e.fromUnit],a=t[e.toUnit];if(!n||!a)continue;let[o,S]=n.gen<a.gen?[e.fromUnit,e.toUnit]:[e.toUnit,e.fromUnit];m[o]||(m[o]=[]),m[o].includes(S)||m[o].push(S);let u=k[S],i=t[o].dir;u?t[u].dir==="sibling"&&i!=="sibling"&&(k[S]=o):k[S]=o}function v(e){let n=t[e];return!n||n.dir==="sibling"?!1:(m[e]||[]).filter(o=>t[o]&&t[o].dir!=="anc"&&t[o].dir!=="sibling").length===0}let T={};function _(e){if(T[e]!==void 0)return T[e];let n=t[e];if(!n)return 0;if(n.dir==="sibling")return T[e]=l(n);let a=(m[e]||[]).filter(u=>t[u]&&t[u].dir!=="anc");if(a.length===0)return T[e]=l(n);let o=a.filter(u=>!v(u));if(o.length===0)return T[e]=l(n);let S=o.reduce((u,i)=>u+_(i),0)+(o.length-1)*A;return S=Math.max(S,l(n)),T[e]=S}let F=Object.keys(t),z=F.filter(e=>t[e].gen>=0&&t[e].dir!=="anc"),X=F.filter(e=>t[e].gen<0||t[e].dir==="anc"),W=z.filter(e=>{let n=t[e];if(n.dir==="anc")return!1;if(n.dir==="root")return!0;let a=k[e];return a&&t[a].dir==="anc"?!1:!a||t[a].gen<0});function q(e,n){let a=t[e];if(!a)return;a.x=n-l(a)/2,a.width=l(a),a.height=M;let o=(m[e]||[]).filter(i=>{let r=t[i];return!(!r||r.dir==="anc")}).sort((i,r)=>{let b=p(t[i])-p(t[r]);return isNaN(b)?0:b});if(o.length===0)return;let S=o.reduce((i,r)=>i+(v(r)?l(t[r]):_(r)),0)+(o.length-1)*A,u=n-S/2;for(let i of o)if(v(i))t[i].x=u,t[i].width=l(t[i]),t[i].height=M,u+=l(t[i])+A;else{let r=_(i);q(i,u+r/2),u+=r+A}}{let n=-(W.reduce((a,o)=>a+_(o),0)+(W.length-1)*A)/2;for(let a of W)q(a,n+_(a)/2),n+=_(a)+A}let x={};for(let e of F){let n=String(t[e].gen);(x[n]=x[n]||[]).push(e)}for(let[e,n]of Object.entries(x)){let a=parseInt(e)*(M+tt);for(let o of n)t[o].x!==void 0&&(t[o].y=a)}function I(e){let n=k[e],a=n?t[n]:void 0;if(a&&a.x!==void 0)return a.x+l(a)/2;let o=t[e];return o.x+l(o)/2}function P(e){let n=e.filter(u=>t[u].x!==void 0).sort((u,i)=>{let r=I(u),b=I(i);return r!==b?r-b:t[u].x-t[i].x});if(n.length<2)return;for(let u=1;u<n.length;u++){let i=t[n[u-1]],r=t[n[u]],b=i.x+l(i)+A;r.x<b&&(r.x=b)}for(let u=n.length-2;u>=0;u--){let i=t[n[u+1]],r=t[n[u]],b=i.x-l(r)-A;r.x>b&&(r.x=b)}let a=t[n[0]].x,o=t[n[n.length-1]].x+l(t[n[n.length-1]]),S=(a+o)/2;for(let u of n)t[u].x-=S}for(let[e,n]of Object.entries(x))parseInt(e)>=0&&P(n);let B=[...new Set(X.map(e=>t[e].gen))].sort((e,n)=>n-e);for(let e of B){let n=x[String(e)]||[];for(let a of n){let o=t[a];o.width=l(o),o.height=M,o.y=e*(M+tt);let S=(m[a]||[]).filter(i=>t[i]&&t[i].x!==void 0);if(S.length>0){let i=Math.min(...S.map(b=>t[b].x)),r=Math.max(...S.map(b=>t[b].x+l(t[b])));o.x=(i+r)/2-l(o)/2}else o.x=-l(o)/2;if((m[a]||[]).filter(i=>t[i]&&t[i].dir==="sibling"&&t[i].x===void 0).sort((i,r)=>{let b=p(t[i])-p(t[r]);return isNaN(b)?0:b}).length>0){let i=(m[a]||[]).sort((R,L)=>{let H=p(t[R])-p(t[L]);return isNaN(H)?0:H}),r=i.reduce((R,L)=>R+l(t[L]),0)+(i.length-1)*A,w=o.x+l(o)/2-r/2,E=(parseInt(String(e))+1)*(M+tt);for(let R of i)t[R].x=w,t[R].y=E,t[R].width=l(t[R]),t[R].height=M,w+=l(t[R])+A}}P(n)}for(let[,e]of Object.entries(x))P(e.filter(n=>t[n].x!==void 0))}function at(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Rt(t,g,U,C,l,p){var _;let m=(_=l[t])!=null?_:"u",k=m==="m"?p.maleFill:m==="f"?p.femaleFill:p.unknownFill,v=g?p.rootBorder:C?p.sibBorder:m==="m"?p.maleBorder:m==="f"?p.femaleBorder:p.unknownBorder,T=g?p.textRoot:C?p.textSib:p.text;return{fill:k,border:v,text:T}}function Ot(t,g,U,C,l,p,m,k,v=!0){var a,o,S,u,i;let T=1/0,_=-1/0,F=1/0,z=-1/0;for(let r of Object.values(t))r.x!==void 0&&(T=Math.min(T,r.x),_=Math.max(_,r.x+((a=r.width)!=null?a:0)),F=Math.min(F,r.y),z=Math.max(z,r.y+((o=r.height)!=null?o:0)));let X=40,W=_-T+X*2,q=z-F+X*2,x=-T+X,I=-F+X,P="",B="",e=new Set,n=new Map;for(let r of g){let b=t[r.fromUnit],w=t[r.toUnit];if(!b||!w||b.x===void 0||w.x===void 0)continue;let E=b.gen<=w.gen?r.fromUnit:r.toUnit,R=E===r.fromUnit?r.toUnit:r.fromUnit,L=E===r.fromUnit?r.fromName:void 0,H=\`\${E}|\${R}\`;if(e.has(H))continue;e.add(H);let j=\`\${E}::\${L!=null?L:""}::\${r.sibling}\`;n.has(j)||n.set(j,[]),n.get(j).push({ancId:E,chId:R,fromName:L,toName:r.toName,sibling:r.sibling})}for(let r of n.values()){let{ancId:b,fromName:w,sibling:E}=r[0],R=t[b],L=E?m.edgeSib:m.edge,H=E?" stroke-dasharray='5,3'":"";if(k==="horizontal"){let j=w?R.members.indexOf(w):-1,Y=j>=0?R.x+j*(N+V)+N/2+x:R.x+((S=R.width)!=null?S:N)/2+x,c=R.y+M+I;r.map(f=>{let s=t[f.chId],$=f.toName?s.members.indexOf(f.toName):0,y=$>0?$*(N+V):0;return{...f,cx:s.x+y+N/2+x,cy:s.y+I}}).sort((f,s)=>f.cx-s.cx).forEach(({cx:f,cy:s},$)=>{let y=v?m.edgePalette[$%m.edgePalette.length]:L,h=s-c,O=\`M\${Y},\${c} C\${Y},\${c+h*.5} \${f},\${s-h*.5} \${f},\${s}\`;P+=\`<path d='\${O}' fill='none' stroke='\${y}' stroke-width='1.5'\${H}/>\`})}else{let j=w?R.members.indexOf(w):-1,Y=R.x+((u=R.width)!=null?u:0)+x,c=j>=0?R.y+j*(M+V)+M/2+I:R.y+((i=R.height)!=null?i:M)/2+I;r.map(f=>{let s=t[f.chId],$=f.toName?s.members.indexOf(f.toName):0,y=$>0?$*(M+V):0;return{...f,cx:s.x+x,cy:s.y+y+M/2+I}}).sort((f,s)=>f.cy-s.cy).forEach(({cx:f,cy:s},$)=>{let y=v?m.edgePalette[$%m.edgePalette.length]:L,h=f-Y,O=\`M\${Y},\${c} C\${Y+h*.5},\${c} \${f-h*.5},\${s} \${f},\${s}\`;P+=\`<path d='\${O}' fill='none' stroke='\${y}' stroke-width='1.5'\${H}/>\`})}}for(let r of Object.values(t))r.x!==void 0&&r.members.forEach((b,w)=>{let E=l[b],R=k==="horizontal"?r.x+w*(N+V)+x:r.x+x,L=k==="horizontal"?r.y+I:r.y+w*(M+V)+I,H=b===C,j=w>0,Y=r.dir==="sibling",c=ht(E==null?void 0:E.DOB),d=ht(E==null?void 0:E.DOD),f=at(c&&d?\`\${c} - \${d}\`:c||d||""),{first:s,last:$}=bt(b,E!=null?E:null),{fill:y,border:h,text:O}=Rt(b,H,j,Y,p,m),D=H?"rgba(255,255,255,0.75)":m.dates,mt=H?"4":"1",et=H?"700":"500",G=R+N/2;if(j)if(k==="horizontal"){let nt=r.x+w*(N+V)-V+x,rt=r.y+M/2+I;P+=\`<line x1='\${nt}' y1='\${rt}' x2='\${nt+V}' y2='\${rt}' stroke='\${m.spouseLine}' stroke-width='2' stroke-dasharray='3,2'/>\`}else{let nt=r.x+N/2+x,rt=r.y+w*(M+V)-V+I;P+=\`<line x1='\${nt}' y1='\${rt}' x2='\${nt}' y2='\${rt+V}' stroke='\${m.spouseLine}' stroke-width='2' stroke-dasharray='3,2'/>\`}let K=at(pt(s)),Z=at(pt($));B+=\`<g class='person-card' data-name='\${at(b)}' style='cursor:pointer'>\`,B+=\`<rect x='\${R}' y='\${L}' width='\${N}' height='\${M}' rx='6' fill='\${y}' stroke='\${h}' stroke-width='\${mt}'/>\`,B+=\`<text x='\${G}' y='\${L+16}' text-anchor='middle' font-size='14' font-weight='\${et}' fill='\${O}' font-family='var(--font-interface)'>\${K}</text>\`,B+=\`<text x='\${G}' y='\${L+29}' text-anchor='middle' font-size='14' font-weight='\${et}' fill='\${O}' font-family='var(--font-interface)'>\${Z}</text>\`,B+=\`<text x='\${G}' y='\${L+48}' text-anchor='middle' font-size='11' fill='\${D}' font-family='var(--font-interface)'>\${f}</text>\`,B+="</g>"});return{svgW:W,svgH:q,edgeSVG:P,cardSVG:B}}function $t(t){var U;let g={};for(let[C,l]of Object.entries(t)){let p=String((U=l==null?void 0:l.sex)!=null?U:"").toLowerCase().trim();g[C]=p==="male"?"m":p==="female"?"f":"u"}return g}function Bt(t){let g=ARBOR_PEOPLE[t];return g&&[g.first_names,g.family_name].filter(Boolean).join(" ")||t}var ft=ARBOR_INITIAL_THEME,ot="horizontal",dt=!0,lt=!1,it="",st=[],It=$t(ARBOR_PEOPLE);function Q(t){var I;it=t;let g=ARBOR_THEMES[ft];document.body.style.background=(I=g.bodyBg)!=null?I:"";let U=document.getElementById("arbor-toolbar");U.replaceChildren(),U.style.cssText=\`display:flex; align-items:center; gap:10px; padding:7px 12px;background:\${g.toolbarBg}; border-bottom:1px solid \${g.toolbarBorder};overflow-x:auto;\`;let C=\`background:\${g.btnBg}; border:1px solid \${g.btnBorder};color:\${g.btnColor}; padding:3px 10px; border-radius:4px;cursor:pointer; font-size:12px; flex-shrink:0;\`,{units:l,people:p,edges:m}=yt(t,ARBOR_PEOPLE,dt),k=document.createElement("span");k.style.cssText=\`font-size:13px; font-weight:600; color:\${g.rootBorder}; margin-right:auto;\`,k.textContent=\`\${ARBOR_FOLDER} - \${Bt(t)} (\${Object.keys(p).length} people)\`,U.appendChild(k);function v(P,B=!1){let e=document.createElement("button");return e.textContent=P,e.style.cssText=C+(B?" opacity:0.35; cursor:default;":""),U.appendChild(e),e}v("\\u2190 Back",st.length===0).addEventListener("click",()=>{st.length>0&&Q(st.pop())}),v("\\u2302 Home").addEventListener("click",()=>{st.length=0,Q(ARBOR_ROOT)}),v(dt?"Show All Siblings":"Blood Siblings Only").addEventListener("click",()=>{dt=!dt,Q(it)});let T=document.createElement("span");T.style.cssText=\`width:1px; height:18px; background:\${g.toolbarBorder}; flex-shrink:0;\`,U.appendChild(T),v(ot==="horizontal"?"\\u21C4 Vertical":"\\u2195 Horizontal").addEventListener("click",()=>{ot=ot==="horizontal"?"vertical":"horizontal",Q(it)}),v(lt?"Mono Lines":"Colour Lines").addEventListener("click",()=>{lt=!lt,Q(it)}),v(ft==="dark"?"\\u2600 Light":"\\u{1F319} Dark").addEventListener("click",()=>{ft=ft==="dark"?"light":"dark",Q(it)}),St(l,m,ARBOR_PEOPLE,ot);let{svgW:_,svgH:F,edgeSVG:z,cardSVG:X}=Ot(l,m,p,t,ARBOR_PEOPLE,It,g,ot,lt),W=document.getElementById("arbor-tree");W.replaceChildren();let q=\`<svg width='\${_}' height='\${F}' xmlns='http://www.w3.org/2000/svg'><g id='edges'>\${z}</g><g id='cards'>\${X}</g></svg>\`,x=new DOMParser().parseFromString(q,"image/svg+xml");W.appendChild(document.adoptNode(x.documentElement)),W.querySelectorAll(".person-card").forEach(P=>{P.addEventListener("click",()=>{let B=P.getAttribute("data-name");B&&B!==t&&(st.push(t),Q(B))})})}document.addEventListener("DOMContentLoaded",()=>Q(ARBOR_ROOT));})();
`;

// src/commands/exportHtml.ts
function serialisePeople(byName) {
  var _a, _b, _c;
  const result = {};
  for (const [stem, page] of Object.entries(byName)) {
    result[stem] = {
      first_names: String((_a = page.first_names) != null ? _a : ""),
      family_name: String((_b = page.family_name) != null ? _b : ""),
      sex: String((_c = page.sex) != null ? _c : "").toLowerCase().trim(),
      DOB: getYear(page.DOB),
      DOD: getYear(page.DOD),
      father: resolveName(page.father),
      mother: resolveName(page.mother),
      married: resolveList(page.married)
    };
  }
  return result;
}
function readThemeFromBody() {
  const cs = getComputedStyle(document.body);
  const g = (v) => cs.getPropertyValue(v).trim();
  return {
    containerBorder: g("--background-modifier-border"),
    edge: g("--arbor-edge"),
    edgeSib: g("--arbor-edge-sib"),
    edgePalette: [g("--arbor-edge-0"), g("--arbor-edge-1"), g("--arbor-edge-2"), g("--arbor-edge-3"), g("--arbor-edge-4")],
    spouseLine: g("--arbor-spouse-line"),
    rootBorder: g("--interactive-accent"),
    text: g("--text-normal"),
    textRoot: g("--arbor-text-root"),
    textSib: g("--text-muted"),
    dates: g("--text-muted"),
    maleFill: g("--arbor-male-fill"),
    maleBorder: g("--arbor-male-border"),
    femaleFill: g("--arbor-female-fill"),
    femaleBorder: g("--arbor-female-border"),
    unknownFill: g("--arbor-unknown-fill"),
    unknownBorder: g("--arbor-unknown-border"),
    sibFill: g("--arbor-sib-fill"),
    sibBorder: g("--arbor-sib-border"),
    toolbarBg: g("--background-secondary"),
    toolbarBorder: g("--background-modifier-border"),
    btnBg: g("--interactive-normal"),
    btnBorder: g("--background-modifier-border"),
    btnColor: g("--text-normal"),
    bodyBg: g("--background-primary")
  };
}
function captureThemes() {
  const body = document.body;
  const initial = body.classList.contains("theme-light") ? "light" : "dark";
  const currentTheme = readThemeFromBody();
  if (initial === "dark") {
    body.classList.remove("theme-dark");
    body.classList.add("theme-light");
  } else {
    body.classList.remove("theme-light");
    body.classList.add("theme-dark");
  }
  const otherTheme = readThemeFromBody();
  if (initial === "dark") {
    body.classList.remove("theme-light");
    body.classList.add("theme-dark");
  } else {
    body.classList.remove("theme-dark");
    body.classList.add("theme-light");
  }
  return {
    themes: {
      dark: initial === "dark" ? currentTheme : otherTheme,
      light: initial === "light" ? currentTheme : otherTheme
    },
    initial
  };
}
function buildHtml(people, rootStem, rootDisplayName, folder) {
  const peopleJson = JSON.stringify(people, null, 2);
  const rootJson = JSON.stringify(rootStem);
  const folderName = folder.split("/")[0] || folder;
  const titleEsc = `Arbor Family Tree: ${folderName}`.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const { themes, initial } = captureThemes();
  const themesJson = JSON.stringify(themes);
  const initialJson = JSON.stringify(initial);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${titleEsc}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --font-interface: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  body { font-family: var(--font-interface); height: 100vh; display: flex; flex-direction: column; }
  #arbor-toolbar { flex-shrink: 0; }
  #arbor-tree { flex: 1; overflow: auto; padding: 20px; }
  svg .person-card { cursor: pointer; }
  svg .person-card rect { transition: filter 0.15s; }
  svg .person-card:hover rect { filter: brightness(1.15); }
</style>
</head>
<body>
<div id="arbor-toolbar"></div>
<div id="arbor-tree"></div>
<script>
const ARBOR_PEOPLE        = ${peopleJson};
const ARBOR_ROOT          = ${rootJson};
const ARBOR_FOLDER        = ${JSON.stringify(folderName)};
const ARBOR_THEMES        = ${themesJson};
const ARBOR_INITIAL_THEME = ${initialJson};
<\/script>
<script>${HTML_BUNDLE}<\/script>
</body>
</html>`;
}
async function resolveRootPerson(app, byName) {
  const active = app.workspace.getActiveFile();
  if (active && byName[active.basename]) return active.basename;
  const { stemToDisplay } = buildNameIndex(byName);
  const stems = Object.keys(byName).sort(
    (a, b) => (stemToDisplay[a] || a).localeCompare(stemToDisplay[b] || b)
  );
  if (stems.length === 0) return null;
  return new Promise((resolve) => new RootPersonModal(app, stems, stemToDisplay, resolve).open());
}
var RootPersonModal = class extends import_obsidian4.FuzzySuggestModal {
  constructor(app, stems, stemToDisplay, onPick) {
    super(app);
    this.stems = stems;
    this.stemToDisplay = stemToDisplay;
    this.onPick = onPick;
    this.selected = null;
    this.setPlaceholder("Choose the root person for the export\u2026");
  }
  getItems() {
    return this.stems;
  }
  getItemText(stem) {
    return this.stemToDisplay[stem] || stem;
  }
  onChooseItem(stem) {
    this.selected = stem;
  }
  onClose() {
    setTimeout(() => this.onPick(this.selected), 0);
  }
};
var ExportModal = class extends import_obsidian4.Modal {
  constructor(app, rootDisplayName, onExport) {
    super(app);
    this.rootDisplayName = rootDisplayName;
    this.onExport = onExport;
    this.filename = "family-tree.html";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Export tree as HTML" });
    contentEl.createEl("p", {
      text: `Root: ${this.rootDisplayName}`,
      attr: { style: "color: var(--text-muted); font-size: 12px; margin: 0 0 12px;" }
    });
    new import_obsidian4.Setting(contentEl).setName("Output filename").setDesc("Saved to your vault root. The .html extension will be added if missing.").addText((text) => {
      text.setValue(this.filename).onChange((value) => {
        this.filename = value.trim();
      });
      text.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.submit();
        }
      });
      setTimeout(() => text.inputEl.focus(), 50);
    });
    new import_obsidian4.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Export").setCta().onClick(() => this.submit())
    );
  }
  submit() {
    if (!this.filename) {
      new import_obsidian4.Notice("Arbor: please enter a filename.");
      return;
    }
    this.onExport(this.filename);
    this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};
function registerExportHtmlCommand(plugin) {
  plugin.addCommand({
    id: "export-tree-html",
    name: "Export tree as HTML",
    callback: async () => {
      const folder = await resolveTargetFolder(plugin.app);
      if (folder === null) return;
      const byName = loadPeople(plugin.app, folder);
      if (Object.keys(byName).length === 0) {
        new import_obsidian4.Notice("Arbor: no person notes found.");
        return;
      }
      const rootStem = await resolveRootPerson(plugin.app, byName);
      if (!rootStem) return;
      const { stemToDisplay } = buildNameIndex(byName);
      const rootDisplayName = stemToDisplay[rootStem] || rootStem;
      new ExportModal(plugin.app, rootDisplayName, (filename) => {
        void (async () => {
          try {
            const path = filename.endsWith(".html") ? filename : filename + ".html";
            const people = serialisePeople(byName);
            const html = buildHtml(people, rootStem, rootDisplayName, folder);
            const existing = plugin.app.vault.getAbstractFileByPath(path);
            if (existing instanceof import_obsidian4.TFile) {
              await plugin.app.vault.modify(existing, html);
            } else {
              await plugin.app.vault.create(path, html);
            }
            new import_obsidian4.Notice(`Arbor: exported to ${path}`);
          } catch (err) {
            new import_obsidian4.Notice(`Arbor: export failed \u2014 ${err}`);
          }
        })();
      }).open();
    }
  });
}

// src/commands/exportGedcom.ts
var import_obsidian5 = require("obsidian");

// src/gedcom.ts
var MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
function formatGedcomDate(val) {
  if (!val) return null;
  if (typeof val === "object" && val !== null && "year" in val) {
    const d = val;
    if (!d.year) return null;
    if (d.month && d.day) return `${String(d.day).padStart(2, "0")} ${MONTHS[d.month - 1]} ${d.year}`;
    if (d.month) return `${MONTHS[d.month - 1]} ${d.year}`;
    return String(d.year);
  }
  if (typeof val !== "string" && typeof val !== "number") return null;
  let s = String(val).trim();
  let prefix = "";
  const approx = s.match(/^([~c]+\.?)\s*/);
  if (approx) {
    prefix = "ABT ";
    s = s.slice(approx[0].length);
  }
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [, y, mo, d] = m;
    return prefix + `${d} ${MONTHS[parseInt(mo) - 1]} ${y}`;
  }
  m = s.match(/^(\d{4})-(\d{2})$/);
  if (m) {
    const [, y, mo] = m;
    return prefix + `${MONTHS[parseInt(mo) - 1]} ${y}`;
  }
  m = s.match(/^(\d{3,4})$/);
  if (m) return prefix + m[1];
  return prefix + s || null;
}
function sexToGedcom(val) {
  const s = typeof val === "string" ? val.trim().toLowerCase() : "";
  if (s === "male") return "M";
  if (s === "female") return "F";
  return "U";
}
function gedLine(level, tag, value = "") {
  return value ? `${level} ${tag} ${value}` : `${level} ${tag}`;
}
function buildFamilies(byName) {
  const famMap = /* @__PURE__ */ new Map();
  const key = (f, m) => `${f != null ? f : ""}|||${m != null ? m : ""}`;
  for (const [name, page] of Object.entries(byName)) {
    const f = resolveName(page.father);
    const m = resolveName(page.mother);
    if (f || m) {
      const k = key(f, m);
      if (!famMap.has(k)) famMap.set(k, []);
      famMap.get(k).push(name);
    }
  }
  for (const [name, page] of Object.entries(byName)) {
    const spouses = resolveList(page.married);
    const sex = sexToGedcom(page.sex);
    for (const sp of spouses) {
      let k;
      if (sex === "M") k = key(name, sp);
      else if (sex === "F") k = key(sp, name);
      else k = key(...[name, sp].sort());
      if (!famMap.has(k)) famMap.set(k, []);
    }
  }
  return Array.from(famMap.entries()).map(([k, children]) => {
    const [husband, wife] = k.split("|||");
    return { husband: husband || null, wife: wife || null, children };
  });
}
function buildGedcom(byName, filename) {
  var _a, _b, _c, _d, _e;
  const sortedNames = Object.keys(byName).sort();
  const personIds = {};
  sortedNames.forEach((name, i) => {
    personIds[name] = `I${String(i + 1).padStart(4, "0")}`;
  });
  const families = buildFamilies(byName);
  const familyIds = families.map((_, i) => `F${String(i + 1).padStart(4, "0")}`);
  const spouseFams = {};
  const childFams = {};
  families.forEach((fam, i) => {
    var _a2, _b2, _c2, _d2, _e2;
    const fid = familyIds[i];
    if (fam.husband) ((_b2 = spouseFams[_a2 = fam.husband]) != null ? _b2 : spouseFams[_a2] = []).push(fid);
    if (fam.wife) ((_d2 = spouseFams[_c2 = fam.wife]) != null ? _d2 : spouseFams[_c2] = []).push(fid);
    for (const child of fam.children) ((_e2 = childFams[child]) != null ? _e2 : childFams[child] = []).push(fid);
  });
  const now = /* @__PURE__ */ new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  const lines = [
    gedLine(0, "HEAD"),
    gedLine(1, "SOUR", "ArborPlugin"),
    gedLine(2, "NAME", "Arbor Family Tree Plugin"),
    gedLine(1, "DATE", `${day} ${month} ${year}`),
    gedLine(2, "TIME", time),
    gedLine(1, "FILE", filename),
    gedLine(1, "GEDC"),
    gedLine(2, "VERS", "5.5.1"),
    gedLine(2, "FORM", "LINEAGE-LINKED"),
    gedLine(1, "CHAR", "UTF-8")
  ];
  for (const name of sortedNames) {
    const page = byName[name];
    const xref = personIds[name];
    const first = String((_a = page.first_names) != null ? _a : "").trim();
    const last = String((_b = page.family_name) != null ? _b : "").trim();
    const fullName = last ? `${first} /${last}/` : first;
    lines.push(gedLine(0, `@${xref}@`, "INDI"));
    lines.push(gedLine(1, "NAME", fullName));
    if (first) lines.push(gedLine(2, "GIVN", first));
    if (last) lines.push(gedLine(2, "SURN", last));
    lines.push(gedLine(1, "SEX", sexToGedcom(page.sex)));
    const dob = formatGedcomDate(page.DOB);
    const birthplace = String((_c = page.birthplace) != null ? _c : "").trim();
    if (dob || birthplace) {
      lines.push(gedLine(1, "BIRT"));
      if (dob) lines.push(gedLine(2, "DATE", dob));
      if (birthplace) lines.push(gedLine(2, "PLAC", birthplace));
    }
    const dod = formatGedcomDate(page.DOD);
    if (dod) {
      lines.push(gedLine(1, "DEAT"));
      lines.push(gedLine(2, "DATE", dod));
    }
    for (const fid of (_d = spouseFams[name]) != null ? _d : []) lines.push(gedLine(1, "FAMS", `@${fid}@`));
    for (const fid of (_e = childFams[name]) != null ? _e : []) lines.push(gedLine(1, "FAMC", `@${fid}@`));
  }
  families.forEach((fam, i) => {
    const fid = familyIds[i];
    lines.push(gedLine(0, `@${fid}@`, "FAM"));
    if (fam.husband && personIds[fam.husband]) lines.push(gedLine(1, "HUSB", `@${personIds[fam.husband]}@`));
    if (fam.wife && personIds[fam.wife]) lines.push(gedLine(1, "WIFE", `@${personIds[fam.wife]}@`));
    for (const child of fam.children) {
      if (personIds[child]) lines.push(gedLine(1, "CHIL", `@${personIds[child]}@`));
    }
  });
  lines.push(gedLine(0, "TRLR"));
  return lines.join("\n") + "\n";
}

// src/commands/exportGedcom.ts
var ExportGedcomModal = class extends import_obsidian5.Modal {
  constructor(app, personCount, onExport) {
    super(app);
    this.personCount = personCount;
    this.onExport = onExport;
    this.filename = "family.ged";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Export tree as GEDCOM" });
    contentEl.createEl("p", {
      text: `${this.personCount} people found`,
      attr: { style: "color: var(--text-muted); font-size: 12px; margin: 0 0 12px;" }
    });
    new import_obsidian5.Setting(contentEl).setName("Output filename").setDesc("Saved to your vault root. The .ged extension will be added if missing.").addText((text) => {
      text.setValue(this.filename).onChange((value) => {
        this.filename = value.trim();
      });
      text.inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.submit();
        }
      });
      setTimeout(() => text.inputEl.focus(), 50);
    });
    new import_obsidian5.Setting(contentEl).addButton(
      (btn) => btn.setButtonText("Export").setCta().onClick(() => this.submit())
    );
  }
  submit() {
    if (!this.filename) {
      new import_obsidian5.Notice("Arbor: please enter a filename.");
      return;
    }
    this.onExport(this.filename);
    this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};
function registerExportGedcomCommand(plugin) {
  plugin.addCommand({
    id: "export-gedcom",
    name: "Export tree as GEDCOM",
    callback: async () => {
      const folder = await resolveTargetFolder(plugin.app);
      if (folder === null) return;
      const byName = loadPeople(plugin.app, folder);
      const count = Object.keys(byName).length;
      if (count === 0) {
        new import_obsidian5.Notice("Arbor: no person notes found.");
        return;
      }
      new ExportGedcomModal(plugin.app, count, (filename) => {
        void (async () => {
          try {
            const path = filename.endsWith(".ged") ? filename : filename + ".ged";
            const gedcom = buildGedcom(byName, path);
            const existing = plugin.app.vault.getAbstractFileByPath(path);
            if (existing instanceof import_obsidian5.TFile) {
              await plugin.app.vault.modify(existing, gedcom);
            } else {
              await plugin.app.vault.create(path, gedcom);
            }
            new import_obsidian5.Notice(`Arbor: exported ${count} people to ${path}`);
          } catch (err) {
            new import_obsidian5.Notice(`Arbor: GEDCOM export failed \u2014 ${err}`);
          }
        })();
      }).open();
    }
  });
}

// src/commands/exportCsv.ts
var import_obsidian6 = require("obsidian");
function extractStem(val) {
  if (!val) return "";
  if (typeof val === "object" && "path" in val)
    return String(val.path);
  return String(val).replace(/^\[\[|\]\]$/g, "");
}
function fmtDateField(val) {
  if (val === null || val === void 0) return "";
  if (typeof val === "number") return String(val);
  if (typeof val === "string") return val;
  if (typeof val === "object" && "year" in val) {
    const d = val;
    if (d.month && d.day)
      return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
    return String(d.year);
  }
  return String(val);
}
var HEADERS = [
  "first_names",
  "family_name",
  "sex",
  "DOB",
  "DOD",
  "birthplace",
  "married",
  "father",
  "mother"
];
function personToRow(p, stemToDisplay) {
  var _a, _b, _c, _d;
  const resolve = (v) => {
    var _a2;
    const stem = extractStem(v);
    return stem ? (_a2 = stemToDisplay[stem]) != null ? _a2 : stem : "";
  };
  const marriedRaw = Array.isArray(p.married) ? p.married : p.married ? [p.married] : [];
  const marriedNames = marriedRaw.map(resolve).filter(Boolean);
  return [
    String((_a = p.first_names) != null ? _a : ""),
    String((_b = p.family_name) != null ? _b : ""),
    String((_c = p.sex) != null ? _c : ""),
    fmtDateField(p.DOB),
    fmtDateField(p.DOD),
    String((_d = p.birthplace) != null ? _d : ""),
    marriedNames,
    // string[] → pipe-joined by serializeCSV
    resolve(p.father),
    resolve(p.mother)
  ];
}
var ExportCsvModal = class extends import_obsidian6.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.filename = "arbor-export.csv";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Export people to CSV" });
    new import_obsidian6.Setting(contentEl).setName("Filename").setDesc("Saved to vault root").addText(
      (t) => t.setValue(this.filename).onChange((v) => {
        this.filename = v.trim();
      })
    );
    new import_obsidian6.Setting(contentEl).addButton((b) => b.setButtonText("Cancel").onClick(() => this.close())).addButton((b) => b.setButtonText("Export").setCta().onClick(() => void this.run()));
  }
  onClose() {
    this.contentEl.empty();
  }
  async run() {
    const folder = await resolveTargetFolder(this.plugin.app);
    if (folder === null) return;
    const people = loadPeople(this.plugin.app, folder);
    const { stemToDisplay } = buildNameIndex(people);
    const rows = Object.values(people).map((p) => personToRow(p, stemToDisplay));
    const csv = serializeCSV(HEADERS, rows);
    const filename = this.filename.endsWith(".csv") ? this.filename : this.filename + ".csv";
    const existing = this.app.vault.getFileByPath(filename);
    if (existing) {
      await this.app.vault.modify(existing, csv);
    } else {
      await this.app.vault.create(filename, csv);
    }
    new import_obsidian6.Notice(`Arbor: exported ${rows.length} people to ${filename}`);
    this.close();
  }
};
function registerExportCsvCommand(plugin) {
  plugin.addCommand({
    id: "export-people-to-csv",
    name: "Export people to CSV",
    callback: () => new ExportCsvModal(plugin.app, plugin).open()
  });
}

// src/main.ts
var ArborPlugin = class extends import_obsidian7.Plugin {
  constructor() {
    super(...arguments);
    this.settings = { ...DEFAULT_SETTINGS };
  }
  async onload() {
    await this.loadSettings();
    await this.runSchemaMigrations();
    this.registerView(
      ARBOR_VIEW_TYPE,
      (leaf) => new FamilyTreeView(leaf, this)
    );
    this.addRibbonIcon("trees", "Open tree view", () => {
      void this.activateView();
    });
    this.addCommand({
      id: "open-family-tree",
      name: "Open tree view",
      callback: () => this.activateView()
    });
    registerNewPersonCommand(this);
    registerBulkImportCommand(this);
    registerExportHtmlCommand(this);
    registerExportGedcomCommand(this);
    registerExportCsvCommand(this);
  }
  onunload() {
  }
  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(ARBOR_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getLeaf("tab");
      await leaf.setViewState({ type: ARBOR_VIEW_TYPE, active: true });
    }
    workspace.revealLeaf(leaf);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async runSchemaMigrations() {
    var _a;
    const stored = (_a = this.settings.arborSchemaVersion) != null ? _a : 0;
    if (stored === CURRENT_ARBOR_SCHEMA_VERSION) return;
    if (stored > CURRENT_ARBOR_SCHEMA_VERSION) {
      new import_obsidian7.Notice(
        "Arbor: this vault was created with a newer version of the plugin. Some features may not work correctly. Please update Arbor."
      );
      return;
    }
    this.settings.arborSchemaVersion = CURRENT_ARBOR_SCHEMA_VERSION;
    await this.saveSettings();
  }
};

/* nosourcemap */