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

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => HillChartPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// src/obsidian/hillChartBlockProcessor.ts
var import_obsidian2 = require("obsidian");

// src/model/hillCurve.ts
var GSS_ITERATIONS = 5;
var HillCurve = class _HillCurve {
  // Two cubic Bézier segments in normalized space.
  // Left half (t ∈ [0, 0.5]): hugs baseline, rises steeply to peak
  static LEFT = {
    p0: { x: 0, y: 0 },
    p1: { x: 0.25, y: 0 },
    p2: { x: 0.35, y: 0.8 },
    p3: { x: 0.5, y: 0.8 }
  };
  // Right half (t ∈ [0.5, 1]): mirror-symmetric descent from peak to baseline
  static RIGHT = {
    p0: { x: 0.5, y: 0.8 },
    p1: { x: 0.65, y: 0.8 },
    p2: { x: 0.75, y: 0 },
    p3: { x: 1, y: 0 }
  };
  marginRatio;
  constructor(options) {
    this.marginRatio = options?.marginRatio ?? 0.08;
  }
  pointAt(t) {
    const seg = t <= 0.5 ? _HillCurve.LEFT : _HillCurve.RIGHT;
    const u = t <= 0.5 ? t * 2 : (t - 0.5) * 2;
    const mu = 1 - u;
    const mu2 = mu * mu;
    const mu3 = mu2 * mu;
    const u2 = u * u;
    const u3 = u2 * u;
    const x = mu3 * seg.p0.x + 3 * mu2 * u * seg.p1.x + 3 * mu * u2 * seg.p2.x + u3 * seg.p3.x;
    const y = mu3 * seg.p0.y + 3 * mu2 * u * seg.p1.y + 3 * mu * u2 * seg.p2.y + u3 * seg.p3.y;
    return { x, y };
  }
  scaleToSize(normPoint, size) {
    const margin = this.marginRatio;
    const availableWidth = size.width * (1 - 2 * margin);
    const availableHeight = size.height * (1 - 2 * margin);
    const offsetX = size.width * margin;
    const offsetY = size.height * margin;
    return {
      x: offsetX + normPoint.x * availableWidth,
      y: offsetY + (1 - normPoint.y) * availableHeight
    };
  }
  toSvgPath(size) {
    const L = _HillCurve.LEFT;
    const R = _HillCurve.RIGHT;
    const lp0 = this.scaleToSize(L.p0, size);
    const lp1 = this.scaleToSize(L.p1, size);
    const lp2 = this.scaleToSize(L.p2, size);
    const lp3 = this.scaleToSize(L.p3, size);
    const rp1 = this.scaleToSize(R.p1, size);
    const rp2 = this.scaleToSize(R.p2, size);
    const rp3 = this.scaleToSize(R.p3, size);
    return `M ${lp0.x} ${lp0.y} C ${lp1.x} ${lp1.y}, ${lp2.x} ${lp2.y}, ${lp3.x} ${lp3.y} C ${rp1.x} ${rp1.y}, ${rp2.x} ${rp2.y}, ${rp3.x} ${rp3.y}`;
  }
  toSvgPoint(t, size) {
    return this.scaleToSize(this.pointAt(t), size);
  }
  tFromSvgX(svgX, size) {
    const margin = this.marginRatio;
    const availW = size.width * (1 - 2 * margin);
    const normX = (svgX - size.width * margin) / availW;
    if (normX <= 0)
      return 0;
    if (normX >= 1)
      return 1;
    let lo = 0, hi = 1;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (this.pointAt(mid).x < normX)
        lo = mid;
      else
        hi = mid;
    }
    return (lo + hi) / 2;
  }
  projectFromSvgPoint(svgPoint, size) {
    const margin = this.marginRatio;
    const availW = size.width * (1 - 2 * margin);
    const availH = size.height * (1 - 2 * margin);
    const normX = (svgPoint.x - size.width * margin) / availW;
    const normY = 1 - (svgPoint.y - size.height * margin) / availH;
    return this.projectToCurve({ x: normX, y: normY });
  }
  projectToCurve(point) {
    const sampleCount = 100;
    let bestT = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i <= sampleCount; i++) {
      const t = i / sampleCount;
      const p = this.pointAt(t);
      const dx = p.x - point.x;
      const dy = p.y - point.y;
      const distance = dx * dx + dy * dy;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestT = t;
      }
    }
    if (bestDistance === 0)
      return bestT;
    return this.refineProjection(point, bestT);
  }
  refineProjection(point, initialT) {
    let left = Math.max(0, initialT - 0.1);
    let right = Math.min(1, initialT + 0.1);
    const goldenRatio = (3 - Math.sqrt(5)) / 2;
    for (let i = 0; i < GSS_ITERATIONS; i++) {
      const x1 = right - goldenRatio * (right - left);
      const x2 = left + goldenRatio * (right - left);
      const p1 = this.pointAt(x1);
      const p2 = this.pointAt(x2);
      const d1 = (p1.x - point.x) ** 2 + (p1.y - point.y) ** 2;
      const d2 = (p2.x - point.x) ** 2 + (p2.y - point.y) ** 2;
      if (d1 < d2) {
        right = x2;
      } else {
        left = x1;
      }
    }
    const candidates = [left, (left + right) / 2, right, initialT];
    let bestT = candidates[0];
    let bestDist = Number.POSITIVE_INFINITY;
    for (const t of candidates) {
      const p = this.pointAt(t);
      const d = (p.x - point.x) ** 2 + (p.y - point.y) ** 2;
      if (d < bestDist) {
        bestDist = d;
        bestT = t;
      }
    }
    return bestT;
  }
};

// src/ui/visualConstants.ts
var HOVER_OPACITY = 0.75;
var SECTION_LABEL_OFFSET = 18;
var DEFAULT_DOT_LABEL_FONT_SIZE = 12;

// src/ui/labelSeparation.ts
function fanOffsets(n) {
  return Array.from({ length: n }, (_, i) => i - (n - 1) / 2);
}
function findClusters(entries, threshold) {
  if (entries.length === 0)
    return [];
  const sorted = [...entries].sort(
    (a, b) => a.baseY !== b.baseY ? a.baseY - b.baseY : a.position - b.position
  );
  const clusters = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const previous = sorted[i - 1];
    if (current.baseY - previous.baseY <= threshold) {
      clusters[clusters.length - 1].push(current);
    } else {
      clusters.push([current]);
    }
  }
  return clusters;
}
function separateLabels(labels, opts) {
  if (labels.length === 0)
    return [];
  if (labels.length === 1)
    return [{ ...labels[0] }];
  const fontSize = opts?.fontSize ?? DEFAULT_DOT_LABEL_FONT_SIZE;
  const step = opts?.baseStep ?? fontSize * 1.2;
  const maxDisplacement = fontSize * 3;
  const outputByInputIndex = /* @__PURE__ */ new Map();
  const groups = /* @__PURE__ */ new Map();
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const group = groups.get(label.textAnchor) ?? [];
    group.push({ index: i, label });
    groups.set(label.textAnchor, group);
  }
  for (const [, group] of groups) {
    const clusterLabels = group.map((item) => item.label);
    const clusters = findClusters(clusterLabels, step);
    for (const cluster of clusters) {
      if (cluster.length < 2) {
        const inputItem = group.find((item) => item.label === cluster[0]);
        if (inputItem) {
          outputByInputIndex.set(inputItem.index, { ...cluster[0] });
        }
        continue;
      }
      const n = cluster.length;
      const centerY = cluster.reduce((sum, l) => sum + l.baseY, 0) / n;
      const outerOffset = (n - 1) / 2;
      const effectiveStep = outerOffset > 0 ? Math.min(step, maxDisplacement / outerOffset) : step;
      for (const [i, offset] of fanOffsets(n).entries()) {
        const spreadLabel = { ...cluster[i], baseY: centerY + offset * effectiveStep };
        const inputItem = group.find((item) => item.label === cluster[i]);
        if (inputItem) {
          outputByInputIndex.set(inputItem.index, spreadLabel);
        }
      }
    }
  }
  const result = [];
  for (let i = 0; i < labels.length; i++) {
    const spread = outputByInputIndex.get(i);
    if (spread) {
      result.push(spread);
    }
  }
  return result;
}

