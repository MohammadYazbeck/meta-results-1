import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
  eyebrowClassName,
  mutedTextClassName,
} from "@/components/ui/class-names";

type SectionHeadingProps = {
  action?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: string;
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
        "flex flex-col gap-3 px-5 pb-3 pt-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:pt-6",
        className
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? <p className={eyebrowClassName}>{eyebrow}</p> : null}
        <h2 className="font-display text-[20px] font-bold leading-tight text-ink">
          {title}
        </h2>
        {description ? (
          <div className={mutedTextClassName}>{description}</div>
        ) : null}
      </div>
      {action ? (
        <div className="text-sm font-medium text-muted sm:text-left">
          {action}
        </div>
      ) : null}
    </div>
  );
}
