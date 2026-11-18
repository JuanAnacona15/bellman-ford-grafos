/**
 * GraphRenderer3D.js — 3D graph renderer using 3d-force-graph (Three.js)
 * Exposes the same public interface as GraphRenderer (Cytoscape) for interchangeability.
 */
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';

// ══════════════════════════════════════════
// PALETA DE COLORES (coincide con GraphStyles.js)
// ══════════════════════════════════════════
const NODE_COLOR = {
  default:    0x3d5a80,
  source:     0xff6b6b,
  visited:    0x00ff88,
  'neg-cycle': 0xff3333,
  affected:   0xffcc00,
  unreachable:0x4a5568,
  'path-node':0x00cfff,
};

const EDGE_CSS = {
  default:        '#3d5a80',
  'active-edge':  '#ff9500',
  'relaxed-edge': '#00ff88',
  'no-change-edge':'#2d333b',
  'path-edge':    '#00cfff',
  'neg-cycle-edge':'#ff3333',
};

const EDGE_WIDTH = {
  default:        1,
  'active-edge':  3.5,
  'relaxed-edge': 3,
  'no-change-edge':0.5,
  'path-edge':    3,
  'neg-cycle-edge':3.5,
};

export class GraphRenderer3D {
  /**
   * @param {string} containerId
   * @param {object} eventHandlers — { onNodeTap, onEdgeTap, onBgTap }
   */
  constructor(containerId, eventHandlers = {}) {
    this.container = document.getElementById(containerId);
    this.eventHandlers = eventHandlers;
    this.fg = null;

    // Internal node/link lists (plain objects, NOT Three.js objects)
    this._nodes = [];   // { id, label, _cls: Set<string>, _distLabel: string }
    this._links = [];   // { id, source, target, weight, label, _cls: Set<string> }

    this._init();
  }

  // ─────────────────────────────────────────
  _init() {
    this.fg = ForceGraph3D()(this.container)
      .backgroundColor('#0d1117')
      .showNavInfo(false)
      // ── Nodes ──
      .nodeId('id')
      .nodeLabel(() => '')          // we render labels inside the Three.js object
      .nodeVal(1)
      .nodeResolution(24)
      .nodeOpacity(1)
      .nodeThreeObject((n) => this._buildNodeMesh(n))
      .nodeThreeObjectExtend(false)
      // ── Links ──
      .linkSource('source')
      .linkTarget('target')
      .linkLabel((l) => `${l.label}`)
      .linkWidth((l) => this._edgeWidth(l))
      .linkColor((l) => this._edgeColor(l))
      .linkOpacity(0.9)
      .linkDirectionalArrowLength(5)
      .linkDirectionalArrowRelPos(0.9)
      .linkDirectionalArrowColor((l) => this._edgeColor(l))
      // Flowing particles on active / relaxed edges
      .linkDirectionalParticles((l) => {
        if (l._cls?.has('active-edge'))  return 4;
        if (l._cls?.has('relaxed-edge')) return 3;
        return 0;
      })
      .linkDirectionalParticleWidth(2.5)
      .linkDirectionalParticleSpeed(0.015)
      .linkDirectionalParticleColor((l) => this._edgeColor(l))
      // Curve parallel edges
      .linkCurvature((l) => {
        const src = this._linkId(l.source);
        const tgt = this._linkId(l.target);
        const parallels = this._links.filter(
          ll => this._linkId(ll.source) === src && this._linkId(ll.target) === tgt
        );
        return parallels.length > 1 ? 0.25 : 0;
      })
      // ── Events ──
      .onNodeClick((node) => this.eventHandlers.onNodeTap?.(node.id, {}))
      .onBackgroundClick(() => this.eventHandlers.onBgTap?.({}, {}))
      // Physics
      .warmupTicks(80)
      .cooldownTime(2500);

    // Tune force simulation
    this.fg.d3Force('charge')?.strength(-140);
    this.fg.d3Force('link')?.distance(90);

    // Auto-resize
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(this.container);
  }

