import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import { adminLogoutAction } from "@/app/actions/admin-auth";
import { ExpandableDetailSection } from "@/components/ui/expandable-detail-section";
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

type MetricIconName = "coins" | "spend" | "wallet";

function MetricIcon({ name }: { name: MetricIconName }) {
  if (name === "spend") {
    return (
      <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
        <path d="m4.5 17 5-5 3.5 3.5L20 8.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M15.5 8.5H20V13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    );
  }

  if (name === "coins") {
    return (
      <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
        <ellipse cx="12" cy="6" rx="6.5" ry="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5.5 6v5c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3V6m-13 5v5c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3v-5" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
      <path d="M4.5 7.5h13a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2H17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M15.5 12h4v4h-4a2 2 0 0 1 0-4Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function FinancialMetric({
  icon,
  label,
  tone = "default",
  value,
}: {
  icon: MetricIconName;
  label: string;
  tone?: "default" | "orange";
  value: string;
}) {
  const isOrange = tone === "orange";

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-1.5 gap-y-2 rounded-[18px] bg-white/86 p-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.055)] ring-1 ring-black/[0.04] sm:flex sm:justify-between sm:gap-3 sm:rounded-[20px] sm:p-4">
      <div className="contents min-w-0 text-right sm:block">
        <span className="col-start-1 row-start-1 block min-w-0 text-[10px] font-semibold leading-4 text-muted sm:text-[13px]">{label}</span>
        <strong
          className={cn(
            "col-span-2 row-start-2 block min-w-0 whitespace-nowrap font-display text-[clamp(0.72rem,3.2vw,1.75rem)] font-bold leading-none tracking-[-0.02em] tabular-nums sm:mt-2 sm:text-[clamp(1rem,2.4vw,1.75rem)]",
            isOrange ? "text-[#f05a12]" : "text-ink",
          )}
          dir="ltr"
        >
          {value}
        </strong>
      </div>
      <span
        className={cn(
          "col-start-2 row-start-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl",
          isOrange ? "bg-[#fff0e7] text-[#f05a12]" : "bg-[#f1f3f7] text-[#596273]",
        )}
      >
        <MetricIcon name={icon} />
      </span>
    </div>
  );
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f7f8fa] px-4 py-3.5 ring-1 ring-black/[0.035]">
      <span className="block text-[11px] font-semibold text-muted">{label}</span>
      <strong className="mt-1.5 block break-words text-[15px] font-bold text-ink tabular-nums" dir="auto">
        {value}
      </strong>
    </div>
  );
}

function HeaderActionIcon({ children }: { children: ReactNode }) {
  return <span className="inline-flex h-5 w-5 items-center justify-center">{children}</span>;
}

function getCampaignStatusMeta(status?: string) {
  const normalizedStatus = status?.toUpperCase();

  if (!normalizedStatus) {
    return {
      badgeClassName: "bg-[#f0f2f5] text-muted",
      dotClassName: "bg-[#8a8d91]",
      label: "حالة الحملة غير متاحة",
    };
  }

  if (normalizedStatus === "ACTIVE") {
    return {
      badgeClassName: "bg-[#eaf8ee] text-[#237b36]",
      dotClassName: "bg-[#31a24c] shadow-[0_0_0_4px_rgba(49,162,76,0.13)]",
      label: "الحملة نشطة",
    };
  }

  if (normalizedStatus === "COMPLETED") {
    return {
      badgeClassName: "bg-[#f0f2f5] text-muted",
      dotClassName: "bg-[#8a8d91]",
      label: "الحملة مكتملة",
    };
  }

  return {
    badgeClassName: "bg-[#f0f2f5] text-muted",
    dotClassName: "bg-[#8a8d91]",
    label: "الحملة غير نشطة",
  };
}

