import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type HierarchyBadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted";
  variant: "campaign" | "adSet" | "ad";
};

const badgeStyles = {
  ad: "border-[#10b981]/15 bg-[rgba(16,185,129,0.1)] text-[#047857]",
  adSet: "border-[#7c3aed]/15 bg-[rgba(124,58,237,0.1)] text-[#6d28d9]",
  campaign: "border-accent/15 bg-[rgba(0,113,227,0.1)] text-accent",
} as const;

const dotStyles = {
  ad: "bg-[#10b981]",
  adSet: "bg-[#7c3aed]",
  campaign: "bg-accent",
} as const;

const mutedBadgeStyle = "border-[#8e8e93]/18 bg-[#8e8e93]/10 text-[#6e6e73]";
const mutedDotStyle = "bg-[#8e8e93]";

export function HierarchyBadge({
  children,
  className,
  tone = "default",
  variant,
}: HierarchyBadgeProps) {
  const isMuted = tone === "muted";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase ",
        isMuted ? mutedBadgeStyle : badgeStyles[variant],
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", isMuted ? mutedDotStyle : dotStyles[variant])} />
      {children}
    </span>
  );
}
