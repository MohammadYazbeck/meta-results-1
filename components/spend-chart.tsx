"use client";

import { useState } from "react";

import { DailySpend } from "@/lib/meta";
import { formatDisplayCurrency } from "@/lib/currency";

import { panelClassName } from "@/components/ui/class-names";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type SpendChartProps = {
  daily: DailySpend[];
};

export function SpendChart({ daily }: SpendChartProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const totalSpend = daily.reduce((sum, entry) => sum + entry.spend, 0);
  const highestSpend = daily.reduce(
    (highest, entry) => Math.max(highest, entry.spend),
    0,
  );

  return (
    <section className={cn(panelClassName, "min-w-0")}> 
      <SectionHeading
        action={
          <button
            aria-controls="daily-spend-details"
            aria-expanded={isExpanded}
            className="inline-flex min-h-10 items-center gap-3 rounded-full bg-[#f2f4f7] px-3.5 py-2 text-[12px] text-muted transition duration-200 hover:bg-[#e9edf2] focus:outline-none focus:ring-2 focus:ring-[#0866ff]/20"
            onClick={() => setIsExpanded((current) => !current)}
            type="button"
          >
            <span>
              الإجمالي خلال الفترة{" "}
              <strong className="font-semibold text-ink">
                {formatDisplayCurrency(totalSpend)}
              </strong>
            </span>
            <span className="h-5 w-px bg-black/[0.08]" />
            <span className="font-semibold text-[#0866ff]">
              {isExpanded ? "إخفاء" : "عرض"}
            </span>
            <svg
              aria-hidden="true"
              className={cn(
                "transition-transform duration-300",
                isExpanded && "rotate-180",
              )}
              fill="none"
              height="16"
              viewBox="0 0 24 24"
              width="16"
            >
              <path
                d="m7 10 5 5 5-5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        }
        eyebrow="اتجاه الإنفاق"
        title="الإنفاق اليومي"
      />

      <div
        aria-hidden={!isExpanded}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
        id="daily-spend-details"
      >
        <div className="overflow-hidden">
          <div className="p-5 pt-3">
          <div className="grid gap-3 min-[500px]:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            {daily.map((entry) => {
              const isHighest = highestSpend > 0 && entry.spend === highestSpend;
              const fillPercentage = highestSpend
                ? Math.max(4, Math.round((entry.spend / highestSpend) * 100))
                : 0;

              return (
                <div
                  className={cn(
                    "rounded-2xl p-3.5 ring-1 ring-black/[0.035] transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]",
                    isHighest
                      ? "bg-[linear-gradient(145deg,#fff0dc,#fffaf4)] shadow-[0_8px_22px_rgba(242,140,40,0.12)]"
                      : "bg-[#f6f8fb]",
                  )}
                  key={entry.date}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("block text-[12px]", isHighest ? "text-[#9a4d08]" : "text-muted")}>
                      {entry.date}
                    </span>
                    {isHighest ? (
                      <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[#a6530a]">
                        أعلى يوم
                      </span>
                    ) : null}
                  </div>
                  <strong className={cn("mt-1 block font-display text-[15px] font-medium tabular-nums", isHighest ? "text-[#8d4708]" : "text-ink")}>
                    {formatDisplayCurrency(entry.spend)}
                  </strong>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.055]">
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        isHighest ? "bg-[#f28c28]" : "bg-[#0866ff]/65",
                      )}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {!daily.length ? (
              <div className="rounded-lg border border-dashed border-line bg-[var(--bg-soft)] px-4 py-5 text-center text-sm text-muted">
                لا توجد بيانات إنفاق يومية لهذه الفترة.
              </div>
            ) : null}
        </div>
      </div>
        </div>
      </div>
    </section>
  );
}
