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
    <div className="inline-flex items-center gap-2">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-60 live-pulse-dot" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10B981]" />
      </span>
      <span className="text-[10px] uppercase tracking-[0.08em] text-[#10B981]">Live</span>
      <span className="text-[10px] text-muted-foreground">Updated {seconds}s ago</span>
    </div>
  )
}
