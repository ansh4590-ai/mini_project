// AnimatedGridPattern.jsx
// Source: https://magicui.design/docs/components/animated-grid-pattern
// Dependency: framer-motion (already installed as framer-motion v14)
import React, { useId, useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}) {
  const id = useId();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [squares, setSquares] = useState(() => generateSquares(numSquares, 10, 10));

  function getPos(columns, rows) {
    return [
      getRandomInt(0, columns),
      getRandomInt(0, rows),
    ];
  }

  function generateSquares(count, columns, rows) {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: getPos(columns, rows),
    }));
  }

  const updateSquarePosition = useCallback(
    (id) => {
      setSquares((prev) =>
        prev.map((sq) => {
          if (sq.id === id) {
            const columns = Math.floor(dimensions.width / width);
            const rows = Math.floor(dimensions.height / height);
            return { ...sq, pos: getPos(columns || 10, rows || 10) };
          }
          return sq;
        })
      );
    },
    [dimensions.width, dimensions.height, width, height]
  );

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      const columns = Math.floor(dimensions.width / width);
      const rows = Math.floor(dimensions.height / height);
      setSquares(generateSquares(numSquares, columns, rows));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, numSquares, width, height]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    const container = containerRef.current;
    if (container) resizeObserver.observe(container);
    return () => { if (container) resizeObserver.unobserve(container); };
  }, [containerRef]);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={clsx(
        'pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30',
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ id: sqId, pos: [sqX, sqY] }) => (
          <motion.rect
            key={`${sqId}-${sqX}-${sqY}`}
            width={width - 1}
            height={height - 1}
            x={sqX * width + 1}
            y={sqY * height + 1}
            fill="currentColor"
            strokeWidth="0"
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: 1,
              delay: Math.random() * (duration / 2),
              repeatType: 'reverse',
              ease: 'easeInOut',
              repeatDelay,
            }}
            onAnimationComplete={() => updateSquarePosition(sqId)}
          />
        ))}
      </svg>
    </svg>
  );
}
