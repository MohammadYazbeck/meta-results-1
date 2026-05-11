"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  KeyboardEvent,
  MouseEvent,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from "react";

import type { CampaignBudgetRecord } from "@/lib/budget-store";
import { formatDisplayCurrency } from "@/lib/currency";
import type { CampaignSpend, DateRange } from "@/lib/meta";

import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type CampaignTableProps = {
  actionPath?: "/" | "/archive";
  archivedCount?: number;
  budgets: Record<string, CampaignBudgetRecord>;
  campaigns: CampaignSpend[];
  emptyMessage?: string;
  initialQuery?: string;
  mode?: "active" | "archive";
  range: DateRange;
  searchEmptyMessage?: string;
  secondaryHref: string;
  secondaryLabel: string;
};

const listingPanelClassName =
  "overflow-hidden rounded-[30px] border border-white/70 bg-[var(--card)] shadow-panel backdrop-blur-2xl";

const quietButtonClassName =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-black/[0.08] bg-white/82 px-4 py-2.5 text-sm font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] focus:outline-none focus:ring-2 focus:ring-accent/15";

const archiveButtonClassName =
  "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-full border border-[#111113]/10 bg-[#111113] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_18px_rgba(17,17,19,0.12)] focus:outline-none focus:ring-2 focus:ring-accent/20";

const searchInputClassName =
  "min-h-[54px] rounded-[20px] border border-black/[0.06] bg-white/82 py-3 pl-4 pr-11 text-base text-ink outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] placeholder:text-muted/70 focus:border-accent/20 focus:bg-white focus:ring-2 focus:ring-accent/10";

function getRemaining(totalPaid: number, totalSpend: number) {
  return Math.round((totalPaid - totalSpend) * 100) / 100;
}

function buildClearHref(actionPath: "/" | "/archive", range: DateRange) {
  const params = new URLSearchParams({
    end: range.end,
    start: range.start,
  });

  return `${actionPath}?${params.toString()}`;
}

function ArchiveIcon({ mode }: { mode: "active" | "archive" }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="15"
      viewBox="0 0 24 24"
      width="15"
    >
      <path
        d="M4 7.5h16M6 7.5v10A2.5 2.5 0 0 0 8.5 20h7a2.5 2.5 0 0 0 2.5-2.5v-10M8 4h8l1 3.5H7L8 4Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      {mode === "archive" ? (
        <path
          d="m9 13 2 2 4-4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      ) : (
        <path
          d="M9 12h6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      )}
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
    >
      <path
        d="m20 20-4.2-4.2M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CampaignLinkCell({
  campaign,
}: {
  campaign: CampaignSpend;
}) {
  return (
    <div className="grid gap-2">
      <Link
        className="relative z-[2] font-medium text-ink"
        href={`/${campaign.campaignId}`}
      >
        {campaign.campaignName}
      </Link>

      <span className="break-all text-xs text-muted">{campaign.campaignId}</span>
    </div>
  );
}

