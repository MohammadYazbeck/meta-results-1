import Link from "next/link";

import { CampaignBudgetRecord } from "@/lib/budget-store";
import { formatDisplayCurrency } from "@/lib/currency";
import { CampaignSpend } from "@/lib/meta";

import { panelClassName } from "@/components/ui/class-names";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type CampaignTableProps = {
  budgets: Record<string, CampaignBudgetRecord>;
  campaigns: CampaignSpend[];
};

function getRemaining(totalPaid: number, totalSpend: number) {
  return Math.round((totalPaid - totalSpend) * 100) / 100;
}

function CampaignLinkCell({
  campaign,
}: {
  campaign: CampaignSpend;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <Link
          className="font-medium text-ink transition hover:text-accent"
          href={`/${campaign.campaignId}`}
        >
          {campaign.campaignName}
        </Link>

        <span className="inline-flex w-fit items-center rounded-full border border-black/[0.05] bg-[rgba(0,113,227,0.08)] px-3 py-1 text-[11px] font-semibold uppercase text-accent">
          التقرير
        </span>
      </div>

      <span className="break-all text-xs text-muted">{campaign.campaignId}</span>
    </div>
  );
}

function MobileMetric({
  danger,
  label,
  value,
}: {
  danger?: boolean;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[20px] border border-black/[0.05] bg-white/80 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
      <span className="text-[11px] font-semibold uppercase text-muted">
        {label}
      </span>
      <strong
        className={cn(
          "mt-1 block font-display text-[15px] font-medium",
          danger ? "text-[#b42318]" : "text-ink",
        )}
      >
        {value}
      </strong>
    </div>
  );
}

export function CampaignTable({ budgets, campaigns }: CampaignTableProps) {
  return (
    <section className={cn(panelClassName, "overflow-hidden")}> 
      <SectionHeading
        action={<p className="m-0 text-sm text-muted">كل حملة لها صفحة تفاصيل.</p>}
        eyebrow="الحملات"
        title="الحملات والنتائج"
      />

      <div className="grid gap-3 px-4 pb-4 pt-3 md:hidden">
        {campaigns.map((campaign) => {
          const totalPaid = budgets[campaign.campaignId]?.totalPaid ?? 0;
          const remaining = getRemaining(totalPaid, campaign.totalSpend);

          return (
            <article
              className="grid gap-3 rounded-[26px] border border-black/[0.05] bg-white/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
              key={campaign.campaignId}
            >
              <CampaignLinkCell campaign={campaign} />

              <div className="grid gap-2 sm:grid-cols-2">
                <MobileMetric
                  label="إجمالي المدفوع"
                  value={formatDisplayCurrency(totalPaid)}
                />
                <MobileMetric
                  danger={remaining < 0}
                  label="المتبقي"
                  value={formatDisplayCurrency(remaining)}
                />
                <MobileMetric
                  label="إجمالي المصروف"
                  value={formatDisplayCurrency(campaign.totalSpend)}
                />
                <MobileMetric
                  label="متوسط اليوم"
                  value={formatDisplayCurrency(campaign.averageDailySpend)}
                />
              </div>

              <span className="text-xs font-medium text-muted">
                أيام النشاط: {campaign.activeDays}
              </span>
            </article>
          );
        })}

        {!campaigns.length ? (
          <div className="rounded-[26px] border border-dashed border-black/[0.08] bg-white/45 p-6 text-center text-sm text-muted">
            لا توجد بيانات حملات لهذه الفترة.
          </div>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto px-3 pb-3 md:block">
        <table className="min-w-full border-separate border-spacing-y-3 text-right">
          <thead>
            <tr className="text-[12px] font-semibold uppercase text-muted">
              <th className="px-5 py-2">الحملة</th>
              <th className="px-4 py-2">إجمالي المدفوع</th>
              <th className="px-4 py-2">المتبقي</th>
              <th className="px-4 py-2">إجمالي المصروف</th>
              <th className="px-4 py-2">متوسط اليوم</th>
              <th className="px-4 py-2">أيام النشاط</th>
            </tr>
          </thead>

          <tbody>
            {campaigns.map((campaign) => {
              const totalPaid = budgets[campaign.campaignId]?.totalPaid ?? 0;
              const remaining = getRemaining(totalPaid, campaign.totalSpend);

              return (
                <tr
                  className="transition hover:-translate-y-0.5"
                  key={campaign.campaignId}
                >
                  <td className="rounded-r-[26px] border-y border-r border-black/[0.05] bg-white/72 px-5 py-4 align-top shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <CampaignLinkCell campaign={campaign} />
                  </td>
                  <td className="border-y border-black/[0.05] bg-white/72 px-4 py-4 font-display text-[15px] font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    {formatDisplayCurrency(totalPaid)}
                  </td>
                  <td
                    className={cn(
                      "border-y border-black/[0.05] bg-white/72 px-4 py-4 font-display text-[15px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
                      remaining < 0 ? "text-[#b42318]" : "text-ink",
                    )}
                  >
                    {formatDisplayCurrency(remaining)}
                  </td>
                  <td className="border-y border-black/[0.05] bg-white/72 px-4 py-4 font-display text-[15px] font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    {formatDisplayCurrency(campaign.totalSpend)}
                  </td>
                  <td className="border-y border-black/[0.05] bg-white/72 px-4 py-4 font-display text-[15px] font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    {formatDisplayCurrency(campaign.averageDailySpend)}
                  </td>
                  <td className="rounded-l-[26px] border-y border-l border-black/[0.05] bg-white/72 px-4 py-4 text-sm font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    {campaign.activeDays}
                  </td>
                </tr>
              );
            })}

            {!campaigns.length ? (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-muted" colSpan={6}>
                  لا توجد بيانات حملات لهذه الفترة.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
