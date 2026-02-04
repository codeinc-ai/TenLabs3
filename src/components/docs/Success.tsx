import * as React from "react";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type SuccessProps = React.HTMLAttributes<HTMLDivElement>;

export function Success({ className, children, ...props }: SuccessProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
        <div className="text-emerald-950 dark:text-emerald-50 [&_strong]:font-semibold">
          {children}
        </div>
      </div>
    </div>
  );
}
