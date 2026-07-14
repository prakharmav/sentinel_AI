"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "./button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  siblingCount?: number
}

function generateRange(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  siblingCount = 1,
}: PaginationProps) {
  const pages = React.useMemo(() => {
    const totalShown = siblingCount * 2 + 5 // first, last, current, 2 ellipses
    if (totalPages <= totalShown) {
      return generateRange(1, totalPages)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const showLeftDots = leftSiblingIndex > 2
    const showRightDots = rightSiblingIndex < totalPages - 1

    if (!showLeftDots && showRightDots) {
      const leftRange = generateRange(1, 3 + 2 * siblingCount)
      return [...leftRange, "...", totalPages]
    }
    if (showLeftDots && !showRightDots) {
      const rightRange = generateRange(totalPages - (2 + 2 * siblingCount), totalPages)
      return [1, "...", ...rightRange]
    }
    if (showLeftDots && showRightDots) {
      const middleRange = generateRange(leftSiblingIndex, rightSiblingIndex)
      return [1, "...", ...middleRange, "...", totalPages]
    }
    return generateRange(1, totalPages)
  }, [currentPage, totalPages, siblingCount])

  if (totalPages <= 1) return null

  return (
    <nav className={cn("flex items-center justify-center gap-1", className)} aria-label="Pagination">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous</span>
      </Button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="flex items-center justify-center h-9 w-9 text-on-surface-variant">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "ghost"}
            size="icon"
            className={cn(
              "h-9 w-9 text-sm font-medium",
              currentPage === page && "pointer-events-none"
            )}
            onClick={() => onPageChange(page as number)}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next</span>
      </Button>
    </nav>
  )
}
