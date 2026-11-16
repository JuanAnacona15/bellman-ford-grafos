# PLAN.md — Bellman-Ford Visualizer

## 1. Descripción general del proyecto

**Nombre:** Bellman-Ford Visualizer

**Tipo:** Aplicación web educativa e interactiva.

**Propósito:** Desarrollar una aplicación web que permita construir, visualizar, analizar y ejecutar el algoritmo de Bellman-Ford sobre grafos ponderados dirigidos, mostrando de manera gráfica y detallada el proceso de búsqueda de caminos mínimos y la detección de ciclos negativos.

El proyecto debe cumplir dos objetivos principales:

1. Implementar correctamente el algoritmo de Bellman-Ford para grafos ponderados arbitrarios.
2. Facilitar la comprensión del algoritmo mediante una experiencia visual, interactiva y educativa.

La aplicación debe tener una apariencia moderna, profesional y atractiva, con una interfaz intuitiva que permita tanto ejecutar el algoritmo como comprender su funcionamiento interno.

---

# 2. Tecnologías y herramientas

La aplicación se desarrollará utilizando tecnologías web.

### Tecnologías principales

- **HTML5:** estructura de la aplicación.
- **CSS3:** diseño, estilos, animaciones y adaptación a diferentes pantallas.
- **JavaScript:** lógica de negocio, algoritmo y comportamiento interactivo.

### Librerías recomendadas

- **Cytoscape.js:** construcción, representación y manipulación visual de grafos.
- **Lucide Icons:** iconografía de la interfaz.
- **SweetAlert2:** mensajes, confirmaciones y alertas visuales.
- **LocalStorage:** almacenamiento local de grafos y preferencias.

Se priorizará JavaScript nativo para el desarrollo del algoritmo, evitando depender de librerías que resuelvan automáticamente el problema de caminos mínimos.

### Entorno de desarrollo

- Node.js y npm.
- Vite como servidor de desarrollo y herramienta de construcción.
- Visual Studio Code como editor recomendado.
- Git para control de versiones.

---

# 3. Objetivos funcionales

La aplicación debe permitir:

1. Crear grafos dirigidos ponderados.
2. Agregar, editar y eliminar vértices.
3. Crear, editar y eliminar aristas.
4. Asignar pesos positivos, negativos y cero.
5. Seleccionar un vértice de origen.
6. Ejecutar Bellman-Ford sobre cualquier grafo válido.
7. Mostrar las distancias mínimas desde el origen.
8. Visualizar las relajaciones de las aristas.
9. Ejecutar el algoritmo paso a paso.
10. Detectar ciclos negativos alcanzables desde el origen.
11. Identificar y visualizar los ciclos negativos detectados.
12. Reconstruir los caminos mínimos.
13. Mostrar tablas de iteraciones y estadísticas.
14. Cargar grafos de ejemplo.

---

# 4. Arquitectura general

El proyecto debe utilizar una arquitectura modular, separando la lógica algorítmica de la interfaz gráfica.

La estructura propuesta es:

```text
bellman-ford-visualizer/
│
├── index.html
├── package.json
├── vite.config.js
│
├── public/
│   └── assets/
│
├── src/
│   ├── main.js
│   │
│   ├── core/
│   │   ├── Graph.js
│   │   ├── BellmanFord.js
│   │   ├── NegativeCycle.js
│   │   ├── PathReconstruction.js
│   │   └── GraphValidation.js
│   │
│   ├── visualization/
│   │   ├── GraphRenderer.js
│   │   ├── GraphInteractions.js
│   │   ├── GraphAnimations.js
│   │   └── GraphStyles.js
│   │
│   ├── simulator/
│   │   ├── SimulationController.js
│   │   ├── StepManager.js
│   │   └── SimulationHistory.js
│   │
│   ├── components/
│   │   ├── Sidebar.js
│   │   ├── Toolbar.js
│   │   ├── GraphEditor.js
│   │   ├── ResultsTable.js
│   │   ├── StatisticsPanel.js
│   │   └── Notifications.js
│   │
│   ├── examples/
│   │   └── ExampleGraphs.js
│   │
│   ├── utils/
│   │   ├── Export.js
│   │   ├── Import.js
│   │   └── Storage.js
│   │
│   └── styles/
│       ├── global.css
│       ├── layout.css
│       ├── components.css
│       ├── graph.css
│       └── animations.css
│
└── tests/
    ├── bellmanFord.test.js
    ├── negativeCycle.test.js
    ├── pathReconstruction.test.js
    └── graphValidation.test.js
```