// src/ui/labelLayout.ts
var LabelLayout = class {
  entries = [];
  add(entry) {
    this.entries.push(entry);
  }
  finalize(ceiling, maxFontSize) {
    if (this.entries.length === 0)
      return;
    const specs = this.entries.map((e) => ({
      position: e.position.toPercent(),
      textAnchor: e.textAnchor,
      baseY: e.baseY
    }));
    const adjusted = separateLabels(specs, { fontSize: maxFontSize });
    adjusted.forEach((a, i) => {
      const entry = this.entries[i];
      const clampedY = Math.min(a.baseY, ceiling);
      entry.textEl.setAttribute("y", `${clampedY}`);
    });
  }
  getEntries() {
    return this.entries;
  }
};

// src/ui/chartChromeRenderer.ts
var SVG_NS = "http://www.w3.org/2000/svg";
var UPHILL_LABEL_X_RATIO = 0.25;
var DOWNHILL_LABEL_X_RATIO = 0.75;
var ChartChromeRenderer = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  renderBaseline(style) {
    if (!style.visible)
      return;
    const { svg, size, baselineY } = this.ctx;
    const baseline = activeDocument.createElementNS(SVG_NS, "line");
    baseline.setAttribute("x1", "0");
    baseline.setAttribute("y1", `${baselineY}`);
    baseline.setAttribute("x2", `${size.width}`);
    baseline.setAttribute("y2", `${baselineY}`);
    baseline.setAttribute("stroke", style.stroke);
    baseline.setAttribute("stroke-opacity", `${style.opacity}`);
    baseline.setAttribute("stroke-width", `${style.strokeWidth}`);
    svg.appendChild(baseline);
  }
  renderDivider(curve, style) {
    if (!style.visible)
      return;
    const { svg, size, baselineY } = this.ctx;
    const centerX = size.width / 2;
    const peakY = curve.toSvgPoint(0.5, size).y;
    const dividerEl = activeDocument.createElementNS(SVG_NS, "line");
    dividerEl.setAttribute("x1", `${centerX}`);
    dividerEl.setAttribute("x2", `${centerX}`);
    dividerEl.setAttribute("y1", `${peakY}`);
    dividerEl.setAttribute("y2", `${baselineY}`);
    dividerEl.setAttribute("stroke", style.stroke);
    dividerEl.setAttribute("stroke-width", `${style.strokeWidth}`);
    if (style.style === "dashed")
      dividerEl.setAttribute("stroke-dasharray", "8 4");
    else if (style.style === "dots") {
      dividerEl.setAttribute("stroke-dasharray", "1 8");
      dividerEl.setAttribute("stroke-linecap", "round");
    }
    svg.appendChild(dividerEl);
  }
  renderCurvePath(curve, style) {
    const { svg, size } = this.ctx;
    const path = activeDocument.createElementNS(SVG_NS, "path");
    path.setAttribute("d", curve.toSvgPath(size));
    path.setAttribute("fill", style.fill);
    path.setAttribute("stroke", style.stroke);
    path.setAttribute("stroke-width", `${style.strokeWidth}`);
    svg.appendChild(path);
  }
  renderSectionLabels(chartStyle) {
    const { svg, size, baselineY } = this.ctx;
    const y = baselineY + SECTION_LABEL_OFFSET;
    if (chartStyle.uphill.label !== void 0) {
      this.renderSectionLabel(svg, { label: chartStyle.uphill.label, x: size.width * UPHILL_LABEL_X_RATIO, y, style: chartStyle.uphill });
    }
    if (chartStyle.downhill.label !== void 0) {
      this.renderSectionLabel(svg, { label: chartStyle.downhill.label, x: size.width * DOWNHILL_LABEL_X_RATIO, y, style: chartStyle.downhill });
    }
  }
  renderSectionLabel(svg, spec) {
    const text = activeDocument.createElementNS(SVG_NS, "text");
    text.setAttribute("x", `${spec.x}`);
    text.setAttribute("y", `${spec.y}`);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-size", `${spec.style.fontSize}`);
    text.setAttribute("fill", spec.style.color);
    text.textContent = spec.label;
    svg.appendChild(text);
  }
};

// src/model/hillPosition.ts
var HillPosition = class _HillPosition {
  constructor(percent) {
    this.percent = percent;
  }
  static fromPercent(n) {
    if (!isFinite(n)) {
      throw new Error(`HillPosition.fromPercent: invalid value ${n}`);
    }
    return new _HillPosition(Math.min(100, Math.max(0, n)));
  }
  static fromT(t) {
    const clamped = Math.min(1, Math.max(0, t));
    return new _HillPosition(clamped * 100);
  }
  toPercent() {
    return this.percent;
  }
  toT() {
    return this.percent / 100;
  }
};

// src/ui/labelPlacement.ts
var LABEL_OFFSET_PX = 10;
var LEFT_ANCHOR_THRESHOLD = 80;
var MIDDLE_ANCHOR_HI = 60;
var MIDDLE_ANCHOR_LO = 40;
function computeLabelPlacement(t, dotX, dotY) {
  const position = t * 100;
  if (position >= LEFT_ANCHOR_THRESHOLD) {
    return { labelX: dotX - LABEL_OFFSET_PX, labelY: dotY, textAnchor: "end" };
  } else if (position >= MIDDLE_ANCHOR_LO && position <= MIDDLE_ANCHOR_HI) {
    return { labelX: dotX, labelY: dotY - LABEL_OFFSET_PX, textAnchor: "middle" };
  } else {
    return { labelX: dotX + LABEL_OFFSET_PX, labelY: dotY, textAnchor: "start" };
  }
}

// src/ui/labelDragBinding.ts
function applyPlacement(textEl, placement) {
  textEl.setAttribute("x", `${placement.labelX}`);
  textEl.setAttribute("y", `${placement.labelY}`);
  textEl.setAttribute("text-anchor", placement.textAnchor);
  textEl.setAttribute("dominant-baseline", "middle");
}
var LabelDragBinding = class {
  constructor(labelEntry, textEl, labelLayout, ceilingPolicy) {
    this.labelEntry = labelEntry;
    this.textEl = textEl;
    this.labelLayout = labelLayout;
    this.ceilingPolicy = ceilingPolicy;
  }
  update(t, x, y) {
    const placement = computeLabelPlacement(t, x, y);
    if (this.textEl !== null) {
      applyPlacement(this.textEl, placement);
    }
    if (this.labelEntry !== null) {
      this.labelEntry.position = HillPosition.fromPercent(Math.round(t * 100));
      this.labelEntry.textAnchor = placement.textAnchor;
      this.labelEntry.baseY = placement.labelY;
    }
    const ceiling = this.ceilingPolicy.getCeiling();
    if (ceiling !== null) {
      this.labelLayout.finalize(ceiling, this.ceilingPolicy.getMaxFontSize());
    }
  }
};

// src/ui/opacityHelper.ts
function applyResolvedOpacity(circle, opacity) {
  if (opacity === void 0) {
    circle.removeAttribute("fill-opacity");
  } else {
    circle.setAttribute("fill-opacity", `${opacity}`);
  }
}

// src/ui/dragToken.ts
var DragToken = class _DragToken {
  constructor(seq) {
    this.seq = seq;
  }
  static initial() {
    return new _DragToken(0);
  }
  static fromSeq(seq) {
    return new _DragToken(seq);
  }
  /** Returns a new token with the next sequential value. */
  next() {
    return new _DragToken(this.seq + 1);
  }
  /** True when both tokens represent the same seq value (gesture not pre-empted). */
  equals(other) {
    return this.seq === other.seq;
  }
  /** The raw seq value — used internally when interfacing with numeric SharedDragState. */
  toSeq() {
    return this.seq;
  }
};

