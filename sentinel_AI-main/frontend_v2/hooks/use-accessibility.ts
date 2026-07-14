import * as React from "react"

/**
 * Keyboard navigation hook for accessible list navigation.
 * Supports Arrow Up/Down, Home, End, Enter, and Escape.
 */
export function useKeyboardNavigation(itemCount: number, onSelect?: (index: number) => void, onEscape?: () => void) {
  const [activeIndex, setActiveIndex] = React.useState(-1)

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setActiveIndex((prev) => (prev + 1) % itemCount)
          break
        case "ArrowUp":
          e.preventDefault()
          setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount)
          break
        case "Home":
          e.preventDefault()
          setActiveIndex(0)
          break
        case "End":
          e.preventDefault()
          setActiveIndex(itemCount - 1)
          break
        case "Enter":
        case " ":
          e.preventDefault()
          if (activeIndex >= 0) onSelect?.(activeIndex)
          break
        case "Escape":
          e.preventDefault()
          onEscape?.()
          setActiveIndex(-1)
          break
      }
    },
    [itemCount, activeIndex, onSelect, onEscape]
  )

  return { activeIndex, setActiveIndex, handleKeyDown }
}

/**
 * Announces messages to screen readers via a live region.
 */
export function useAnnounce() {
  const announce = React.useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    const el = document.createElement("div")
    el.setAttribute("role", "status")
    el.setAttribute("aria-live", priority)
    el.setAttribute("aria-atomic", "true")
    el.className = "sr-only"
    el.textContent = message
    document.body.appendChild(el)
    setTimeout(() => document.body.removeChild(el), 1000)
  }, [])

  return announce
}

/**
 * Traps focus within a container element for modal dialogs.
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, isActive: boolean) {
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return
    const container = containerRef.current
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelector)
    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    firstFocusable?.focus()

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    container.addEventListener("keydown", handleTab)
    return () => container.removeEventListener("keydown", handleTab)
  }, [containerRef, isActive])
}
