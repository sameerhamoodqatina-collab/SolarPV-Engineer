'use client';

import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type CardVariant = 'default' | 'glass' | 'solid' | 'gradient';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'title'> {
  variant?: CardVariant;
  padding?: CardPadding;
  header?: ReactNode;
  footer?: ReactNode;
  glow?: boolean;
  glowColor?: 'blue' | 'orange' | 'green';
  children?: ReactNode;
  hoverable?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-surface border border-border rounded-2xl',
  glass:
    'glass rounded-2xl',
  solid:
    'bg-bg-tertiary border border-border rounded-2xl',
  gradient:
    'bg-gradient-to-br from-solar-sky/10 via-surface to-solar-purple/10 border border-border rounded-2xl',
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const glowStyles: Record<string, string> = {
  blue: 'glow-blue',
  orange: 'glow-orange',
  green: 'glow-green',
};

export function Card({
  variant = 'default',
  padding = 'md',
  header,
  footer,
  glow = false,
  glowColor = 'blue',
  children,
  hoverable = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2, scale: 1.005 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        ${variantStyles[variant]}
        ${glow ? glowStyles[glowColor] : ''}
        overflow-hidden
        ${className}
      `}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-border">
          {header}
        </div>
      )}
      <div className={paddingStyles[padding]}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-border bg-surface-alt/50">
          {footer}
        </div>
      )}
    </motion.div>
  );
}

export { type CardProps, type CardVariant, type CardPadding };
