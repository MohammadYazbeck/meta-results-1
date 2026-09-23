"use client";

import { ReactNode, useId, useState } from "react";

import { cn } from "@/lib/utils";

type ExpandableDetailSectionProps = {
  children: ReactNode;
  className?: string;
  description: string;
  icon: "info" | "metrics";
  title: string;
  tone: "blue" | "orange";
};

function SectionIcon({ icon }: { icon: ExpandableDetailSectionProps["icon"] }) {
  if (icon === "metrics") {
    return (
      <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 24 24" width="19">
        <path d="M5 19V9m7 10V5m7 14v-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 24 24" width="19">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10.5V16m0-8.5h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function ExpandableDetailSection({
  children,
  className,
  description,
  icon,
  title,
  tone,
}: ExpandableDetailSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const reactId = useId();
  const contentId = `detail-section-${reactId.replace(/:/g, "")}`;
  const isOrange = tone === "orange";

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[18px] bg-white/78 shadow-[0_1px_2px_rgba(15,23,42,0.03)] ring-1 ring-black/[0.04] transition-shadow duration-300",
        isExpanded && "shadow-[0_12px_30px_rgba(15,23,42,0.075)]",
        className,
      )}
    >
      <button
        aria-controls={contentId}
        aria-expanded={isExpanded}
        className="flex w-full items-center gap-3 p-3.5 text-right transition-colors hover:bg-[#f8fafc] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0866ff]/20 sm:p-4"
        onClick={() => setIsExpanded((current) => !current)}
        type="button"
      >
        <span
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm",
            isOrange
              ? "bg-[#fff1df] text-[#c56812]"
              : "bg-[#eaf3ff] text-[#0866ff]",
          )}
        >
          <SectionIcon icon={icon} />
        </span>

        <span className="min-w-0 flex-1">
          <strong className="block text-sm font-bold text-ink sm:text-[15px]">{title}</strong>
          <span className="mt-0.5 block text-[12px] leading-5 text-muted">{description}</span>
        </span>

        <span className="hidden text-[12px] font-semibold text-muted sm:block">
          {isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
        </span>
        <span
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0f2f5] text-muted transition duration-300",
            isExpanded && "rotate-180 bg-[#eaf3ff] text-[#0866ff]",
          )}
        >
          <svg aria-hidden="true" fill="none" height="17" viewBox="0 0 24 24" width="17">
            <path d="m7 10 5 5 5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </span>
      </button>

      <div
        aria-hidden={!isExpanded}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        id={contentId}
      >
        <div className="overflow-hidden">
          <div className="px-3.5 pb-3.5 pt-1 sm:px-4 sm:pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