  // ─────────────────────────────────────────
  // NODE THREE.JS MESH
  // ─────────────────────────────────────────
  _buildNodeMesh(node) {
    const cls    = node._cls || new Set();
    const color  = this._nodeColor(node);
    const isSource   = cls.has('source');
    const isNeg      = cls.has('neg-cycle');
    const isPath     = cls.has('path-node');
    const isUnreach  = cls.has('unreachable');
    const radius = (isSource || isNeg) ? 7 : isPath ? 6.5 : 5;

    const group = new THREE.Group();

    // ── Sphere body ──
    const geo = new THREE.SphereGeometry(radius, 24, 24);
    const mat = new THREE.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: isNeg ? 0.6 : isSource ? 0.5 : 0.3,
      shininess: 90,
      transparent: true,
      opacity: isUnreach ? 0.3 : 0.92,
    });
    group.add(new THREE.Mesh(geo, mat));

    // ── Glow ring for special states ──
    if (isSource || isNeg || isPath) {
      const ringGeo = new THREE.TorusGeometry(radius + 2.5, 0.8, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.45,
      });
      group.add(new THREE.Mesh(ringGeo, ringMat));
    }

    // ── Text label sprite ──
    const labelText = node._distLabel
      ? `${node.label}\n${node._distLabel}`
      : node.label;
    group.add(this._textSprite(labelText, radius));

    return group;
  }

  _textSprite(text, radius) {
    const W = 128, H = 64;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const lines = text.split('\n');
    if (lines.length === 1) {
      ctx.font = 'bold 30px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lines[0], W / 2, H / 2);
    } else {
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lines[0], W / 2, 20);
      ctx.font = '17px Inter, sans-serif';
      ctx.fillStyle = '#8b949e';
      ctx.fillText(lines[1], W / 2, 46);
    }

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    sprite.scale.set(16, 8, 1);
    return sprite;
  }

  // ─────────────────────────────────────────
  // COLOR HELPERS
  // ─────────────────────────────────────────
  _nodeColor(node) {
    const cls = node._cls;
    if (!cls || cls.size === 0) return NODE_COLOR.default;
    for (const key of ['neg-cycle','source','path-node','affected','visited','unreachable']) {
      if (cls.has(key)) return NODE_COLOR[key] ?? NODE_COLOR.default;
    }
    return NODE_COLOR.default;
  }

  _edgeColor(link) {
    const cls = link._cls;
    if (!cls || cls.size === 0) return EDGE_CSS.default;
    for (const key of ['neg-cycle-edge','active-edge','relaxed-edge','path-edge','no-change-edge']) {
      if (cls.has(key)) return EDGE_CSS[key];
    }
    return EDGE_CSS.default;
  }

  _edgeWidth(link) {
    const cls = link._cls;
    if (!cls || cls.size === 0) return EDGE_WIDTH.default;
    for (const key of ['neg-cycle-edge','active-edge','relaxed-edge','path-edge','no-change-edge']) {
      if (cls.has(key)) return EDGE_WIDTH[key];
    }
    return EDGE_WIDTH.default;
  }

  _linkId(x) { return typeof x === 'object' ? x?.id : x; }

  // ─────────────────────────────────────────
  // PUBLIC API — matches GraphRenderer
  // ─────────────────────────────────────────

  syncGraph(graph) {
    // Preserve existing node classes/positions
    const prevNodes = new Map(this._nodes.map(n => [n.id, n]));
    const prevLinks = new Map(this._links.map(l => [l.id, l]));

    this._nodes = graph.getVertices().map(v =>
      prevNodes.get(v) ?? { id: v, label: v, _cls: new Set(), _distLabel: '' }
    );
    this._links = graph.getEdges().map(e => {
      const prev = prevLinks.get(e.id);
      return {
        id: e.id,
        source: e.from,
        target: e.to,
        weight: e.weight,
        label: String(e.weight),
        _cls: prev?._cls ?? new Set(),
      };
    });
    this._push();
  }

  addNode(id) {
    if (this._nodes.find(n => n.id === id)) return;
    this._nodes.push({ id, label: id, _cls: new Set(), _distLabel: '' });
    this._push();
  }

  removeNode(id) {
    this._nodes = this._nodes.filter(n => n.id !== id);
    this._links = this._links.filter(l =>
      this._linkId(l.source) !== id && this._linkId(l.target) !== id
    );
    this._push();
  }

  addEdge(edgeId, from, to, weight) {
    this._links.push({ id: edgeId, source: from, target: to, weight, label: String(weight), _cls: new Set() });
    this._push();
  }

  removeEdge(edgeId) {
    this._links = this._links.filter(l => l.id !== edgeId);
    this._push();
  }

  updateEdgeLabel(edgeId, weight) {
    const l = this._links.find(l => l.id === edgeId);
    if (l) { l.weight = weight; l.label = String(weight); this._soft(); }
  }

  setSource(nodeId, previousId) {
    if (previousId) this._nodeCls(previousId, 'delete', 'source');
    if (nodeId)     this._nodeCls(nodeId,     'add',    'source');
    this._soft();
  }

  setNodeDistLabel(nodeId, dist) {
    const n = this._nodes.find(n => n.id === nodeId);
    if (!n) return;
    n._distLabel = dist === Infinity ? '∞' : dist === -Infinity ? '-∞' : String(dist);
    this._soft();
  }

  clearDistLabels() {
    this._nodes.forEach(n => n._distLabel = '');
    this._soft();
  }

  classifyNode(nodeId, ...classes) {
    classes.forEach(c => this._nodeCls(nodeId, 'add', c));
    this._soft();
  }

  declassifyNode(nodeId, ...classes) {
    classes.forEach(c => this._nodeCls(nodeId, 'delete', c));
    this._soft();
  }

  classifyEdge(edgeId, ...classes) {
    classes.forEach(c => this._edgeCls(edgeId, 'add', c));
    this._soft();
  }

  resetAllClasses() {
    this._nodes.forEach(n => n._cls.clear());
    this._links.forEach(l => l._cls.clear());
    this._soft();
  }

  highlightPath(path, edgeList) {
    this.resetPathClasses();
    path.forEach(id => this._nodeCls(id, 'add', 'path-node'));
    edgeList.forEach(id => this._edgeCls(id, 'add', 'path-edge'));
    this._soft();
  }

  resetPathClasses() {
    this._nodes.forEach(n => n._cls.delete('path-node'));
    this._links.forEach(l => l._cls.delete('path-edge'));
    this._soft();
  }

  fit() { this.fg?.zoomToFit(500, 60); }

  layout(name = 'force') {
    const nodes = this._nodes;
    const n = nodes.length;
    if (n === 0) return;

    if (name === 'cose' || name === 'force') {
      nodes.forEach(v => { delete v.fx; delete v.fy; delete v.fz; });
      this._push();
      this.fg?.d3ReheatSimulation();
      return;
    }

    if (name === 'circle') {
      const r = 60 + n * 7;
      nodes.forEach((v, i) => {
        const a = (2 * Math.PI * i) / n;
        v.fx = r * Math.cos(a); v.fy = r * Math.sin(a); v.fz = 0;
      });
    } else if (name === 'grid') {
      const cols = Math.ceil(Math.sqrt(n));
      const sp = 55;
      nodes.forEach((v, i) => {
        v.fx = (i % cols) * sp - cols * sp / 2;
        v.fy = Math.floor(i / cols) * sp - Math.ceil(n / cols) * sp / 2;
        v.fz = 0;
      });
    } else if (name === 'breadthfirst') {
      // Golden-ratio sphere packing
      const r = 55 + n * 5;
      const phi = Math.PI * (3 - Math.sqrt(5));
      nodes.forEach((v, i) => {
        const y2 = 1 - (i / (n - 1 || 1)) * 2;
        const rr = Math.sqrt(1 - y2 * y2);
        const theta = phi * i;
        v.fx = r * rr * Math.cos(theta);
        v.fy = r * y2;
        v.fz = r * rr * Math.sin(theta);
      });
    } else if (name === 'concentric') {
      // Helix
      const h = n * 10;
      const r = 40 + n * 5;
      nodes.forEach((v, i) => {
        const t = i / Math.max(n - 1, 1);
        const a = t * Math.PI * 6;
        v.fx = r * Math.cos(a); v.fy = -h / 2 + t * h; v.fz = r * Math.sin(a);
      });
    } else if (name === 'random') {
      const sp = 60 + n * 7;
      nodes.forEach(v => {
        v.fx = (Math.random() - 0.5) * sp;
        v.fy = (Math.random() - 0.5) * sp;
        v.fz = (Math.random() - 0.5) * sp;
      });
    }

    this._push();
    setTimeout(() => this.fit(), 300);
  }

  centerOn(nodeId) {
    const node = this._nodes.find(n => n.id === nodeId);
    if (!node || node.x == null) return;
    const d = 150;
    const len = Math.hypot(node.x, node.y, node.z) || 1;
    const ratio = 1 + d / len;
    this.fg?.cameraPosition(
      { x: node.x * ratio, y: node.y * ratio, z: node.z * ratio },
      { x: node.x, y: node.y, z: node.z },
      1000
    );
  }

  resize() {
    if (!this.container || !this.fg) return;
    this.fg.width(this.container.clientWidth);
    this.fg.height(this.container.clientHeight);
  }

  destroy() {
    this._ro?.disconnect();
    if (this.fg) { this.fg._destructor?.(); this.fg = null; }
    if (this.container) this.container.innerHTML = '';
  }

  // ── cy stub so GraphInteractions.getMode() doesn't crash ──
  get cy() { return null; }

  // ─────────────────────────────────────────
  // INTERNAL
  // ─────────────────────────────────────────
  _nodeCls(id, op, cls) {
    const n = this._nodes.find(n => n.id === id);
    if (n) n._cls[op](cls);
  }
  _edgeCls(id, op, cls) {
    const l = this._links.find(l => l.id === id);
    if (l) l._cls[op](cls);
  }

  /** Full push — rebuilds graphData (triggers force restart) */
  _push() {
    const nodes = this._nodes.map(n => ({ ...n }));
    const links = this._links.map(l => ({
      ...l,
      source: this._linkId(l.source),
      target: this._linkId(l.target),
    }));
    // Re-attach _cls / _distLabel from originals after 3d-force-graph mutates nodes
    this.fg?.graphData({ nodes, links });
    // After graphData merges, patch _cls back (3d-force-graph copies the objects)
    requestAnimationFrame(() => {
      const data = this.fg?.graphData();
      if (!data) return;
      data.nodes.forEach(gn => {
        const src = this._nodes.find(n => n.id === gn.id);
        if (src) { gn._cls = src._cls; gn._distLabel = src._distLabel; gn.label = src.label; }
      });
      data.links.forEach(gl => {
        const src = this._links.find(l => l.id === gl.id);
        if (src) { gl._cls = src._cls; gl.label = src.label; }
      });
    });
  }

  /** Soft update — only refreshes visuals without restarting physics */
  _soft() {
    const data = this.fg?.graphData();
    if (!data) return;
    // Sync _cls / _distLabel from our source of truth into live graph objects
    data.nodes.forEach(gn => {
      const src = this._nodes.find(n => n.id === gn.id);
      if (src) { gn._cls = src._cls; gn._distLabel = src._distLabel; }
    });
    data.links.forEach(gl => {
      const src = this._links.find(l => l.id === gl.id);
      if (src) { gl._cls = src._cls; }
    });
    this.fg?.refresh();
  }
}