Cada módulo debe tener una responsabilidad específica.

La lógica del algoritmo no debe depender de Cytoscape.js ni de los componentes visuales.

---

# 5. Diseño de la interfaz

La aplicación tendrá una interfaz organizada en cinco secciones principales.

## 5.1. Inicio

Página principal del sistema.

Debe incluir:

- Nombre y logotipo del proyecto.
- Descripción breve de Bellman-Ford.
- Botón para comenzar.
- Acceso a los grafos de ejemplo.
- Acceso a una sección explicativa del algoritmo.

## 5.2. Constructor de grafos

Espacio de trabajo donde el usuario puede crear y modificar grafos.

Debe permitir:

- Agregar vértices.
- Crear aristas dirigidas.
- Asignar pesos.
- Modificar pesos.
- Eliminar vértices.
- Eliminar aristas.
- Mover vértices libremente.
- Seleccionar el origen.
- Limpiar el grafo.
- Cargar ejemplos prediseñados.

El grafo debe visualizarse en un lienzo interactivo.

Los vértices deben representarse mediante nodos circulares y las aristas mediante conexiones dirigidas con sus respectivos pesos.

## 5.3. Simulador

Sección encargada de ejecutar y visualizar Bellman-Ford.

Debe incorporar:

- Iniciar ejecución.
- Pausar.
- Continuar.
- Siguiente paso.
- Paso anterior, cuando exista historial disponible.
- Reiniciar.
- Ejecutar automáticamente.
- Control de velocidad.

Durante la ejecución se deben resaltar las aristas evaluadas y mostrar los cambios de distancia.

## 5.4. Resultados

Panel dedicado a presentar los resultados del algoritmo.

Debe incluir:

- Tabla de distancias mínimas.
- Camino mínimo hacia cada vértice.
- Tabla de iteraciones.
- Estadísticas de ejecución.
- Estado de detección de ciclos negativos.

## 5.5. Análisis

Sección destinada a explicar los resultados.

Debe mostrar:

- Existencia o ausencia de ciclos negativos alcanzables.
- Ciclos negativos identificados.
- Vértices afectados.
- Explicación del resultado.
- Complejidad temporal del algoritmo.

---

# 6. FASE 1 — Funcionalidades fundamentales

Esta fase constituye el núcleo obligatorio del proyecto.

No se debe comenzar con las animaciones avanzadas ni con funcionalidades complementarias hasta comprobar que el algoritmo funciona correctamente.

## 6.1. Representación del grafo

Implementar una estructura de datos que permita representar cualquier grafo dirigido y ponderado.

Cada grafo debe contener:

- Conjunto de vértices.
- Conjunto de aristas.
- Identificadores únicos.
- Peso de cada arista.

Representación sugerida:

```javascript
const graph = {
    vertices: ["A", "B", "C", "D"],

    edges: [
        { from: "A", to: "B", weight: 4 },
        { from: "A", to: "C", weight: 2 },
        { from: "C", to: "B", weight: -1 },
        { from: "B", to: "D", weight: 3 }
    ]
};
```

El sistema debe admitir:

- Pesos positivos.
- Pesos negativos.
- Pesos iguales a cero.
- Grafos desconectados.
- Vértices aislados.
- Aristas paralelas.
- Autociclos.

