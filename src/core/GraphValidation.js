/**
 * GraphValidation.js — Input and graph structure validation
 */

export const ValidationErrors = {
  EMPTY_GRAPH: 'El grafo no tiene vértices.',
  NO_SOURCE: 'No se ha seleccionado un vértice de origen.',
  SOURCE_NOT_FOUND: 'El vértice de origen no existe en el grafo.',
  INVALID_WEIGHT: (edgeId) => `La arista ${edgeId} tiene un peso inválido (NaN o Infinity).`,
  INVALID_EDGE: (edgeId) => `La arista ${edgeId} referencia vértices inexistentes.`,
  DUPLICATE_VERTEX: (id) => `El identificador "${id}" ya existe.`,
  EMPTY_ID: 'El identificador no puede estar vacío.',
};

/**
 * Validate the entire graph before running Bellman-Ford.
 * @param {import('./Graph.js').Graph} graph
 * @param {string} source
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateGraph(graph, source) {
  const errors = [];

  if (graph.getVertexCount() === 0) {
    errors.push(ValidationErrors.EMPTY_GRAPH);
    return { valid: false, errors };
  }

  if (!source || source.trim() === '') {
    errors.push(ValidationErrors.NO_SOURCE);
  } else if (!graph.hasVertex(source)) {
    errors.push(ValidationErrors.SOURCE_NOT_FOUND);
  }

  for (const edge of graph.getEdges()) {
    if (!graph.hasVertex(edge.from) || !graph.hasVertex(edge.to)) {
      errors.push(ValidationErrors.INVALID_EDGE(edge.id));
    }
    if (!isFinite(edge.weight) || isNaN(edge.weight)) {
      errors.push(ValidationErrors.INVALID_WEIGHT(edge.id));
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a vertex identifier string.
 * @param {string} id
 * @param {Set<string>} existing
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateVertexId(id, existing) {
  if (!id || id.trim() === '') return { valid: false, error: ValidationErrors.EMPTY_ID };
  if (existing.has(id.trim())) return { valid: false, error: ValidationErrors.DUPLICATE_VERTEX(id.trim()) };
  return { valid: true };
}

/**
 * Validate a weight string input.
 * @param {string} weightStr
 * @returns {{ valid: boolean, value?: number, error?: string }}
 */
export function validateWeight(weightStr) {
  const val = Number(weightStr);
  if (weightStr === '' || weightStr === null || weightStr === undefined) {
    return { valid: false, error: 'El peso no puede estar vacío.' };
  }
  if (isNaN(val)) return { valid: false, error: 'El peso debe ser un número.' };
  if (!isFinite(val)) return { valid: false, error: 'El peso debe ser finito.' };
  return { valid: true, value: val };
}
