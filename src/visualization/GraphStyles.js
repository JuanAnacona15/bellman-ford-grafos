/**
 * GraphStyles.js — Cytoscape.js style definitions for all node/edge states
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
  nodeBg: '#1f2937',
  nodeDefault: '#58a6ff',
  nodeSource: '#f78166',
  nodeVisited: '#3fb950',
  nodeNegCycle: '#f85149',
  nodeAffected: '#d29922',
  nodeUnreachable: '#6e7681',
  edgeDefault: 'rgba(88, 166, 255, 0.4)',
  edgeActive: '#ffa657',
  edgeRelaxed: '#3fb950',
  edgeNoChange: '#6e7681',
  edgePath: '#58a6ff',
  edgeNegCycle: '#f85149',
  labelBg: 'rgba(13, 17, 23, 0.85)',
};

/**
 * Returns the full Cytoscape stylesheet array.
 */
export function getCytoscapeStyles() {
  return [
    // === NODES ===
    {
      selector: 'node',
      style: {
        'background-color': COLORS.nodeBg,
        'border-color': COLORS.nodeDefault,
        'border-width': 2.5,
        'label': 'data(label)',
        'text-valign': 'center',
        'text-halign': 'center',
        'color': '#e6edf3',
        'font-size': '13px',
        'font-family': 'Inter, sans-serif',
        'font-weight': '600',
        'width': 42,
        'height': 42,
        'transition-property': 'background-color, border-color, border-width',
        'transition-duration': '300ms',
        'transition-timing-function': 'ease',
      },
    },
    {
      selector: 'node[distLabel]',
      style: {
        'content': (ele) => `${ele.data('label')}\n${ele.data('distLabel')}`,
        'text-wrap': 'wrap',
        'font-size': '11px',
        'line-height': '1.4',
      },
    },
    {
      selector: 'node.source',
      style: {
        'border-color': COLORS.nodeSource,
        'border-width': 3.5,
        'background-color': 'rgba(247, 129, 102, 0.2)',
      },
    },
    {
      selector: 'node.visited',
      style: {
        'border-color': COLORS.nodeVisited,
        'background-color': 'rgba(63, 185, 80, 0.15)',
      },
    },
    {
      selector: 'node.neg-cycle',
      style: {
        'border-color': COLORS.nodeNegCycle,
        'border-width': 3.5,
        'background-color': 'rgba(248, 81, 73, 0.2)',
      },
    },
    {
      selector: 'node.affected',
      style: {
        'border-color': COLORS.nodeAffected,
        'background-color': 'rgba(210, 153, 34, 0.15)',
      },
    },
    {
      selector: 'node.unreachable',
      style: {
        'border-color': COLORS.nodeUnreachable,
        'opacity': 0.6,
      },
    },
    {
      selector: 'node.path-node',
      style: {
        'border-color': COLORS.edgePath,
        'border-width': 3.5,
        'background-color': 'rgba(88, 166, 255, 0.2)',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': 3.5,
        'border-color': '#fff',
      },
    },

    // === EDGES ===
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': COLORS.edgeDefault,
        'target-arrow-color': COLORS.edgeDefault,
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.2,
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '11px',
        'font-family': 'Inter, sans-serif',
        'font-weight': '600',
        'color': '#e6edf3',
        'text-background-color': 'rgba(13, 17, 23, 0.85)',
        'text-background-opacity': 1,
        'text-background-padding': '2px',
        'text-background-shape': 'roundrectangle',
        'text-margin-y': -8,
        'transition-property': 'line-color, target-arrow-color, width',
        'transition-duration': '300ms',
      },
    },
    {
      selector: 'edge.active-edge',
      style: {
        'line-color': COLORS.edgeActive,
        'target-arrow-color': COLORS.edgeActive,
        'width': 3.5,
      },
    },
    {
      selector: 'edge.relaxed-edge',
      style: {
        'line-color': COLORS.edgeRelaxed,
        'target-arrow-color': COLORS.edgeRelaxed,
        'width': 3,
      },
    },
    {
      selector: 'edge.no-change-edge',
      style: {
        'line-color': COLORS.edgeNoChange,
        'target-arrow-color': COLORS.edgeNoChange,
      },
    },
    {
      selector: 'edge.path-edge',
      style: {
        'line-color': COLORS.edgePath,
        'target-arrow-color': COLORS.edgePath,
        'width': 3,
      },
    },
    {
      selector: 'edge.neg-cycle-edge',
      style: {
        'line-color': COLORS.nodeNegCycle,
        'target-arrow-color': COLORS.nodeNegCycle,
        'width': 3.5,
      },
    },

    // Parallel (self-loop) edges
    {
      selector: 'edge.parallel',
      style: { 'curve-style': 'unbundled-bezier', 'control-point-distances': [40], 'control-point-weights': [0.5] },
    },
    {
      selector: 'edge[source = target]',
      style: { 'curve-style': 'loop', 'loop-direction': '0deg', 'loop-sweep': '45deg' },
    },
  ];
}
