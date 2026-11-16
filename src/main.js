/**
 * main.js — Application entry point
 * Wires together all modules: Graph, Renderer, Interactions, Simulation, UI
 */

import { Graph } from './core/Graph.js';
import { GraphRenderer } from './visualization/GraphRenderer.js';
import { GraphInteractions, TOOL_MODES } from './visualization/GraphInteractions.js';
import { GraphAnimations } from './visualization/GraphAnimations.js';
import { SimulationController, SIM_STATE } from './simulator/SimulationController.js';
import { EXAMPLE_GRAPHS, loadExample } from './examples/ExampleGraphs.js';
import { validateWeight } from './core/GraphValidation.js';
import { saveCurrentGraph, loadCurrentGraph, saveToHistory } from './utils/Storage.js';
import {
  exportGraphJSON, exportResultsJSON, exportDistancesCSV,
  exportHistoryCSV, downloadFile,
} from './utils/Export.js';
import { importGraphJSON, importGraphCSV, readFileAsText } from './utils/Import.js';

// ═══════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════
const state = {
  graph: new Graph(),
  source: null,
  renderer: null,
  interactions: null,
  animations: null,
  sim: null,
  currentTab: 'constructor',
  editingEdgeId: null,
};

// ═══════════════════════════════════════════════════════════
// DOM HELPERS
// ═══════════════════════════════════════════════════════════
const $ = (id) => document.getElementById(id);
const show = (el) => el?.classList.remove('hidden');
const hide = (el) => el?.classList.add('hidden');

function formatDist(d) {
  if (d === Infinity) return '∞';
  if (d === -Infinity) return '−∞';
  return String(d);
}

