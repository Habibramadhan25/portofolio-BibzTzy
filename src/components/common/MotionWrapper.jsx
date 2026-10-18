import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export const pageContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
      when: 'beforeChildren',
      staggerChildren: 0.08,
      delayChildren: 0.03
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
  }
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.48,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const cardItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.52,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * PageTransition Wrapper
 * Staggers header, controls, cards, and sections gracefully.
 */
export function PageTransition({ children, className = '', style = {}, id }) {
  const { isReducedMotion } = useTheme();

  if (isReducedMotion) {
    return (
      <div id={id} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
      style={{
        width: '100%',
        ...style
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * MotionItem
 * For Titles, Headers, Filters, and Subtitles.
 */
export function MotionItem({ children, className = '', style = {}, ...props }) {
  const { isReducedMotion } = useTheme();

  if (isReducedMotion) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerItemVariants}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * MotionCard
 * For Cards, Boxes, Grid elements with subtle scale + slide up.
 */
export function MotionCard({ children, className = '', style = {}, hoverLift = true, ...props }) {
  const { isReducedMotion } = useTheme();

  if (isReducedMotion) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={cardItemVariants}
      whileHover={hoverLift ? { y: -3, transition: { duration: 0.2, ease: 'easeOut' } } : undefined}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerGrid
 * Specific sub-container for grids of cards (skills, projects, certs).
 */
export function StaggerGrid({ children, className = '', style = {}, stagger = 0.06 }) {
  const { isReducedMotion } = useTheme();

  if (isReducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger,
            delayChildren: 0.05
          }
        }
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn Component
 * Staggered fade in for card grids, lists, or headers (backward compatibility).
 */
export function FadeIn({ children, delay = 0, direction = 'up', className = '', style = {} }) {
  const { isReducedMotion } = useTheme();

  if (isReducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const offset = direction === 'up' ? 14 : direction === 'down' ? -14 : direction === 'left' ? 14 : -14;
  const isHorizontal = direction === 'left' || direction === 'right';

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: isHorizontal ? offset : 0,
        y: !isHorizontal ? offset : 0
      }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.38,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleOnHover Component
 * Interactive hover and tap feedback.
 */
export function ScaleOnHover({ children, scale = 1.02, tapScale = 0.98, className = '', style = {} }) {
  const { isReducedMotion } = useTheme();

  if (isReducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}
