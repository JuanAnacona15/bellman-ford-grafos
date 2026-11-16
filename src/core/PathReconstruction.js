/**
 * PathReconstruction.js — Reconstructs shortest paths from BF predecessor array
 */
import { INFINITY } from './constants.js';

/**
 * Reconstruct the shortest path from source to target.
 *
 * @param {Object.<string, string|null>} predecessor
 * @param {string} source
 * @param {string} target
 * @param {Object.<string, number>} dist
 * @param {Set<string>} affectedByNegCycle
 * @returns {{
 *   path: string[],
 *   exists: boolean,
 *   affectedByNegCycle: boolean,
 *   totalWeight: number
 * }}
 */
export function reconstructPath(predecessor, source, target, dist, affectedByNegCycle = new Set()) {
  if (affectedByNegCycle.has(target) && target !== source) {
    return { path: [], exists: false, affectedByNegCycle: true, totalWeight: -Infinity };
  }

  if (dist[target] === INFINITY) {
    return { path: [], exists: false, affectedByNegCycle: false, totalWeight: Infinity };
  }

  if (target === source) {
    return { path: [source], exists: true, affectedByNegCycle: false, totalWeight: 0 };
  }

  const path = [];
  const visited = new Set();
  let cur = target;

  while (cur !== null && cur !== undefined) {
    if (visited.has(cur)) {
      // Cycle detected during reconstruction — shouldn't happen with valid BF output
      return { path: [], exists: false, affectedByNegCycle: true, totalWeight: -Infinity };
    }
    visited.add(cur);
    path.push(cur);
    cur = predecessor[cur];
  }

  path.reverse();

  if (path[0] !== source) {
    return { path: [], exists: false, affectedByNegCycle: false, totalWeight: Infinity };
  }

  return {
    path,
    exists: true,
    affectedByNegCycle: false,
    totalWeight: dist[target],
  };
}

/**
 * Reconstruct all shortest paths from source.
 *
 * @param {Object.<string, string|null>} predecessor
 * @param {string} source
 * @param {string[]} vertices
 * @param {Object.<string, number>} dist
 * @param {Set<string>} affectedByNegCycle
 * @returns {Object.<string, ReturnType<reconstructPath>>}
 */
export function reconstructAllPaths(predecessor, source, vertices, dist, affectedByNegCycle = new Set()) {
  const result = {};
  for (const v of vertices) {
    result[v] = reconstructPath(predecessor, source, v, dist, affectedByNegCycle);
  }
  return result;
}
