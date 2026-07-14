"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<any>({})

export const Tabs = ({ defaultValue, className, children }: any) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue)
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("flex flex-col", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export const TabsList = ({ className, children }: any) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}>
    {children}
  </div>
)

export const TabsTrigger = ({ value, className, children }: any) => {
  const { activeTab, setActiveTab } = React.useContext(TabsContext)
  const isActive = activeTab === value
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow-sm" : "hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ value, className, children }: any) => {
  const { activeTab } = React.useContext(TabsContext)
  if (activeTab !== value) return null
  return (
    <div className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}>
      {children}
    </div>
  )
}
