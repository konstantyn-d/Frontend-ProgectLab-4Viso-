'use client'

import { useMemo } from 'react'

// Seeded pseudo-random so SSR and client agree
function makeRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function NetworkBackground() {
  const { points, lines } = useMemo(() => {
    const rng = makeRng(42)
    const points = Array.from({ length: 36 }, () => ({
      x: rng() * 100,
      y: rng() * 100,
      r: 0.4 + rng() * 0.6,
      delay: rng() * 3,
    }))
    const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = []
    points.forEach((a, i) => {
      points.slice(i + 1).forEach((b) => {
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 18) {
          lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, opacity: 1 - dist / 18 })
        }
      })
    })
    return { points, lines }
  }, [])

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0A0A0A" stopOpacity="0" />
          <stop offset="100%" stopColor="#0A0A0A" stopOpacity="0.8" />
        </radialGradient>
      </defs>
      {lines.map((line, i) => (
        <line
          key={`l-${i}`}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#10B981"
          strokeWidth={0.08}
          strokeOpacity={line.opacity * 0.25}
        />
      ))}
      {points.map((p, i) => (
        <circle key={`p-${i}`} cx={p.x} cy={p.y} r={p.r} fill="#10B981" opacity={0.6}>
          <animate
            attributeName="opacity"
            values="0.2;0.8;0.2"
            dur={`${3 + (i % 4)}s`}
            begin={`${p.delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      <rect width="100" height="100" fill="url(#vignette)" />
    </svg>
  )
}
