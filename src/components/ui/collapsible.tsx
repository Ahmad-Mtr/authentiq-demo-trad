"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CollapsibleProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  isEmpty?: boolean
  badge?: string | number
  className?: string
}

export function Collapsible({
  title,
  icon,
  children,
  defaultOpen = true,
  isEmpty = false,
  badge,
  className,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen && !isEmpty)

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 text-left transition-colors",
          "hover:bg-muted/50",
          isOpen && "border-b"
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="font-medium">{title}</span>
          {badge !== undefined && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
              {badge}
            </span>
          )}
          {isEmpty && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
              Empty
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="p-4">
          {isEmpty ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No data available. Click "Add" to add items.
            </p>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  )
}