function CampaignArchiveButton({
  campaign,
  isRemoving,
  mode,
  onArchiveCampaign,
}: {
  campaign: CampaignSpend;
  isRemoving: boolean;
  mode: "active" | "archive";
  onArchiveCampaign: (
    campaign: CampaignSpend,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
}) {
  const archiveLabel = mode === "archive" ? "إلغاء الأرشفة" : "أرشفة";

  return (
    <button
      className={cn(
        archiveButtonClassName,
        isRemoving && "cursor-wait opacity-70",
      )}
      disabled={isRemoving}
      onClick={(event) => onArchiveCampaign(campaign, event)}
      onKeyDown={(event) => event.stopPropagation()}
      type="button"
    >
      <ArchiveIcon mode={mode} />
      {archiveLabel}
    </button>
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

export function CampaignTable({
  actionPath = "/",
  archivedCount,
  budgets,
  campaigns,
  emptyMessage = "لا توجد بيانات حملات لهذه الفترة.",
  initialQuery = "",
  mode = "active",
  range,
  searchEmptyMessage = "لا توجد حملات مطابقة لهذا البحث.",
  secondaryHref,
  secondaryLabel,
}: CampaignTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [negativeRemainingOnly, setNegativeRemainingOnly] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [currentArchivedCount, setCurrentArchivedCount] = useState(
    archivedCount ?? 0,
  );
  const [hiddenCampaignIds, setHiddenCampaignIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [removingCampaignIds, setRemovingCampaignIds] = useState<Set<string>>(
    () => new Set(),
  );
  const removalTimers = useRef<Map<string, number>>(new Map());
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const liveCampaigns = useMemo(
    () =>
      campaigns.filter(
        (campaign) => !hiddenCampaignIds.has(campaign.campaignId),
      ),
    [campaigns, hiddenCampaignIds],
  );
  const visibleCampaigns = useMemo(() => {
    const searchedCampaigns = normalizedQuery
      ? liveCampaigns.filter((campaign) =>
          campaign.campaignName.toLowerCase().includes(normalizedQuery),
        )
      : liveCampaigns;

    if (mode !== "active" || !negativeRemainingOnly) {
      return searchedCampaigns;
    }

    return searchedCampaigns.filter((campaign) => {
      const totalPaid = budgets[campaign.campaignId]?.totalPaid ?? 0;
      return getRemaining(totalPaid, campaign.totalSpend) < 0;
    });
  }, [budgets, liveCampaigns, mode, negativeRemainingOnly, normalizedQuery]);
  const resolvedEmptyMessage = normalizedQuery
    ? searchEmptyMessage
    : negativeRemainingOnly && mode === "active"
      ? "لا توجد حملات بمتبقٍ سالب."
      : emptyMessage;
  const negativeFilterControl =
    mode === "active" ? (
      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-black/[0.06] bg-white/78 px-4 py-2 text-sm font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]">
        <input
          checked={negativeRemainingOnly}
          className="h-4 w-4 accent-[#b42318]"
          onChange={(event) => setNegativeRemainingOnly(event.target.checked)}
          type="checkbox"
        />
        عرض المتبقي السالب فقط
      </label>
    ) : null;

  function openCampaign(campaign: CampaignSpend) {
    router.push(`/${campaign.campaignId}`);
  }

  function handleOpenKey(
    event: KeyboardEvent<HTMLElement>,
    campaign: CampaignSpend,
  ) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openCampaign(campaign);
  }

  async function handleArchiveCampaign(
    campaign: CampaignSpend,
    event: MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (removingCampaignIds.has(campaign.campaignId)) {
      return;
    }

    setArchiveError(null);
    setRemovingCampaignIds((current) => {
      const next = new Set(current);
      next.add(campaign.campaignId);
      return next;
    });
    setCurrentArchivedCount((current) =>
      mode === "archive" ? Math.max(0, current - 1) : current + 1,
    );

    const timeoutId = window.setTimeout(() => {
      setHiddenCampaignIds((current) => {
        const next = new Set(current);
        next.add(campaign.campaignId);
        return next;
      });
      setRemovingCampaignIds((current) => {
        const next = new Set(current);
        next.delete(campaign.campaignId);
        return next;
      });
      removalTimers.current.delete(campaign.campaignId);
    }, 140);

    removalTimers.current.set(campaign.campaignId, timeoutId);

    try {
      const response = await fetch("/api/campaign-archive", {
        body: JSON.stringify({
          campaignId: campaign.campaignId,
          campaignName: campaign.campaignName,
          mode: mode === "archive" ? "unarchive" : "archive",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error || "Archive update failed.");
      }

      router.refresh();
    } catch (error) {
      const activeTimer = removalTimers.current.get(campaign.campaignId);

      if (activeTimer) {
        window.clearTimeout(activeTimer);
        removalTimers.current.delete(campaign.campaignId);
      }

      setHiddenCampaignIds((current) => {
        const next = new Set(current);
        next.delete(campaign.campaignId);
        return next;
      });
      setRemovingCampaignIds((current) => {
        const next = new Set(current);
        next.delete(campaign.campaignId);
        return next;
      });
      setCurrentArchivedCount((current) =>
        mode === "archive" ? current + 1 : Math.max(0, current - 1),
      );
      setArchiveError(
        error instanceof Error
          ? error.message
          : "تعذر تحديث الأرشيف. حاول مرة أخرى.",
      );
    }
  }

  return (
    <>
      <section className={cn(listingPanelClassName, "mb-6 p-4 sm:p-5")}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-muted">
                البحث باسم الحملة
              </span>
              <span className="relative block">
                <SearchIcon />
                <input
                  aria-label="البحث باسم الحملة"
                  className={searchInputClassName}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="اكتب اسم الحملة..."
                  type="search"
                  value={query}
                />
              </span>
            </label>

            <div className="flex flex-col gap-2 sm:items-end">
              {negativeFilterControl}
              {query ? (
                <Link
                  className={quietButtonClassName}
                  href={buildClearHref(actionPath, range)}
                  onClick={() => setQuery("")}
                >
                  مسح البحث
                </Link>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
            <span className="text-sm text-muted">
              {visibleCampaigns.length} من {liveCampaigns.length} حملة
            </span>
            <Link className={quietButtonClassName} href={secondaryHref}>
              {secondaryLabel}
              {typeof archivedCount === "number"
                ? ` (${currentArchivedCount})`
                : ""}
            </Link>
          </div>
        </div>

        {archiveError ? (
          <p className="mt-3 rounded-[18px] border border-[#b42318]/10 bg-[#fff4f2] px-4 py-3 text-sm font-medium text-[#b42318]">
            {archiveError}
          </p>
        ) : null}
      </section>

      <section className={listingPanelClassName}> 
        <SectionHeading
          action={
            <p className="m-0 text-sm text-muted">
              {mode === "archive"
                ? "يمكن إرجاع أي حملة إلى الصفحة الرئيسية."
                : "كل حملة لها صفحة تفاصيل."}
            </p>
          }
          eyebrow="الحملات"
          title={mode === "archive" ? "الحملات المؤرشفة" : "الحملات والنتائج"}
        />

      <div className="grid gap-3 px-4 pb-4 pt-3 md:hidden">
        {visibleCampaigns.map((campaign) => {
          const totalPaid = budgets[campaign.campaignId]?.totalPaid ?? 0;
          const remaining = getRemaining(totalPaid, campaign.totalSpend);
          const isRemoving = removingCampaignIds.has(campaign.campaignId);

          return (
            <article
              className={cn(
                "grid cursor-pointer gap-3 rounded-[26px] border border-black/[0.05] bg-white/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-opacity duration-150",
                isRemoving && "pointer-events-none opacity-0",
              )}
              key={campaign.campaignId}
              onClick={() => openCampaign(campaign)}
              onKeyDown={(event) => handleOpenKey(event, campaign)}
              role="link"
              tabIndex={0}
            >
              <div className="flex items-start justify-between gap-3">
                <CampaignLinkCell campaign={campaign} />
                <div className="shrink-0">
                  <CampaignArchiveButton
                    campaign={campaign}
                    isRemoving={isRemoving}
                    mode={mode}
                    onArchiveCampaign={handleArchiveCampaign}
                  />
                </div>
              </div>

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
                  label="مصروف الفترة"
                  value={formatDisplayCurrency(campaign.spendInRange)}
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

        {!visibleCampaigns.length ? (
          <div className="rounded-[26px] border border-dashed border-black/[0.08] bg-white/45 p-6 text-center text-sm text-muted">
            {resolvedEmptyMessage}
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
              <th className="px-4 py-2">مصروف الفترة</th>
              <th className="px-4 py-2">إجمالي المصروف</th>
              <th className="px-4 py-2">متوسط اليوم</th>
              <th className="px-4 py-2">أيام النشاط</th>
              <th className="px-5 py-2">الأرشفة</th>
            </tr>
          </thead>

          <tbody>
            {visibleCampaigns.map((campaign) => {
              const totalPaid = budgets[campaign.campaignId]?.totalPaid ?? 0;
              const remaining = getRemaining(totalPaid, campaign.totalSpend);
              const isRemoving = removingCampaignIds.has(campaign.campaignId);

              return (
                <tr
                  className={cn(
                    "cursor-pointer transition-opacity duration-150",
                    isRemoving && "pointer-events-none opacity-0",
                  )}
                  key={campaign.campaignId}
                  onClick={() => openCampaign(campaign)}
                  onKeyDown={(event) => handleOpenKey(event, campaign)}
                  role="link"
                  tabIndex={0}
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
                    {formatDisplayCurrency(campaign.spendInRange)}
                  </td>
                  <td className="border-y border-black/[0.05] bg-white/72 px-4 py-4 font-display text-[15px] font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    {formatDisplayCurrency(campaign.totalSpend)}
                  </td>
                  <td className="border-y border-black/[0.05] bg-white/72 px-4 py-4 font-display text-[15px] font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    {formatDisplayCurrency(campaign.averageDailySpend)}
                  </td>
                  <td className="border-y border-black/[0.05] bg-white/72 px-4 py-4 text-sm font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    {campaign.activeDays}
                  </td>
                  <td className="rounded-l-[26px] border-y border-l border-black/[0.05] bg-white/72 px-5 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <div className="flex justify-end">
                      <CampaignArchiveButton
                        campaign={campaign}
                        isRemoving={isRemoving}
                        mode={mode}
                        onArchiveCampaign={handleArchiveCampaign}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}

            {!visibleCampaigns.length ? (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-muted" colSpan={8}>
                  {resolvedEmptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      </section>
    </>
  );
}
