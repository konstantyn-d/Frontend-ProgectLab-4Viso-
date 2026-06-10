'use client'

import { useEffect, useState } from 'react'

export function LiveIndicator() {
  const [seconds, setSeconds] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => (prev >= 30 ? 1 : prev + 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="inline-flex items-center gap-2.5 h-[30px] px-[14px] rounded-full border font-mono text-[10px] uppercase tracking-[0.07em]"
      style={{
        background: 'var(--accent-wash)',
        borderColor: 'var(--accent-line)',
        color: 'var(--accent-deep)',
      }}
    >
      <span className="pulse-dot" style={{ color: 'var(--primary)' }} />
      Live
      <span className="normal-case tracking-normal" style={{ color: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)', letterSpacing: 0 }}>
        · updated {seconds}s ago
      </span>
    </div>
  )
}
