/**
 * SimulationController.js — Orchestrates the BF simulation playback
 * Separates algorithm execution from visual playback.
 */
import { runBellmanFord } from '../core/BellmanFord.js';
import { detectNegativeCycles } from '../core/NegativeCycle.js';
import { reconstructAllPaths } from '../core/PathReconstruction.js';
import { validateGraph } from '../core/GraphValidation.js';

export const SIM_STATE = {
  IDLE: 'idle',
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished',
};

export class SimulationController {
  /**
   * @param {import('../core/Graph.js').Graph} graph
   * @param {import('../visualization/GraphAnimations.js').GraphAnimations} animations
   * @param {object} callbacks - { onStateChange, onStep, onFinish, onError }
   */
  constructor(graph, animations, callbacks = {}) {
    this.graph = graph;
    this.animations = animations;
    this.callbacks = callbacks;

    this.state = SIM_STATE.IDLE;
    this.source = null;
    this.result = null;       // Full BF result
    this.negCycleResult = null;
    this.allPaths = null;
    this.stepIndex = -1;      // Current position in history
    this.speed = 600;         // ms between steps
    this._timer = null;
  }

  /**
   * Prepare the simulation: run BF and store result, don't animate yet.
   * @param {string} source
   */
  prepare(source) {
    this._stop();
    this.source = source;

    const validation = validateGraph(this.graph, source);
    if (!validation.valid) {
      this.callbacks.onError?.(validation.errors.join('\n'));
      return false;
    }

    // Run the full algorithm
    const startTime = performance.now();
    this.result = runBellmanFord(this.graph, source);
    this.result.executionTimeMs = performance.now() - startTime;

    // Detect negative cycles
    this.negCycleResult = detectNegativeCycles(
      this.graph,
      this.result.dist,
      this.result.predecessor
    );

    // Reconstruct all paths
    this.allPaths = reconstructAllPaths(
      this.result.predecessor,
      source,
      this.graph.getVertices(),
      this.result.dist,
      this.negCycleResult.affectedVertices
    );

    this.stepIndex = -1;
    this._setState(SIM_STATE.READY);
    return true;
  }

  play() {
    if (this.state === SIM_STATE.FINISHED) return;
    if (this.state === SIM_STATE.IDLE) return;
    this._setState(SIM_STATE.PLAYING);
    this._scheduleNext();
  }

  pause() {
    if (this.state !== SIM_STATE.PLAYING) return;
    this._stop();
    this._setState(SIM_STATE.PAUSED);
  }

  resume() {
    if (this.state !== SIM_STATE.PAUSED) return;
    this._setState(SIM_STATE.PLAYING);
    this._scheduleNext();
  }

  nextStep() {
    if (this.state === SIM_STATE.FINISHED) return;
    if (this.state === SIM_STATE.IDLE) return;
    this._stop();
    if (this.state === SIM_STATE.PLAYING) {
      this._setState(SIM_STATE.PAUSED);
    }
    this._applyStep(this.stepIndex + 1);
  }

  prevStep() {
    if (this.stepIndex <= 0) return;
    this._stop();
    if (this.state === SIM_STATE.PLAYING) this._setState(SIM_STATE.PAUSED);
    this._applyStep(this.stepIndex - 1);
  }

  restart() {
    this._stop();
    this.stepIndex = -1;
    this.animations.reset(this.source);
    this._setState(this.result ? SIM_STATE.READY : SIM_STATE.IDLE);
    this.callbacks.onStep?.(null, -1);
  }

  fastForward() {
    this._stop();
    // Jump to end
    this.stepIndex = this.result.history.length - 1;
    this._finalize();
  }

  setSpeed(ms) {
    this.speed = Math.max(100, Math.min(3000, ms));
  }

  reset() {
    this._stop();
    this.state = SIM_STATE.IDLE;
    this.source = null;
    this.result = null;
    this.negCycleResult = null;
    this.allPaths = null;
    this.stepIndex = -1;
    this.animations.reset(null);
    this.callbacks.onStateChange?.(SIM_STATE.IDLE, null);
  }

  getResult() { return this.result; }
  getNegCycleResult() { return this.negCycleResult; }
  getAllPaths() { return this.allPaths; }
  getStepIndex() { return this.stepIndex; }
  getTotalSteps() { return this.result?.history.length ?? 0; }
  getCurrentEvent() {
    if (!this.result || this.stepIndex < 0) return null;
    return this.result.history[this.stepIndex] ?? null;
  }

  // ── Private ────────────────────────────────────────────────

  _applyStep(index) {
    const history = this.result.history;
    if (index < 0 || index >= history.length) {
      if (index >= history.length) this._finalize();
      return;
    }

    this.stepIndex = index;
    const event = history[index];

    // Build current dist from snapshot
    const dist = { ...event.distSnapshot };
    if (event.relaxed) dist[event.to] = event.distAfter;

    this.animations.applyStep(event, dist, this.source);
    this.callbacks.onStep?.(event, index);

    if (index >= history.length - 1 && this.state === SIM_STATE.PLAYING) {
      this._finalize();
    }
  }

  _finalize() {
    this._stop();
    this._setState(SIM_STATE.FINISHED);

    this.animations.applyFinalState(
      this.result.dist,
      this.negCycleResult.affectedVertices,
      this.negCycleResult.cycles,
      this.allPaths,
      this.source
    );

    this.callbacks.onFinish?.(this.result, this.negCycleResult, this.allPaths);
  }

  _scheduleNext() {
    this._timer = setTimeout(() => {
      if (this.state !== SIM_STATE.PLAYING) return;
      const nextIdx = this.stepIndex + 1;
      if (nextIdx >= this.result.history.length) {
        this._finalize();
        return;
      }
      this._applyStep(nextIdx);
      if (this.state === SIM_STATE.PLAYING) {
        this._scheduleNext();
      }
    }, this.speed);
  }

  _stop() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  _setState(state) {
    this.state = state;
    this.callbacks.onStateChange?.(state, this);
  }
}
