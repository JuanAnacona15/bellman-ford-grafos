# Bellman-Ford Visualizer

> Herramienta web educativa e interactiva para visualizar el algoritmo de Bellman-Ford sobre grafos ponderados dirigidos.

![Licencia MIT](https://img.shields.io/badge/licencia-MIT-blue.svg)
![Tests](https://img.shields.io/badge/tests-38%2F38%20✓-brightgreen)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3-orange)

---

## Descripción

**Bellman-Ford Visualizer** es una aplicación web que permite construir grafos dirigidos ponderados y ejecutar el algoritmo de Bellman-Ford paso a paso, mostrando visualmente cada iteración, detectando ciclos negativos y reconstruyendo los caminos mínimos desde un vértice de origen.

El proyecto tiene dos dimensiones:

- **Algorítmica:** implementación propia, correcta y verificada de Bellman-Ford, sin depender de librerías externas para la lógica del algoritmo.
- **Educativa:** interfaz interactiva con animaciones, tablas de iteraciones y explicaciones contextuales que permiten comprender el funcionamiento interno del algoritmo.

---

## Funcionalidades

### Constructor de grafos
- Agregar y eliminar vértices con nombre personalizado
- Crear aristas dirigidas con pesos positivos, negativos o cero
- Editar el peso de una arista haciendo clic sobre ella
- Mover vértices libremente con drag & drop
- 5 modos de herramienta: **Mover · Vértice · Arista · Origen · Eliminar**
- Atajos de teclado: `N` (nodo), `E` (arista), `S` (origen), `P` (mover), `Del` (eliminar), `F` (ajustar vista)
- Cargar 4 grafos de ejemplo prediseñados
- Importar grafos desde archivos **JSON** o **CSV**
- Representación visual, lista de adyacencia y matriz de adyacencia

### Simulador
- Ejecutar el algoritmo **paso a paso** con historial completo
- Controles: **▶ Play · ⏸ Pause · ◀ Anterior · ▶ Siguiente · ⏭ Ir al final · ↺ Reiniciar**
- Control de velocidad (100ms – 2000ms por paso)
- Atajos de teclado: `Espacio` (play/pause), `→` (siguiente paso), `←` (paso anterior)
- Barra de progreso y detalle del paso actual (arista evaluada, distancias, resultado)
- Animaciones de color en nodos y aristas según el estado (relajación exitosa, sin cambio, camino mínimo, ciclo negativo)

### Resultados
- **Tabla de distancias mínimas** desde el origen a todos los vértices
- **Caminos mínimos reconstruidos** para cada vértice de destino
- Estadísticas de ejecución: iteraciones, relajaciones exitosas, aristas examinadas, tiempo
- Exportar resultados en **JSON** o **CSV**
- Exportar historial de iteraciones en **CSV**

### Análisis
- Detección de **ciclos negativos alcanzables** desde el origen
- Identificación del ciclo exacto con su peso total
- Propagación: vértices cuyos caminos pasan por el ciclo quedan marcados como **−∞**
- Distinción correcta entre ciclos negativos alcanzables y desconectados del origen
- **Tabla de iteraciones** completa agrupada por iteración
- Información de complejidad temporal O(V·E) y espacial O(V)
- Selector de destino para visualizar y resaltar el camino mínimo en el grafo

### Persistencia
- El grafo actual se guarda automáticamente en **LocalStorage**
- Historial de las últimas 20 ejecuciones guardado localmente

---

## Grafos de ejemplo incluidos

| Ejemplo | Descripción |
|---|---|
| **Grafo básico** | Pesos mixtos (positivos y negativos). Muestra el funcionamiento estándar. |
| **Pesos negativos** | Demuestra que BF maneja correctamente pesos negativos sin ciclos negativos. |
| **Ciclo negativo** | Contiene un ciclo negativo alcanzable. BF lo detecta en la iteración \|V\|. |
| **Grafo desconectado** | Vértices inalcanzables cuya distancia permanece en ∞. |

---

## Paleta de colores (nodos y aristas)

| Color | Significado |
|---|---|
| 🔵 Azul | Vértice/arista por defecto |
| 🟠 Naranja | Arista actualmente evaluada |
| 🟢 Verde | Relajación exitosa / camino mínimo |
| ⚫ Gris | Sin cambio / vértice inactivo |
| 🔴 Rojo | Ciclo negativo |
| 🟡 Amarillo | Vértice afectado por ciclo negativo |

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| **HTML5 + CSS3 + JavaScript ES2022** | Base de la aplicación |
| **[Vite 6](https://vitejs.dev/)** | Build tool y servidor de desarrollo |
| **[Cytoscape.js 3](https://js.cytoscape.org/)** | Renderizado y manipulación del grafo |
| **[Vitest](https://vitest.dev/)** | Tests automatizados |
| **LocalStorage API** | Persistencia de grafos y preferencias |

---

## Instalación y uso

### Requisitos
- Node.js ≥ 18
- npm ≥ 9

### Desarrollo local

```bash
# Clonar el repositorio
git clone git@github.com:TU_USUARIO/bellman-ford-grafos.git
cd bellman-ford-grafos

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### Ejecutar tests

```bash
npm test
```

```
Test Files  4 passed (4)
     Tests  38 passed (38)
  Duration  ~1.3s
```

### Build de producción

```bash
npm run build
npm run preview
```

---

## Estructura del proyecto

```
bellman-ford-visualizer/
│
├── index.html
├── package.json
├── vite.config.js
│
├── src/
│   ├── main.js                        # Entry point — conecta todos los módulos
│   │
│   ├── core/                          # Lógica algorítmica pura (sin UI)
│   │   ├── Graph.js                   # Estructura de datos del grafo
│   │   ├── BellmanFord.js             # Algoritmo de Bellman-Ford
│   │   ├── NegativeCycle.js           # Detección de ciclos negativos
│   │   ├── PathReconstruction.js      # Reconstrucción de caminos mínimos
│   │   ├── GraphValidation.js         # Validación de entradas
│   │   └── constants.js               # Constantes compartidas
│   │
│   ├── visualization/                 # Capa de renderizado (Cytoscape.js)
│   │   ├── GraphRenderer.js           # Wrapper de Cytoscape
│   │   ├── GraphInteractions.js       # Modos de herramienta y eventos
│   │   ├── GraphAnimations.js         # Transiciones visuales durante simulación
│   │   └── GraphStyles.js             # Estilos Cytoscape para cada estado
│   │
│   ├── simulator/
│   │   └── SimulationController.js    # Orquestación de la simulación paso a paso
│   │
│   ├── examples/
│   │   └── ExampleGraphs.js           # 4 grafos prediseñados
│   │
│   ├── utils/
│   │   ├── Storage.js                 # Persistencia en LocalStorage
│   │   ├── Export.js                  # Exportación JSON/CSV
│   │   └── Import.js                  # Importación JSON/CSV
│   │
│   └── styles/
│       ├── global.css                 # Design tokens y reset
│       ├── layout.css                 # Layout estructural
│       ├── components.css             # Componentes UI
│       ├── graph.css                  # Canvas y overlays flotantes
│       └── animations.css             # Keyframes y clases de animación
│
└── tests/
    ├── bellmanFord.test.js            # 13 tests del algoritmo
    ├── negativeCycle.test.js          # 6 tests de ciclos negativos
    ├── pathReconstruction.test.js     # 6 tests de reconstrucción
    └── graphValidation.test.js        # 13 tests de validación
```

---

## Implementación del algoritmo

### Bellman-Ford

```javascript
// Inicialización
dist[source] = 0;  // todos los demás = Infinity

// |V| - 1 iteraciones de relajación
for (let i = 1; i <= V - 1; i++) {
  let updated = false;
  for (const { from, to, weight } of edges) {
    if (dist[from] !== Infinity && dist[from] + weight < dist[to]) {
      dist[to] = dist[from] + weight;
      predecessor[to] = from;
      updated = true;
    }
  }
  if (!updated) break; // Terminación anticipada
}
```

### Detección de ciclos negativos

Una pasada adicional sobre las aristas detecta si alguna distancia aún puede reducirse. Si es así, existe un ciclo negativo alcanzable. El ciclo exacto se identifica retrocediendo |V| pasos por los predecesores.

### Complejidad

| | Valor |
|---|---|
| **Tiempo** | O(V · E) |
| **Espacio** | O(V) |
| **Iteraciones máximas** | \|V\| − 1 |

---

## Principio fundamental

> **Primero exactitud algorítmica, después visualización, finalmente funcionalidades avanzadas.**

---

## Licencia

MIT © 2026
