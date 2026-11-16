/**
 * negativeCycle.test.js — Tests for negative cycle detection
 */
import { describe, it, expect } from 'vitest';
import { Graph } from '../src/core/Graph.js';
import { runBellmanFord } from '../src/core/BellmanFord.js';
import { detectNegativeCycles } from '../src/core/NegativeCycle.js';

function run(vertices, edges, source) {
  const g = new Graph();
  vertices.forEach(v => g.addVertex(v));
  edges.forEach(([from, to, w]) => g.addEdge(from, to, w));
  const r = runBellmanFord(g, source);
  const nc = detectNegativeCycles(g, r.dist, r.predecessor);
  return { g, r, nc };
}

describe('Detección de ciclos negativos', () => {
  it('sin ciclos negativos', () => {
    const { nc } = run(['A', 'B', 'C'], [['A', 'B', 1], ['B', 'C', 2]], 'A');
    expect(nc.hasNegativeCycle).toBe(false);
    expect(nc.cycles.length).toBe(0);
    expect(nc.affectedVertices.size).toBe(0);
  });

  it('ciclo negativo alcanzable desde el origen', () => {
    // A→B→C→B con B→C→B = -3+2 = -1 (negativo)
    const { nc } = run(
      ['A', 'B', 'C', 'D'],
      [['A', 'B', 1], ['B', 'C', -3], ['C', 'B', 2], ['A', 'D', 5]],
      'A'
    );
    expect(nc.hasNegativeCycle).toBe(true);
    expect(nc.cycles.length).toBeGreaterThan(0);
  });

  it('autociclo negativo', () => {
    const { nc } = run(['A', 'B'], [['A', 'B', 1], ['B', 'B', -1]], 'A');
    expect(nc.hasNegativeCycle).toBe(true);
  });

  it('ciclo negativo desconectado no afecta distancias del origen', () => {
    // Grafo: A→B con X→Y→X ciclo negativo desconectado
    const { r, nc } = run(
      ['A', 'B', 'X', 'Y'],
      [['A', 'B', 3], ['X', 'Y', -2], ['Y', 'X', -2]],
      'A'
    );
    // A y B deben tener distancias válidas
    expect(r.dist['A']).toBe(0);
    expect(r.dist['B']).toBe(3);
    // El ciclo desconectado NO debe invalidar las distancias desde A
    // (X e Y son inalcanzables desde A, así que BF no los alcanza)
    expect(nc.affectedVertices.has('A')).toBe(false);
    expect(nc.affectedVertices.has('B')).toBe(false);
  });

  it('vértices afectados por ciclo negativo son correctamente identificados', () => {
    const { nc } = run(
      ['A', 'B', 'C', 'D'],
      [['A', 'B', 1], ['B', 'C', -3], ['C', 'B', 2], ['C', 'D', 1]],
      'A'
    );
    // D es alcanzable desde el ciclo B→C, debe estar afectado
    expect(nc.affectedVertices.has('D')).toBe(true);
  });

  it('ciclo con peso exactamente cero NO es negativo', () => {
    const { nc } = run(
      ['A', 'B', 'C'],
      [['A', 'B', 1], ['B', 'C', -1], ['C', 'B', 1]],
      'A'
    );
    // B→C→B = -1+1 = 0, no es negativo
    expect(nc.hasNegativeCycle).toBe(false);
  });
});
