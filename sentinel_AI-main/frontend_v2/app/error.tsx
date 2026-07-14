'use client'

import { ErrorState } from '@/components/ui/error-state'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background flex items-center justify-center p-8">
        <ErrorState
          title="System Exception"
          message={error.message || 'An unexpected error occurred.'}
          onRetry={reset}
        />
      </body>
    </html>
  )
}
