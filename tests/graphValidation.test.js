/**
 * graphValidation.test.js — Tests for graph validation
 */
import { describe, it, expect } from 'vitest';
import { Graph } from '../src/core/Graph.js';
import { validateGraph, validateVertexId, validateWeight } from '../src/core/GraphValidation.js';

describe('validateGraph', () => {
  it('rechaza grafo vacío', () => {
    const g = new Graph();
    const r = validateGraph(g, 'A');
    expect(r.valid).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
  });

  it('rechaza origen vacío', () => {
    const g = new Graph(); g.addVertex('A');
    const r = validateGraph(g, '');
    expect(r.valid).toBe(false);
  });

  it('rechaza origen inexistente', () => {
    const g = new Graph(); g.addVertex('A');
    const r = validateGraph(g, 'Z');
    expect(r.valid).toBe(false);
  });

  it('acepta grafo válido', () => {
    const g = new Graph();
    g.addVertex('A'); g.addVertex('B');
    g.addEdge('A', 'B', 3);
    const r = validateGraph(g, 'A');
    expect(r.valid).toBe(true);
    expect(r.errors.length).toBe(0);
  });
});

describe('validateVertexId', () => {
  it('rechaza id vacío', () => {
    const r = validateVertexId('', new Set());
    expect(r.valid).toBe(false);
  });

  it('rechaza id duplicado', () => {
    const r = validateVertexId('A', new Set(['A']));
    expect(r.valid).toBe(false);
  });

  it('acepta id nuevo', () => {
    const r = validateVertexId('B', new Set(['A']));
    expect(r.valid).toBe(true);
  });
});

describe('validateWeight', () => {
  it('acepta enteros', () => {
    expect(validateWeight('5').valid).toBe(true);
    expect(validateWeight('-3').value).toBe(-3);
  });

  it('acepta decimales', () => {
    expect(validateWeight('3.14').valid).toBe(true);
  });

  it('acepta cero', () => {
    expect(validateWeight('0').value).toBe(0);
  });

  it('rechaza NaN', () => {
    expect(validateWeight('abc').valid).toBe(false);
  });

  it('rechaza vacío', () => {
    expect(validateWeight('').valid).toBe(false);
  });

  it('rechaza Infinity', () => {
    expect(validateWeight('Infinity').valid).toBe(false);
  });
});
