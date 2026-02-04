import * as React from "react";

import { cn } from "@/lib/utils";

export interface FrameProps extends React.HTMLAttributes<HTMLDivElement> {
  background?: "subtle" | "none";
}

export function Frame({ background = "subtle", className, children, ...props }: FrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border",
        background === "subtle" ? "bg-muted/30" : "bg-transparent",
        className
      )}
      {...props}
    >
      <div className="p-4">{children}</div>
    </div>
  );
}
