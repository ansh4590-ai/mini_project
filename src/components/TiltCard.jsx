// TiltCard.jsx — High-performance 3D perspective card with mouse-tracking specular shine & glow
import React, { useRef, useState, useCallback } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { clsx } from 'clsx';

/**
 * TiltCard — wrap any card content for 3D hover tilt + specular shine + colored ambient glow
 *
 * Props:
 *  glowColor   – CSS color string for the glow/shine (default #8b5cf6)
 *  tiltMax     – max tilt degrees (default 10)
 *  scale       – scale on hover (default 1.02)
 *  className   – extra classes (applied to perspective container)
 *  innerClass  – extra classes on the inner card body
 *  children    – card content
 */
export default function TiltCard({
  glowColor = '#8b5cf6',
  tiltMax = 10,
  scale = 1.02,
  className = '',
  innerClass = '',
  children,
  ...rest
}) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  // Smooth, snappy spring physics
  const springCfg = { stiffness: 220, damping: 20, mass: 0.6 };

  const rawX = useSpring(0, springCfg);
  const rawY = useSpring(0, springCfg);

  const rotateX = useTransform(rawY, [-0.5, 0.5], [tiltMax, -tiltMax]);
  const rotateY = useTransform(rawX, [-0.5, 0.5], [-tiltMax, tiltMax]);

  // Specular shine light position
  const [shine, setShine] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    rawX.set(nx - 0.5);
    rawY.set(ny - 0.5);
    setShine({ x: Math.round(nx * 100), y: Math.round(ny * 100) });
  }, [rawX, rawY]);

  const handleMouseEnter = useCallback(() => setHovered(true), []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    rawX.set(0);
    rawY.set(0);
    setShine({ x: 50, y: 50 });
  }, [rawX, rawY]);

  return (
    <div
      style={{ perspective: 1100, touchAction: 'pan-y' }}
      className={clsx('relative cursor-default', className)}
      {...rest}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          scale: hovered ? scale : 1,
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        transition={{ scale: { type: 'spring', stiffness: 300, damping: 25 } }}
        className="relative h-full w-full rounded-2xl"
      >
        {/* Ambient neon backglow behind card */}
        <div
          className="absolute -inset-1 rounded-2xl pointer-events-none transition-opacity duration-300 blur-xl z-0"
          style={{
            background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, ${glowColor}50, transparent 70%)`,
            opacity: hovered ? 0.7 : 0,
          }}
        />

        {/* Card border & surface container */}
        <div
          className={clsx(
            'relative z-10 h-full rounded-2xl overflow-hidden',
            'bg-zinc-900/90 backdrop-blur-xl border border-zinc-800',
            'shadow-lg transition-all duration-300',
            hovered ? 'border-zinc-700 shadow-2xl' : '',
            innerClass
          )}
          style={{
            boxShadow: hovered
              ? `0 16px 40px -12px ${glowColor}30, 0 0 0 1px ${glowColor}40`
              : '0 4px 20px -2px rgba(0,0,0,0.5)',
          }}
        >
          {/* Dynamic specular glass highlight tracking cursor */}
          <div
            className="absolute inset-0 pointer-events-none z-20 rounded-2xl transition-opacity duration-200"
            style={{
              opacity: hovered ? 1 : 0,
              background: `radial-gradient(circle 280px at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 40%, transparent 80%)`,
            }}
          />

          {/* Children content with 3D depth */}
          <div className="relative z-30 h-full">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
