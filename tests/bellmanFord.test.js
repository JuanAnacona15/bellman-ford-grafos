/**
 * bellmanFord.test.js — Unit tests for the BF algorithm
 */
import { describe, it, expect } from 'vitest';
import { Graph } from '../src/core/Graph.js';
import { runBellmanFord } from '../src/core/BellmanFord.js';

function makeGraph(vertices, edges) {
  const g = new Graph();
  vertices.forEach(v => g.addVertex(v));
  edges.forEach(([from, to, weight]) => g.addEdge(from, to, weight));
  return g;
}

describe('Bellman-Ford — casos básicos', () => {
  it('grafo con pesos positivos', () => {
    const g = makeGraph(['A', 'B', 'C', 'D'], [
      ['A', 'B', 4], ['A', 'C', 2], ['C', 'B', -1], ['B', 'D', 3],
    ]);
    const r = runBellmanFord(g, 'A');
    expect(r.dist['A']).toBe(0);
    expect(r.dist['C']).toBe(2);
    expect(r.dist['B']).toBe(1); // A→C→B = 2 + (-1) = 1
    expect(r.dist['D']).toBe(4); // A→C→B→D = 1 + 3 = 4
  });

  it('grafo con un único vértice', () => {
    const g = makeGraph(['A'], []);
    const r = runBellmanFord(g, 'A');
    expect(r.dist['A']).toBe(0);
    expect(r.iterations).toBe(0);
  });

  it('vértice de origen igual a destino', () => {
    const g = makeGraph(['A', 'B'], [['A', 'B', 5]]);
    const r = runBellmanFord(g, 'A');
    expect(r.dist['A']).toBe(0);
  });

  it('vértices inalcanzables quedan en Infinity', () => {
    const g = makeGraph(['A', 'B', 'C'], [['A', 'B', 3]]);
    const r = runBellmanFord(g, 'A');
    expect(r.dist['C']).toBe(Infinity);
  });

  it('grafo sin aristas', () => {
    const g = makeGraph(['A', 'B', 'C'], []);
    const r = runBellmanFord(g, 'A');
    expect(r.dist['A']).toBe(0);
    expect(r.dist['B']).toBe(Infinity);
    expect(r.dist['C']).toBe(Infinity);
  });

  it('pesos negativos sin ciclo negativo', () => {
    const g = makeGraph(['S', 'A', 'B', 'T'], [
      ['S', 'A', 4], ['S', 'B', 5], ['A', 'T', -6], ['B', 'T', 2],
    ]);
    const r = runBellmanFord(g, 'S');
    expect(r.dist['T']).toBe(-2); // S→A→T = 4 + (-6) = -2
  });

  it('terminación anticipada si no hay actualizaciones', () => {
    // Con 4 vértices (|V|-1 = 3 iteraciones), A→B resuelve en la iter 1.
    // La iter 2 no produce cambios → convergedEarly = true, iterations = 2 < 3
    const g = makeGraph(['A', 'B', 'C', 'D'], [['A', 'B', 3]]);
    const r = runBellmanFord(g, 'A');
    expect(r.convergedEarly).toBe(true);
    expect(r.iterations).toBeLessThan(g.getVertexCount() - 1);
  });

  it('aristas paralelas — elige la más corta', () => {
    const g = makeGraph(['A', 'B'], [['A', 'B', 10], ['A', 'B', 3]]);
    const r = runBellmanFord(g, 'A');
    expect(r.dist['B']).toBe(3);
  });

  it('autociclo positivo — no afecta distancias', () => {
    const g = makeGraph(['A', 'B'], [['A', 'A', 5], ['A', 'B', 2]]);
    const r = runBellmanFord(g, 'A');
    expect(r.dist['A']).toBe(0);
    expect(r.dist['B']).toBe(2);
  });

  it('peso cero', () => {
    const g = makeGraph(['A', 'B', 'C'], [['A', 'B', 0], ['B', 'C', 0]]);
    const r = runBellmanFord(g, 'A');
    expect(r.dist['B']).toBe(0);
    expect(r.dist['C']).toBe(0);
  });

  it('predecessor correcto para reconstrucción', () => {
    const g = makeGraph(['A', 'B', 'C'], [['A', 'B', 1], ['B', 'C', 2], ['A', 'C', 10]]);
    const r = runBellmanFord(g, 'A');
    expect(r.predecessor['B']).toBe('A');
    expect(r.predecessor['C']).toBe('B'); // A→B→C = 3, mejor que A→C = 10
  });

  it('historial de eventos contiene todos los pasos', () => {
    const g = makeGraph(['A', 'B'], [['A', 'B', 5]]);
    const r = runBellmanFord(g, 'A');
    // 1 iteración × 1 arista = 1 evento mínimo
    expect(r.history.length).toBeGreaterThanOrEqual(1);
    expect(r.history[0]).toHaveProperty('edgeId');
    expect(r.history[0]).toHaveProperty('relaxed');
    expect(r.history[0]).toHaveProperty('distSnapshot');
  });
});

describe('Bellman-Ford — grafo desconectado', () => {
  it('componentes no alcanzados se mantienen en Infinity', () => {
    const g = makeGraph(['A', 'B', 'X', 'Y'], [
      ['A', 'B', 3], ['X', 'Y', 1],
    ]);
    const r = runBellmanFord(g, 'A');
    expect(r.dist['A']).toBe(0);
    expect(r.dist['B']).toBe(3);
    expect(r.dist['X']).toBe(Infinity);
    expect(r.dist['Y']).toBe(Infinity);
  });
});