function notify(msg, type = 'info') {
  // Minimal inline notification — no external library dependency needed
  const bar = $('step-info-bar');
  const text = $('step-info-text');
  if (!bar || !text) return;
  text.textContent = msg;
  bar.className = `step-info-bar-${type}`;
  show(bar);
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  el.style.cssText = `
    position: fixed; bottom: 60px; right: 16px; z-index: 9999;
    background: ${type === 'error' ? 'var(--color-danger)' : type === 'success' ? 'var(--color-success)' : 'var(--color-surface-2)'};
    color: ${type === 'error' || type === 'success' ? '#000' : 'var(--color-text)'};
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    font-weight: 500;
    box-shadow: var(--shadow-md);
    animation: fadeIn 0.3s ease;
    max-width: 320px;
  `;
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s';
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════
function init() {
  // Initialize Cytoscape renderer
  state.renderer = new GraphRenderer('cy', {
    onNodeTap: handleNodeTap,
    onEdgeTap: handleEdgeTap,
    onBgTap: handleBgTap,
    onNodeDragEnd: () => persistGraph(),
  });

  // Interactions layer
  state.interactions = new GraphInteractions(state.renderer, state.graph, {
    onGraphChange: onGraphChange,
    onSourceChange: setSource,
    onError: (msg) => toast(msg, 'error'),
  });

  // Animations layer
  state.animations = new GraphAnimations(state.renderer);

  // Simulation controller
  state.sim = new SimulationController(state.graph, state.animations, {
    onStateChange: onSimStateChange,
    onStep: onSimStep,
    onFinish: onSimFinish,
    onError: (msg) => toast(msg, 'error'),
  });

  // Wire UI events
  wireEvents();
  renderExamples();
  renderRepr();

  // Try restoring saved graph
  const saved = loadCurrentGraph();
  if (saved.graphJSON) {
    try {
      const g = Graph.fromJSON(saved.graphJSON);
      state.graph = g;
      state.renderer.syncGraph(g);
      state.interactions.graph = g;
      state.sim.graph = g;
      if (saved.source && g.hasVertex(saved.source)) {
        setSource(saved.source);
      }
      onGraphChange();
    } catch {}
  }

  // Update simulation buttons
  onSimStateChange(SIM_STATE.IDLE, null);
}

// ═══════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════
$('btn-start').addEventListener('click', () => {
  hide($('landing-page'));
  show($('main-app'));
  $('main-app').style.display = 'flex';
  setTimeout(() => state.renderer.fit(), 100);
});

$('btn-view-examples').addEventListener('click', () => {
  hide($('landing-page'));
  show($('main-app'));
  $('main-app').style.display = 'flex';
  switchTab('constructor');
  // Scroll to examples section
  setTimeout(() => {
    $('examples-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);
});

$('btn-home').addEventListener('click', () => {
  hide($('main-app'));
  show($('landing-page'));
});

// ═══════════════════════════════════════════════════════════
// TAB NAVIGATION
// ═══════════════════════════════════════════════════════════
function switchTab(tabName) {
  state.currentTab = tabName;

  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
  });
  $(`content-${tabName}`)?.classList.remove('hidden');

  // Sync source selects
  if (tabName === 'simulator') {
    syncSourceSelect($('sim-source-select'));
  }
  if (tabName === 'analysis') {
    syncSourceSelect($('path-target-select'), false);
  }
}

document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

// ═══════════════════════════════════════════════════════════
// GRAPH CHANGE HANDLER
// ═══════════════════════════════════════════════════════════
function onGraphChange() {
  renderVertexList();
  syncAllSelects();
  renderRepr();
  persistGraph();

  // If sim is finished/running, reset it on graph change
  if (state.sim.state !== SIM_STATE.IDLE) {
    state.sim.reset();
    onSimStateChange(SIM_STATE.IDLE, null);
  }
}

function persistGraph() {
  saveCurrentGraph(state.graph.toJSON(), state.source);
}

// ═══════════════════════════════════════════════════════════
// SOURCE MANAGEMENT
// ═══════════════════════════════════════════════════════════
function setSource(nodeId) {
  const prev = state.source;
  state.source = nodeId;
  state.renderer.setSource(nodeId, prev);
  renderSourceBadge();
  persistGraph();

  // Update all source selects
  [$('source-select'), $('sim-source-select')].forEach(sel => {
    if (sel) sel.value = nodeId || '';
  });
}

function renderSourceBadge() {
  const badge = $('source-badge');
  if (!badge) return;
  if (state.source) {
    badge.innerHTML = `<span class="source-label">◎ Origen: <strong>${state.source}</strong></span>`;
  } else {
    badge.innerHTML = '';
  }
}

// ═══════════════════════════════════════════════════════════
// VERTEX & EDGE UI RENDERING
// ═══════════════════════════════════════════════════════════
function renderVertexList() {
  const list = $('vertex-list');
  if (!list) return;
  list.innerHTML = '';
  for (const v of state.graph.getVertices()) {
    const chip = document.createElement('span');
    chip.className = `vertex-chip${v === state.source ? ' source-chip' : ''}`;
    chip.innerHTML = `${v}<span class="chip-delete" data-v="${v}" title="Eliminar">✕</span>`;
    chip.addEventListener('click', (e) => {
      if (e.target.classList.contains('chip-delete')) {
        const vid = e.target.dataset.v;
        state.graph.removeVertex(vid);
        state.renderer.removeNode(vid);
        if (state.source === vid) setSource(null);
        onGraphChange();
      } else {
        // Select as source on click
        setSource(v);
        state.interactions.setMode(TOOL_MODES.PAN);
      }
    });
    list.appendChild(chip);
  }
}

function syncAllSelects() {
  syncSourceSelect($('source-select'));
  syncSourceSelect($('sim-source-select'));

  // Edge from/to selects
  const edgeFrom = $('edge-from');
  const edgeTo = $('edge-to');
  if (edgeFrom && edgeTo) {
    const verts = state.graph.getVertices();
    [edgeFrom, edgeTo].forEach(sel => {
      const prev = sel.value;
      sel.innerHTML = '<option value="">—</option>';
      verts.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        if (v === prev) opt.selected = true;
        sel.appendChild(opt);
      });
    });
  }
}

function syncSourceSelect(selectEl, includeEmpty = true) {
  if (!selectEl) return;
  const prev = selectEl.value;
  selectEl.innerHTML = includeEmpty ? '<option value="">— Seleccionar —</option>' : '<option value="">— Destino —</option>';
  for (const v of state.graph.getVertices()) {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    if (v === prev || v === state.source) opt.selected = (v === prev || (prev === '' && v === state.source));
    selectEl.appendChild(opt);
  }
  if (state.source) selectEl.value = state.source;
}

// ═══════════════════════════════════════════════════════════
// REPRESENTATION (ADJ MATRIX / LIST)
// ═══════════════════════════════════════════════════════════
function renderRepr() {
  const container = $('repr-container');
  if (!container) return;
  const active = document.querySelector('.repr-tab.active')?.dataset.repr || 'visual';
  renderReprMode(active, container);
}

