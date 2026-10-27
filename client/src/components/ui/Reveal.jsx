import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '../../lib/motion.js';

// Reusable entrance primitives for cards & lists.
//
// <RevealGroup> is a container that staggers its direct <Reveal> children in on
// mount (opacity + small y). <Reveal> is also usable on its own for a single
// element. Both pass through className and arbitrary props to the underlying
// motion element, and accept `as` to render a different tag (ul/li/section…).
//
// Reduced-motion is handled globally by <MotionConfig reducedMotion="user">, so
// these degrade to a clean no-op for users who prefer less movement.

export function RevealGroup({ as = 'div', className = '', children, ...props }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      {...props}
    >
      {children}
    </Comp>
  );
}

// A single item. When used inside <RevealGroup> it inherits the stagger via
// variants; when used standalone it animates itself on mount.
export function Reveal({ as = 'div', className = '', standalone = false, children, ...props }) {
  const Comp = motion[as] || motion.div;
  const standaloneProps = standalone
    ? { initial: 'hidden', animate: 'show' }
    : {};
  return (
    <Comp className={className} variants={staggerItem} {...standaloneProps} {...props}>
      {children}
    </Comp>
  );
}