La representación interna debe utilizar una lista de aristas, ya que resulta adecuada para implementar Bellman-Ford.

## 6.2. Constructor funcional

Desarrollar las herramientas necesarias para construir grafos desde la interfaz.

Criterios:

- No permitir identificadores duplicados.
- No permitir aristas hacia vértices inexistentes.
- Validar los pesos ingresados.
- Permitir eliminar elementos.
- Mantener sincronizada la representación visual con la estructura interna.

## 6.3. Implementación de Bellman-Ford

Implementar el algoritmo desde cero.

### Inicialización

Asignar infinito a todas las distancias.

Asignar cero al vértice de origen.

```javascript
dist[source] = 0;
```

### Relajación

Recorrer las aristas del grafo durante un máximo de |V| - 1 iteraciones.

Para cada arista:

```javascript
if (dist[from] !== Infinity &&
    dist[from] + weight < dist[to]) {

    dist[to] = dist[from] + weight;
    predecessor[to] = from;
}
```

Guardar los cambios realizados para poder reconstruir las iteraciones.

### Optimización

Si durante una iteración completa no se producen actualizaciones, finalizar anticipadamente.

### Resultado

El algoritmo debe devolver:

- Distancias finales.
- Predecesores.
- Historial de iteraciones.
- Número de iteraciones realizadas.
- Número de relajaciones exitosas.
- Estado de detección de ciclos negativos.

## 6.4. Detección de ciclos negativos

Realizar una pasada adicional sobre las aristas.

Si una arista todavía permite reducir la distancia de un vértice alcanzable desde el origen, existe un ciclo negativo alcanzable.

La detección debe distinguir entre:

- Ciclos negativos alcanzables desde el origen.
- Ciclos negativos desconectados del origen.

Un ciclo negativo desconectado no debe provocar que se declare inválido el resultado de las distancias desde el origen.

### Identificación del ciclo

Implementar una estrategia de reconstrucción:

1. Registrar los vértices cuya distancia todavía puede actualizarse.
2. Actualizar sus predecesores durante la comprobación.
3. Retroceder mediante los predecesores durante |V| pasos para entrar en el ciclo.
4. Recorrer los predecesores hasta regresar al vértice inicial.
5. Reconstruir el ciclo en el orden correcto.

El sistema debe comprobar que el peso total del ciclo sea negativo.

### Propagación de vértices afectados

Identificar todos los vértices alcanzables desde los ciclos negativos.

Para estos vértices, la distancia mínima se representará como -Infinity, indicando que no existe un mínimo finito.

Los vértices no afectados deben conservar sus distancias válidas.

## 6.5. Reconstrucción de caminos mínimos

Utilizar el arreglo de predecesores generado durante Bellman-Ford.

Para cada destino:

1. Consultar su predecesor.
2. Retroceder hasta llegar al origen.
3. Reconstruir el recorrido.
4. Invertir la secuencia para mostrar el camino correcto.

Consideraciones:

- Si el destino es inalcanzable, indicar que no existe camino.
- Si está afectado por un ciclo negativo, indicar que no existe camino mínimo finito.
- Si el destino es el origen, mostrar un camino de costo cero.

## 6.6. Validación del grafo

Implementar controles para detectar:

- Grafo sin vértices.
- Origen inexistente.
- Pesos no numéricos.
- Valores infinitos o NaN.
- Aristas inválidas.
- Identificadores duplicados.

Los pesos deben aceptar números decimales y negativos.

---

# 7. FASE 2 — Visualización y simulación

Una vez validado el motor algorítmico, desarrollar la experiencia visual.

## 7.1. Visualización del grafo

Utilizar Cytoscape.js.

Funciones:

- Dibujar nodos y aristas.
- Mostrar etiquetas de pesos.
- Diferenciar origen y destino.
- Permitir arrastrar nodos.
- Ajustar automáticamente la distribución.
- Resaltar caminos.
- Resaltar aristas evaluadas.

