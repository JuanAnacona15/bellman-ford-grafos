/**
 * pathReconstruction.test.js — Tests for path reconstruction
 */
import { describe, it, expect } from 'vitest';
import { Graph } from '../src/core/Graph.js';
import { runBellmanFord } from '../src/core/BellmanFord.js';
import { reconstructPath, reconstructAllPaths } from '../src/core/PathReconstruction.js';

function setup(vertices, edges, source) {
  const g = new Graph();
  vertices.forEach(v => g.addVertex(v));
  edges.forEach(([from, to, w]) => g.addEdge(from, to, w));
  const r = runBellmanFord(g, source);
  return { g, r };
}

describe('Reconstrucción de caminos mínimos', () => {
  it('camino del origen a sí mismo', () => {
    const { r } = setup(['A', 'B'], [['A', 'B', 3]], 'A');
    const p = reconstructPath(r.predecessor, 'A', 'A', r.dist);
    expect(p.exists).toBe(true);
    expect(p.path).toEqual(['A']);
    expect(p.totalWeight).toBe(0);
  });

  it('camino simple A→B', () => {
    const { r } = setup(['A', 'B'], [['A', 'B', 5]], 'A');
    const p = reconstructPath(r.predecessor, 'A', 'B', r.dist);
    expect(p.exists).toBe(true);
    expect(p.path).toEqual(['A', 'B']);
    expect(p.totalWeight).toBe(5);
  });

  it('camino óptimo en grafo con alternativas', () => {
    const { r } = setup(
      ['A', 'B', 'C'],
      [['A', 'B', 10], ['A', 'C', 2], ['C', 'B', 1]],
      'A'
    );
    const p = reconstructPath(r.predecessor, 'A', 'B', r.dist);
    expect(p.path).toEqual(['A', 'C', 'B']);
    expect(p.totalWeight).toBe(3);
  });

  it('vértice inalcanzable', () => {
    const { r } = setup(['A', 'B', 'C'], [['A', 'B', 3]], 'A');
    const p = reconstructPath(r.predecessor, 'A', 'C', r.dist);
    expect(p.exists).toBe(false);
    expect(p.path).toHaveLength(0);
  });

  it('vértice afectado por ciclo negativo', () => {
    const p = reconstructPath({}, 'A', 'B', { A: 0, B: -Infinity }, new Set(['B']));
    expect(p.exists).toBe(false);
    expect(p.affectedByNegCycle).toBe(true);
  });

  it('reconstructAllPaths retorna un resultado para cada vértice', () => {
    const { r, g } = setup(['A', 'B', 'C'], [['A', 'B', 2], ['B', 'C', 3]], 'A');
    const all = reconstructAllPaths(r.predecessor, 'A', g.getVertices(), r.dist);
    expect(Object.keys(all).length).toBe(3);
    expect(all['C'].path).toEqual(['A', 'B', 'C']);
  });
});
