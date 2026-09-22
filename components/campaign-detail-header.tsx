import Image from "next/image";
import Link from "next/link";

import { ReactNode } from "react";

import { adminLogoutAction } from "@/app/actions/admin-auth";
import {
  eyebrowClassName,
  panelClassName,
  secondaryButtonClassName,
  statCardClassName,
} from "@/components/ui/class-names";
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
    <div className="mb-3 text-[11px] font-semibold uppercase text-muted">
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
      <span className="text-[11px] font-semibold uppercase  text-muted">
        {label}
      </span>
      <strong
        className={cn(
          "break-words font-display text-[15px] font-medium text-ink",
          danger && "text-[#b42318]"
        )}
        dir="auto"
      >
        {value}
      </strong>
    </div>
  );
}

function DetailStatsGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
  );
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
        wide && "sm:col-span-2"
      )}
    >
      <span className="text-[10px] font-semibold uppercase  text-muted">
        {label}
      </span>
      <strong
        className={cn(
          "mt-1 block break-words font-display text-[1.02rem] font-semibold leading-none  text-ink tabular-nums",
          danger && "text-[#b42318]"
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
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function getCampaignStatusMeta(status?: string) {
  const normalizedStatus = status?.toUpperCase();

  if (!normalizedStatus) {
    return {
      className: "text-[#6e6e73]",
      label: "حالة الحملة غير متاحة",
    };
  }

  if (normalizedStatus === "ACTIVE") {
    return {
      className: "text-[#1d9c58]",
      label: "الحملة نشطة",
    };
  }

  if (normalizedStatus === "COMPLETED") {
    return {
      className: "text-[#6e6e73]",
      label: "الحملة مكتملة",
    };
  }

  return {
    className: "text-[#b42318]",
    label: "الحملة غير نشطة",
  };
}

function formatCampaignEndDate(value?: string) {
  if (!value) {
    return "لا يوجد موعد محدد";
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return "لا يوجد موعد محدد";
  }

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
    <section
      className={cn(
        panelClassName,
        "relative mb-8 overflow-hidden px-4 py-5 sm:px-6 sm:py-7"
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,113,227,0.1),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.24),transparent)]" />
      <div className="pointer-events-none absolute right-[8%] top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.9),_transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-[10%] right-[10%] h-px bg-gradient-to-l from-transparent via-white/75 to-transparent" />

      <div className="relative z-[1] grid gap-5 sm:gap-6">
        <div className="order-1 grid gap-4">
          <div className="flex justify-center">
            <Image
              alt="Ozmo Results"
              className="h-auto w-[158px] shrink-0 sm:w-[196px]"
              height={52}
              priority
              src="/logo1.png"
              width={196}
            />
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
            {isAdmin ? (
              <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                <Link
                  className={cn(
                    secondaryButtonClassName,
                    "min-h-[42px] w-full text-[13px] sm:min-h-0 sm:w-auto sm:text-sm"
                  )}
                  href="/"
                >
                  الرجوع إلى نظرة الحساب العامة
                </Link>
                <form action={adminLogoutAction}>
                  <button
                    className={cn(
                      secondaryButtonClassName,
                      "min-h-[42px] w-full text-[13px] sm:min-h-0 sm:w-auto sm:text-sm"
                    )}
                    type="submit"
                  >
                    تسجيل الخروج
                  </button>
                </form>
              </div>
            ) : (
              <p className="min-w-0 text-center text-[13px] font-medium text-muted sm:text-right md:text-sm"></p>
            )}
          </div>
        </div>

        <div className="order-2 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.72fr)] lg:items-end lg:gap-5">
          <div className="min-w-0">
            <p className={eyebrowClassName}>حالة الحملة</p>
            <p
              className={cn(
                "mb-3 text-sm font-semibold sm:text-base",
                statusMeta.className
              )}
            >
              {statusMeta.label}
            </p>
            <h1 className="break-words font-display text-[clamp(1.55rem,8vw,4.2rem)] leading-[0.94] text-ink sm:text-[clamp(2rem,4vw,4.2rem)]">
              {campaign.campaignName}
            </h1>
          </div>

          <div className="min-w-0 rounded-[24px] border border-black/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,248,251,0.84))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:rounded-[28px] sm:p-5">
            <span className="text-[10px] font-semibold uppercase text-muted sm:text-[11px]">
              الرصيد الحالي
            </span>
            <strong
              className={cn(
                "mt-1.5 block break-words font-display text-[clamp(1.45rem,7vw,3.1rem)] leading-none sm:mt-2",
                wallet < 0 ? "text-[#b42318]" : "text-ink"
              )}
              dir="ltr"
            >
              {formatDisplayCurrency(wallet)}
            </strong>
            <p className="mt-2 text-[13px] leading-6 text-muted sm:mt-3 sm:text-sm sm:leading-7">
              إجمالي المدفوع ناقص إجمالي المصروف منذ بداية الحملة وحتى اليوم.
            </p>
          </div>
        </div>

        <div className="order-3 grid gap-4 md:hidden">
          <MobileStatsRail title="الملخص المالي">
            <MobileStatCard
              label="إجمالي المصروف"
              value={formatDisplayCurrency(campaign.totals.spend)}
            />
            <MobileStatCard
              label="إجمالي المدفوع"
              value={formatDisplayCurrency(totalPaid)}
            />
            <MobileStatCard
              danger={wallet < 0}
              label="الرصيد الحالي"
              value={formatDisplayCurrency(wallet)}
            />
          </MobileStatsRail>

          <MobileStatsRail title="معلومات الحملة">
            <MobileStatCard label="الفترة" value={rangeLabel} wide />
            <MobileStatCard
              label="الإعلانات"
              value={new Intl.NumberFormat("en-US").format(totalAds)}
            />
            <MobileStatCard
              label="تنتهي في"
              value={formatCampaignEndDate(campaign.endDate)}
            />
          </MobileStatsRail>

          <MobileStatsRail title="المقاييس العددية">
            <MobileStatCard
              label="إجمالي المحادثات من الإعلان"
              value={new Intl.NumberFormat("en-US").format(
                campaign.totals.messages
              )}
            />
            <MobileStatCard
              label="متابعات إنستغرام من الإعلانات"
              value={new Intl.NumberFormat("en-US").format(
                campaign.totals.followers
              )}
            />
            <MobileStatCard
              label="زيارات الملف الشخصي"
              value={new Intl.NumberFormat("en-US").format(
                campaign.totals.profileVisits
              )}
            />
            <MobileStatCard
              label="إعجابات صفحة فيسبوك"
              value={new Intl.NumberFormat("en-US").format(
                campaign.totals.facebookPageLikes
              )}
            />
            <MobileStatCard
              label="الوصول"
              value={new Intl.NumberFormat("en-US").format(
                campaign.totals.reach
              )}
            />
            <MobileStatCard
              label="الانطباعات"
              value={new Intl.NumberFormat("en-US").format(
                campaign.totals.impressions
              )}
            />
          </MobileStatsRail>
        </div>

        <div className="order-4 hidden md:block">
          <SectionLabel>الملخص المالي</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <DetailStat
              label="إجمالي المصروف"
              value={formatDisplayCurrency(campaign.totals.spend)}
            />
            <DetailStat
              label="إجمالي المدفوع"
              value={formatDisplayCurrency(totalPaid)}
            />
            <DetailStat
              danger={wallet < 0}
              label="الرصيد الحالي"
              value={formatDisplayCurrency(wallet)}
            />
          </div>
        </div>

        <div className="order-5 hidden md:block">
          <SectionLabel>معلومات الحملة</SectionLabel>
          <DetailStatsGrid>
            <DetailStat label="الفترة" value={rangeLabel} />
            <DetailStat
              label="الإعلانات"
              value={new Intl.NumberFormat("en-US").format(totalAds)}
            />
            <DetailStat
              label="تنتهي في"
              value={formatCampaignEndDate(campaign.endDate)}
            />
          </DetailStatsGrid>
        </div>

        <div className="order-6 hidden md:block">
          <SectionLabel>المقاييس العددية</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <DetailStat
              label="إجمالي المحادثات من الإعلان"
              value={new Intl.NumberFormat("en-US").format(
                campaign.totals.messages
              )}
            />
            <DetailStat
              label="متابعات إنستغرام من الإعلانات"
              value={new Intl.NumberFormat("en-US").format(
                campaign.totals.followers
              )}
            />
            <DetailStat
              label="زيارات الملف الشخصي"
              value={new Intl.NumberFormat("en-US").format(
                campaign.totals.profileVisits
              )}
            />
            <DetailStat
              label="إعجابات صفحة فيسبوك"
              value={new Intl.NumberFormat("en-US").format(
                campaign.totals.facebookPageLikes
              )}
            />
            <DetailStat
              label="الوصول"
              value={new Intl.NumberFormat("en-US").format(
                campaign.totals.reach
              )}
            />
            <DetailStat
              label="الانطباعات"
              value={new Intl.NumberFormat("en-US").format(
                campaign.totals.impressions
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