## 7.2. Ejecución paso a paso

La ejecución debe estar separada de la implementación del algoritmo.

El motor debe producir un historial de eventos que posteriormente consumirá el simulador.

Cada evento debe registrar:

- Número de iteración.
- Arista evaluada.
- Distancia anterior.
- Distancia candidata.
- Distancia nueva.
- Resultado de la relajación.
- Predecesor anterior y nuevo.

## 7.3. Controles de simulación

Implementar:

- Play.
- Pause.
- Resume.
- Next Step.
- Previous Step.
- Restart.
- Fast Forward.

El botón de paso anterior debe recuperar el estado histórico, no volver a ejecutar el algoritmo desde cero.

## 7.4. Animaciones

Utilizar colores y transiciones para distinguir:

- Vértice de origen.
- Vértices visitados.
- Arista actualmente evaluada.
- Relajación exitosa.
- Relajación sin cambios.
- Camino mínimo.
- Ciclo negativo.

Las animaciones no deben interferir con la precisión de los cálculos.

## 7.5. Tabla de iteraciones

Mostrar los cambios de distancia en cada iteración.

Columnas:

- Iteración.
- Vértice.
- Distancia anterior.
- Nueva distancia.
- Arista responsable.

También se debe incluir una tabla resumen con la distancia de cada vértice después de cada iteración completa.

---

# 8. FASE 3 — Resultados y herramientas educativas

## 8.1. Panel de resultados

Presentar una tabla final:

| Vértice | Distancia | Camino mínimo |
|---|---|---|
| A | 0 | A |
| B | 3 | A → C → B |
| C | 2 | A → C |
| D | 6 | A → C → B → D |

Los valores son ilustrativos.

La información debe generarse a partir del grafo ejecutado, no estar escrita manualmente.

## 8.2. Reconstrucción visual de caminos

Al seleccionar un vértice de destino:

- Resaltar el recorrido correspondiente.
- Mostrar el peso de cada arista.
- Calcular el peso total.
- Indicar la cantidad de aristas utilizadas.

## 8.3. Panel de estadísticas

Mostrar:

- Cantidad de vértices.
- Cantidad de aristas.
- Iteraciones realizadas.
- Relajaciones exitosas.
- Aristas examinadas.
- Tiempo de ejecución.
- Existencia de ciclos negativos.

## 8.4. Grafos prediseñados

Crear una biblioteca de ejemplos:

**Ejemplo 1: Grafo básico**

Permite observar el funcionamiento habitual.

**Ejemplo 2: Grafo con pesos negativos**

Demuestra que Bellman-Ford admite pesos negativos cuando no existen ciclos negativos alcanzables.

**Ejemplo 3: Grafo con ciclo negativo**

Demuestra la detección de ciclos negativos.

**Ejemplo 4: Grafo desconectado**

Permite comprender el comportamiento de los vértices inalcanzables.

Cada ejemplo debe poder cargarse directamente en el constructor.

---

# 9. FASE 4 — Funcionalidades que harán destacar el proyecto

Estas funcionalidades se desarrollarán después de completar y probar las fases anteriores.

## 9.1. Importación de grafos

Permitir cargar grafos mediante:

- Archivos JSON.
- Archivos CSV.

Validar la información antes de incorporarla al constructor.

## 9.2. Exportación

Permitir exportar:

- Grafo actual.
- Distancias finales.
- Caminos mínimos.
- Historial de iteraciones.
- Estadísticas.

Formatos recomendados: JSON, CSV y TXT.

## 9.3. Matriz de adyacencia

Mostrar la representación matricial del grafo.

Permitir cambiar entre:

- Visualización gráfica.
- Lista de adyacencia.
- Matriz de adyacencia.

## 9.4. Generador aleatorio

Crear grafos automáticamente según parámetros configurables:

