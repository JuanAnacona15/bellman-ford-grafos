/**
 * BellmanFord.js — Core Bellman-Ford algorithm implementation
 * Pure algorithmic logic, no UI dependencies.
 */

import { INFINITY } from './constants.js';

/**
 * Run Bellman-Ford from a source vertex.
 *
 * @param {import('./Graph.js').Graph} graph
 * @param {string} source
 * @returns {{
 *   dist: Object.<string, number>,
 *   predecessor: Object.<string, string|null>,
 *   history: BFEvent[],
 *   iterations: number,
 *   successfulRelaxations: number,
 *   edgesExamined: number,
 *   convergedEarly: boolean
 * }}
 */
export function runBellmanFord(graph, source) {
  const vertices = graph.getVertices();
  const edges = graph.getEdges();
  const V = vertices.length;

  // Initialize distances
  const dist = {};
  const predecessor = {};
  for (const v of vertices) {
    dist[v] = INFINITY;
    predecessor[v] = null;
  }
  dist[source] = 0;

  const history = [];
  let successfulRelaxations = 0;
  let edgesExamined = 0;
  let iterations = 0;
  let convergedEarly = false;

  // Main loop: |V| - 1 iterations
  for (let i = 1; i <= V - 1; i++) {
    let updated = false;

    for (const edge of edges) {
      edgesExamined++;
      const { from, to, weight, id } = edge;
      const distBefore = dist[to];
      const distCandidate = dist[from] === INFINITY ? INFINITY : dist[from] + weight;
      const relaxed = distCandidate < distBefore;

      const event = {
        iteration: i,
        edgeId: id,
        from,
        to,
        weight,
        distFrom: dist[from],
        distBefore,
        distCandidate,
        distAfter: relaxed ? distCandidate : distBefore,
        relaxed,
        predBefore: predecessor[to],
        predAfter: relaxed ? from : predecessor[to],
        // snapshot of all distances at this moment
        distSnapshot: { ...dist },
      };

      if (relaxed) {
        dist[to] = distCandidate;
        predecessor[to] = from;
        event.distSnapshot[to] = distCandidate;
        successfulRelaxations++;
        updated = true;
      }

      history.push(event);
    }

    iterations = i;

    // Early termination if no updates
    if (!updated) {
      convergedEarly = true;
      break;
    }
  }

  return {
    dist: { ...dist },
    predecessor: { ...predecessor },
    history,
    iterations,
    successfulRelaxations,
    edgesExamined,
    convergedEarly,
  };
}