function formatCampaignEndDate(value?: string) {
  if (!value) return "لا يوجد موعد محدد";

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "لا يوجد موعد محدد";

  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function CampaignDetailHeader({
  campaign,
  isAdmin,
  rangeLabel,
  totalAds,
  totalPaid,
  wallet,
}: CampaignDetailHeaderProps) {
  const statusMeta = getCampaignStatusMeta(campaign.status);

  return (
    <section className="relative mb-0 overflow-hidden bg-[radial-gradient(circle_at_0%_0%,rgba(255,122,45,0.13),transparent_23rem),radial-gradient(circle_at_100%_3%,rgba(255,122,45,0.10),transparent_18rem),linear-gradient(180deg,#fffefd_0%,#f8fafc_100%)] p-4 sm:mb-6 sm:rounded-[28px] sm:p-6 sm:shadow-[0_18px_60px_rgba(15,23,42,0.09)] sm:ring-1 sm:ring-black/[0.04] lg:p-8">
      <div className="grid gap-6 lg:gap-7">
        <div className="flex justify-center">
          <Image alt="Ozmo Results" className="h-auto w-[156px] sm:w-[184px]" height={52} priority src="/logo1.png" width={196} />
        </div>

        {isAdmin ? (
          <div className="grid grid-cols-2 gap-3 lg:mx-auto lg:w-full lg:max-w-3xl">
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-[#ff6418] bg-white/65 px-2 text-[11px] font-bold text-[#e95712] transition duration-200 hover:-translate-y-0.5 hover:bg-[#fff3eb] sm:gap-3 sm:px-5 sm:text-sm" href="/">
              <HeaderActionIcon>
                <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 24 24" width="19">
                  <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </HeaderActionIcon>
              الرجوع إلى نظرة الحساب العامة
            </Link>
            <form action={adminLogoutAction}>
              <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/78 px-2 text-[11px] font-bold text-ink shadow-[0_8px_22px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04] transition duration-200 hover:-translate-y-0.5 hover:bg-white sm:gap-3 sm:px-5 sm:text-sm" type="submit">
                <HeaderActionIcon>
                  <svg aria-hidden="true" fill="none" height="19" viewBox="0 0 24 24" width="19">
                    <path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10m4-4 3-3-3-3m3 3H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </HeaderActionIcon>
                تسجيل الخروج
              </button>
            </form>
          </div>
        ) : null}

        <div className="text-right">
          <h1 className="break-words font-display text-[clamp(1.9rem,7vw,3.5rem)] font-black leading-tight text-ink">{campaign.campaignName}</h1>
          <span className={cn("mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold", statusMeta.badgeClassName)}>
            <span aria-hidden="true" className={cn("h-2.5 w-2.5 rounded-full", statusMeta.dotClassName)} />
            {statusMeta.label}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(120deg,#fff7f1_0%,#ffffff_58%,#fff1e7_100%)] p-5 shadow-[0_10px_30px_rgba(242,90,18,0.08)] ring-1 ring-[#ff7a2d]/15 sm:p-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8">
          <span aria-hidden="true" className="absolute inset-y-2 right-0 w-1.5 rounded-l-full bg-[#ff5a00]" />
          <div className="pr-2 text-right">
            <span className="text-sm font-bold text-ink">الرصيد الحالي</span>
            <strong className={cn("mt-3 block font-display text-[clamp(2.7rem,10vw,5rem)] font-black leading-none tabular-nums", wallet < 0 ? "text-[#ff5a00]" : "text-[#0866ff]")} dir="ltr">
              {formatDisplayCurrency(wallet)}
            </strong>
            <p className="mt-4 text-[13px] leading-7 text-muted sm:text-sm">إجمالي المدفوع ناقص إجمالي المصروف منذ بداية الحملة وحتى اليوم.</p>
          </div>
          <span className="mr-auto mt-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#fff0e7] text-[#ff5a00] lg:mr-0 lg:mt-0 lg:h-20 lg:w-20">
            <MetricIcon name="wallet" />
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <FinancialMetric icon="spend" label="إجمالي المصروف" tone="orange" value={formatDisplayCurrency(campaign.totals.spend)} />
          <FinancialMetric icon="coins" label="إجمالي المدفوع" value={formatDisplayCurrency(totalPaid)} />
          <FinancialMetric icon="wallet" label="الرصيد الحالي" value={formatDisplayCurrency(wallet)} />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <ExpandableDetailSection description="الفترة، عدد الإعلانات، وتاريخ الانتهاء" icon="info" title="معلومات الحملة" tone="orange">
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <DetailValue label="الفترة" value={rangeLabel} />
              <DetailValue label="الإعلانات" value={new Intl.NumberFormat("en-US").format(totalAds)} />
              <DetailValue label="تنتهي في" value={formatCampaignEndDate(campaign.endDate)} />
            </div>
          </ExpandableDetailSection>

          <ExpandableDetailSection description="المحادثات، المتابعات، الوصول والانطباعات" icon="metrics" title="المقاييس العددية" tone="orange">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <DetailValue label="إجمالي المحادثات من الإعلان" value={new Intl.NumberFormat("en-US").format(campaign.totals.messages)} />
              <DetailValue label="متابعات إنستغرام من الإعلانات" value={new Intl.NumberFormat("en-US").format(campaign.totals.followers)} />
              <DetailValue label="زيارات الملف الشخصي" value={new Intl.NumberFormat("en-US").format(campaign.totals.profileVisits)} />
              <DetailValue label="إعجابات صفحة فيسبوك" value={new Intl.NumberFormat("en-US").format(campaign.totals.facebookPageLikes)} />
              <DetailValue label="الوصول" value={new Intl.NumberFormat("en-US").format(campaign.totals.reach)} />
              <DetailValue label="الانطباعات" value={new Intl.NumberFormat("en-US").format(campaign.totals.impressions)} />
            </div>
          </ExpandableDetailSection>
        </div>
      </div>
    </section>
  );
}