- Número de vértices.
- Número de aristas.
- Rango de pesos.
- Inclusión de pesos negativos.
- Posibilidad de generar ciclos negativos.

El generador debe garantizar que los grafos creados sean estructuralmente válidos.

## 9.5. Comparación con Dijkstra

Implementar Dijkstra como algoritmo complementario.

Permitir ejecutar ambos algoritmos sobre el mismo grafo cuando sus condiciones de uso lo permitan.

Mostrar:

- Diferencias en resultados.
- Número de operaciones.
- Tiempo de ejecución.
- Restricciones de cada algoritmo.

No se debe presentar Dijkstra como válido para grafos con pesos negativos arbitrarios.

## 9.6. Modo educativo

Incorporar explicaciones contextuales.

Ejemplos:

- ¿Qué es la relajación?
- ¿Por qué se necesitan |V| - 1 iteraciones?
- ¿Por qué Bellman-Ford admite pesos negativos?
- ¿Cómo se detecta un ciclo negativo?
- ¿Qué significa que una distancia sea infinita?

Las explicaciones deben aparecer durante la ejecución, según el evento que se esté mostrando.

## 9.7. Historial de ejecuciones

Guardar localmente:

- Grafos utilizados.
- Vértices de origen.
- Resultados.
- Fecha de ejecución.

Permitir recuperar ejecuciones anteriores.

## 9.8. Tutorial interactivo

Crear una sección educativa que explique Bellman-Ford mediante ejemplos guiados.

Incluir:

- Introducción.
- Fundamento matemático.
- Inicialización.
- Relajación.
- Iteraciones.
- Detección de ciclos negativos.
- Complejidad temporal.

---

# 10. Diseño visual y experiencia de usuario

La aplicación debe tener una identidad visual coherente.

### Estilo

- Diseño moderno.
- Interfaz limpia.
- Apariencia profesional.
- Modo oscuro como tema principal.
- Contraste adecuado.
- Animaciones fluidas.
- Diseño responsive.

### Paleta sugerida

- Fondo: azul oscuro o gris azulado.
- Paneles: tonos ligeramente más claros.
- Azul: elementos seleccionados.
- Verde: relajaciones exitosas y resultados válidos.
- Rojo: ciclos negativos y advertencias.
- Gris: elementos inactivos.
- Blanco: información principal.

### Principios de diseño

1. El grafo debe ocupar una parte importante de la pantalla.
2. Los controles deben ser accesibles.
3. Las tablas deben ser fáciles de interpretar.
4. Los resultados deben tener una jerarquía visual clara.
5. Los colores deben mantener significados consistentes.
6. La interfaz debe adaptarse a pantallas de escritorio y móviles.

---

# 11. Plan de pruebas

El proyecto debe incluir pruebas automatizadas y pruebas manuales.

## 11.1. Pruebas obligatorias del algoritmo

| Caso | Resultado esperado |
|---|---|
| Grafo con pesos positivos | Distancias correctas |
| Grafo con pesos negativos | Distancias correctas |
| Grafo sin aristas | Todos los demás vértices inalcanzables |
| Grafo desconectado | Identificación de vértices inalcanzables |
| Ciclo negativo alcanzable | Detección correcta |
| Ciclo negativo desconectado | No invalida las distancias desde el origen |
| Autociclo negativo | Detección correcta |
| Peso cero | Cálculo correcto |
| Aristas paralelas | Selección correcta del camino |
| Grafo de un vértice | Distancia del origen igual a cero |

## 11.2. Pruebas de interfaz

- Crear un vértice.
- Eliminar un vértice.
- Crear una arista.
- Modificar un peso.
- Seleccionar un origen.
- Cargar un ejemplo.
- Ejecutar el algoritmo.
- Pausar y continuar.
- Reiniciar la simulación.
- Visualizar un camino mínimo.

## 11.3. Pruebas de consistencia

Comprobar que:

- Los resultados visuales coincidan con los resultados del motor.
- Las tablas coincidan con el historial de ejecución.
- Los caminos reconstruidos correspondan con sus distancias.
- Los ciclos identificados tengan peso total negativo.
- Los vértices afectados por ciclos negativos estén correctamente clasificados.

---

# 12. Criterios de aceptación

El proyecto se considerará funcionalmente completo cuando cumpla todos estos puntos:

- [ ] Permite ingresar grafos arbitrarios válidos.
- [ ] Permite utilizar pesos positivos, negativos y cero.
- [ ] Ejecuta Bellman-Ford correctamente.
- [ ] Calcula distancias mínimas desde un origen.
- [ ] Identifica vértices inalcanzables.
- [ ] Detecta ciclos negativos alcanzables.
- [ ] Distingue ciclos negativos desconectados.
- [ ] Puede reconstruir caminos mínimos.
- [ ] Presenta los resultados visualmente.
- [ ] Permite observar las iteraciones.
- [ ] Permite ejecutar el algoritmo paso a paso.
- [ ] Cuenta con ejemplos prediseñados.
- [ ] Identifica y muestra los ciclos negativos.
- [ ] Incluye pruebas para los casos límite.

---

# 13. Orden de desarrollo

Se debe seguir este orden para evitar construir funcionalidades visuales sobre una lógica incorrecta.

| Etapa | Desarrollo | Prioridad |
|---|---|---|
| 1 | Configuración del proyecto | Obligatoria |
| 2 | Estructura de grafos | Obligatoria |
| 3 | Validación de entradas | Obligatoria |
| 4 | Algoritmo Bellman-Ford | Obligatoria |
| 5 | Detección de ciclos negativos | Obligatoria |
| 6 | Reconstrucción de caminos | Alta |
| 7 | Constructor visual | Alta |
| 8 | Simulación paso a paso | Alta |
| 9 | Tablas y estadísticas | Alta |
| 10 | Grafos prediseñados | Alta |
| 11 | Importación y exportación | Complementaria |
| 12 | Comparación con Dijkstra | Complementaria |
| 13 | Generador aleatorio | Complementaria |
| 14 | Modo educativo | Complementaria |
| 15 | Historial y tutorial | Complementaria |
| 16 | Pulido visual y optimización | Final |

---

# 14. Reglas de desarrollo

Para mantener la calidad del proyecto:

1. Implementar y probar cada módulo antes de continuar.
2. No mezclar la lógica del algoritmo con el código de la interfaz.
3. No utilizar librerías externas para sustituir la implementación propia de Bellman-Ford.
4. Mantener una estructura de código modular.
5. Evitar duplicar lógica.
6. Utilizar nombres descriptivos para variables y funciones.
7. Validar todas las entradas del usuario.
8. Mantener sincronizados los datos y la visualización.
9. Documentar las funciones algorítmicas importantes.
10. No sacrificar la precisión matemática por efectos visuales.

---

# 15. Resultado final esperado

El resultado será una aplicación web educativa denominada **Bellman-Ford Visualizer**.

La aplicación permitirá construir grafos ponderados, ejecutar Bellman-Ford, visualizar las iteraciones, identificar caminos mínimos, detectar ciclos negativos y comprender el funcionamiento del algoritmo.

El proyecto tendrá dos dimensiones:

**Dimensión algorítmica:** una implementación propia, funcional, verificable y matemáticamente correcta de Bellman-Ford.

**Dimensión visual y educativa:** una interfaz interactiva que permita comprender cada operación mediante representaciones gráficas, tablas, animaciones y explicaciones.

La prioridad será garantizar el cumplimiento de los requisitos académicos. Posteriormente se incorporarán las funcionalidades complementarias para convertirlo en una herramienta educativa completa y profesional.

**Principio fundamental del proyecto: primero exactitud algorítmica, después visualización y finalmente funcionalidades avanzadas.**