// src/ui/dragGestureRecognizer.ts
var DRAG_THRESHOLD_PX = 4;
var DragGestureRecognizer = class {
  constructor(dragState, specIndex, callbacks) {
    this.dragState = dragState;
    this.specIndex = specIndex;
    this.callbacks = callbacks;
  }
  active = false;
  armed = false;
  disposed = false;
  myToken = DragToken.initial();
  startClientX = 0;
  startClientY = 0;
  boundOnMouseMove = (ev) => this.onMouseMove(ev);
  boundOnMouseUp = () => this.onMouseUp();
  /** Arm immediately (circle grab). Callback onArm fires synchronously. */
  armImmediate(ev) {
    this.beginGesture(ev, true);
    this.callbacks.onArm();
  }
  /** Arm pending (label grab). onArm fires only when the move threshold is crossed. */
  armPending(ev) {
    this.beginGesture(ev, false);
  }
  /**
   * Idempotent teardown — remove window listeners and advance the shared token
   * so any in-flight gesture sees itself preempted on next tick.
   */
  dispose() {
    if (this.disposed)
      return;
    this.disposed = true;
    this.teardown();
    this.dragState.token = this.dragState.token.next();
  }
  // ── internals ─────────────────────────────────────────────────────────────
  beginGesture(ev, armedImmediately) {
    this.dragState.token = this.dragState.token.next();
    this.myToken = this.dragState.token;
    this.dragState.activeDotIndex = this.specIndex;
    this.active = true;
    this.armed = armedImmediately;
    this.startClientX = ev.clientX;
    this.startClientY = ev.clientY;
    activeWindow.addEventListener("mousemove", this.boundOnMouseMove);
    activeWindow.addEventListener("mouseup", this.boundOnMouseUp);
  }
  onMouseMove(ev) {
    if (!this.active)
      return;
    if (this.cancelIfPreempted())
      return;
    if (!this.armed && !this.tryArm(ev))
      return;
    this.callbacks.onMove(ev);
  }
  onMouseUp() {
    if (!this.active)
      return;
    if (this.cancelIfPreempted())
      return;
    this.finish();
  }
  tryArm(ev) {
    const displacement = Math.abs(ev.clientX - this.startClientX) + Math.abs(ev.clientY - this.startClientY);
    if (displacement < DRAG_THRESHOLD_PX)
      return false;
    this.armed = true;
    this.callbacks.onArm();
    return true;
  }
  cancelIfPreempted() {
    if (this.myToken.equals(this.dragState.token))
      return false;
    const wasArmed = this.armed;
    this.teardown();
    this.callbacks.onCancel(wasArmed);
    return true;
  }
  finish() {
    const wasArmed = this.armed;
    if (this.dragState.activeDotIndex === this.specIndex) {
      this.dragState.activeDotIndex = null;
    }
    this.teardown();
    this.callbacks.onCommit(wasArmed);
  }
  /** Single source of truth for listener removal + flag reset. */
  teardown() {
    this.active = false;
    this.armed = false;
    activeWindow.removeEventListener("mousemove", this.boundOnMouseMove);
    activeWindow.removeEventListener("mouseup", this.boundOnMouseUp);
  }
};

// src/ui/clickGuard.ts
var ClickGuard = class {
  armed = false;
  arm() {
    this.armed = true;
  }
  intercept(ev) {
    if (!this.armed)
      return false;
    this.armed = false;
    ev.stopImmediatePropagation();
    ev.preventDefault();
    return true;
  }
};

// src/ui/dotDragController.ts
function createSharedDragState() {
  return { activeDotIndex: null, token: DragToken.initial() };
}
var DotDragController = class {
  a;
  recognizer;
  labelBinding;
  clickGuard = new ClickGuard();
  // Per-attachment mutable state (one controller instance per dot).
  currentT = 0;
  originalPercent = 0;
  svgGrabOffsetX = 0;
  boundOnCircleMouseDown = (ev) => this.onCircleMouseDown(ev);
  boundOnLabelMouseDown = (ev) => this.onLabelMouseDown(ev);
  boundOnLabelClick = (ev) => this.onLabelClick(ev);
  constructor(a) {
    this.a = a;
    this.currentT = a.identity.initialPosition.toT();
    this.originalPercent = a.identity.initialPosition.toPercent();
    this.labelBinding = new LabelDragBinding(
      a.label.labelEntry,
      a.dom.textEl,
      a.label.labelLayout,
      a.label.labelCeilingPolicy
    );
    this.recognizer = new DragGestureRecognizer(a.shared.dragState, a.identity.specIndex, {
      onArm: () => this.handleArm(),
      onMove: (ev) => this.handleMove(ev),
      onCommit: (wasArmed) => this.handleCommit(wasArmed),
      onCancel: (wasArmed) => this.handleCancel(wasArmed)
    });
    a.dom.circle.addEventListener("mousedown", this.boundOnCircleMouseDown);
    if (a.dom.textEl) {
      a.dom.textEl.addEventListener("mousedown", this.boundOnLabelMouseDown);
      a.dom.textEl.addEventListener("click", this.boundOnLabelClick, { capture: true });
    }
  }
  dispose() {
    this.cleanup();
  }
  // ── mousedown handlers ────────────────────────────────────────────────────
  onCircleMouseDown(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this.svgGrabOffsetX = 0;
    this.a.shared.hoverState.isDragging = true;
    this.recognizer.armImmediate(ev);
  }
  onLabelMouseDown(ev) {
    ev.preventDefault();
    this.svgGrabOffsetX = this.computeSvgGrabOffset(ev.clientX);
    this.a.shared.hoverState.isDragging = true;
    this.recognizer.armPending(ev);
  }
  onLabelClick(ev) {
    if (this.clickGuard.intercept(ev))
      return;
    const noteLink = this.a.dom.textEl?.dataset.noteLink;
    if (noteLink && this.a.callbacks.onNoteClick) {
      this.a.callbacks.onNoteClick(noteLink, ev.metaKey || ev.ctrlKey);
    }
  }
  // ── recognizer callbacks ──────────────────────────────────────────────────
  handleArm() {
    this.a.dom.circle.classList.add("hill-chart-dot--grabbing");
    this.a.dom.circle.setAttribute("fill-opacity", `${HOVER_OPACITY}`);
  }
  handleMove(ev) {
    this.updatePosition(ev);
  }
  handleCommit(wasArmed) {
    this.a.shared.hoverState.isDragging = false;
    if (wasArmed)
      this.commitDrag();
  }
  handleCancel(wasArmed) {
    if (wasArmed)
      this.restoreOpacity();
    this.a.shared.hoverState.isDragging = false;
  }
  commitDrag() {
    this.clickGuard.arm();
    this.a.dom.circle.classList.remove("hill-chart-dot--grabbing");
    this.restoreOpacity();
    const newPercent = Math.round(this.currentT * 100);
    if (newPercent !== this.originalPercent) {
      this.a.callbacks.onPositionChange(this.a.identity.specIndex, HillPosition.fromPercent(newPercent));
    }
  }
  // ── position update ───────────────────────────────────────────────────────
  updatePosition(ev) {
    const { svg, circle, textEl } = this.a.dom;
    const { curve, size } = this.a.shared;
    const ctm = svg.getScreenCTM();
    if (!ctm)
      return;
    const pt = svg.createSVGPoint();
    if (!pt)
      return;
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    const svgPt = pt.matrixTransform(ctm.inverse());
    this.currentT = curve.tFromSvgX(svgPt.x - this.svgGrabOffsetX, size);
    const { x: newX, y: newY } = curve.toSvgPoint(this.currentT, size);
    circle.setAttribute("cx", `${newX}`);
    circle.setAttribute("cy", `${newY}`);
    if (textEl)
      this.labelBinding.update(this.currentT, newX, newY);
  }
  // ── helpers ───────────────────────────────────────────────────────────────
  computeSvgGrabOffset(clientX) {
    const { svg, circle } = this.a.dom;
    try {
      const ctm = svg.getScreenCTM();
      if (!ctm)
        return 0;
      const pt = svg.createSVGPoint();
      if (!pt)
        return 0;
      pt.x = clientX;
      pt.y = 0;
      const svgGrab = pt.matrixTransform(ctm.inverse());
      const dotSvgX = parseFloat(circle.getAttribute("cx") ?? "0");
      return svgGrab.x - dotSvgX;
    } catch {
      return 0;
    }
  }
  restoreOpacity() {
    applyResolvedOpacity(this.a.dom.circle, this.a.identity.resolvedOpacity);
  }
  cleanup() {
    this.recognizer.dispose();
    this.a.shared.hoverState.isDragging = false;
    this.a.dom.circle.removeEventListener("mousedown", this.boundOnCircleMouseDown);
    if (this.a.dom.textEl) {
      this.a.dom.textEl.removeEventListener("mousedown", this.boundOnLabelMouseDown);
      this.a.dom.textEl.removeEventListener("click", this.boundOnLabelClick, { capture: true });
    }
  }
};

