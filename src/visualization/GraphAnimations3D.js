/**
 * GraphAnimations3D.js — Applies visual state transitions to 3D graph elements
 * during simulation playback. Same interface as GraphAnimations (2D).
 */

export class GraphAnimations3D {
  /**
   * @param {import('./GraphRenderer3D.js').GraphRenderer3D} renderer
   */
  constructor(renderer) {
    this.renderer = renderer;
  }

  /**
   * Apply a simulation step's visual state.
   * @param {object} event  - BFEvent from BellmanFord history
   * @param {object} dist   - Current distance snapshot
   * @param {string} source - Source vertex id
   */
  applyStep(event, dist, source) {
    const r = this.renderer;

    // ── Clear previous step edge classes ──
    r._links.forEach(l => {
      l._cls.delete('active-edge');
      l._cls.delete('relaxed-edge');
      l._cls.delete('no-change-edge');
    });

    // ── Classify active edge ──
    const link = r._links.find(l => l.id === event.edgeId);
    if (link) {
      if (event.relaxed) {
        link._cls.add('relaxed-edge');
        // Mark target as visited
        const target = r._nodes.find(n => n.id === event.to);
        if (target && !target._cls.has('source')) {
          target._cls.add('visited');
        }
      } else {
        link._cls.add('no-change-edge');
      }
    }

    // ── Update distance labels ──
    for (const [nodeId, d] of Object.entries(dist)) {
      r.setNodeDistLabel(nodeId, d);
    }

    r._soft();
  }

  /**
   * Reset all visual state and labels.
   */
  reset(source) {
    this.renderer.resetAllClasses();
    this.renderer.clearDistLabels();
    if (source) {
      this.renderer.setSource(source, null);
    }
  }

  /**
   * Apply final result state: visited, unreachable, neg-cycle nodes and edges.
   */
  applyFinalState(dist, affectedVertices, cycles, paths, source) {
    const r = this.renderer;

    // Clear step classes on edges
    r._links.forEach(l => {
      l._cls.delete('active-edge');
      l._cls.delete('relaxed-edge');
      l._cls.delete('no-change-edge');
    });

    // Classify nodes
    for (const [nodeId, d] of Object.entries(dist)) {
      r.setNodeDistLabel(nodeId, d);

      const node = r._nodes.find(n => n.id === nodeId);
      if (!node) continue;

      node._cls.delete('visited');
      node._cls.delete('affected');
      node._cls.delete('unreachable');
      node._cls.delete('neg-cycle');

      if (nodeId === source) {
        node._cls.add('source');
      } else if (affectedVertices && affectedVertices.has(nodeId)) {
        node._cls.add('affected');
      } else if (d === Infinity) {
        node._cls.add('unreachable');
      } else {
        node._cls.add('visited');
      }
    }

    // Mark negative cycle edges and nodes
    if (cycles) {
      for (const cycle of cycles) {
        for (let i = 0; i < cycle.length - 1; i++) {
          const link = r._links.find(l => {
            const src = typeof l.source === 'object' ? l.source.id : l.source;
            const tgt = typeof l.target === 'object' ? l.target.id : l.target;
            return src === cycle[i] && tgt === cycle[i + 1];
          });
          if (link) link._cls.add('neg-cycle-edge');
        }
      }
      cycles.flat().forEach(nodeId => {
        const node = r._nodes.find(n => n.id === nodeId);
        if (node) {
          node._cls.delete('visited');
          node._cls.delete('affected');
          node._cls.delete('unreachable');
          node._cls.add('neg-cycle');
        }
      });
    }

    r._soft();
  }

  /**
   * Flash a node briefly with a visual state.
   */
  flashNode(nodeId, type = 'relaxed') {
    const node = this.renderer._nodes.find(n => n.id === nodeId);
    if (!node) return;
    const cls = type === 'relaxed' ? 'visited' : 'unreachable';
    node._cls.add(cls);
    this.renderer._soft();
    if (type !== 'relaxed') {
      setTimeout(() => {
        node._cls.delete(cls);
        this.renderer._soft();
      }, 600);
    }
  }
}
