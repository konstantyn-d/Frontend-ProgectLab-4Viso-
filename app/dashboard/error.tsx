'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <AlertTriangle className="w-10 h-10 text-[#E53E3E]" />
      <h2 className="text-[15px] font-medium text-[#F5F5F5]">Something went wrong</h2>
      <p className="text-[13px] text-[#6B6B6B] max-w-md text-center">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <Button
        onClick={reset}
        variant="outline"
        className="h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
      >
        Try again
      </Button>
    </div>
  )
}
