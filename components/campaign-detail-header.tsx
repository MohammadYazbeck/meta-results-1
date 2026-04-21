import { ReactNode } from "react";

import Link from "next/link";

import { adminLogoutAction } from "@/app/actions/admin-auth";
import { DateRangeForm } from "@/components/date-range-form";
import {
  eyebrowClassName,
  panelClassName,
  secondaryButtonClassName,
  statCardClassName,
} from "@/components/ui/class-names";
import { HierarchyBadge } from "@/components/ui/hierarchy-badge";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDisplayCurrency } from "@/lib/currency";
import { CampaignDetailData } from "@/lib/meta";
import { cn } from "@/lib/utils";

type CampaignDetailHeaderProps = {
  campaign: CampaignDetailData;
  isAdmin: boolean;
  rangeLabel: string;
  totalAds: number;
  totalPaid: number;
  wallet: number;
};

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
      {children}
    </div>
  );
}

function DetailStat({
  danger,
  label,
  value,
}: {
  danger?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className={statCardClassName}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <strong
        className={cn(
          "break-words font-display text-[15px] font-medium tracking-[-0.03em] text-ink",
          danger && "text-[#b42318]",
        )}
      >
        {value}
      </strong>
    </div>
  );
}

function DetailStatsGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{children}</div>;
}

function MobileStatCard({
  danger,
  label,
  value,
  wide,
}: {
  danger?: boolean;
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[20px] border border-black/[0.05] bg-white/88 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
        wide && "sm:col-span-2",
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <strong
        className={cn(
          "mt-1 block break-words font-display text-[1.02rem] font-semibold leading-none tracking-[-0.04em] text-ink tabular-nums",
          danger && "text-[#b42318]",
        )}
        dir="auto"
      >
        {value}
      </strong>
    </div>
  );
}

