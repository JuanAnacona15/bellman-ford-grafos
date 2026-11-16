/**
 * GraphAnimations.js — Applies visual state transitions to Cytoscape elements
 * during simulation playback.
 */

export class GraphAnimations {
  /**
   * @param {import('./GraphRenderer.js').GraphRenderer} renderer
   */
  constructor(renderer) {
    this.renderer = renderer;
  }

  /**
   * Apply a simulation step's visual state to the graph.
   * @param {object} event - BFEvent from BellmanFord history
   * @param {object} dist - Current distance map
   * @param {string} source - Source node id
   */
  applyStep(event, dist, source) {
    const cy = this.renderer.cy;

    // Reset previous edge state classes
    cy.edges().removeClass('active-edge relaxed-edge no-change-edge');

    // Highlight the active edge
    const activeEdge = cy.getElementById(event.edgeId);
    activeEdge.addClass('active-edge');

    // Show result of relaxation
    if (event.relaxed) {
      activeEdge.removeClass('active-edge');
      activeEdge.addClass('relaxed-edge');
      // Mark target node as visited
      cy.getElementById(event.to).addClass('visited');
    } else {
      activeEdge.removeClass('active-edge');
      activeEdge.addClass('no-change-edge');
    }

    // Update distance labels on all nodes
    for (const [nodeId, d] of Object.entries(dist)) {
      this.renderer.setNodeDistLabel(nodeId, d);
    }
  }

  /**
   * Reset all state classes and clear distance labels.
   */
  reset(source) {
    this.renderer.resetAllClasses();
    this.renderer.clearDistLabels();
    if (source) {
      this.renderer.setSource(source, null);
    }
  }

  /**
   * Apply final result state: show min paths and affected/neg-cycle nodes.
   */
  applyFinalState(dist, affectedVertices, cycles, paths, source) {
    const cy = this.renderer.cy;
    cy.edges().removeClass('active-edge relaxed-edge no-change-edge');

    for (const [nodeId, d] of Object.entries(dist)) {
      this.renderer.setNodeDistLabel(nodeId, d);

      if (nodeId === source) {
        cy.getElementById(nodeId).addClass('source');
      } else if (affectedVertices && affectedVertices.has(nodeId)) {
        cy.getElementById(nodeId).addClass('affected');
      } else if (d === Infinity) {
        cy.getElementById(nodeId).addClass('unreachable');
      } else {
        cy.getElementById(nodeId).addClass('visited');
      }
    }

    // Mark cycle edges
    if (cycles) {
      for (const cycle of cycles) {
        for (let i = 0; i < cycle.length - 1; i++) {
          const edgeFound = cy.edges(`[source="${cycle[i]}"][target="${cycle[i + 1]}"]`).first();
          if (edgeFound.length) edgeFound.addClass('neg-cycle-edge');
        }
      }
      cycles.flat().forEach(nodeId => {
        cy.getElementById(nodeId).removeClass('visited affected unreachable').addClass('neg-cycle');
      });
    }
  }

  /**
   * Flash a node briefly with a custom color (CSS animation).
   */
  flashNode(nodeId, type = 'relaxed') {
    const node = this.renderer.cy.getElementById(nodeId);
    if (!node.length) return;
    const cls = type === 'relaxed' ? 'visited' : 'unreachable';
    node.addClass(cls);
    setTimeout(() => {
      if (type !== 'relaxed') node.removeClass(cls);
    }, 600);
  }
}
