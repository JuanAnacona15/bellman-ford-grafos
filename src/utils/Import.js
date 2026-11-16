/**
 * Import.js — Import graph data from JSON or CSV
 */
import { Graph } from '../core/Graph.js';
import { validateGraph } from '../core/GraphValidation.js';

/**
 * Parse a JSON string into a Graph instance.
 * @param {string} jsonStr
 * @returns {{ graph: Graph, source: string|null, error?: string }}
 */
export function importGraphJSON(jsonStr) {
  try {
    const obj = JSON.parse(jsonStr);

    // Support two formats: raw graph JSON or full results export
    const graphData = obj.graph ?? obj;

    if (!graphData.vertices || !Array.isArray(graphData.vertices)) {
      return { graph: null, source: null, error: 'JSON inválido: falta la propiedad "vertices".' };
    }

    const graph = Graph.fromJSON(graphData);
    const source = obj.source ?? null;
    return { graph, source };
  } catch (e) {
    return { graph: null, source: null, error: `Error al parsear JSON: ${e.message}` };
  }
}

/**
 * Parse a CSV edge list.
 * Expected format: from,to,weight (one edge per line, optional header)
 * @param {string} csvStr
 * @returns {{ graph: Graph, error?: string }}
 */
export function importGraphCSV(csvStr) {
  try {
    const lines = csvStr.trim().split('\n').map(l => l.trim()).filter(Boolean);
    const graph = new Graph();
    let startLine = 0;

    // Skip header if present
    if (lines[0] && isNaN(parseFloat(lines[0].split(',')[2]))) {
      startLine = 1;
    }

    for (let i = startLine; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 3) continue;
      const [from, to, weightStr] = parts;
      const weight = parseFloat(weightStr);
      if (isNaN(weight)) continue;
      graph.addVertex(from);
      graph.addVertex(to);
      graph.addEdge(from, to, weight);
    }

    if (graph.getVertexCount() === 0) {
      return { graph: null, error: 'CSV vacío o sin aristas válidas.' };
    }

    return { graph };
  } catch (e) {
    return { graph: null, error: `Error al parsear CSV: ${e.message}` };
  }
}

/**
 * Read a File object and return its content as a string.
 * @param {File} file
 * @returns {Promise<string>}
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
