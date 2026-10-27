// Shared motion tokens for MediVault.
//
// The design language is "clinical & trustworthy": motion should feel smooth
// and confident, never bouncy or distracting (think Linear/Stripe restraint).
// We lean on short durations, GPU-friendly transforms (opacity/translate/scale),
// and a calm easeOut curve.
//
// Reduced motion is honoured globally via <MotionConfig reducedMotion="user">
// in main.jsx — when a user prefers reduced motion, `motion` collapses transform
// animations to their final state automatically, so these tokens stay no-op.

// A gentle ease-out curve (same feel as the Tailwind scale-in keyframe).
export const EASE_OUT = [0.16, 1, 0.3, 1];

// Page / content fade + slide-up used for route transitions.
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.25, ease: EASE_OUT },
};

// Container that staggers its direct children (cards / list items).
export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.02 },
  },
};

// Individual item entrance — pairs with staggerContainer.
export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: EASE_OUT },
  },
};

// Modal / dialog panel: scale + fade in, quick fade out.
export const modalPanel = {
  initial: { opacity: 0, scale: 0.97, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 4 },
  transition: { duration: 0.2, ease: EASE_OUT },
};

// Backdrop fade.
export const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18, ease: 'easeOut' },
};

// Bottom sheet slide-up.
export const sheetPanel = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 40 },
  transition: { duration: 0.26, ease: EASE_OUT },
};

// Dropdown / menu panel: small scale + fade from the trigger.
export const menuPanel = {
  initial: { opacity: 0, scale: 0.97, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: -2 },
  transition: { duration: 0.15, ease: EASE_OUT },
};

// Understated tap feedback for interactive controls.
export const tap = { scale: 0.97 };
