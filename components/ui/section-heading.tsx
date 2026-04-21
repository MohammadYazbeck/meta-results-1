import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { eyebrowClassName, mutedTextClassName } from "@/components/ui/class-names";

type SectionHeadingProps = {
  action?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow: string;
  title: ReactNode;
};

export function SectionHeading({
  action,
  className,
  description,
  eyebrow,
  title,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:pt-6",
        className,
      )}
    >
      <div className="max-w-2xl">
        <p className={eyebrowClassName}>{eyebrow}</p>
        <h2 className="font-display text-[clamp(1.35rem,2vw,2.05rem)] leading-[1.08] tracking-[-0.045em] text-ink">
          {title}
        </h2>
        {description ? <div className={mutedTextClassName}>{description}</div> : null}
      </div>
      {action ? (
        <div className="text-sm font-medium text-muted sm:text-left">{action}</div>
      ) : null}
    </div>
  );
}
