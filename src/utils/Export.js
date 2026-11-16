/**
 * Export.js — Export graph data and results in multiple formats
 */

/** Export graph as JSON string. */
export function exportGraphJSON(graph) {
  return JSON.stringify(graph.toJSON(), null, 2);
}

/** Export results as JSON. */
export function exportResultsJSON(result, negCycleResult, allPaths, graphJSON) {
  const data = {
    graph: graphJSON,
    result: {
      dist: serializeDist(result.dist),
      iterations: result.iterations,
      successfulRelaxations: result.successfulRelaxations,
      edgesExamined: result.edgesExamined,
      executionTimeMs: result.executionTimeMs,
      convergedEarly: result.convergedEarly,
    },
    negativeCycles: {
      detected: negCycleResult.hasNegativeCycle,
      cycles: negCycleResult.cycles,
      affectedVertices: [...(negCycleResult.affectedVertices || [])],
    },
    paths: Object.fromEntries(
      Object.entries(allPaths).map(([v, p]) => [v, {
        path: p.path,
        exists: p.exists,
        totalWeight: p.totalWeight === Infinity ? 'Infinity' : p.totalWeight === -Infinity ? '-Infinity' : p.totalWeight,
        affectedByNegCycle: p.affectedByNegCycle,
      }])
    ),
  };
  return JSON.stringify(data, null, 2);
}

/** Export distances as CSV. */
export function exportDistancesCSV(result, allPaths) {
  const rows = [['Vértice', 'Distancia', 'Camino mínimo']];
  for (const [v, d] of Object.entries(result.dist)) {
    const pathInfo = allPaths[v];
    const dist = d === Infinity ? '∞' : d === -Infinity ? '-∞' : String(d);
    const path = pathInfo?.path?.join(' → ') || (pathInfo?.affectedByNegCycle ? '-∞ (ciclo negativo)' : '—');
    rows.push([v, dist, path]);
  }
  return rows.map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
}

/** Export iteration history as CSV. */
export function exportHistoryCSV(history) {
  const rows = [['Iteración', 'Arista', 'Desde', 'Hacia', 'Peso', 'Dist anterior', 'Dist candidata', 'Dist nueva', 'Relajación']];
  for (const e of history) {
    rows.push([
      e.iteration,
      e.edgeId,
      e.from,
      e.to,
      e.weight,
      e.distBefore === Infinity ? '∞' : e.distBefore,
      e.distCandidate === Infinity ? '∞' : e.distCandidate,
      e.distAfter === Infinity ? '∞' : e.distAfter,
      e.relaxed ? 'Sí' : 'No',
    ]);
  }
  return rows.map(r => r.join(',')).join('\n');
}

/** Download a text file. */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function serializeDist(dist) {
  const out = {};
  for (const [k, v] of Object.entries(dist)) {
    out[k] = v === Infinity ? 'Infinity' : v === -Infinity ? '-Infinity' : v;
  }
  return out;
}
