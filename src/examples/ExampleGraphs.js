/**
 * ExampleGraphs.js — Predefined example graphs for the Bellman-Ford Visualizer
 */

export const EXAMPLE_GRAPHS = [
  {
    id: 'basic',
    name: 'Grafo básico',
    description: 'Grafo simple con pesos positivos. Ideal para observar el funcionamiento habitual de Bellman-Ford.',
    source: 'A',
    vertices: [
      { id: 'A', position: { x: 150, y: 300 } },
      { id: 'B', position: { x: 350, y: 150 } },
      { id: 'C', position: { x: 350, y: 450 } },
      { id: 'D', position: { x: 550, y: 300 } },
      { id: 'E', position: { x: 700, y: 150 } },
    ],
    edges: [
      { from: 'A', to: 'B', weight: 6 },
      { from: 'A', to: 'C', weight: 7 },
      { from: 'B', to: 'D', weight: 5 },
      { from: 'C', to: 'B', weight: 8 },
      { from: 'C', to: 'D', weight: -4 },
      { from: 'D', to: 'B', weight: -2 },
      { from: 'B', to: 'E', weight: -4 },
      { from: 'D', to: 'E', weight: 9 },
    ],
  },
  {
    id: 'negative-weights',
    name: 'Pesos negativos',
    description: 'Demuestra que Bellman-Ford puede manejar pesos negativos correctamente cuando no hay ciclos negativos.',
    source: 'S',
    vertices: [
      { id: 'S', position: { x: 100, y: 300 } },
      { id: 'A', position: { x: 300, y: 150 } },
      { id: 'B', position: { x: 300, y: 450 } },
      { id: 'C', position: { x: 500, y: 300 } },
      { id: 'T', position: { x: 700, y: 300 } },
    ],
    edges: [
      { from: 'S', to: 'A', weight: 4 },
      { from: 'S', to: 'B', weight: 2 },
      { from: 'A', to: 'C', weight: -3 },
      { from: 'B', to: 'C', weight: 2 },
      { from: 'B', to: 'A', weight: 1 },
      { from: 'C', to: 'T', weight: 2 },
      { from: 'A', to: 'T', weight: 4 },
    ],
  },
  {
    id: 'negative-cycle',
    name: 'Ciclo negativo',
    description: 'Contiene un ciclo negativo alcanzable desde el origen. Bellman-Ford lo detecta en la iteración |V|.',
    source: 'A',
    vertices: [
      { id: 'A', position: { x: 150, y: 300 } },
      { id: 'B', position: { x: 350, y: 150 } },
      { id: 'C', position: { x: 550, y: 300 } },
      { id: 'D', position: { x: 350, y: 450 } },
    ],
    edges: [
      { from: 'A', to: 'B', weight: 1 },
      { from: 'B', to: 'C', weight: -3 },
      { from: 'C', to: 'D', weight: 2 },
      { from: 'D', to: 'B', weight: 1 },  // B→C→D→B = -3+2+1 = 0... let's use -1
      { from: 'A', to: 'D', weight: 10 },
    ],
    // Adjust to make cycle B→C→D→B actually negative: -3+2+(-1)=-2
    // Reconstruct edges below
    _edgesOverride: [
      { from: 'A', to: 'B', weight: 1 },
      { from: 'B', to: 'C', weight: -3 },
      { from: 'C', to: 'D', weight: 2 },
      { from: 'D', to: 'B', weight: -1 },  // cycle weight = -3+2-1 = -2 (negative!)
      { from: 'A', to: 'D', weight: 10 },
    ],
  },
  {
    id: 'disconnected',
    name: 'Grafo desconectado',
    description: 'Algunos vértices no son alcanzables desde el origen. Sus distancias permanecen como infinito.',
    source: 'A',
    vertices: [
      { id: 'A', position: { x: 150, y: 300 } },
      { id: 'B', position: { x: 350, y: 200 } },
      { id: 'C', position: { x: 350, y: 400 } },
      { id: 'X', position: { x: 600, y: 200 } },  // disconnected component
      { id: 'Y', position: { x: 600, y: 400 } },  // disconnected component
    ],
    edges: [
      { from: 'A', to: 'B', weight: 3 },
      { from: 'A', to: 'C', weight: 5 },
      { from: 'B', to: 'C', weight: -2 },
      { from: 'X', to: 'Y', weight: 4 },  // isolated subgraph
    ],
  },
];

/**
 * Load an example graph into a Graph instance and renderer.
 * @param {string} id
 * @param {import('../core/Graph.js').Graph} graph
 * @param {import('../visualization/GraphRenderer.js').GraphRenderer} renderer
 * @returns {string} The source vertex id
 */
export function loadExample(id, graph, renderer) {
  const example = EXAMPLE_GRAPHS.find(e => e.id === id);
  if (!example) return null;

  graph.clear();

  // Reset renderer
  renderer.cy.elements().remove();

  // Add vertices
  for (const v of example.vertices) {
    graph.addVertex(v.id);
    renderer.addNode(v.id, v.position);
  }

  // Use _edgesOverride if present (for the negative cycle example)
  const edgeList = example._edgesOverride || example.edges;

  // Add edges
  for (const e of edgeList) {
    const edge = graph.addEdge(e.from, e.to, e.weight);
    if (edge) {
      renderer.addEdge(edge.id, e.from, e.to, e.weight);
    }
  }

  return example.source;
}
