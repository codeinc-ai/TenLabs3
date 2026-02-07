"use client"

import { cn } from "@/lib/utils"

interface ShimmeringTextProps {
  text: string
  className?: string
}

export function ShimmeringText({ text, className }: ShimmeringTextProps) {
  return (
    <span
      className={cn(
        "animate-pulse text-foreground/80",
        "inline-block",
        className
      )}
    >
      {text}
    </span>
  )
}
