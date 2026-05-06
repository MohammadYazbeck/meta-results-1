import { DailySpend } from "@/lib/meta";
import { formatDisplayCurrency } from "@/lib/currency";

import { panelClassName } from "@/components/ui/class-names";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type SpendChartProps = {
  daily: DailySpend[];
};

export function SpendChart({ daily }: SpendChartProps) {
  const totalSpend = daily.reduce((sum, entry) => sum + entry.spend, 0);

  return (
    <section className={cn(panelClassName, "min-w-0")}> 
      <SectionHeading
        action={
          <div className="rounded-full border border-black/[0.05] bg-white/75 px-3 py-1.5 text-[13px] text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
            الإجمالي خلال الفترة {formatDisplayCurrency(totalSpend)}
          </div>
        }
        eyebrow="اتجاه الإنفاق"
        title="الإنفاق اليومي"
      />

      <div className="px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
        <div className="rounded-[28px] border border-black/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,249,251,0.9))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-4">
          <div className="grid gap-3 min-[500px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {daily.map((entry) => (
              <div
                className="rounded-[22px] border border-black/[0.05] bg-white/80 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                key={entry.date}
              >
                <span className="block text-[11px] font-semibold uppercase text-muted">
                  {entry.date}
                </span>
                <strong className="mt-1 block font-display text-[15px] font-medium text-ink">
                  {formatDisplayCurrency(entry.spend)}
                </strong>
              </div>
            ))}

            {!daily.length ? (
              <div className="rounded-[22px] border border-dashed border-black/[0.08] bg-white/50 px-4 py-5 text-center text-sm text-muted">
                لا توجد بيانات إنفاق يومية لهذه الفترة.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
