import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type HierarchyBadgeProps = {
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted";
  variant: "campaign" | "adSet" | "ad";
};

const badgeStyles = {
  ad: "border-[#31a24c]/20 bg-[#e9f7ed] text-[#237b36]",
  adSet: "border-[#1877f2]/20 bg-[#e7f3ff] text-[#166fe5]",
  campaign: "border-accent/20 bg-[#e7f3ff] text-accent",
} as const;

const dotStyles = {
  ad: "bg-success",
  adSet: "bg-[#1877f2]",
  campaign: "bg-accent",
} as const;

const mutedBadgeStyle = "border-line bg-[var(--bg-soft)] text-muted";
const mutedDotStyle = "bg-muted";

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
        "inline-flex w-fit items-center gap-2 rounded border px-3 py-1 text-[11px] font-semibold",
        isMuted ? mutedBadgeStyle : badgeStyles[variant],
        className
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", isMuted ? mutedDotStyle : dotStyles[variant])} />
      {children}
    </span>
  );
}
