/**
 * GraphRenderer.js — Cytoscape.js instance management and graph rendering
 */
import cytoscape from 'cytoscape';
import { getCytoscapeStyles } from './GraphStyles.js';

export class GraphRenderer {
  /**
   * @param {string} containerId - DOM element id for Cytoscape mount
   * @param {object} eventHandlers - { onNodeTap, onEdgeTap, onBgTap, onNodeDragEnd }
   */
  constructor(containerId, eventHandlers = {}) {
    this.container = document.getElementById(containerId);
    this.eventHandlers = eventHandlers;
    this.cy = null;
    this._init();
  }

  _init() {
    this.cy = cytoscape({
      container: this.container,
      elements: [],
      style: getCytoscapeStyles(),
      layout: { name: 'preset' },
      minZoom: 0.2,
      maxZoom: 3,
      wheelSensitivity: 0.3,
    });

    // Wire up events
    this.cy.on('tap', 'node', (evt) => {
      this.eventHandlers.onNodeTap?.(evt.target.id(), evt);
    });
    this.cy.on('tap', 'edge', (evt) => {
      this.eventHandlers.onEdgeTap?.(evt.target.id(), evt);
    });
    this.cy.on('tap', (evt) => {
      if (evt.target === this.cy) {
        const pos = evt.position;
        this.eventHandlers.onBgTap?.(pos, evt);
      }
    });
    this.cy.on('dragfree', 'node', (evt) => {
      this.eventHandlers.onNodeDragEnd?.(evt.target.id(), evt.target.position());
    });
  }

  /** Sync Cytoscape elements with Graph data model. */
  syncGraph(graph) {
    const vertices = graph.getVertices();
    const edges = graph.getEdges();

    // Add missing nodes
    for (const v of vertices) {
      if (!this.cy.getElementById(v).length) {
        this.cy.add({
          group: 'nodes',
          data: { id: v, label: v },
          position: this._randomPosition(),
        });
      }
    }

    // Remove deleted nodes
    this.cy.nodes().forEach(node => {
      if (!graph.hasVertex(node.id())) {
        this.cy.remove(node);
      }
    });

    // Add missing edges
    for (const e of edges) {
      if (!this.cy.getElementById(e.id).length) {
        this.cy.add({
          group: 'edges',
          data: {
            id: e.id,
            source: e.from,
            target: e.to,
            weight: e.weight,
            label: String(e.weight),
          },
        });
      } else {
        // Update weight label
        const cyEdge = this.cy.getElementById(e.id);
        cyEdge.data('label', String(e.weight));
        cyEdge.data('weight', e.weight);
      }
    }

    // Remove deleted edges
    this.cy.edges().forEach(edge => {
      if (!edges.find(e => e.id === edge.id())) {
        this.cy.remove(edge);
      }
    });

    // Mark parallel edges
    this._updateParallelEdges();
  }

  /** Add a single node with given position or random. */
  addNode(id, position) {
    const pos = position || this._randomPosition();
    this.cy.add({ group: 'nodes', data: { id, label: id }, position: pos });
  }

  /** Remove a node by id. */
  removeNode(id) {
    this.cy.getElementById(id).remove();
  }

  /** Add an edge. */
  addEdge(edgeId, from, to, weight) {
    this.cy.add({
      group: 'edges',
      data: { id: edgeId, source: from, target: to, weight, label: String(weight) },
    });
    this._updateParallelEdges();
  }

  /** Remove an edge by id. */
  removeEdge(edgeId) {
    this.cy.getElementById(edgeId).remove();
  }

  /** Update edge weight label. */
  updateEdgeLabel(edgeId, weight) {
    const edge = this.cy.getElementById(edgeId);
    if (edge.length) {
      edge.data('label', String(weight));
      edge.data('weight', weight);
    }
  }

  /** Set the source node visual. */
  setSource(nodeId, previousId) {
    if (previousId) {
      this.cy.getElementById(previousId).removeClass('source');
    }
    if (nodeId) {
      this.cy.getElementById(nodeId).addClass('source');
    }
  }

