import dynamic from "next/dynamic"
import * as React from "react"

/**
 * Lazy-load a component with Next.js dynamic import.
 * Automatically shows a loading fallback.
 */
export function lazyLoad<T extends React.ComponentType<React.ComponentProps<T>>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  return dynamic(importFn, {
    loading: () => <>{fallback ?? null}</>,
    ssr: false,
  })
}

/**
 * Memoize a component to prevent unnecessary re-renders.
 * Wraps React.memo with a display name for DevTools.
 */
export function memoize<P extends object>(
  Component: React.FC<P>,
  displayName: string,
  propsAreEqual?: (prev: Readonly<P>, next: Readonly<P>) => boolean
): React.NamedExoticComponent<P> {
  const MemoizedComponent = React.memo(Component, propsAreEqual)
  MemoizedComponent.displayName = displayName
  return MemoizedComponent
}
