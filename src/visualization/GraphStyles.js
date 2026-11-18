/**
 * GraphStyles.js — Cytoscape.js style definitions — Neon Futuristic Theme
 */

export const STATES = {
  DEFAULT:      'default',
  SOURCE:       'source',
  VISITED:      'visited',
  CURRENT_EDGE: 'currentEdge',
  RELAXED:      'relaxed',
  NO_CHANGE:    'noChange',
  MIN_PATH:     'minPath',
  NEG_CYCLE:    'negCycle',
  UNREACHABLE:  'unreachable',
  AFFECTED:     'affected',
};

export const COLORS = {
  nodeBg:        '#04070f',
  nodeDefault:   '#00d4ff',
  nodeSource:    '#ff6b00',
  nodeVisited:   '#00ff88',
  nodeNegCycle:  '#ff0080',
  nodeAffected:  '#ffe600',
  nodeUnreachable:'#1e3045',
  edgeDefault:   'rgba(0,212,255,0.3)',
  edgeActive:    '#ff6b00',
  edgeRelaxed:   '#00ff88',
  edgeNoChange:  'rgba(30,48,69,0.6)',
  edgePath:      '#00d4ff',
  edgeNegCycle:  '#ff0080',
};

export function getCytoscapeStyles() {
  return [
    // ── DEFAULT NODE ──
    {
      selector: 'node',
      style: {
        'background-color':  '#04070f',
        'border-color':      '#00d4ff',
        'border-width':      2.5,
        'label':             'data(label)',
        'text-valign':       'center',
        'text-halign':       'center',
        'color':             '#00d4ff',
        'font-size':         '13px',
        'font-family':       'Orbitron, Inter, sans-serif',
        'font-weight':       '700',
        'width':             44,
        'height':            44,
        'text-outline-color':'#04070f',
        'text-outline-width': 2,
        'transition-property': 'background-color, border-color, border-width, width, height',
        'transition-duration': '220ms',
        'transition-timing-function': 'ease-out',
      },
    },

    // ── SOURCE ── Blazing orange
    {
      selector: 'node.source',
      style: {
        'border-color':      '#ff6b00',
        'border-width':      4,
        'background-color':  'rgba(255,107,0,0.2)',
        'color':             '#ff6b00',
        'font-weight':       '900',
        'width':  52,
        'height': 52,
        'text-outline-color': '#04070f',
        'text-outline-width': 2.5,
      },
    },

    // ── VISITED ── Neon green
    {
      selector: 'node.visited',
      style: {
        'border-color':     '#00ff88',
        'border-width':     3,
        'background-color': 'rgba(0,255,136,0.12)',
        'color':            '#00ff88',
        'text-outline-color': '#04070f',
        'text-outline-width': 2,
      },
    },

    // ── NEGATIVE CYCLE ── Hot pink / magenta
    {
      selector: 'node.neg-cycle',
      style: {
        'border-color':     '#ff0080',
        'border-width':     4.5,
        'background-color': 'rgba(255,0,128,0.22)',
        'color':            '#ff0080',
        'font-weight':      '900',
        'width':  52,
        'height': 52,
        'text-outline-color': '#04070f',
        'text-outline-width': 2.5,
      },
    },

    // ── AFFECTED ── Electric yellow
    {
      selector: 'node.affected',
      style: {
        'border-color':     '#ffe600',
        'border-width':     3.5,
        'background-color': 'rgba(255,230,0,0.14)',
        'color':            '#ffe600',
        'text-outline-color': '#04070f',
        'text-outline-width': 2,
      },
    },

    // ── UNREACHABLE ── Deep muted blue
    {
      selector: 'node.unreachable',
      style: {
        'border-color':     '#1e3045',
        'background-color': 'rgba(30,48,69,0.3)',
        'color':            '#2a4a66',
        'opacity':          0.5,
      },
    },

    // ── PATH NODE ── Bright cyan (same as default but bigger + glowing)
    {
      selector: 'node.path-node',
      style: {
        'border-color':     '#00d4ff',
        'border-width':     5,
        'background-color': 'rgba(0,212,255,0.18)',
        'color':            '#00d4ff',
        'font-weight':      '900',
        'width':  50,
        'height': 50,
        'text-outline-color': '#04070f',
        'text-outline-width': 2.5,
      },
    },

    // ── SELECTED ──
    {
      selector: 'node:selected',
      style: {
        'border-width': 4.5,
        'border-color': '#ffffff',
        'background-color': 'rgba(255,255,255,0.08)',
      },
    },

    // ── DIST LABEL ──
    {
      selector: 'node[distLabel]',
      style: {
        'content':    (ele) => `${ele.data('label')}\n${ele.data('distLabel')}`,
        'text-wrap':  'wrap',
        'font-size':  '11px',
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
        'width':                2,
        'line-color':           'rgba(0,212,255,0.28)',
        'target-arrow-color':   'rgba(0,212,255,0.28)',
        'target-arrow-shape':   'triangle',
        'arrow-scale':          1.3,
        'curve-style':          'bezier',
        'label':                'data(label)',
        'font-size':            '11px',
        'font-family':          'JetBrains Mono, monospace',
        'font-weight':          '700',
        'color':                'rgba(0,212,255,0.7)',
        'text-background-color':   '#04070f',
        'text-background-opacity': 1,
        'text-background-padding': '2px',
        'text-background-shape':   'roundrectangle',
        'text-margin-y':        -9,
        'transition-property':  'line-color, target-arrow-color, width, opacity',
        'transition-duration':  '200ms',
        'transition-timing-function': 'ease-out',
      },
    },

    // ── ACTIVE EDGE — blazing orange ──
    {
      selector: 'edge.active-edge',
      style: {
        'line-color':         '#ff6b00',
        'target-arrow-color': '#ff6b00',
        'width':     5,
        'color':     '#ff6b00',
        'font-weight': '800',
        'font-size': '12px',
        'z-index':   999,
        'text-background-color': '#04070f',
      },
    },

    // ── RELAXED EDGE — neon green ──
    {
      selector: 'edge.relaxed-edge',
      style: {
        'line-color':         '#00ff88',
        'target-arrow-color': '#00ff88',
        'width':     4.5,
        'color':     '#00ff88',
        'font-weight': '800',
        'z-index':   998,
        'text-background-color': '#04070f',
      },
    },

    // ── NO-CHANGE EDGE — very dim ──
    {
      selector: 'edge.no-change-edge',
      style: {
        'line-color':         'rgba(0,212,255,0.08)',
        'target-arrow-color': 'rgba(0,212,255,0.08)',
        'width':   1.5,
        'color':   'rgba(0,212,255,0.25)',
        'opacity': 0.5,
      },
    },

    // ── PATH EDGE — bright cyan ──
    {
      selector: 'edge.path-edge',
      style: {
        'line-color':         '#00d4ff',
        'target-arrow-color': '#00d4ff',
        'width':     5,
        'color':     '#00d4ff',
        'font-weight': '800',
        'z-index':   997,
        'text-background-color': '#04070f',
      },
    },

    // ── NEG CYCLE EDGE — hot pink ──
    {
      selector: 'edge.neg-cycle-edge',
      style: {
        'line-color':         '#ff0080',
        'target-arrow-color': '#ff0080',
        'width':     5,
        'color':     '#ff0080',
        'font-weight': '800',
        'z-index':   999,
        'text-background-color': '#04070f',
      },
    },

    // ── PARALLEL EDGES ──
    {
      selector: 'edge.parallel',
      style: {
        'curve-style':              'unbundled-bezier',
        'control-point-distances':  [50],
        'control-point-weights':    [0.5],
      },
    },

    // ── SELF LOOPS ──
    {
      selector: 'edge[source = target]',
      style: {
        'curve-style':    'loop',
        'loop-direction': '0deg',
        'loop-sweep':     '45deg',
      },
    },
  ];
}