function MobileStatsRail({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <div className="grid gap-2 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

export function CampaignDetailHeader({
  campaign,
  isAdmin,
  rangeLabel,
  totalAds,
  totalPaid,
  wallet,
}: CampaignDetailHeaderProps) {
  const featuredLabel = isAdmin ? "الرصيد الحالي" : "إجمالي المصروف";
  const featuredValue = isAdmin
    ? formatDisplayCurrency(wallet)
    : formatDisplayCurrency(campaign.totals.spend);
  const featuredDescription = isAdmin
    ? "إجمالي المدفوع ناقص المصروف الفعلي للحملة."
    : "قراءة مركزة لأداء الحملة خلال الفترة الحالية.";

  return (
    <section className={cn(panelClassName, "relative mb-8 overflow-hidden px-4 py-5 sm:px-6 sm:py-7")}> 
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,113,227,0.1),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.24),transparent)]" />
      <div className="pointer-events-none absolute right-[8%] top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.9),_transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-l from-transparent via-white/75 to-transparent" />

      <div className="relative z-[1] grid gap-5 sm:gap-6">
        <div className="order-1 flex flex-col gap-2.5 md:flex-row md:items-start md:justify-between">
          {isAdmin ? (
            <Link
              className="inline-flex w-full items-center text-[13px] font-medium text-muted transition hover:text-accent md:w-fit md:text-sm"
              href={`/?start=${campaign.range.start}&end=${campaign.range.end}`}
            >
              الرجوع إلى نظرة الحساب العامة
            </Link>
          ) : (
            <p className="text-[13px] font-medium text-muted md:text-sm">تقرير الحملة للعميل</p>
          )}

          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <StatusPill className="w-full justify-center sm:w-fit" source={campaign.source} />
            {isAdmin ? (
              <form action={adminLogoutAction}>
                <button className={cn(secondaryButtonClassName, "min-h-[42px] text-[13px] sm:min-h-0 sm:text-sm")} type="submit">
                  تسجيل الخروج
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="order-2 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.72fr)] lg:items-end lg:gap-5">
          <div className="min-w-0">
            <p className={eyebrowClassName}>تفاصيل الحملة</p>
            <div className="-mx-0.5 mb-2 flex gap-2 overflow-x-auto px-0.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              <HierarchyBadge variant="campaign">Campaign</HierarchyBadge>
              <HierarchyBadge variant="adSet">
                {campaign.adSets.length} Ad Sets
              </HierarchyBadge>
              <HierarchyBadge variant="ad">{totalAds} Ads</HierarchyBadge>
            </div>
            <h1 className="break-words font-display text-[clamp(1.55rem,8vw,4.2rem)] leading-[0.94] tracking-[-0.06em] text-ink sm:text-[clamp(2rem,4vw,4.2rem)]">
              {campaign.campaignName}
            </h1>
            <p className="mt-3 max-w-[65ch] break-all text-[13px] leading-6 text-muted sm:mt-4 sm:text-base sm:leading-7">
              رقم الحملة <strong className="font-medium text-ink">{campaign.campaignId}</strong>
            </p>

            <div className="mt-4 rounded-[22px] border border-black/[0.05] bg-white/68 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] lg:hidden">
              <DateRangeForm action={`/${campaign.campaignId}`} compact range={campaign.range} />
            </div>
          </div>

          <div className="min-w-0 rounded-[24px] border border-black/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,248,251,0.84))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:rounded-[28px] sm:p-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted sm:text-[11px]">
              {featuredLabel}
            </span>
            <strong
              className={cn(
                "mt-1.5 block break-words font-display text-[clamp(1.45rem,7vw,3.1rem)] leading-none tracking-[-0.055em] sm:mt-2",
                isAdmin && wallet < 0 ? "text-[#b42318]" : "text-ink",
              )}
              dir="ltr"
            >
              {featuredValue}
            </strong>
            <p className="mt-2 text-[13px] leading-6 text-muted sm:mt-3 sm:text-sm sm:leading-7">
              {featuredDescription}
            </p>
          </div>
        </div>

        <div className="order-3 hidden rounded-[24px] border border-black/[0.05] bg-white/65 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] lg:order-6 lg:block lg:rounded-[28px] lg:p-5">
          <DateRangeForm action={`/${campaign.campaignId}`} compact range={campaign.range} />
        </div>

        <div className="order-4 grid gap-4 md:hidden">
          {isAdmin ? (
            <MobileStatsRail title="الملخص المالي">
              <MobileStatCard
                label="إجمالي المصروف"
                value={formatDisplayCurrency(campaign.totals.spend)}
              />
              <MobileStatCard
                label="إجمالي المدفوع"
                value={formatDisplayCurrency(totalPaid)}
              />
            </MobileStatsRail>
          ) : null}

          <MobileStatsRail title="معلومات الحملة">
            <MobileStatCard label="الفترة" value={rangeLabel} wide />
            <MobileStatCard
              label="المجموعات"
              value={new Intl.NumberFormat("en-US").format(campaign.adSets.length)}
            />
            <MobileStatCard
              label="الإعلانات"
              value={new Intl.NumberFormat("en-US").format(totalAds)}
            />
          </MobileStatsRail>

          <MobileStatsRail title="المقاييس العددية">
            <MobileStatCard
              label="الرسائل"
              value={new Intl.NumberFormat("en-US").format(campaign.totals.messages)}
            />
            <MobileStatCard
              label="المتابعون"
              value={new Intl.NumberFormat("en-US").format(campaign.totals.followers)}
            />
            <MobileStatCard
              label="الوصول"
              value={new Intl.NumberFormat("en-US").format(campaign.totals.reach)}
            />
            <MobileStatCard
              label="الانطباعات"
              value={new Intl.NumberFormat("en-US").format(campaign.totals.impressions)}
            />
          </MobileStatsRail>
        </div>

        {isAdmin ? (
          <div className="order-4 hidden md:block lg:order-3">
            <SectionLabel>الملخص المالي</SectionLabel>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <DetailStat
                label="إجمالي المصروف"
                value={formatDisplayCurrency(campaign.totals.spend)}
              />
              <DetailStat
                label="إجمالي المدفوع"
                value={formatDisplayCurrency(totalPaid)}
              />
            </div>
          </div>
        ) : null}

        <div className={cn(isAdmin ? "order-5 hidden md:block lg:order-4" : "order-4 hidden md:block lg:order-3")}>
          <SectionLabel>معلومات الحملة</SectionLabel>
          <DetailStatsGrid>
            <DetailStat label="الفترة" value={rangeLabel} />
            <DetailStat
              label="المجموعات"
              value={new Intl.NumberFormat("en-US").format(campaign.adSets.length)}
            />
            <DetailStat
              label="الإعلانات"
              value={new Intl.NumberFormat("en-US").format(totalAds)}
            />
          </DetailStatsGrid>
        </div>

        <div className={cn(isAdmin ? "order-6 hidden md:block lg:order-5" : "order-5 hidden md:block lg:order-4")}>
          <SectionLabel>المقاييس العددية</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DetailStat
              label="الرسائل"
              value={new Intl.NumberFormat("en-US").format(campaign.totals.messages)}
            />
            <DetailStat
              label="المتابعون"
              value={new Intl.NumberFormat("en-US").format(campaign.totals.followers)}
            />
            <DetailStat
              label="الوصول"
              value={new Intl.NumberFormat("en-US").format(campaign.totals.reach)}
            />
            <DetailStat
              label="الانطباعات"
              value={new Intl.NumberFormat("en-US").format(campaign.totals.impressions)}
            />
          </div>
        </div>

      </div>
    </section>
  );
}