  /** Update a node's displayed distance label. */
  setNodeDistLabel(nodeId, dist) {
    const node = this.cy.getElementById(nodeId);
    if (!node.length) return;
    let label = '';
    if (dist === Infinity) label = '∞';
    else if (dist === -Infinity) label = '-∞';
    else label = String(dist);
    node.data('distLabel', label);
  }

  /** Clear all distance labels. */
  clearDistLabels() {
    this.cy.nodes().forEach(n => n.removeData('distLabel'));
  }

  /** Apply a CSS class to a node. */
  classifyNode(nodeId, ...classes) {
    const node = this.cy.getElementById(nodeId);
    if (node.length) node.addClass(classes.join(' '));
  }

  /** Remove a CSS class from a node. */
  declassifyNode(nodeId, ...classes) {
    const node = this.cy.getElementById(nodeId);
    if (node.length) node.removeClass(classes.join(' '));
  }

  /** Apply a CSS class to an edge. */
  classifyEdge(edgeId, ...classes) {
    const edge = this.cy.getElementById(edgeId);
    if (edge.length) edge.addClass(classes.join(' '));
  }

  /** Remove all state classes from all elements. */
  resetAllClasses() {
    const stateClasses = [
      'source', 'visited', 'neg-cycle', 'affected', 'unreachable', 'path-node',
      'active-edge', 'relaxed-edge', 'no-change-edge', 'path-edge', 'neg-cycle-edge',
    ];
    this.cy.elements().removeClass(stateClasses.join(' '));
  }

  /** Highlight a path (array of vertex ids). */
  highlightPath(path, edgeList) {
    this.resetPathClasses();
    for (const nodeId of path) {
      this.cy.getElementById(nodeId).addClass('path-node');
    }
    for (const edgeId of edgeList) {
      this.cy.getElementById(edgeId).addClass('path-edge');
    }
  }

  resetPathClasses() {
    this.cy.nodes().removeClass('path-node');
    this.cy.edges().removeClass('path-edge');
  }

  /** Fit graph to viewport. */
  fit(padding = 40) {
    this.cy.fit(this.cy.elements(), padding);
  }

  /** Auto-layout. */
  layout(name = 'cose') {
    this.cy.layout({
      name,
      animate: true,
      animationDuration: 600,
      padding: 50,
      randomize: false,
    }).run();
  }

  /** Center on a node. */
  centerOn(nodeId) {
    const node = this.cy.getElementById(nodeId);
    if (node.length) {
      this.cy.animate({ center: { eles: node }, zoom: Math.max(this.cy.zoom(), 1.2) }, { duration: 400 });
    }
  }

  /** Get node position. */
  getNodePosition(nodeId) {
    const node = this.cy.getElementById(nodeId);
    return node.length ? node.position() : null;
  }

  /** Get rendered position for overlay elements. */
  getRenderedPosition(nodeId) {
    const node = this.cy.getElementById(nodeId);
    return node.length ? node.renderedPosition() : null;
  }

  /** Destroy the Cytoscape instance. */
  destroy() {
    this.cy?.destroy();
    this.cy = null;
  }

  _randomPosition() {
    const w = this.container?.clientWidth || 800;
    const h = this.container?.clientHeight || 600;
    return {
      x: 80 + Math.random() * (w - 160),
      y: 80 + Math.random() * (h - 160),
    };
  }

  _updateParallelEdges() {
    // Mark parallel edges (same source/target pair)
    const seen = new Map();
    this.cy.edges().forEach(e => {
      const key = `${e.data('source')}-${e.data('target')}`;
      if (!seen.has(key)) seen.set(key, 0);
      seen.set(key, seen.get(key) + 1);
    });
    this.cy.edges().forEach(e => {
      const key = `${e.data('source')}-${e.data('target')}`;
      if ((seen.get(key) || 0) > 1) {
        e.addClass('parallel');
      } else {
        e.removeClass('parallel');
      }
    });
  }
}
