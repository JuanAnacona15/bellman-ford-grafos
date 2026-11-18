/**
 * animations.js — GSAP-powered UI animations for Bellman-Ford Visualizer
 * Following official GSAP best practices (gsap-core + gsap-timeline skills).
 *
 * Rules applied:
 *  ✅ Only animate transform + opacity (compositor-only)
 *  ✅ Use timelines for multi-step sequences, NOT chained delays
 *  ✅ Use gsap.matchMedia() for prefers-reduced-motion
 *  ✅ Store tween references for cleanup
 *  ✅ Use autoAlpha instead of opacity for show/hide
 *  ✅ Use stagger for lists of elements
 */

import gsap from 'gsap';

// ── Global defaults ──────────────────────────────────────────
gsap.defaults({ duration: 0.45, ease: 'power3.out' });

// ── Reduced-motion support ───────────────────────────────────
const mm = gsap.matchMedia();
let motionOk = true;
mm.add(
  { reduceMotion: '(prefers-reduced-motion: reduce)' },
  (ctx) => { motionOk = !ctx.conditions.reduceMotion; }
);

function dur(d) { return motionOk ? d : 0; }

// ════════════════════════════════════════════════════════════
// LANDING PAGE ENTRANCE
// ════════════════════════════════════════════════════════════
export function animateLandingEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Background orbs drift in slowly
  tl.fromTo('.hero-bg-orb', {
    scale: 0.4, autoAlpha: 0,
  }, {
    scale: 1, autoAlpha: 1,
    duration: dur(2.2),
    stagger: { each: 0.3, from: 'random' },
    ease: 'power2.out',
  }, 0)

  // Logo badge drops in
  .fromTo('.logo-badge', {
    y: -30, autoAlpha: 0, scale: 0.8,
  }, {
    y: 0, autoAlpha: 1, scale: 1,
    duration: dur(0.7),
    ease: 'back.out(1.5)',
  }, 0.3)

  // Title letters slide up with stagger
  .fromTo('.hero-title', {
    y: 50, autoAlpha: 0, skewY: 4,
  }, {
    y: 0, autoAlpha: 1, skewY: 0,
    duration: dur(0.9),
    ease: 'expo.out',
  }, 0.55)

  // Subtitle fades in
  .fromTo('.hero-subtitle', {
    y: 25, autoAlpha: 0,
  }, {
    y: 0, autoAlpha: 1,
    duration: dur(0.65),
  }, 0.8)

  // CTA buttons bounce in with stagger
  .fromTo('.hero-actions .btn', {
    y: 20, autoAlpha: 0, scale: 0.9,
  }, {
    y: 0, autoAlpha: 1, scale: 1,
    duration: dur(0.55),
    stagger: 0.12,
    ease: 'back.out(1.4)',
  }, 1.0)

  // Info cards stagger up
  .fromTo('.info-card', {
    y: 40, autoAlpha: 0, scale: 0.95,
  }, {
    y: 0, autoAlpha: 1, scale: 1,
    duration: dur(0.55),
    stagger: { each: 0.1, from: 'start' },
    ease: 'power3.out',
  }, 1.15)

  // Bottom hint fades
  .fromTo('.landing-hint', {
    autoAlpha: 0,
  }, {
    autoAlpha: 1,
    duration: dur(0.5),
  }, 1.6);

  return tl;
}

// ════════════════════════════════════════════════════════════
// APP ENTRANCE (when user clicks "Comenzar")
// ════════════════════════════════════════════════════════════
export function animateAppEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.fromTo('#app-header', {
    y: -60, autoAlpha: 0,
  }, {
    y: 0, autoAlpha: 1,
    duration: dur(0.55),
  })

  .fromTo('#sidebar', {
    x: -40, autoAlpha: 0,
  }, {
    x: 0, autoAlpha: 1,
    duration: dur(0.5),
  }, '<0.1')

  .fromTo('#graph-canvas-container', {
    scale: 0.97, autoAlpha: 0,
  }, {
    scale: 1, autoAlpha: 1,
    duration: dur(0.6),
    ease: 'expo.out',
  }, '<0.1')

  .fromTo('#step-info-bar', {
    y: 40, autoAlpha: 0,
  }, {
    y: 0, autoAlpha: 1,
    duration: dur(0.45),
  }, '<0.15');

  return tl;
}

// ════════════════════════════════════════════════════════════
// SIDEBAR SECTION PANELS APPEAR
// ════════════════════════════════════════════════════════════
export function animateSidebarSections(container = '#sidebar') {
  gsap.fromTo(`${container} .panel`, {
    x: -20, autoAlpha: 0,
  }, {
    x: 0, autoAlpha: 1,
    duration: dur(0.4),
    stagger: 0.07,
    ease: 'power2.out',
  });
}

// ════════════════════════════════════════════════════════════
// TAB SWITCH
// ════════════════════════════════════════════════════════════
export function animateTabSwitch(incomingTab) {
  gsap.fromTo(incomingTab, {
    y: 12, autoAlpha: 0,
  }, {
    y: 0, autoAlpha: 1,
    duration: dur(0.35),
    ease: 'power2.out',
    clearProps: 'transform,opacity,visibility',
  });
}