// src/ui/dotStyle.ts
function resolveDotStyle(global, perDot) {
  return {
    color: perDot?.color ?? global?.color,
    opacity: perDot?.opacity ?? global?.opacity,
    radius: perDot?.radius ?? global?.radius,
    fontSize: perDot?.fontSize ?? global?.fontSize,
    fontColor: perDot?.fontColor ?? global?.fontColor
  };
}

// src/ui/dotRenderer.ts
var SVG_NS2 = "http://www.w3.org/2000/svg";
var DEFAULT_DOT_RADIUS = 6;
var DotRenderer = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  render(item, specIndex, options) {
    const { curve, size, globalDotStyle } = options;
    const effective = resolveDotStyle(globalDotStyle, item.style);
    const t = item.position.toT();
    const { x, y } = curve.toSvgPoint(t, size);
    const { circle, hoverState, hoverCtx } = this.createAndMountCircle(x, y, effective, options);
    const textEl = this.createAndMountLabel(item, { t, x, y }, effective, circle, hoverCtx, options);
    this.attachDragIfEditable({ svg: this.ctx.svg, circle, textEl, specIndex, item, effective, hoverState, options });
    return circle;
  }
  createAndMountCircle(x, y, effective, options) {
    const { svg } = this.ctx;
    const { registerCleanup } = options;
    const circle = this.createDotCircle(x, y, effective);
    svg.appendChild(circle);
    const hoverState = { isDragging: false };
    const restoreOpacity = () => {
      applyResolvedOpacity(circle, effective.opacity);
    };
    const hoverCtx = { hoverState, restoreOpacity, registerCleanup };
    this.attachHoverFeedback(circle, hoverCtx);
    return { circle, hoverState, hoverCtx };
  }
  createAndMountLabel(item, dotPos, effective, circle, hoverCtx, options) {
    const { onNoteClick, onPositionChange, labelLayout, registerCleanup } = options;
    const { svg } = this.ctx;
    if (!item.label)
      return null;
    const labelCtx = { effective, labelLayout };
    const textEl = this.createDotLabel(item, dotPos, labelCtx);
    this.attachLabelHoverFeedback(textEl, circle, hoverCtx);
    this.wireNoteLinkClick(textEl, item, { onNoteClick, onPositionChange, registerCleanup });
    svg.appendChild(textEl);
    return textEl;
  }
  attachDragIfEditable(ctx) {
    const { svg, circle, textEl, specIndex, item, effective, hoverState, options } = ctx;
    const { onPositionChange, onNoteClick, labelLayout, sharedDragState, curve, size, labelCeilingPolicy, registerCleanup } = options;
    if (!onPositionChange)
      return;
    const entries = labelLayout.getEntries();
    const labelEntry = textEl !== null ? entries[entries.length - 1] : null;
    const controller = new DotDragController({
      dom: { svg, circle, textEl },
      identity: { specIndex, initialPosition: item.position, resolvedOpacity: effective.opacity },
      label: { labelEntry, labelLayout, labelCeilingPolicy },
      shared: { hoverState, dragState: sharedDragState, curve, size },
      callbacks: { onPositionChange, onNoteClick }
    });
    registerCleanup(() => controller.dispose());
  }
  createDotCircle(x, y, effective) {
    const circle = activeDocument.createElementNS(SVG_NS2, "circle");
    circle.setAttribute("cx", `${x}`);
    circle.setAttribute("cy", `${y}`);
    circle.setAttribute("r", `${effective.radius ?? DEFAULT_DOT_RADIUS}`);
    circle.setAttribute("fill", effective.color ?? "currentColor");
    if (effective.opacity !== void 0) {
      circle.setAttribute("fill-opacity", `${effective.opacity}`);
    }
    circle.setAttribute("stroke", "var(--background-primary)");
    circle.setAttribute("stroke-width", "2");
    circle.classList.add("hill-chart-dot");
    return circle;
  }
  attachHoverTarget(target, circle, hoverCtx) {
    const { hoverState, restoreOpacity, registerCleanup } = hoverCtx;
    const onEnter = () => {
      circle.setAttribute("fill-opacity", `${HOVER_OPACITY}`);
    };
    const onLeave = () => {
      if (!hoverState.isDragging)
        restoreOpacity();
    };
    target.addEventListener("mouseenter", onEnter);
    target.addEventListener("mouseleave", onLeave);
    registerCleanup(() => {
      target.removeEventListener("mouseenter", onEnter);
      target.removeEventListener("mouseleave", onLeave);
    });
  }
  attachHoverFeedback(circle, hoverCtx) {
    this.attachHoverTarget(circle, circle, hoverCtx);
  }
  createDotLabel(item, dotPos, labelCtx) {
    const { effective, labelLayout } = labelCtx;
    const textEl = activeDocument.createElementNS(SVG_NS2, "text");
    textEl.setAttribute("dominant-baseline", "middle");
    textEl.setAttribute("font-size", `${effective.fontSize ?? DEFAULT_DOT_LABEL_FONT_SIZE}`);
    textEl.setAttribute("fill", effective.fontColor ?? "currentColor");
    textEl.textContent = item.label;
    const placement = computeLabelPlacement(dotPos.t, dotPos.x, dotPos.y);
    applyPlacement(textEl, placement);
    labelLayout.add({
      textEl,
      position: item.position,
      textAnchor: placement.textAnchor,
      baseY: placement.labelY
    });
    return textEl;
  }
  attachLabelHoverFeedback(textEl, circle, hoverCtx) {
    this.attachHoverTarget(textEl, circle, hoverCtx);
  }
  wireNoteLinkClick(textEl, item, callbacks) {
    if (!item.noteLink || !callbacks.onNoteClick)
      return;
    textEl.dataset.noteLink = item.noteLink;
    textEl.classList.add("hill-chart-note-link");
    if (!callbacks.onPositionChange) {
      const handler = (ev) => {
        callbacks.onNoteClick(item.noteLink, ev.metaKey || ev.ctrlKey);
      };
      textEl.addEventListener("click", handler);
      callbacks.registerCleanup(() => textEl.removeEventListener("click", handler));
    }
  }
};

// src/model/chartStyle.ts
function resolveGroupWith(descriptors, partial) {
  const result = {};
  for (const d of descriptors) {
    const value = partial?.[d.key];
    result[d.key] = value !== void 0 ? value : d.default;
  }
  return result;
}
function resolveSectionLabelWith(descriptors, partial) {
  const resolved = resolveGroupWith(descriptors, partial);
  if (partial?.label === void 0) {
    return { ...resolved, label: void 0 };
  }
  return resolved;
}
function resolveDividerWith(descriptors, partial) {
  const resolved = resolveGroupWith(descriptors, partial);
  if (partial?.visible === void 0) {
    return { ...resolved, visible: void 0 };
  }
  return resolved;
}
function resolveDotWith(descriptors, partial) {
  const resolved = resolveGroupWith(descriptors, partial);
  if (partial?.opacity === void 0) {
    return { ...resolved, opacity: void 0 };
  }
  return resolved;
}
function resolveChartStyleWith(schema, partial) {
  const p = partial ?? {};
  return {
    curve: resolveGroupWith(schema.curveDescriptors, p.curve),
    baseline: resolveGroupWith(schema.baselineDescriptors, p.baseline),
    divider: resolveDividerWith(schema.dividerDescriptors, p.divider),
    uphill: resolveSectionLabelWith(schema.uphillDescriptors, p.uphill),
    downhill: resolveSectionLabelWith(schema.downhillDescriptors, p.downhill),
    dot: resolveDotWith(schema.dotDescriptors, p.dot)
  };
}

