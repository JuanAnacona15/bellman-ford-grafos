/**
 * Storage.js — LocalStorage persistence for graphs and execution history
 */

const KEYS = {
  CURRENT_GRAPH: 'bfv_current_graph',
  CURRENT_SOURCE: 'bfv_current_source',
  HISTORY: 'bfv_history',
  PREFERENCES: 'bfv_preferences',
};

/** Save the current graph state. */
export function saveCurrentGraph(graphJSON, source) {
  try {
    localStorage.setItem(KEYS.CURRENT_GRAPH, JSON.stringify(graphJSON));
    localStorage.setItem(KEYS.CURRENT_SOURCE, source || '');
  } catch (e) {
    console.warn('Could not save graph to localStorage', e);
  }
}

/** Load the saved graph state. */
export function loadCurrentGraph() {
  try {
    const data = localStorage.getItem(KEYS.CURRENT_GRAPH);
    const source = localStorage.getItem(KEYS.CURRENT_SOURCE) || '';
    return { graphJSON: data ? JSON.parse(data) : null, source };
  } catch (e) {
    console.warn('Could not load graph from localStorage', e);
    return { graphJSON: null, source: '' };
  }
}

/** Save a completed execution to history. */
export function saveToHistory(entry) {
  try {
    const history = loadHistory();
    history.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      ...entry,
    });
    // Keep last 20 entries
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history.slice(0, 20)));
  } catch (e) {
    console.warn('Could not save to history', e);
  }
}

/** Load execution history. */
export function loadHistory() {
  try {
    const data = localStorage.getItem(KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

/** Clear all saved data. */
export function clearAll() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
