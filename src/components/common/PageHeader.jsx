import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const headerContainerVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.06,
      delayChildren: 0.02
    }
  }
};

const headerChildVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export default function PageHeader({
  badge,
  title,
  subtitle,
  actions
}) {
  const { isReducedMotion } = useTheme();

  if (isReducedMotion) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1.25rem',
        marginBottom: '1.75rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '750px', minWidth: 0, flex: '1 1 280px' }}>
          {badge && (
            <div>
              <span className="badge badge-ice">{badge}</span>
            </div>
          )}
          <h1 style={{ fontSize: 'clamp(1.35rem, 5vw, 2rem)', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 'clamp(0.84rem, 2.4vw, 0.95rem)', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      variants={headerContainerVariants}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1.25rem',
        marginBottom: '1.75rem',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '750px', minWidth: 0, flex: '1 1 280px' }}>
        {badge && (
          <motion.div variants={headerChildVariants}>
            <span className="badge badge-ice glow-subtle">{badge}</span>
          </motion.div>
        )}
        <motion.h1
          variants={headerChildVariants}
          style={{ fontSize: 'clamp(1.35rem, 5vw, 2rem)', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', wordBreak: 'break-word' }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            variants={headerChildVariants}
            style={{ fontSize: 'clamp(0.84rem, 2.4vw, 0.95rem)', color: 'var(--text-secondary)', lineHeight: 1.55 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {actions && (
        <motion.div
          variants={headerChildVariants}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', flexShrink: 0 }}
        >
          {actions}
        </motion.div>
      )}
    </motion.div>
  );
}
