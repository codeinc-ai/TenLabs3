import * as React from "react";

import { cn } from "@/lib/utils";

export interface StepProps extends React.HTMLAttributes<HTMLLIElement> {
  title: string;
  stepNumber?: number;
}

export function Step({ title, stepNumber, className, children, ...props }: StepProps) {
  return (
    <li className={cn("relative pl-12", className)} {...props}>
      <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border bg-background text-sm font-semibold">
        {stepNumber ?? "•"}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="mt-2 text-sm text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
        {children}
      </div>
    </li>
  );
}

export type StepsProps = React.HTMLAttributes<HTMLOListElement>;

export function Steps({ className, children, ...props }: StepsProps) {
  const items = React.Children.toArray(children).map((child, index) => {
    if (!React.isValidElement<StepProps>(child)) return child;

    // Only inject numbering into our own <Step /> components.
    if (child.type !== Step) return child;

    return React.cloneElement(child, {
      stepNumber: index + 1,
    });
  });

  return (
    <ol
      className={cn(
        "space-y-8 border-l border-border/60 pl-6",
        className
      )}
      {...props}
    >
      {items}
    </ol>
  );
}
