/**
 * GraphStyles.js — Cytoscape.js style definitions for all node/edge states
 * Uses vivid neon-accented colors for simulation steps.
 */

export const STATES = {
  DEFAULT: 'default',
  SOURCE: 'source',
  VISITED: 'visited',
  CURRENT_EDGE: 'currentEdge',
  RELAXED: 'relaxed',
  NO_CHANGE: 'noChange',
  MIN_PATH: 'minPath',
  NEG_CYCLE: 'negCycle',
  UNREACHABLE: 'unreachable',
  AFFECTED: 'affected',
};

export const COLORS = {
  nodeBg: '#0d1117',
  nodeDefault: '#58a6ff',
  nodeSource: '#ff6b6b',
  nodeVisited: '#00ff88',
  nodeNegCycle: '#ff3333',
  nodeAffected: '#ffcc00',
  nodeUnreachable: '#4a5568',
  edgeDefault: 'rgba(88, 166, 255, 0.35)',
  edgeActive: '#ff9500',
  edgeRelaxed: '#00ff88',
  edgeNoChange: '#4a5568',
  edgePath: '#00cfff',
  edgeNegCycle: '#ff3333',
};

export function getCytoscapeStyles() {
  return [
    // ── DEFAULT NODE ──
    {
      selector: 'node',
      style: {
        'background-color': '#0d1117',
        'border-color': '#3d5a80',
        'border-width': 2.5,
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#e6edf3',
        'font-size': '13px',
        'font-family': 'Inter, sans-serif',
        'font-weight': '700',
        'width': 44,
        'height': 44,
        'transition-property': 'background-color, border-color, border-width, width, height',
        'transition-duration': '250ms',
        'transition-timing-function': 'ease-out',
      },
    },

    // ── SOURCE ── Bright coral with thick glow border
    {
      selector: 'node.source',
      style: {
        'border-color': '#ff6b6b',
        'border-width': 4,
        'background-color': 'rgba(255, 107, 107, 0.22)',
        'color': '#fff',
        'font-weight': '800',
        'width': 50,
        'height': 50,
      },
    },

    // ── VISITED ── Neon green
    {
      selector: 'node.visited',
      style: {
        'border-color': '#00ff88',
        'border-width': 3,
        'background-color': 'rgba(0, 255, 136, 0.15)',
        'color': '#00ff88',
      },
    },

    // ── NEGATIVE CYCLE ── Bright red with pulse
    {
      selector: 'node.neg-cycle',
      style: {
        'border-color': '#ff3333',
        'border-width': 4.5,
        'background-color': 'rgba(255, 51, 51, 0.25)',
        'color': '#ff3333',
        'font-weight': '800',
        'width': 50,
        'height': 50,
      },
    },

    // ── AFFECTED by neg cycle ── Vivid amber
    {
      selector: 'node.affected',
      style: {
        'border-color': '#ffcc00',
        'border-width': 3.5,
        'background-color': 'rgba(255, 204, 0, 0.18)',
        'color': '#ffcc00',
      },
    },

    // ── UNREACHABLE ── Muted
    {
      selector: 'node.unreachable',
      style: {
        'border-color': '#4a5568',
        'background-color': 'rgba(74, 85, 104, 0.1)',
        'color': '#4a5568',
        'opacity': 0.55,
      },
    },

    // ── PATH NODE ── Cyan highlight
    {
      selector: 'node.path-node',
      style: {
        'border-color': '#00cfff',
        'border-width': 4,
        'background-color': 'rgba(0, 207, 255, 0.2)',
        'color': '#00cfff',
        'font-weight': '800',
      },
    },

    // ── SELECTED ──
    {
      selector: 'node:selected',
      style: {
        'border-width': 4,
        'border-color': '#fff',
      },
    },

    // ── DIST LABEL variant (shown during simulation) ──
    {
      selector: 'node[distLabel]',
      style: {
        'content': (ele) => `${ele.data('label')}\n${ele.data('distLabel')}`,
        'text-wrap': 'wrap',
        'font-size': '11px',
        'line-height': '1.5',
      },
    },

    // ══════════════════════════════
    // EDGES
    // ══════════════════════════════

    // ── DEFAULT EDGE ──
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': 'rgba(88, 166, 255, 0.35)',
        'target-arrow-color': 'rgba(88, 166, 255, 0.35)',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.3,
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '11px',
        'font-family': 'Inter, sans-serif',
        'font-weight': '700',
        'color': '#c9d1d9',
        'text-background-color': '#161b22',
        'text-background-opacity': 1,
        'text-background-padding': '2px',
        'text-background-shape': 'roundrectangle',
        'text-margin-y': -9,
        'transition-property': 'line-color, target-arrow-color, width, opacity',
        'transition-duration': '200ms',
        'transition-timing-function': 'ease-out',
      },
    },

    // ── ACTIVE EDGE being evaluated — blazing orange ──
    {
      selector: 'edge.active-edge',
      style: {
        'line-color': '#ff9500',
        'target-arrow-color': '#ff9500',
        'width': 4.5,
        'color': '#ff9500',
        'font-weight': '800',
        'font-size': '12px',
        'z-index': 999,
      },
    },

    // ── RELAXED EDGE — neon green ──
    {
      selector: 'edge.relaxed-edge',
      style: {
        'line-color': '#00ff88',
        'target-arrow-color': '#00ff88',
        'width': 4,
        'color': '#00ff88',
        'font-weight': '800',
        'z-index': 998,
      },
    },

    // ── NO-CHANGE EDGE — dim gray ──
    {
      selector: 'edge.no-change-edge',
      style: {
        'line-color': '#3d4452',
        'target-arrow-color': '#3d4452',
        'width': 1.5,
        'opacity': 0.5,
      },
    },

    // ── PATH EDGE — bright cyan ──
    {
      selector: 'edge.path-edge',
      style: {
        'line-color': '#00cfff',
        'target-arrow-color': '#00cfff',
        'width': 4,
        'color': '#00cfff',
        'font-weight': '800',
        'z-index': 997,
      },
    },

    // ── NEG CYCLE EDGE — bright red ──
    {
      selector: 'edge.neg-cycle-edge',
      style: {
        'line-color': '#ff3333',
        'target-arrow-color': '#ff3333',
        'width': 4.5,
        'color': '#ff3333',
        'font-weight': '800',
        'z-index': 999,
      },
    },

    // ── PARALLEL EDGES ──
    {
      selector: 'edge.parallel',
      style: {
        'curve-style': 'unbundled-bezier',
        'control-point-distances': [50],
        'control-point-weights': [0.5],
      },
    },

    // ── SELF LOOPS ──
    {
      selector: 'edge[source = target]',
      style: {
        'curve-style': 'loop',
        'loop-direction': '0deg',
        'loop-sweep': '45deg',
      },
    },
  ];
}