// src/obsidian/validateStyleValue.ts
var CSS_NAMED_COLORS = /* @__PURE__ */ new Set([
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgrey",
  "darkgreen",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkslategrey",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dimgrey",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "grey",
  "green",
  "greenyellow",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgrey",
  "lightgreen",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightslategrey",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "slategrey",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen",
  // Special values
  "transparent",
  "currentcolor",
  "inherit",
  "none"
]);
function isValidCssColor(value) {
  if (typeof value !== "string" || value.trim() === "")
    return false;
  const trimmed = value.trim().toLowerCase();
  if (CSS_NAMED_COLORS.has(trimmed))
    return true;
  if (/^var\(--[\w-]+(\s*,\s*[^)]+)?\)$/.test(trimmed))
    return true;
  if (/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value))
    return true;
  if (/^rgba?\s*\(\s*/.test(trimmed)) {
    return isValidRgbColor(trimmed);
  }
  if (/^hsla?\s*\(\s*/.test(trimmed)) {
    return isValidHslColor(trimmed);
  }
  return false;
}
function isValidRgbColor(color) {
  const match = color.match(/^rgba?\s*\(\s*([^)]+)\s*\)$/);
  if (!match)
    return false;
  const args = match[1].split(",").map((s) => s.trim()).filter((s) => s !== "");
  if (args.length < 3 || args.length > 4)
    return false;
  for (let i = 0; i < 3; i++) {
    const val = Number(args[i]);
    if (!Number.isFinite(val) || val < 0 || val > 255)
      return false;
  }
  if (args.length === 4) {
    const alpha = Number(args[3]);
    if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1)
      return false;
  }
  return true;
}
function isValidHslColor(color) {
  const match = color.match(/^hsla?\s*\(\s*([^)]+)\s*\)$/);
  if (!match)
    return false;
  const args = match[1].split(",").map((s) => s.trim()).filter((s) => s !== "");
  if (args.length < 3 || args.length > 4)
    return false;
  const hue = Number(args[0]);
  if (!Number.isFinite(hue) || hue < 0 || hue > 360)
    return false;
  const satMatch = args[1].match(/^([0-9.]+)\s*%?$/);
  if (!satMatch)
    return false;
  const sat = Number(satMatch[1]);
  if (!Number.isFinite(sat) || sat < 0 || sat > 100)
    return false;
  const lightMatch = args[2].match(/^([0-9.]+)\s*%?$/);
  if (!lightMatch)
    return false;
  const light = Number(lightMatch[1]);
  if (!Number.isFinite(light) || light < 0 || light > 100)
    return false;
  if (args.length === 4) {
    const alpha = Number(args[3]);
    if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1)
      return false;
  }
  return true;
}
function isNonNegativeFinite(value) {
  return Number.isFinite(value) && value >= 0;
}
function isOpacity(value) {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

// src/obsidian/styleSchema.ts
var DIVIDER_STYLES = ["line", "dots", "dashed"];
function parseColor(raw) {
  return typeof raw === "string" && isValidCssColor(raw) ? raw : void 0;
}
function parseNonNegativeNumber(raw) {
  return typeof raw === "number" && isNonNegativeFinite(raw) ? raw : void 0;
}
function parseOpacityValue(raw) {
  return typeof raw === "number" && isOpacity(raw) ? raw : void 0;
}
function parseBool(raw) {
  return typeof raw === "boolean" ? raw : void 0;
}
function parseString(raw) {
  return typeof raw === "string" ? raw : void 0;
}
function parseDividerStyleEnum(raw) {
  if (typeof raw !== "string")
    return void 0;
  const match = DIVIDER_STYLES.find((s) => s === raw);
  return match;
}
function parseByKind(kind, raw) {
  switch (kind.kind) {
    case "color":
      return parseColor(raw);
    case "nonNegativeNumber":
      return parseNonNegativeNumber(raw);
    case "opacity":
      return parseOpacityValue(raw);
    case "boolean":
      return parseBool(raw);
    case "string":
      return parseString(raw);
    case "dividerStyle":
      return parseDividerStyleEnum(raw);
  }
}
var INVALID_COLOR = { kind: "color" };
var INVALID_NON_NEGATIVE = { kind: "hint", hint: "must be a non-negative number" };
var INVALID_OPACITY = { kind: "hint", hint: "must be a number in [0, 1]" };
var INVALID_BOOLEAN = { kind: "hint", hint: "must be boolean" };
var INVALID_DIVIDER_STYLE = {
  kind: "hint",
  hint: `must be one of: ${DIVIDER_STYLES.join(", ")}`
};
var styleSchema = [
  {
    group: "curve",
    key: "stroke",
    target: "stroke",
    kind: { kind: "color", default: "currentColor" },
    invalid: INVALID_COLOR
  },
  {
    group: "curve",
    key: "strokeWidth",
    target: "strokeWidth",
    kind: { kind: "nonNegativeNumber", default: 2 },
    invalid: INVALID_NON_NEGATIVE
  },
  {
    group: "curve",
    key: "fill",
    target: "fill",
    kind: { kind: "color", default: "none" },
    invalid: INVALID_COLOR
  },
  {
    group: "baseline",
    key: "visible",
    target: "visible",
    kind: { kind: "boolean", default: true },
    invalid: INVALID_BOOLEAN
  },
  {
    group: "baseline",
    key: "stroke",
    target: "stroke",
    kind: { kind: "color", default: "currentColor" },
    invalid: INVALID_COLOR
  },
  {
    group: "baseline",
    key: "opacity",
    target: "opacity",
    kind: { kind: "opacity", default: 0.3 },
    invalid: INVALID_OPACITY
  },
  {
    group: "baseline",
    key: "strokeWidth",
    target: "strokeWidth",
    kind: { kind: "nonNegativeNumber", default: 1 },
    invalid: INVALID_NON_NEGATIVE
  },
  {
    group: "divider",
    key: "visible",
    target: "visible",
    kind: { kind: "boolean", default: true },
    invalid: INVALID_BOOLEAN
  },
  {
    group: "divider",
    key: "stroke",
    target: "stroke",
    kind: { kind: "color", default: "currentColor" },
    invalid: INVALID_COLOR
  },
  {
    group: "divider",
    key: "strokeWidth",
    target: "strokeWidth",
    kind: { kind: "nonNegativeNumber", default: 1 },
    invalid: INVALID_NON_NEGATIVE
  },
  {
    group: "divider",
    key: "style",
    target: "style",
    kind: { kind: "dividerStyle", default: "line" },
    invalid: INVALID_DIVIDER_STYLE
  },
  // uphill — label silently ignores non-string (invalid undefined)
  {
    group: "uphill",
    key: "label",
    target: "label",
    kind: { kind: "string", default: "UPHILL" },
    invalid: void 0
  },
  {
    group: "uphill",
    key: "fontSize",
    target: "fontSize",
    kind: { kind: "nonNegativeNumber", default: 12 },
    invalid: INVALID_NON_NEGATIVE
  },
  {
    group: "uphill",
    key: "color",
    target: "color",
    kind: { kind: "color", default: "currentColor" },
    invalid: INVALID_COLOR
  },
  {
    group: "downhill",
    key: "label",
    target: "label",
    kind: { kind: "string", default: "DOWNHILL" },
    invalid: void 0
  },
  {
    group: "downhill",
    key: "fontSize",
    target: "fontSize",
    kind: { kind: "nonNegativeNumber", default: 12 },
    invalid: INVALID_NON_NEGATIVE
  },
  {
    group: "downhill",
    key: "color",
    target: "color",
    kind: { kind: "color", default: "currentColor" },
    invalid: INVALID_COLOR
  },
  {
    group: "dot",
    key: "color",
    target: "color",
    kind: { kind: "color", default: "currentColor" },
    invalid: INVALID_COLOR
  },
  {
    group: "dot",
    key: "opacity",
    target: "opacity",
    kind: { kind: "opacity" },
    invalid: INVALID_OPACITY
  },
  {
    group: "dot",
    key: "radius",
    target: "radius",
    kind: { kind: "nonNegativeNumber", default: 6 },
    invalid: INVALID_NON_NEGATIVE
  },
  {
    group: "dot",
    key: "fontSize",
    target: "fontSize",
    kind: { kind: "nonNegativeNumber", default: 12 },
    invalid: INVALID_NON_NEGATIVE
  },
  {
    group: "dot",
    key: "fontColor",
    target: "fontColor",
    kind: { kind: "color", default: "currentColor" },
    invalid: INVALID_COLOR
  }
];
function knownKeysFor(group) {
  return new Set(styleSchema.filter((d) => d.group === group).map((d) => d.key));
}

// src/obsidian/resolvedStylesApplier.ts
function reportInvalid(invalid, ctx, key, rawValue) {
  if (!invalid)
    return;
  if (invalid.kind === "color" && typeof rawValue !== "string")
    return;
  const message = invalid.kind === "color" ? `${ctx.path}.${key}: invalid CSS color "${String(rawValue)}". Field ignored.` : `${ctx.path}.${key}: invalid value (${invalid.hint}). Field ignored.`;
  ctx.push({ message, severity: "warning" });
}
function applySchemaGroup(raw, group, ctx) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    return void 0;
  const obj = raw;
  const style = {};
  const descriptors = styleSchema.filter((d) => d.group === group);
  for (const d of descriptors) {
    if (!(d.key in obj))
      continue;
    const rawValue = obj[d.key];
    const parsed = parseByKind(d.kind, rawValue);
    if (parsed !== void 0) {
      style[d.target] = parsed;
    } else {
      reportInvalid(d.invalid, ctx, d.key, rawValue);
    }
  }
  return Object.keys(style).length > 0 ? style : void 0;
}
function toResolvableDescriptors(descriptors) {
  return descriptors.map((d) => ({ key: d.key, default: d.kind.default }));
}
function buildChartStyleSchema() {
  const byGroup = (g) => toResolvableDescriptors(styleSchema.filter((d) => d.group === g));
  return {
    curveDescriptors: byGroup("curve"),
    baselineDescriptors: byGroup("baseline"),
    dividerDescriptors: byGroup("divider"),
    uphillDescriptors: byGroup("uphill"),
    downhillDescriptors: byGroup("downhill"),
    dotDescriptors: byGroup("dot")
  };
}
function resolveChartStyle(partial) {
  return resolveChartStyleWith(buildChartStyleSchema(), partial);
}

