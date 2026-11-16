/**
 * GraphInteractions.js — User interaction handlers for the graph canvas
 * Manages tool modes (addNode, addEdge, delete, selectSource, pan) and
 * responds to Cytoscape events accordingly.
 */
import { validateVertexId, validateWeight } from '../core/GraphValidation.js';

export const TOOL_MODES = {
  PAN: 'pan',
  ADD_NODE: 'addNode',
  ADD_EDGE: 'addEdge',
  DELETE: 'delete',
  SELECT_SOURCE: 'selectSource',
};

export class GraphInteractions {
  /**
   * @param {import('./GraphRenderer.js').GraphRenderer} renderer
   * @param {import('../core/Graph.js').Graph} graph
   * @param {object} callbacks - { onGraphChange, onSourceChange, onNodeEdit, onEdgeEdit }
   */
  constructor(renderer, graph, callbacks = {}) {
    this.renderer = renderer;
    this.graph = graph;
    this.callbacks = callbacks;
    this.mode = TOOL_MODES.PAN;
    this.edgeSource = null; // when adding an edge, first node selected
    this._pendingEdgeHighlight = null;
    this._setupCytoscapeEvents();
  }

  setMode(mode) {
    this.mode = mode;
    this.edgeSource = null;
    this._clearPendingEdge();
    // Update cursor
    const container = this.renderer.container;
    if (container) {
      container.style.cursor = mode === TOOL_MODES.ADD_NODE ? 'crosshair' : 'default';
    }
    // Disable/enable panning based on mode
    this.renderer.cy.userPanningEnabled(mode === TOOL_MODES.PAN);
    this.renderer.cy.userZoomingEnabled(true);
  }

  getMode() { return this.mode; }

  _setupCytoscapeEvents() {
    // Background click
    this.renderer.cy.on('tap', (evt) => {
      if (evt.target !== this.renderer.cy) return;
      if (this.mode === TOOL_MODES.ADD_NODE) {
        this._handleAddNode(evt.position);
      } else if (this.mode === TOOL_MODES.ADD_EDGE) {
        this.edgeSource = null;
        this._clearPendingEdge();
      }
    });

    // Node click
    this.renderer.cy.on('tap', 'node', (evt) => {
      const nodeId = evt.target.id();
      switch (this.mode) {
        case TOOL_MODES.DELETE:
          this._handleDeleteNode(nodeId);
          break;
        case TOOL_MODES.ADD_EDGE:
          this._handleAddEdgeStep(nodeId);
          break;
        case TOOL_MODES.SELECT_SOURCE:
          this._handleSelectSource(nodeId);
          break;
        case TOOL_MODES.PAN:
          this.callbacks.onNodeEdit?.(nodeId);
          break;
      }
    });

    // Edge click
    this.renderer.cy.on('tap', 'edge', (evt) => {
      const edgeId = evt.target.id();
      if (this.mode === TOOL_MODES.DELETE) {
        this._handleDeleteEdge(edgeId);
      } else if (this.mode === TOOL_MODES.PAN) {
        this.callbacks.onEdgeEdit?.(edgeId, evt.renderedPosition || evt.position);
      }
    });
  }

  _handleAddNode(position) {
    const id = this._promptVertexId();
    if (!id) return;
    const added = this.graph.addVertex(id);
    if (!added) {
      this.callbacks.onError?.(`El vértice "${id}" ya existe.`);
      return;
    }
    this.renderer.addNode(id, position);
    this.callbacks.onGraphChange?.();
  }

  _promptVertexId() {
    // Simple prompt; can be replaced with modal
    let id = prompt('Nombre del vértice:', `V${this.graph.getVertexCount() + 1}`);
    if (id === null) return null;
    id = id.trim();
    const v = validateVertexId(id, this.graph.vertices);
    if (!v.valid) {
      alert(v.error);
      return null;
    }
    return id;
  }

  _handleDeleteNode(nodeId) {
    if (!confirm(`¿Eliminar el vértice "${nodeId}" y todas sus aristas?`)) return;
    this.graph.removeVertex(nodeId);
    this.renderer.removeNode(nodeId);
    this.callbacks.onGraphChange?.();
  }

  _handleDeleteEdge(edgeId) {
    this.graph.removeEdge(edgeId);
    this.renderer.removeEdge(edgeId);
    this.callbacks.onGraphChange?.();
  }

  _handleAddEdgeStep(nodeId) {
    if (!this.edgeSource) {
      // First node: mark it
      this.edgeSource = nodeId;
      this.renderer.cy.getElementById(nodeId).addClass('path-node');
      this._pendingEdgeHighlight = nodeId;
    } else {
      if (this.edgeSource === nodeId) {
        // Self-loop — ask for weight directly
        this._createEdge(nodeId, nodeId);
      } else {
        this._createEdge(this.edgeSource, nodeId);
      }
      this.edgeSource = null;
      this._clearPendingEdge();
    }
  }

  _createEdge(from, to) {
    const weightStr = prompt(`Peso de la arista ${from} → ${to}:`, '1');
    if (weightStr === null) return;
    const val = validateWeight(weightStr);
    if (!val.valid) {
      alert(val.error);
      return;
    }
    const edge = this.graph.addEdge(from, to, val.value);
    if (!edge) {
      alert('No se puede crear la arista. Verifique que los vértices existen.');
      return;
    }
    this.renderer.addEdge(edge.id, from, to, val.value);
    this.callbacks.onGraphChange?.();
  }

  _handleSelectSource(nodeId) {
    this.callbacks.onSourceChange?.(nodeId);
  }

  _clearPendingEdge() {
    if (this._pendingEdgeHighlight) {
      this.renderer.cy.getElementById(this._pendingEdgeHighlight).removeClass('path-node');
      this._pendingEdgeHighlight = null;
    }
  }

  /**
   * Programmatically add a vertex at a position (used by examples loader).
   */
  addNodeAt(id, position) {
    if (!this.graph.addVertex(id)) return false;
    this.renderer.addNode(id, position);
    return true;
  }

  /**
   * Programmatically add an edge.
   */
  addEdge(from, to, weight) {
    const edge = this.graph.addEdge(from, to, weight);
    if (!edge) return null;
    this.renderer.addEdge(edge.id, from, to, weight);
    return edge;
  }
}