function renderReprMode(mode, container) {
  if (mode === 'visual') {
    container.innerHTML = '<p class="text-xs text-muted" style="padding:0.3rem 0">Vista del lienzo interactivo.</p>';
    return;
  }

  const verts = state.graph.getVertices();
  const edges = state.graph.getEdges();

  if (mode === 'list') {
    const adj = {};
    verts.forEach(v => adj[v] = []);
    edges.forEach(e => adj[e.from].push(`${e.to}(${e.weight})`));
    container.innerHTML = `<div class="adj-list">${
      verts.map(v =>
        `<div class="adj-list-row"><span class="adj-list-node">${v}</span><span class="adj-list-edges">→ ${adj[v].join(', ') || '∅'}</span></div>`
      ).join('')
    }</div>`;
    return;
  }

  if (mode === 'matrix') {
    if (verts.length === 0) {
      container.innerHTML = '<p class="text-xs text-muted">Grafo vacío.</p>';
      return;
    }
    const mat = {};
    verts.forEach(u => { mat[u] = {}; verts.forEach(v => mat[u][v] = null); });
    edges.forEach(e => {
      if (mat[e.from][e.to] === null || e.weight < mat[e.from][e.to]) {
        mat[e.from][e.to] = e.weight;
      }
    });
    const header = `<th></th>` + verts.map(v => `<th>${v}</th>`).join('');
    const rows = verts.map(u =>
      `<tr><th>${u}</th>${verts.map(v => {
        const val = mat[u][v];
        if (val === null) return `<td class="adj-inf">∞</td>`;
        if (u === v) return `<td class="adj-zero">0</td>`;
        if (val < 0) return `<td class="adj-neg">${val}</td>`;
        return `<td class="adj-pos">${val}</td>`;
      }).join('')}</tr>`
    ).join('');
    container.innerHTML = `<div class="adj-matrix-container"><table class="adj-matrix"><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
}

document.querySelectorAll('.repr-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.repr-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderRepr();
  });
});

// ═══════════════════════════════════════════════════════════
// EXAMPLES
// ═══════════════════════════════════════════════════════════
function renderExamples() {
  const list = $('examples-list');
  if (!list) return;
  list.innerHTML = '';
  EXAMPLE_GRAPHS.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'example-card';
    card.innerHTML = `<div class="example-card-title">${ex.name}</div><div class="example-card-desc">${ex.description}</div>`;
    card.addEventListener('click', () => {
      if (state.graph.getVertexCount() > 0) {
        if (!confirm(`¿Reemplazar el grafo actual con "${ex.name}"?`)) return;
      }
      state.sim.reset();
      const src = loadExample(ex.id, state.graph, state.renderer);
      setSource(src);
      onGraphChange();
      state.renderer.fit();
      toast(`Ejemplo "${ex.name}" cargado.`);
    });
    list.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════════════
// CONSTRUCTOR PANEL EVENTS
// ═══════════════════════════════════════════════════════════
function wireEvents() {
  // Add vertex via form
  $('btn-add-vertex').addEventListener('click', addVertexFromInput);
  $('new-vertex-id').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addVertexFromInput();
  });

  function addVertexFromInput() {
    const input = $('new-vertex-id');
    const id = input.value.trim();
    if (!id) return;
    if (!state.graph.addVertex(id)) {
      toast(`El vértice "${id}" ya existe.`, 'error'); return;
    }
    state.renderer.addNode(id);
    onGraphChange();
    input.value = '';
    input.focus();
  }

  // Add edge via form
  $('btn-add-edge').addEventListener('click', () => {
    const from = $('edge-from').value;
    const to = $('edge-to').value;
    const weightStr = $('edge-weight').value;
    if (!from || !to) { toast('Selecciona vértices de origen y destino.', 'error'); return; }
    const val = validateWeight(weightStr);
    if (!val.valid) { toast(val.error, 'error'); return; }
    const edge = state.graph.addEdge(from, to, val.value);
    if (!edge) { toast('No se pudo crear la arista.', 'error'); return; }
    state.renderer.addEdge(edge.id, from, to, val.value);
    onGraphChange();
  });

  // Source select (constructor)
  $('source-select').addEventListener('change', (e) => setSource(e.target.value || null));

  // Source select (simulator)
  $('sim-source-select').addEventListener('change', (e) => setSource(e.target.value || null));

  // Clear graph
  $('btn-clear-graph').addEventListener('click', () => {
    if (!confirm('¿Limpiar todo el grafo?')) return;
    state.graph.clear();
    state.renderer.cy.elements().remove();
    state.sim.reset();
    setSource(null);
    onGraphChange();
    toast('Grafo limpiado.');
  });

  // Fit / layout buttons
  $('btn-fit-graph').addEventListener('click', () => state.renderer.fit());
  $('btn-layout').addEventListener('click', () => state.renderer.layout('cose'));

  // Zoom controls
  $('btn-zoom-in').addEventListener('click', () => {
    state.renderer.cy.zoom(state.renderer.cy.zoom() * 1.2);
  });
  $('btn-zoom-out').addEventListener('click', () => {
    state.renderer.cy.zoom(state.renderer.cy.zoom() / 1.2);
  });
  $('btn-zoom-fit').addEventListener('click', () => state.renderer.fit());

  // Toolbar tool buttons
  $('tool-pan').addEventListener('click', () => setTool(TOOL_MODES.PAN));
  $('tool-add-node').addEventListener('click', () => setTool(TOOL_MODES.ADD_NODE));
  $('tool-add-edge').addEventListener('click', () => setTool(TOOL_MODES.ADD_EDGE));
  $('tool-select-source').addEventListener('click', () => setTool(TOOL_MODES.SELECT_SOURCE));
  $('tool-delete').addEventListener('click', () => setTool(TOOL_MODES.DELETE));

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.key === 'p' || e.key === 'P') setTool(TOOL_MODES.PAN);
    if (e.key === 'n' || e.key === 'N') setTool(TOOL_MODES.ADD_NODE);
    if (e.key === 'e' || e.key === 'E') setTool(TOOL_MODES.ADD_EDGE);
    if (e.key === 's' || e.key === 'S') setTool(TOOL_MODES.SELECT_SOURCE);
    if (e.key === 'Delete' || e.key === 'Backspace') setTool(TOOL_MODES.DELETE);
    if (e.key === 'f' || e.key === 'F') state.renderer.fit();
    if (e.key === 'ArrowRight' && state.sim.state !== SIM_STATE.IDLE) state.sim.nextStep();
    if (e.key === 'ArrowLeft' && state.sim.state !== SIM_STATE.IDLE) state.sim.prevStep();
    if (e.key === ' ') {
      e.preventDefault();
      if (state.sim.state === SIM_STATE.PLAYING) state.sim.pause();
      else if (state.sim.state === SIM_STATE.PAUSED) state.sim.resume();
    }
  });

  // Edge weight popup
  $('btn-confirm-edge-weight').addEventListener('click', confirmEdgeWeight);
  $('edge-weight-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') confirmEdgeWeight(); });
  $('btn-cancel-edge-weight').addEventListener('click', hideEdgePopup);

  // Simulation buttons
  $('btn-prepare').addEventListener('click', () => {
    const src = state.source;
    if (!src) { toast('Selecciona un vértice de origen primero.', 'error'); return; }
    if (state.sim.prepare(src)) {
      toast('Simulación preparada. Presiona ▶ para ejecutar.', 'success');
      switchTab('simulator');
    }
  });

  $('btn-play-pause').addEventListener('click', () => {
    if (state.sim.state === SIM_STATE.PLAYING) {
      state.sim.pause();
    } else if (state.sim.state === SIM_STATE.PAUSED) {
      state.sim.resume();
    } else if (state.sim.state === SIM_STATE.READY) {
      state.sim.play();
    }
  });

  $('btn-next-step').addEventListener('click', () => state.sim.nextStep());
  $('btn-prev-step').addEventListener('click', () => state.sim.prevStep());
  $('btn-restart').addEventListener('click', () => state.sim.restart());
  $('btn-fast-forward').addEventListener('click', () => state.sim.fastForward());

  // Speed slider
  $('speed-slider').addEventListener('input', (e) => {
    const ms = Number(e.target.value);
    state.sim.setSpeed(ms);
    $('speed-value').textContent = `${ms}ms`;
  });

  // Path target select
  $('path-target-select').addEventListener('change', (e) => {
    renderPathDisplay(e.target.value);
  });

  // Export buttons
  $('btn-export-json').addEventListener('click', () => {
    if (!state.sim.getResult()) return;
    const json = exportResultsJSON(
      state.sim.getResult(), state.sim.getNegCycleResult(),
      state.sim.getAllPaths(), state.graph.toJSON()
    );
    downloadFile(json, 'bellman-ford-results.json', 'application/json');
  });

  $('btn-export-csv').addEventListener('click', () => {
    if (!state.sim.getResult()) return;
    const csv = exportDistancesCSV(state.sim.getResult(), state.sim.getAllPaths());
    downloadFile(csv, 'distancias.csv', 'text/csv');
  });

  $('btn-export-history').addEventListener('click', () => {
    if (!state.sim.getResult()) return;
    const csv = exportHistoryCSV(state.sim.getResult().history);
    downloadFile(csv, 'iteraciones.csv', 'text/csv');
  });

  // Import
  $('btn-import').addEventListener('click', () => $('file-import-input').click());
  $('file-import-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await readFileAsText(file);
    let result;
    if (file.name.endsWith('.csv')) {
      result = importGraphCSV(text);
    } else {
      result = importGraphJSON(text);
    }
    if (result.error) { toast(result.error, 'error'); return; }
    if (!result.graph) return;

    state.graph = result.graph;
    state.renderer.cy.elements().remove();
    state.renderer.syncGraph(result.graph);
    state.interactions.graph = state.graph;
    state.sim.graph = state.graph;
    state.sim.reset();
    if (result.source) setSource(result.source);
    else setSource(null);
    onGraphChange();
    state.renderer.fit();
    toast('Grafo importado correctamente.');
    e.target.value = '';
  });
}

// ═══════════════════════════════════════════════════════════
// TOOL MANAGEMENT
// ═══════════════════════════════════════════════════════════
function setTool(mode) {
  state.interactions.setMode(mode);

  document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
  const toolId = {
    [TOOL_MODES.PAN]: 'tool-pan',
    [TOOL_MODES.ADD_NODE]: 'tool-add-node',
    [TOOL_MODES.ADD_EDGE]: 'tool-add-edge',
    [TOOL_MODES.SELECT_SOURCE]: 'tool-select-source',
    [TOOL_MODES.DELETE]: 'tool-delete',
  }[mode];
  if (toolId) $(`${toolId}`)?.classList.add('active');

  const hints = {
    [TOOL_MODES.PAN]: 'Haz clic en nodos para editarlos, en aristas para modificar su peso.',
    [TOOL_MODES.ADD_NODE]: 'Haz clic en el lienzo para agregar un vértice.',
    [TOOL_MODES.ADD_EDGE]: 'Haz clic en el nodo de origen, luego en el nodo de destino.',
    [TOOL_MODES.SELECT_SOURCE]: 'Haz clic en un vértice para establecerlo como origen.',
    [TOOL_MODES.DELETE]: 'Haz clic en un vértice o arista para eliminarlo.',
  };
  const hint = $('canvas-hint');
  if (hint) hint.textContent = hints[mode] || '';
}

// ═══════════════════════════════════════════════════════════
// CYTOSCAPE EVENT HANDLERS (from renderer)
// ═══════════════════════════════════════════════════════════
function handleNodeTap(nodeId, evt) {
  // Handled inside GraphInteractions, nothing extra needed here
}

function handleEdgeTap(edgeId, evt) {
  if (state.interactions.getMode() === TOOL_MODES.PAN) {
    showEdgePopup(edgeId, evt);
  }
}

function handleBgTap(pos, evt) {
  hideEdgePopup();
  if (state.interactions.getMode() === TOOL_MODES.ADD_NODE) {
    // Handled inside GraphInteractions
  }
}

// ═══════════════════════════════════════════════════════════
// EDGE WEIGHT POPUP
// ═══════════════════════════════════════════════════════════
function showEdgePopup(edgeId, evt) {
  const edge = state.graph.getEdges().find(e => e.id === edgeId);
  if (!edge) return;

  state.editingEdgeId = edgeId;
  const popup = $('edge-weight-popup');
  const input = $('edge-weight-input');
  input.value = edge.weight;

  // Position popup
  const container = $('graph-canvas-container');
  const containerRect = container.getBoundingClientRect();
  const renderedPos = evt.renderedPosition;

  if (renderedPos) {
    popup.style.left = `${renderedPos.x + 10}px`;
    popup.style.top = `${renderedPos.y - 20}px`;
  }

  popup.classList.add('visible');
  input.focus();
  input.select();
}

function hideEdgePopup() {
  $('edge-weight-popup')?.classList.remove('visible');
  state.editingEdgeId = null;
}

function confirmEdgeWeight() {
  if (!state.editingEdgeId) return;
  const weightStr = $('edge-weight-input').value;
  const val = validateWeight(weightStr);
  if (!val.valid) { toast(val.error, 'error'); return; }
  state.graph.updateEdgeWeight(state.editingEdgeId, val.value);
  state.renderer.updateEdgeLabel(state.editingEdgeId, val.value);
  hideEdgePopup();
  onGraphChange();
}

// ═══════════════════════════════════════════════════════════
// SIMULATION STATE CALLBACKS
// ═══════════════════════════════════════════════════════════
function onSimStateChange(simState, sim) {
  const btnPlayPause = $('btn-play-pause');
  const btnPrev = $('btn-prev-step');
  const btnNext = $('btn-next-step');
  const btnFF = $('btn-fast-forward');
  const btnRestart = $('btn-restart');
  const btnPrepare = $('btn-prepare');

  const isActive = simState !== SIM_STATE.IDLE;
  const isPlaying = simState === SIM_STATE.PLAYING;
  const isFinished = simState === SIM_STATE.FINISHED;

  if (btnPlayPause) {
    btnPlayPause.disabled = !isActive || isFinished;
    btnPlayPause.textContent = isPlaying ? '⏸' : '▶';
  }
  if (btnPrev) btnPrev.disabled = !isActive;
  if (btnNext) btnNext.disabled = !isActive || isFinished;
  if (btnFF) btnFF.disabled = !isActive || isFinished;
  if (btnRestart) btnRestart.disabled = !isActive;
  if (btnPrepare) btnPrepare.textContent = isActive ? '↺ Re-ejecutar' : '▶ Preparar';
}

function onSimStep(event, stepIndex) {
  if (!event) return;

  const total = state.sim.getTotalSteps();
  const pct = total > 0 ? Math.round((stepIndex + 1) / total * 100) : 0;

  // Progress bar
  const bar = $('sim-progress-bar');
  if (bar) bar.style.width = `${pct}%`;
  const progText = $('sim-progress-text');
  if (progText) progText.textContent = `Paso ${stepIndex + 1} / ${total}`;

  // Iteration info
  const iterInfo = $('sim-iter-info');
  if (iterInfo) iterInfo.textContent = `Iteración ${event.iteration}`;

  // Step info bar
  const relaxed = event.relaxed;
  const distFrom = formatDist(event.distFrom);
  const distBefore = formatDist(event.distBefore);
  const distAfter = formatDist(event.distAfter);
  const stepBar = $('step-info-bar');
  const stepText = $('step-info-text');

  if (stepText) {
    if (relaxed) {
      stepText.innerHTML = `<strong>Relajación exitosa:</strong> ${event.from}→${event.to} (peso ${event.weight}) · dist[${event.to}]: <s>${distBefore}</s> → <strong style="color:var(--color-success)">${distAfter}</strong>`;
    } else {
      stepText.innerHTML = `<strong>Sin cambio:</strong> ${event.from}→${event.to} (peso ${event.weight}) · dist[${event.to}] = ${distBefore} (candidata: ${formatDist(event.distCandidate)})`;
    }
  }
  if (stepBar) show(stepBar);

  // Step detail panel
  renderStepDetail(event);
}

function renderStepDetail(event) {
  const panel = $('step-detail-panel');
  if (!panel) return;
  const relaxed = event.relaxed;
  panel.innerHTML = `
    <div class="step-detail">
      <div class="step-detail-row">
        <span class="step-detail-label">Iteración</span>
        <span class="step-detail-value">${event.iteration}</span>
      </div>
      <div class="step-detail-row">
        <span class="step-detail-label">Arista</span>
        <span class="step-detail-value">${event.from} → ${event.to}</span>
      </div>
      <div class="step-detail-row">
        <span class="step-detail-label">Peso</span>
        <span class="step-detail-value">${event.weight}</span>
      </div>
      <div class="step-detail-row">
        <span class="step-detail-label">dist[${event.from}]</span>
        <span class="step-detail-value">${formatDist(event.distFrom)}</span>
      </div>
      <div class="step-detail-row">
        <span class="step-detail-label">dist[${event.to}] antes</span>
        <span class="step-detail-value">${formatDist(event.distBefore)}</span>
      </div>
      <div class="step-detail-row">
        <span class="step-detail-label">Candidata</span>
        <span class="step-detail-value">${formatDist(event.distCandidate)}</span>
      </div>
      <div class="step-detail-row">
        <span class="step-detail-label">Resultado</span>
        <span class="step-detail-value ${relaxed ? 'step-relaxed' : 'step-no-change'}">
          ${relaxed ? '✓ Relajada' : '— Sin cambio'}
        </span>
      </div>
      ${relaxed ? `
      <div class="step-detail-row">
        <span class="step-detail-label">dist[${event.to}] nuevo</span>
        <span class="step-detail-value step-relaxed">${formatDist(event.distAfter)}</span>
      </div>` : ''}
    </div>
  `;
}

function onSimFinish(result, negCycleResult, allPaths) {
  renderResults(result, negCycleResult, allPaths);
  renderAnalysis(result, negCycleResult, allPaths);
  renderPathTargetSelect();

  // Enable export buttons
  [$('btn-export-json'), $('btn-export-csv'), $('btn-export-history')].forEach(btn => {
    if (btn) btn.disabled = false;
  });

  // Auto-switch to results tab
  setTimeout(() => switchTab('results'), 400);

  // Save to history
  saveToHistory({
    source: state.source,
    vertices: state.graph.getVertexCount(),
    edges: state.graph.getEdgeCount(),
    iterations: result.iterations,
    hasNegCycle: negCycleResult.hasNegativeCycle,
    graphJSON: state.graph.toJSON(),
  });

  if (negCycleResult.hasNegativeCycle) {
    toast('⚠ Ciclo negativo detectado.', 'warn');
  } else {
    toast('✓ Simulación completada.', 'success');
  }
}

// ═══════════════════════════════════════════════════════════
// RESULTS RENDERING
// ═══════════════════════════════════════════════════════════
function renderResults(result, negCycleResult, allPaths) {
  // Status banner
  const status = $('results-status');
  if (status) {
    if (negCycleResult.hasNegativeCycle) {
      status.innerHTML = `<div class="neg-cycle-warning">⚠ Ciclo negativo detectado. Los vértices afectados no tienen distancia mínima finita.</div>`;
    } else {
      status.innerHTML = `<div class="success-info">✓ Algoritmo completado. ${result.convergedEarly ? 'Convergencia anticipada.' : `${result.iterations} iteraciones realizadas.`}</div>`;
    }
  }

  // Distance table
  const distPanel = $('results-distances');
  if (distPanel) {
    const rows = Object.entries(result.dist).map(([v, d]) => {
      const pathInfo = allPaths[v];
      let distClass = '';
      let distStr = '';
      if (d === Infinity) { distClass = 'distance-infinity'; distStr = '∞'; }
      else if (negCycleResult.affectedVertices?.has(v)) { distClass = 'distance-neg-inf'; distStr = '−∞'; }
      else { distClass = 'distance-valid'; distStr = String(d); }

      const pathStr = pathInfo?.path?.length > 0
        ? pathInfo.path.join(' → ')
        : (pathInfo?.affectedByNegCycle ? '−∞ (ciclo neg.)' : '—');

      const src = v === state.source ? ' ◎' : '';
      return `<tr><td>${v}${src}</td><td class="${distClass}">${distStr}</td><td class="text-xs text-muted">${pathStr}</td></tr>`;
    }).join('');

    distPanel.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead><tr><th>Vértice</th><th>Distancia</th><th>Camino mínimo</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  // Stats
  const stats = $('results-stats');
  if (stats) {
    stats.innerHTML = `
      <div class="stat-grid">
        <div class="stat-item"><div class="stat-value">${state.graph.getVertexCount()}</div><div class="stat-label">Vértices</div></div>
        <div class="stat-item"><div class="stat-value">${state.graph.getEdgeCount()}</div><div class="stat-label">Aristas</div></div>
        <div class="stat-item"><div class="stat-value">${result.iterations}</div><div class="stat-label">Iteraciones</div></div>
        <div class="stat-item"><div class="stat-value">${result.successfulRelaxations}</div><div class="stat-label">Relajaciones</div></div>
        <div class="stat-item"><div class="stat-value">${result.edgesExamined}</div><div class="stat-label">Examinadas</div></div>
        <div class="stat-item"><div class="stat-value">${result.executionTimeMs?.toFixed(2) ?? '—'}ms</div><div class="stat-label">Tiempo</div></div>
      </div>
    `;
  }
}

// ═══════════════════════════════════════════════════════════
// ANALYSIS RENDERING
// ═══════════════════════════════════════════════════════════
function renderAnalysis(result, negCycleResult, allPaths) {
  // Negative cycles
  const ncPanel = $('analysis-neg-cycles');
  if (ncPanel) {
    if (!negCycleResult.hasNegativeCycle) {
      ncPanel.innerHTML = `<div class="success-info">✓ No se detectaron ciclos negativos alcanzables desde el origen.</div>`;
    } else {
      const cyclesHTML = negCycleResult.cycles.map((cycle, i) => {
        const pathHTML = cycle.map((n, j) =>
          `<span class="cycle-node">${n}</span>${j < cycle.length - 1 ? '<span class="cycle-arrow">→</span>' : ''}`
        ).join('');
        // Calculate cycle weight
        const edges = state.graph.getEdges();
        let w = 0;
        for (let j = 0; j < cycle.length - 1; j++) {
          const e = edges.find(e => e.from === cycle[j] && e.to === cycle[j + 1]);
          if (e) w += e.weight;
        }
        return `
          <div class="cycle-item">
            <div class="cycle-path">${pathHTML}</div>
            <div class="cycle-weight">Peso total: <strong>${w}</strong></div>
          </div>
        `;
      }).join('');

      const affectedHTML = [...(negCycleResult.affectedVertices || [])].map(v =>
        `<span class="affected-chip">${v}</span>`
      ).join('');

      ncPanel.innerHTML = `
        <div class="neg-cycle-warning" style="margin-bottom:0.6rem">
          ⚠ ${negCycleResult.cycles.length} ciclo(s) negativo(s) detectado(s).
        </div>
        <div class="cycle-display">${cyclesHTML}</div>
        ${negCycleResult.affectedVertices?.size > 0 ? `
        <div style="margin-top:0.6rem">
          <div class="sidebar-title" style="margin-bottom:0.3rem">Vértices afectados</div>
          <div class="affected-vertices">${affectedHTML}</div>
        </div>` : ''}
      `;
    }
  }

  // Iteration table
  const iterPanel = $('analysis-iterations');
  if (iterPanel) {
    if (!result.history || result.history.length === 0) {
      iterPanel.innerHTML = '<p class="text-xs text-muted">Sin historial.</p>';
      return;
    }

    // Group by iteration
    const groups = {};
    result.history.forEach(ev => {
      if (!groups[ev.iteration]) groups[ev.iteration] = [];
      groups[ev.iteration].push(ev);
    });

    const groupsHTML = Object.entries(groups).map(([iter, events]) => {
      const rows = events.map(ev => `
        <div class="log-entry ${ev.relaxed ? 'relaxed' : 'no-change'}">
          <span class="log-edge">${ev.from}→${ev.to} (w:${ev.weight})</span>
          <span class="log-result">${ev.relaxed ? `✓ ${formatDist(ev.distBefore)}→${formatDist(ev.distAfter)}` : '—'}</span>
        </div>
      `).join('');
      return `
        <div class="iter-group">
          <div class="iter-group-header">Iteración ${iter}</div>
          ${rows}
        </div>
      `;
    }).join('');

    iterPanel.innerHTML = `<div class="iter-history-wrapper">${groupsHTML}</div>`;
  }
}

// ═══════════════════════════════════════════════════════════
// PATH DISPLAY (Analysis tab)
// ═══════════════════════════════════════════════════════════
function renderPathTargetSelect() {
  syncSourceSelect($('path-target-select'), false);
}

function renderPathDisplay(targetId) {
  const container = $('path-display-container');
  if (!container) return;
  if (!targetId) { container.innerHTML = ''; return; }

  const allPaths = state.sim.getAllPaths();
  if (!allPaths) return;

  const pathInfo = allPaths[targetId];
  if (!pathInfo) { container.innerHTML = '<p class="text-xs text-muted">Sin datos.</p>'; return; }

  if (pathInfo.affectedByNegCycle) {
    container.innerHTML = `<div class="neg-cycle-warning">Este vértice es alcanzable a través de un ciclo negativo. No existe camino mínimo finito.</div>`;
    return;
  }

  if (!pathInfo.exists) {
    container.innerHTML = `<div class="warning-info">El vértice <strong>${targetId}</strong> no es alcanzable desde el origen.</div>`;
    return;
  }

  const pathNodes = pathInfo.path.map((n, i) =>
    `<span class="path-node" onclick="highlightNode('${n}')">${n}</span>${i < pathInfo.path.length - 1 ? '<span class="path-arrow">→</span>' : ''}`
  ).join('');

  container.innerHTML = `
    <div class="path-display">${pathNodes}</div>
    <div style="font-size:0.78rem;color:var(--color-text-muted);margin-top:0.4rem">
      Distancia total: <strong style="color:var(--color-success)">${formatDist(pathInfo.totalWeight)}</strong>
      · ${pathInfo.path.length - 1} arista(s)
    </div>
  `;

  // Highlight path in graph
  highlightPath(pathInfo.path);
}

function highlightPath(path) {
  if (!path || path.length < 2) return;
  const edges = state.graph.getEdges();
  const pathEdgeIds = [];
  for (let i = 0; i < path.length - 1; i++) {
    const e = edges.find(e => e.from === path[i] && e.to === path[i + 1]);
    if (e) pathEdgeIds.push(e.id);
  }
  state.renderer.highlightPath(path, pathEdgeIds);
}

window.highlightNode = (nodeId) => {
  state.renderer.centerOn(nodeId);
};

// ═══════════════════════════════════════════════════════════
// BOOTSTRAP
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
