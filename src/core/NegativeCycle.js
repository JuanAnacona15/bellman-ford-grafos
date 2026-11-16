/**
 * NegativeCycle.js — Detection, identification, and propagation of negative cycles
 */
import { INFINITY, NEG_INFINITY } from './constants.js';

/**
 * Detect negative cycles reachable from the source.
 *
 * @param {import('./Graph.js').Graph} graph
 * @param {Object.<string, number>} dist - Final distances from BF
 * @param {Object.<string, string|null>} predecessor
 * @returns {{
 *   hasNegativeCycle: boolean,
 *   cycles: string[][],
 *   affectedVertices: Set<string>,
 *   cycleEdges: string[]
 * }}
 */
export function detectNegativeCycles(graph, dist, predecessor) {
  const vertices = graph.getVertices();
  const edges = graph.getEdges();

  // Work with mutable copies
  const d = { ...dist };
  const pred = { ...predecessor };

  const cycleStartVertices = new Set();
  const updatedPred = { ...predecessor };

  // Extra relaxation pass — find vertices still reducible
  for (const edge of edges) {
    const { from, to, weight } = edge;
    if (d[from] !== INFINITY && d[from] + weight < d[to]) {
      cycleStartVertices.add(to);
      updatedPred[to] = from;
      d[to] = d[from] + weight; // allow further propagation
    }
  }

  if (cycleStartVertices.size === 0) {
    return { hasNegativeCycle: false, cycles: [], affectedVertices: new Set(), cycleEdges: [] };
  }

  // For each cycle start vertex, trace back |V| steps to enter the cycle
  const cycles = [];
  const visitedCycleNodes = new Set();
  const V = vertices.length;

  for (const start of cycleStartVertices) {
    if (visitedCycleNodes.has(start)) continue;

    // Walk back V steps to ensure we're inside the cycle
    let v = start;
    for (let i = 0; i < V; i++) {
      v = updatedPred[v] ?? v;
    }

    // Now collect the cycle
    const cycle = [];
    let cur = v;
    const cycleSet = new Set();

    do {
      if (cycleSet.has(cur)) break; // avoid infinite loops with complex structures
      cycleSet.add(cur);
      cycle.push(cur);
      cur = updatedPred[cur] ?? cur;
    } while (cur !== v && cycle.length <= V);

    cycle.push(v); // close the cycle
    cycle.reverse();

    // Verify negative total weight
    let totalWeight = 0;
    for (let i = 0; i < cycle.length - 1; i++) {
      const edgeFound = edges.find(e => e.from === cycle[i] && e.to === cycle[i + 1]);
      if (edgeFound) totalWeight += edgeFound.weight;
    }

    if (totalWeight < 0 && cycle.length > 1) {
      cycles.push(cycle);
      cycle.forEach(node => visitedCycleNodes.add(node));
    }
  }

  // BFS/DFS to find all vertices reachable from cycle nodes
  const affectedVertices = new Set();
  const adjacency = buildAdjacency(edges);
  const queue = [...visitedCycleNodes];
  while (queue.length > 0) {
    const node = queue.shift();
    if (affectedVertices.has(node)) continue;
    affectedVertices.add(node);
    (adjacency[node] || []).forEach(neighbor => {
      if (!affectedVertices.has(neighbor)) queue.push(neighbor);
    });
  }

  // Collect edge IDs in the cycles
  const cycleEdges = [];
  for (const cycle of cycles) {
    for (let i = 0; i < cycle.length - 1; i++) {
      const edgeFound = edges.find(e => e.from === cycle[i] && e.to === cycle[i + 1]);
      if (edgeFound && !cycleEdges.includes(edgeFound.id)) {
        cycleEdges.push(edgeFound.id);
      }
    }
  }

  return {
    hasNegativeCycle: cycles.length > 0,
    cycles,
    affectedVertices,
    cycleEdges,
  };
}

function buildAdjacency(edges) {
  const adj = {};
  for (const e of edges) {
    if (!adj[e.from]) adj[e.from] = [];
    adj[e.from].push(e.to);
  }
  return adj;
}
