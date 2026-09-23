import { formatDisplayCurrency } from "@/lib/currency";
import { SpendDashboardData } from "@/lib/meta";

import {
  mutedTextClassName,
} from "@/components/ui/class-names";
import { cn } from "@/lib/utils";

type DashboardSummaryGridProps = {
  negativeRemaining: number;
  remaining: number;
  summary: SpendDashboardData["summary"];
  totalPaid: number;
};

function SummaryCard({
  danger,
  eyebrow,
  text,
  tone = "neutral",
  value,
}: {
  danger?: boolean;
  eyebrow: string;
  text: string;
  tone?: "blue" | "green" | "neutral" | "orange" | "red" | "warm";
  value: string;
}) {
  const toneStyles = {
    blue: {
      card: "bg-[linear-gradient(145deg,#eef5ff_0%,#ffffff_76%)]",
      marker: "bg-[#0866ff] shadow-[0_0_0_5px_rgba(8,102,255,0.10)]",
    },
    green: {
      card: "bg-[linear-gradient(145deg,#eef9f1_0%,#ffffff_76%)]",
      marker: "bg-[#31a24c] shadow-[0_0_0_5px_rgba(49,162,76,0.10)]",
    },
    neutral: {
      card: "bg-white",
      marker: "bg-[#8a8d91] shadow-[0_0_0_5px_rgba(138,141,145,0.09)]",
    },
    orange: {
      card: "bg-[linear-gradient(145deg,#fff5e9_0%,#ffffff_76%)]",
      marker: "bg-[#f28c28] shadow-[0_0_0_5px_rgba(242,140,40,0.11)]",
    },
    red: {
      card: "bg-[linear-gradient(145deg,#fff0f2_0%,#ffffff_76%)]",
      marker: "bg-[#e41e3f] shadow-[0_0_0_5px_rgba(228,30,63,0.10)]",
    },
    warm: {
      card: "bg-[linear-gradient(145deg,#fff2e2_0%,#ffffff_72%)]",
      marker: "bg-[#d8781c] shadow-[0_0_0_5px_rgba(216,120,28,0.11)]",
    },
  } as const;
  const style = toneStyles[tone];

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[18px] p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_10px_26px_rgba(15,23,42,0.055)] ring-1 ring-black/[0.035] transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(15,23,42,0.09)]",
        style.card,
      )}
    >
      <div>
        <p className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-muted">
          <span className={cn("h-2 w-2 rounded-full", style.marker)} />
          {eyebrow}
        </p>
        <h2
          className={cn(
            "font-display text-[22px] font-bold leading-none text-ink tabular-nums xl:text-[24px]",
            danger && "text-danger",
            tone === "warm" && "text-[#9a4d08]",
          )}
        >
          {value}
        </h2>
        <p className={cn(mutedTextClassName, "text-[12px] leading-snug")}>
          {text}
        </p>
      </div>
    </article>
  );
}

export function DashboardSummaryGrid({
  negativeRemaining,
  remaining,
  summary,
  totalPaid,
}: DashboardSummaryGridProps) {
  return (
    <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <SummaryCard
        eyebrow="إجمالي المصروف"
        text={`عبر ${summary.totalCampaigns} حملة منذ بداية الحملات.`}
        tone="blue"
        value={formatDisplayCurrency(summary.totalSpend)}
      />
      <SummaryCard
        eyebrow="متوسط اليوم"
        text={`محسوب على ${summary.daysInRange} يوم ضمن الفترة المحددة.`}
        value={formatDisplayCurrency(summary.averageDailySpend)}
      />
      <SummaryCard
        eyebrow="إجمالي المدفوع"
        text="مجموع كل الدفعات المسجلة من لوحة المدير."
        tone="green"
        value={formatDisplayCurrency(totalPaid)}
      />
      <SummaryCard
        eyebrow="المتبقي"
        text="إجمالي المدفوع ناقص إجمالي المصروف."
        tone="orange"
        value={formatDisplayCurrency(remaining)}
      />
      <SummaryCard
        danger={negativeRemaining < 0}
        eyebrow="المتبقي السالب"
        text="مجموع الحملات التي متبقيها أقل من صفر."
        tone={negativeRemaining < 0 ? "red" : "neutral"}
        value={formatDisplayCurrency(negativeRemaining)}
      />
      <SummaryCard
        eyebrow="أعلى حملة"
        text={summary.topCampaignName}
        tone="warm"
        value={formatDisplayCurrency(summary.topCampaignSpend)}
      />
    </section>
  );
}