// src/ui/labelCeilingPolicy.ts
var LabelCeilingPolicy = class {
  ceiling = null;
  maxFontSize = DEFAULT_DOT_LABEL_FONT_SIZE;
  compute(baselineY, sectionFontSize, config, resolved) {
    this.maxFontSize = config.dots.reduce((max, dot) => {
      const effective = resolveDotStyle(resolved.dot, dot.style);
      return Math.max(max, effective.fontSize ?? DEFAULT_DOT_LABEL_FONT_SIZE);
    }, DEFAULT_DOT_LABEL_FONT_SIZE);
    const sectionY = baselineY + SECTION_LABEL_OFFSET;
    this.ceiling = sectionY - sectionFontSize / 2 - this.maxFontSize / 2;
  }
  getCeiling() {
    return this.ceiling;
  }
  getMaxFontSize() {
    return this.maxFontSize;
  }
  reset() {
    this.ceiling = null;
    this.maxFontSize = DEFAULT_DOT_LABEL_FONT_SIZE;
  }
};

// src/ui/hillChartRenderer.ts
var SVG_NS3 = "http://www.w3.org/2000/svg";
var BASELINE_Y_RATIO = 0.92;
var DEFAULT_WIDTH = 400;
var DEFAULT_HEIGHT = 150;
var HillChartRenderer = class {
  mountedSvg = null;
  dragCleanups = [];
  labelLayout = null;
  labelCeilingPolicy = new LabelCeilingPolicy();
  sharedDragState = createSharedDragState();
  render(container, curve, options = {}) {
    const { config = { dots: [], errors: [] }, onNoteClick, onPositionChange } = options;
    this.destroy();
    const layout = new LabelLayout();
    this.labelLayout = layout;
    const resolved = resolveChartStyle(config.chart);
    const size = { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
    if (config.errors.length > 0)
      this.renderErrorStrip(container, config.errors);
    const labelFontSize = this.computeSectionLabelFontSize(resolved);
    const svg = this.buildSvgRoot(size, labelFontSize);
    const baselineY = size.height * BASELINE_Y_RATIO;
    const ctx = { svg, size, baselineY };
    this.renderChrome(ctx, curve, resolved);
    const dotCtx = {
      curve,
      size,
      baselineY,
      onNoteClick,
      onPositionChange,
      globalDotStyle: resolved.dot,
      layout
    };
    this.renderAllDots(svg, config, dotCtx);
    this.finalizeLabelLayout(layout, config, resolved, baselineY);
    container.appendChild(svg);
    this.mountedSvg = svg;
  }
  renderChrome(ctx, curve, resolved) {
    const chrome = new ChartChromeRenderer(ctx);
    chrome.renderBaseline(resolved.baseline);
    chrome.renderDivider(curve, resolved.divider);
    chrome.renderCurvePath(curve, resolved.curve);
    chrome.renderSectionLabels(resolved);
  }
  finalizeLabelLayout(layout, config, resolved, baselineY) {
    const sectionFontSize = this.computeSectionLabelFontSize(resolved);
    this.labelCeilingPolicy.compute(baselineY, sectionFontSize, config, resolved);
    const ceiling = this.labelCeilingPolicy.getCeiling();
    if (ceiling !== null) {
      layout.finalize(ceiling, this.labelCeilingPolicy.getMaxFontSize());
    }
  }
  computeSectionLabelFontSize(resolved) {
    return Math.max(resolved.uphill.fontSize, resolved.downhill.fontSize);
  }
  buildSvgRoot(size, labelFontSize) {
    const viewBoxHeight = size.height + SECTION_LABEL_OFFSET + labelFontSize;
    const svg = activeDocument.createElementNS(SVG_NS3, "svg");
    svg.setAttribute("viewBox", `0 0 ${size.width} ${viewBoxHeight}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "auto");
    return svg;
  }
  renderAllDots(svg, config, dotCtx) {
    const ctx = { svg, size: dotCtx.size, baselineY: dotCtx.baselineY };
    const dotRenderer = new DotRenderer(ctx);
    config.dots.forEach((dot, dotIndex) => {
      dotRenderer.render(dot, dotIndex, {
        curve: dotCtx.curve,
        size: dotCtx.size,
        onNoteClick: dotCtx.onNoteClick,
        onPositionChange: dotCtx.onPositionChange,
        globalDotStyle: dotCtx.globalDotStyle,
        labelLayout: dotCtx.layout,
        sharedDragState: this.sharedDragState,
        labelCeilingPolicy: this.labelCeilingPolicy,
        registerCleanup: (fn) => this.dragCleanups.push(fn)
      });
    });
  }
  renderErrorStrip(container, errors) {
    const errorDiv = createDiv({ cls: "hill-chart-error" });
    for (const err of errors) {
      const p = createEl("p");
      p.textContent = `[${err.severity}] ${err.message}`;
      errorDiv.appendChild(p);
    }
    container.appendChild(errorDiv);
  }
  destroy() {
    this.sharedDragState.token = this.sharedDragState.token.next();
    this.sharedDragState.activeDotIndex = null;
    for (const cleanup of this.dragCleanups)
      cleanup();
    this.dragCleanups = [];
    this.labelLayout = null;
    this.labelCeilingPolicy.reset();
    if (this.mountedSvg && this.mountedSvg.parentElement) {
      this.mountedSvg.parentElement.removeChild(this.mountedSvg);
    }
    this.mountedSvg = null;
  }
};

// src/obsidian/parseYamlHillChart.ts
var import_obsidian = require("obsidian");

// src/obsidian/styleFieldHelpers.ts
function emitUnknownKeyWarnings(raw, ctx, knownKeys) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    return;
  for (const key of Object.keys(raw)) {
    if (!knownKeys.has(key)) {
      ctx.push({ message: `${ctx.path}: unknown key "${key}"`, severity: "warning" });
    }
  }
}

// src/obsidian/parseContext.ts
var ParsePath = class _ParsePath {
  constructor(value) {
    this.value = value;
  }
  static of(segment) {
    return new _ParsePath(segment);
  }
  child(segment) {
    return new _ParsePath(`${this.value}.${segment}`);
  }
  index(i) {
    return new _ParsePath(`${this.value}[${i}]`);
  }
  toString() {
    return this.value;
  }
};
var ParseContext = class _ParseContext {
  constructor(parsePath, errors) {
    this.parsePath = parsePath;
    this.errors = errors;
  }
  get path() {
    return this.parsePath.toString();
  }
  push(error) {
    this.errors.push(error);
  }
  childCtx(segment) {
    return new _ParseContext(this.parsePath.child(segment), this.errors);
  }
  indexCtx(i) {
    return new _ParseContext(this.parsePath.index(i), this.errors);
  }
};

// src/obsidian/parseDot.ts
var MIN_POSITION = 0;
var MAX_POSITION = 100;
var KNOWN_DOT_STYLE_KEYS = knownKeysFor("dot");
function parseDotStyle(raw, ctx, warnUnknownKeys = false) {
  if (warnUnknownKeys) {
    emitUnknownKeyWarnings(raw, ctx, KNOWN_DOT_STYLE_KEYS);
  }
  return applySchemaGroup(raw, "dot", ctx);
}
function parseWikiLink(raw) {
  const match = raw.match(/^\[\[(.+)\]\]$/);
  if (!match)
    return null;
  return { label: match[1], noteLink: match[1] };
}
function applyLabelAndLink(item, rawLabel) {
  const wikiLink = parseWikiLink(rawLabel);
  if (wikiLink) {
    item.label = wikiLink.label;
    item.noteLink = wikiLink.noteLink;
  } else {
    item.label = rawLabel;
  }
}
function reportUnquotedWikiLink(errors, index) {
  errors.push({
    message: `Unquoted wiki-link detected at dots[${index}] (e.g. [[Note]]). Quote it in YAML: "[[Note]]". Item dropped.`,
    severity: "warning"
  });
}
function parseDotLabel(item, obj) {
  if ("label" in obj && typeof obj["label"] === "string" && obj["label"] !== "") {
    applyLabelAndLink(item, obj["label"]);
  }
}
function parseDotStyleField(item, obj, dotCtx) {
  if (!("style" in obj))
    return;
  const styleCtx = dotCtx.childCtx("style");
  const rawStyle = obj["style"];
  const isInvalidMapping = rawStyle !== null && rawStyle !== void 0 && (typeof rawStyle !== "object" || Array.isArray(rawStyle));
  if (isInvalidMapping) {
    styleCtx.push({ message: `${styleCtx.path}: must be a mapping`, severity: "warning" });
    return;
  }
  const style = parseDotStyle(rawStyle, styleCtx, true);
  if (style !== void 0)
    item.style = style;
}
function parseMappingFormDot(obj, dotCtx) {
  const raw = obj["position"];
  if (!Number.isFinite(raw)) {
    dotCtx.push({
      message: `${dotCtx.path}.position: must be a finite number (got ${raw}). Item dropped.`,
      severity: "warning"
    });
    return null;
  }
  if (raw < MIN_POSITION || raw > MAX_POSITION) {
    dotCtx.push({
      message: `${dotCtx.path}.position: must be between ${MIN_POSITION} and ${MAX_POSITION} (got ${raw}). Clamped to ${Math.min(MAX_POSITION, Math.max(MIN_POSITION, raw))}.`,
      severity: "warning"
    });
  }
  const item = { position: HillPosition.fromPercent(raw) };
  parseDotLabel(item, obj);
  parseDotStyleField(item, obj, dotCtx);
  return item;
}
function isValidShorthandPosition(raw) {
  return Number.isFinite(raw) && raw >= MIN_POSITION && raw <= MAX_POSITION;
}
function buildShorthandItem(raw, val) {
  const item = { position: HillPosition.fromPercent(raw) };
  if (typeof val === "string" && val !== "")
    applyLabelAndLink(item, val);
  return item;
}
function parseShorthandFormDot(obj) {
  for (const [key, val] of Object.entries(obj)) {
    const raw = Number(key);
    if (!isValidShorthandPosition(raw))
      continue;
    return buildShorthandItem(raw, val);
  }
  return null;
}
function detectUnquotedWikiLinkInEntry(entry, errors, index) {
  if (Array.isArray(entry)) {
    reportUnquotedWikiLink(errors, index);
    return true;
  }
  if (!entry || typeof entry !== "object")
    return false;
  const obj = entry;
  for (const [key, val] of Object.entries(obj)) {
    if (key !== "style" && Array.isArray(val)) {
      reportUnquotedWikiLink(errors, index);
      return true;
    }
  }
  return false;
}
function dispatchByEntryShape(obj, dotCtx) {
  if ("position" in obj && typeof obj["position"] === "number") {
    return parseMappingFormDot(obj, dotCtx);
  }
  if ("position" in obj) {
    dotCtx.push({
      message: `${dotCtx.path}.position: must be a number (0\u2013100). Item dropped.`,
      severity: "warning"
    });
    return null;
  }
  const shorthand = parseShorthandFormDot(obj);
  if (shorthand === null) {
    dotCtx.push({
      message: `${dotCtx.path}: no valid position found. Use "- 50: Label" or "position: 50". Item dropped.`,
      severity: "warning"
    });
  }
  return shorthand;
}
function parseDotEntry(entry, index, errors) {
  if (entry === null || entry === void 0)
    return null;
  if (detectUnquotedWikiLinkInEntry(entry, errors, index))
    return null;
  if (typeof entry !== "object")
    return null;
  const dotCtx = new ParseContext(ParsePath.of("dots").index(index), errors);
  return dispatchByEntryShape(entry, dotCtx);
}
function parseDots(parsed, errors) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    return [];
  const rawDots = parsed["dots"];
  if (!Array.isArray(rawDots))
    return [];
  const dots = [];
  for (let i = 0; i < rawDots.length; i++) {
    const item = parseDotEntry(rawDots[i], i, errors);
    if (item !== null)
      dots.push(item);
  }
  return dots;
}

// src/obsidian/parseYamlHillChart.ts
var TAB_WIDTH = 4;
var KNOWN_TOP_LEVEL_KEYS = /* @__PURE__ */ new Set(["chart", "dots"]);
var CHART_STYLE_GROUPS = ["curve", "baseline", "divider", "uphill", "downhill", "dot"];
function parseChartStyle(raw, errors) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    return void 0;
  const obj = raw;
  const style = {};
  for (const group of CHART_STYLE_GROUPS) {
    const groupCtx = new ParseContext(ParsePath.of(group), errors);
    emitUnknownKeyWarnings(obj[group], groupCtx, knownKeysFor(group));
    const parsed = applySchemaGroup(obj[group], group, groupCtx);
    if (parsed !== void 0)
      style[group] = parsed;
  }
  return Object.keys(style).length > 0 ? style : void 0;
}
function normalizeIndentation(source) {
  return source.replace(/^[ \t]+/gm, (leading) => {
    let col = 0;
    for (const ch of leading) {
      if (ch === "	") {
        col = Math.ceil((col + 1) / TAB_WIDTH) * TAB_WIDTH;
      } else {
        col += 1;
      }
    }
    return " ".repeat(col);
  });
}
function loadYaml(source, errors) {
  try {
    return (0, import_obsidian.parseYaml)(normalizeIndentation(source));
  } catch (err) {
    errors.push({
      message: err instanceof Error ? err.message : String(err),
      severity: "error"
    });
    return void 0;
  }
}
function warnUnknownTopLevel(parsed, errors) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    return;
  for (const key of Object.keys(parsed)) {
    if (!KNOWN_TOP_LEVEL_KEYS.has(key)) {
      errors.push({
        message: `Unknown top-level key: "${key}". Known keys are: chart, dots.`,
        severity: "warning"
      });
    }
  }
}
function parseYamlHillChart(source) {
  if (source.trim() === "")
    return { dots: [], errors: [] };
  const errors = [];
  const parsed = loadYaml(source, errors);
  if (errors.length > 0)
    return { dots: [], errors };
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    return { dots: [], errors: [] };
  warnUnknownTopLevel(parsed, errors);
  const chart = parseChartStyle(parsed["chart"], errors);
  const dots = parseDots(parsed, errors);
  const config = { dots, errors };
  if (chart)
    config.chart = chart;
  return config;
}

// src/app/logger.ts
var consoleLogger = {
  warn(msg, ctx) {
    console.warn(msg, ctx);
  }
};

// src/obsidian/hillChartBlockProcessor.ts
var HillChartChild = class extends import_obsidian2.MarkdownRenderChild {
  constructor(el, renderer) {
    super(el);
    this.renderer = renderer;
  }
  onunload() {
    this.renderer.destroy();
  }
};
function createHillChartBlockProcessor(app, positionWriter, logger = consoleLogger) {
  return (source, el, ctx) => {
    const config = parseYamlHillChart(source);
    const curve = new HillCurve();
    const renderer = new HillChartRenderer();
    renderer.render(el, curve, {
      config,
      onNoteClick: (noteName, newLeaf) => {
        void app.workspace.openLinkText(noteName, "", newLeaf);
      },
      onPositionChange: (specIndex, newPosition) => {
        const sectionInfo = ctx.getSectionInfo(el);
        const convertedSectionInfo = sectionInfo ? { lineStart: sectionInfo.lineStart, lineEnd: sectionInfo.lineEnd } : null;
        void positionWriter.write({
          sourcePath: ctx.sourcePath,
          sectionInfo: convertedSectionInfo,
          oldContent: source,
          specIndex,
          newPosition
        }).then((result) => {
          if (!result.ok) {
            logger.warn("[hill-chart] writeHillChartPosition failed", { error: result.error });
          }
        });
      }
    });
    ctx.addChild(new HillChartChild(el, renderer));
  };
}

// src/obsidian/writeHillChartPosition.ts
var import_obsidian3 = require("obsidian");

// src/obsidian/updateHillChartSource.ts
var matchShorthandDash = /^(?<prefix>\s*-\s*)(?<pos>\d+(?:\.\d+)?)(?<suffix>(\s*:.*)?)$/;
var matchDashPositionKey = /^(?<prefix>\s*-\s*position:\s*)(?<pos>\d+(?:\.\d+)?)(?<suffix>\s*)$/;
var matchQuotedString = /^(?<prefix>\s*position:\s*)(?<pos>\d+(?:\.\d+)?)(?<suffix>\s*)$/;
function updateHillChartSource(source, specIndex, newPosition) {
  const newPositionNumber = newPosition.toPercent();
  const rawLines = source.split("\n");
  const lines = rawLines.map((l) => l.endsWith("\r") ? l.slice(0, -1) : l);
  const dotsLineIndex = findDotsKeyLine(lines);
  if (dotsLineIndex === -1)
    return source;
  const dotsIndent = indentOf(lines[dotsLineIndex]);
  const itemStarts = findItemStartLines(lines, dotsLineIndex, dotsIndent);
  if (specIndex >= itemStarts.length)
    return source;
  const boundary = {
    startLine: itemStarts[specIndex],
    endLine: specIndex + 1 < itemStarts.length ? itemStarts[specIndex + 1] : findDotsBlockEnd(lines, dotsLineIndex, dotsIndent)
  };
  const rewritten = rewritePositionInItem(lines, boundary, newPositionNumber);
  if (rewritten === null)
    return source;
  const { lineIndex, newLine } = rewritten;
  const hasCR = rawLines[lineIndex].endsWith("\r");
  const updatedRawLines = rawLines.map((rawLine, i) => {
    if (i !== lineIndex)
      return rawLine;
    return hasCR ? newLine + "\r" : newLine;
  });
  return updatedRawLines.join("\n");
}
function findDotsKeyLine(lines) {
  for (let i = 0; i < lines.length; i++) {
    if (/^dots:\s*$/.test(lines[i]))
      return i;
  }
  return -1;
}
function isBlankOrComment(line) {
  return line.trim() === "" || line.trimStart().startsWith("#");
}
function findItemStartLines(lines, dotsLineIndex, dotsIndent) {
  const starts = [];
  for (let i = dotsLineIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (isBlankOrComment(line))
      continue;
    const indent = indentOf(line);
    if (indent <= dotsIndent)
      break;
    if (line.trimStart().startsWith("-")) {
      starts.push(i);
    }
  }
  return starts;
}
function findDotsBlockEnd(lines, dotsLineIndex, dotsIndent) {
  for (let i = dotsLineIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (isBlankOrComment(line))
      continue;
    if (indentOf(line) <= dotsIndent)
      return i;
  }
  return lines.length;
}
function rewritePositionInItem(lines, boundary, newPosition) {
  const { startLine, endLine } = boundary;
  const dashLine = lines[startLine];
  const shorthandMatch = dashLine.match(matchShorthandDash);
  if (shorthandMatch?.groups) {
    const { prefix, suffix } = shorthandMatch.groups;
    return { lineIndex: startLine, newLine: `${prefix}${newPosition}${suffix}` };
  }
  const dashMappingMatch = dashLine.match(matchDashPositionKey);
  if (dashMappingMatch?.groups) {
    const { prefix, suffix } = dashMappingMatch.groups;
    return { lineIndex: startLine, newLine: `${prefix}${newPosition}${suffix}` };
  }
  for (let i = startLine + 1; i < endLine; i++) {
    const posMatch = lines[i].match(matchQuotedString);
    if (posMatch?.groups) {
      const { prefix, suffix } = posMatch.groups;
      return { lineIndex: i, newLine: `${prefix}${newPosition}${suffix}` };
    }
  }
  return null;
}
function indentOf(line) {
  return line.length - line.trimStart().length;
}

// src/obsidian/fencedBlockRegion.ts
var FencedBlockRegion = class {
  constructor(fullContent, startLine, endLine) {
    this.fullContent = fullContent;
    this.startLine = startLine;
    this.endLine = endLine;
    this.trailingNewline = fullContent.endsWith("\n");
    const raw = this.trailingNewline ? fullContent.slice(0, -1) : fullContent;
    this.lines = raw.split("\n");
  }
  lines;
  trailingNewline;
  readInner() {
    return this.lines.slice(this.startLine + 1, this.endLine).join("\n");
  }
  replaceInner(newInner) {
    const before = this.lines.slice(0, this.startLine + 1);
    const after = this.lines.slice(this.endLine);
    const parts = [...before, ...newInner.split("\n"), ...after];
    const joined = parts.join("\n");
    return this.trailingNewline ? joined + "\n" : joined;
  }
};

// src/obsidian/writeHillChartPosition.ts
async function writeHillChartPosition(app, req) {
  const { sourcePath, sectionInfo, newPosition, specIndex, oldContent } = req;
  if (!sectionInfo) {
    return { ok: false, error: { kind: "SectionInfoMissing" } };
  }
  const fileOrError = resolveFile(app, sourcePath);
  if (!(fileOrError instanceof import_obsidian3.TFile)) {
    return { ok: false, error: fileOrError };
  }
  const file = fileOrError;
  const readResult = await readFileContent(app, file);
  if (typeof readResult !== "string") {
    return { ok: false, error: readResult };
  }
  const content = readResult;
  const region = new FencedBlockRegion(content, sectionInfo.lineStart, sectionInfo.lineEnd);
  const currentInner = region.readInner();
  if (isStale(currentInner, oldContent)) {
    return { ok: false, error: { kind: "StaleContent" } };
  }
  const updatedInner = updateHillChartSource(oldContent, specIndex, newPosition);
  if (updatedInner === oldContent)
    return { ok: true, value: void 0 };
  const newContent = region.replaceInner(updatedInner);
  const writeError = await writeFile(app, file, newContent);
  if (writeError) {
    return { ok: false, error: writeError };
  }
  return { ok: true, value: void 0 };
}
function resolveFile(app, path) {
  const abstractFile = app.vault.getAbstractFileByPath(path);
  if (!abstractFile) {
    return { kind: "FileNotFound", path };
  }
  if (!(abstractFile instanceof import_obsidian3.TFile)) {
    return { kind: "NotATFile", path };
  }
  return abstractFile;
}
async function readFileContent(app, file) {
  try {
    return await app.vault.read(file);
  } catch (cause) {
    return { kind: "ReadFailed", cause };
  }
}
function isStale(current, expected) {
  return current !== expected;
}
async function writeFile(app, file, content) {
  try {
    await app.vault.modify(file, content);
    return null;
  } catch (cause) {
    return { kind: "WriteFailed", cause };
  }
}

// src/obsidian/obsidianPositionWriter.ts
var ObsidianPositionWriter = class {
  constructor(app) {
    this.app = app;
  }
  write(req) {
    return writeHillChartPosition(this.app, req);
  }
};

// src/main.ts
var HillChartPlugin = class extends import_obsidian4.Plugin {
  onload() {
    const positionWriter = new ObsidianPositionWriter(this.app);
    this.registerMarkdownCodeBlockProcessor(
      "hill-chart",
      createHillChartBlockProcessor(this.app, positionWriter)
    );
  }
  onunload() {
  }
};

/* nosourcemap */