import { formatDisplayCurrency } from "@/lib/currency";
import { SpendDashboardData } from "@/lib/meta";

import {
  eyebrowClassName,
  mutedTextClassName,
  panelClassName,
} from "@/components/ui/class-names";
import { cn } from "@/lib/utils";

type DashboardSummaryGridProps = {
  remaining: number;
  summary: SpendDashboardData["summary"];
  totalPaid: number;
};

function SummaryCard({
  eyebrow,
  featured,
  text,
  value,
}: {
  eyebrow: string;
  featured?: boolean;
  text: string;
  value: string;
}) {
  return (
    <article
      className={cn(
        panelClassName,
        "relative p-5 sm:p-6",
        featured &&
          "border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.94),rgba(245,249,255,0.78))]",
      )}
    >
      {featured ? (
        <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,_rgba(0,113,227,0.12),_transparent_72%)] blur-2xl" />
      ) : null}

      <div className="relative z-[1]">
        <p className={cn(eyebrowClassName, featured && "text-accent")}>{eyebrow}</p>
        <h2
          className={cn(
            "font-display leading-none tracking-[-0.055em] text-ink",
            featured
              ? "text-[clamp(2.2rem,4vw,3.65rem)]"
              : "text-[clamp(1.65rem,2.6vw,2.3rem)]",
          )}
        >
          {value}
        </h2>
        <p className={cn(mutedTextClassName, featured && "max-w-[28ch]")}>{text}</p>
      </div>
    </article>
  );
}

export function DashboardSummaryGrid({
  remaining,
  summary,
  totalPaid,
}: DashboardSummaryGridProps) {
  return (
    <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.35fr)_repeat(4,minmax(0,1fr))]">
      <SummaryCard
        eyebrow="إجمالي المصروف"
        featured
        text={`عبر ${summary.totalCampaigns} حملة منذ بداية الحملات.`}
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
        value={formatDisplayCurrency(totalPaid)}
      />
      <SummaryCard
        eyebrow="المتبقي"
        text="إجمالي المدفوع ناقص إجمالي المصروف."
        value={formatDisplayCurrency(remaining)}
      />
      <SummaryCard
        eyebrow="أعلى حملة"
        text={summary.topCampaignName}
        value={formatDisplayCurrency(summary.topCampaignSpend)}
      />
    </section>
  );
}