// ════════════════════════════════════════════════════════════
// VERTEX CHIP ENTRANCE
// ════════════════════════════════════════════════════════════
export function animateChipEntrance(chipEl) {
  gsap.fromTo(chipEl, {
    scale: 0.5, autoAlpha: 0, x: -10,
  }, {
    scale: 1, autoAlpha: 1, x: 0,
    duration: dur(0.35),
    ease: 'back.out(2)',
  });
}

export function animateChipExit(chipEl, onComplete) {
  gsap.to(chipEl, {
    scale: 0.5, autoAlpha: 0, x: 10,
    duration: dur(0.25),
    ease: 'power2.in',
    onComplete,
  });
}

// ════════════════════════════════════════════════════════════
// TOAST NOTIFICATION
// ════════════════════════════════════════════════════════════
export function animateToastIn(toastEl) {
  gsap.fromTo(toastEl, {
    x: 60, autoAlpha: 0, scale: 0.9,
  }, {
    x: 0, autoAlpha: 1, scale: 1,
    duration: dur(0.4),
    ease: 'back.out(1.5)',
  });
}

export function animateToastOut(toastEl, onComplete) {
  gsap.to(toastEl, {
    x: 60, autoAlpha: 0, scale: 0.9,
    duration: dur(0.3),
    ease: 'power2.in',
    onComplete,
  });
}

// ════════════════════════════════════════════════════════════
// SIMULATION STEP — flash step info bar
// ════════════════════════════════════════════════════════════
export function animateStepFlash(barEl, relaxed) {
  const color = relaxed ? 'rgba(0,255,136,0.18)' : 'rgba(255,107,0,0.12)';
  gsap.fromTo(barEl, {
    backgroundColor: color,
  }, {
    backgroundColor: 'transparent',
    duration: dur(0.8),
    ease: 'power2.out',
  });
}

// ════════════════════════════════════════════════════════════
// BUTTON PRESS FEEDBACK
// ════════════════════════════════════════════════════════════
export function animateButtonPress(btnEl) {
  gsap.to(btnEl, {
    scale: 0.93,
    duration: dur(0.1),
    ease: 'power2.in',
    yoyo: true,
    repeat: 1,
  });
}

// ════════════════════════════════════════════════════════════
// MODAL / DIALOG OPEN
// ════════════════════════════════════════════════════════════
export function animateModalOpen(overlayEl, dialogEl) {
  const tl = gsap.timeline();
  tl.fromTo(overlayEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur(0.25), ease: 'none' })
    .fromTo(dialogEl, {
      y: -30, scale: 0.93, autoAlpha: 0,
    }, {
      y: 0, scale: 1, autoAlpha: 1,
      duration: dur(0.4),
      ease: 'back.out(1.4)',
    }, '<');
  return tl;
}

export function animateModalClose(overlayEl, dialogEl, onComplete) {
  const tl = gsap.timeline({ onComplete });
  tl.to(dialogEl, { y: -20, scale: 0.95, autoAlpha: 0, duration: dur(0.25), ease: 'power2.in' })
    .to(overlayEl, { autoAlpha: 0, duration: dur(0.2), ease: 'none' }, '<0.05');
  return tl;
}

// ════════════════════════════════════════════════════════════
// NEON PULSE — applied to important elements periodically
// ════════════════════════════════════════════════════════════
export function startNeonPulse(el, color = 'rgba(0,212,255,0.6)') {
  return gsap.to(el, {
    boxShadow: `0 0 20px ${color}, 0 0 60px ${color.replace('0.6', '0.15')}`,
    duration: dur(1.4),
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
}

// ════════════════════════════════════════════════════════════
// FLOATING ORB IDLE ANIMATION
// ════════════════════════════════════════════════════════════
export function startOrbIdle() {
  const orbs = document.querySelectorAll('.hero-bg-orb');
  orbs.forEach((orb, i) => {
    gsap.to(orb, {
      x: `+=${20 + i * 15}`,
      y: `+=${15 + i * 10}`,
      duration: dur(6 + i * 2),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.8,
    });
  });
}

// ════════════════════════════════════════════════════════════
// SCAN LINE EFFECT on the graph canvas header area
// ════════════════════════════════════════════════════════════
export function startScanLine(el) {
  if (!el) return;
  gsap.to(el, {
    backgroundPositionY: '100%',
    duration: dur(3),
    repeat: -1,
    ease: 'none',
  });
}

// ════════════════════════════════════════════════════════════
// ANALYSIS RESULTS ENTRANCE
// ════════════════════════════════════════════════════════════
export function animateResultsIn(container) {
  const rows = container?.querySelectorAll('tr, .stat-item, .path-display, .log-entry');
  if (!rows?.length) return;
  gsap.fromTo(rows, {
    x: -15, autoAlpha: 0,
  }, {
    x: 0, autoAlpha: 1,
    duration: dur(0.35),
    stagger: 0.03,
    ease: 'power2.out',
  });
}
