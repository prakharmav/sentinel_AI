import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { onValueChange?: (value: string) => void }>(({ className, onValueChange, onChange, ...props }, ref) => (
  <select
    ref={ref}
    onChange={(e) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    }}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
))
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div className={cn("hidden", className)} {...props}>{children}</div>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }>(({ className, placeholder, ...props }, ref) => (
  <span ref={ref} className={className} {...props} />
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div className={cn("hidden", className)} {...props}>{children}</div>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(({ className, ...props }, ref) => (
  <option className={className} {...props} />
))
SelectItem.displayName = "SelectItem"

// In my simple Select implementation, Select actually behaves as the native <select> wrapper,
// so when I use it like:
// <Select onValueChange={...}>
//   <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
//   <SelectContent>
//     <SelectItem value="All">All Status</SelectItem>
//   </SelectContent>
// </Select>
// This will render the native select if I modify the implementation slightly.
// To make it fully compatible with shadcn API but using native select:

export function SimpleSelect({ onValueChange, defaultValue, children }: any) {
  const [value, setValue] = React.useState(defaultValue || "");

  // Extract items from SelectContent -> SelectItem
  const items: any[] = [];
  React.Children.forEach(children, (child: any) => {
    if (child?.type?.displayName === "SelectContent") {
      React.Children.forEach(child.props.children, (item: any) => {
        if (item?.type?.displayName === "SelectItem") {
          items.push({ value: item.props.value, label: item.props.children });
        }
      });
    }
  });

  return (
    <select
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        if (onValueChange) onValueChange(e.target.value);
      }}
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {items.map((it, i) => (
        <option key={i} value={it.value}>{it.label}</option>
      ))}
    </select>
  );
}

export {
  SimpleSelect as Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
