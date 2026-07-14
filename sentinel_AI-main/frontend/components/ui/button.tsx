import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]"
    
    const variantStyles = {
      default: "bg-primary text-on-primary shadow hover:bg-primary/95",
      destructive: "bg-error text-white shadow-sm hover:bg-error/90",
      outline: "border border-outline/20 bg-background shadow-sm hover:bg-white/5 hover:text-on-surface",
      secondary: "bg-surface-container-high text-on-surface hover:bg-surface-container-highest",
      ghost: "hover:bg-white/5 hover:text-on-surface text-on-surface-variant",
      link: "text-primary underline-offset-4 hover:underline",
    }

    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-lg px-3 text-xs",
      lg: "h-11 rounded-2xl px-8",
      icon: "h-10 w-10",
    }

    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }