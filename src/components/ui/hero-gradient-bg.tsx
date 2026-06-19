import { cn } from "@/lib/utils";

interface HeroGradientBgProps {
  className?: string;
  colorFrom?: string;
  colorTo?: string;
  size?: string;
  position?: string;
}

export function HeroGradientBg({
  className,
  colorFrom = "#000",
  colorTo = "#63e",
  size = "125% 125%",
  position = "50% 10%",
}: HeroGradientBgProps) {
  return (
    <div
      className={cn("absolute inset-0 -z-10 h-full w-full", className)}
      style={{
        background: `radial-gradient(${size} at ${position}, ${colorFrom} 40%, ${colorTo} 100%)`,
      }}
    />
  );
}
