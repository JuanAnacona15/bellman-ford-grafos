/**
 * Graph.js — Core graph data structure for Bellman-Ford Visualizer
 * Represents a directed weighted graph using an edge list (optimal for Bellman-Ford)
 */
export class Graph {
  constructor() {
    this.vertices = new Set();
    this.edges = []; // Array of { id, from, to, weight }
    this._edgeCounter = 0;
  }

  /** Add a vertex. Returns false if already exists. */
  addVertex(id) {
    if (this.vertices.has(id)) return false;
    this.vertices.add(id);
    return true;
  }

  /** Remove a vertex and all its incident edges. */
  removeVertex(id) {
    if (!this.vertices.has(id)) return false;
    this.vertices.delete(id);
    this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
    return true;
  }

  /** Add a directed weighted edge. Allows parallel edges and self-loops. */
  addEdge(from, to, weight) {
    if (!this.vertices.has(from) || !this.vertices.has(to)) return null;
    const edge = { id: `e${++this._edgeCounter}`, from, to, weight: Number(weight) };
    this.edges.push(edge);
    return edge;
  }

  /** Remove edge by id. */
  removeEdge(edgeId) {
    const idx = this.edges.findIndex(e => e.id === edgeId);
    if (idx === -1) return false;
    this.edges.splice(idx, 1);
    return true;
  }

  /** Update edge weight. */
  updateEdgeWeight(edgeId, weight) {
    const edge = this.edges.find(e => e.id === edgeId);
    if (!edge) return false;
    edge.weight = Number(weight);
    return true;
  }

  /** Rename a vertex (updates all edges). */
  renameVertex(oldId, newId) {
    if (!this.vertices.has(oldId) || this.vertices.has(newId)) return false;
    this.vertices.delete(oldId);
    this.vertices.add(newId);
    this.edges.forEach(e => {
      if (e.from === oldId) e.from = newId;
      if (e.to === oldId) e.to = newId;
    });
    return true;
  }

  getVertices() { return [...this.vertices]; }
  getEdges() { return [...this.edges]; }
  getVertexCount() { return this.vertices.size; }
  getEdgeCount() { return this.edges.length; }
  hasVertex(id) { return this.vertices.has(id); }

  /** Serialize to plain object for storage/export. */
  toJSON() {
    return {
      vertices: [...this.vertices],
      edges: this.edges.map(e => ({ ...e })),
      _edgeCounter: this._edgeCounter
    };
  }

  /** Deserialize from plain object. */
  static fromJSON(obj) {
    const g = new Graph();
    (obj.vertices || []).forEach(v => g.vertices.add(v));
    g.edges = (obj.edges || []).map(e => ({ ...e }));
    g._edgeCounter = obj._edgeCounter || g.edges.length;
    return g;
  }

  /** Create a deep clone. */
  clone() {
    return Graph.fromJSON(this.toJSON());
  }

  /** Clear all data. */
  clear() {
    this.vertices.clear();
    this.edges = [];
    this._edgeCounter = 0;
  }
}
