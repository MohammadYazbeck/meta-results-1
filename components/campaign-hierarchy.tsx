"use client";

import { useState } from "react";

import { formatDisplayCurrency } from "@/lib/currency";
import { type CampaignDetailData } from "@/lib/meta";
import { HierarchyBadge } from "@/components/ui/hierarchy-badge";
import { cn } from "@/lib/utils";

type CampaignHierarchyProps = {
  adSets: CampaignDetailData["adSets"];
};

function formatInteger(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-[20px] border border-black/[0.05] bg-white/92 px-3.5 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.96)]">
      <span className="text-[11px] font-semibold uppercase text-muted">
        {label}
      </span>
      <strong
        className="break-words font-display text-[1.18rem] font-semibold leading-none text-ink tabular-nums sm:text-[1.3rem]"
        dir="ltr"
      >
        {value}
      </strong>
    </div>
  );
}

function MetricPillGroup({
  followers,
  impressions,
  messages,
  reach,
  spend,
}: CampaignDetailData["totals"]) {
  return (
    <div className="grid grid-cols-2 gap-2 min-[520px]:grid-cols-3 xl:grid-cols-5">
      <MetricPill label="المصروف" value={formatDisplayCurrency(spend)} />
      <MetricPill label="الرسائل" value={formatInteger(messages)} />
      <MetricPill label="المتابعون" value={formatInteger(followers)} />
      <MetricPill label="الوصول" value={formatInteger(reach)} />
      <MetricPill label="الانطباعات" value={formatInteger(impressions)} />
    </div>
  );
}

function AdMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-h-[72px] gap-1 rounded-[18px] border border-black/[0.05] bg-white/92 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.96)] sm:min-h-[88px] sm:px-3.5 sm:py-3">
      <span className="text-[10px] font-semibold uppercase text-muted">
        {label}
      </span>
      <strong
        className="self-end font-display text-[1rem] font-semibold leading-none text-ink tabular-nums sm:text-[1.18rem]"
        dir="ltr"
      >
        {value}
      </strong>
    </div>
  );
}

export function CampaignHierarchy({ adSets }: CampaignHierarchyProps) {
  const [openAdSetId, setOpenAdSetId] = useState<string | null>(adSets[0]?.id ?? null);

  if (!adSets.length) {
    return (
      <p className="px-5 pb-5 pt-2 text-sm leading-7 text-muted sm:px-6 sm:pb-6">
        لا توجد مجموعات إعلانية ظاهرة لهذه الحملة ضمن الفترة الحالية.
      </p>
    );
  }

  return (
    <div className="grid gap-4 px-5 pb-5 pt-2 sm:px-6 sm:pb-6">
      {adSets.map((adSet, adSetIndex) => {
        const isOpen = openAdSetId === adSet.id;

        return (
          <article
            className={cn(
              "overflow-hidden rounded-[28px] border border-[#7c3aed]/10 bg-[linear-gradient(180deg,rgba(124,58,237,0.05),rgba(255,255,255,0.76)_22%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition duration-200",
              isOpen && "border-[#7c3aed]/18 bg-[linear-gradient(180deg,rgba(124,58,237,0.08),rgba(255,255,255,0.88)_24%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_18px_40px_rgba(109,40,217,0.05)]",
            )}
            key={adSet.id}
          >
            <button
              aria-controls={`adset-panel-${adSet.id}`}
              aria-expanded={isOpen}
              className="flex w-full flex-col gap-4 p-4 text-right sm:p-5 lg:flex-row lg:items-center lg:justify-between"
              onClick={() => setOpenAdSetId(isOpen ? null : adSet.id)}
              type="button"
            >
              <div className="min-w-0 flex-1">
                <div className="grid gap-1.5 text-right">
                  <div className="flex flex-wrap gap-2">
                    <HierarchyBadge variant="adSet">Ad Set</HierarchyBadge>
                    <span className="inline-flex w-fit items-center rounded-full border border-[#7c3aed]/10 bg-white/70 px-3 py-1 text-[11px] font-medium text-[#6d28d9]">
                      {`المجموعة ${adSetIndex + 1}`}
                    </span>
                  </div>
                  <h3 className="m-0 text-[1.02rem] font-medium text-ink">
                    {adSet.name}
                  </h3>
                </div>
              </div>

              <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:flex-none">
                <div className="grid grid-cols-2 gap-2 text-right lg:min-w-[220px]">
                  <div className="rounded-[18px] border border-black/[0.05] bg-white/82 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <span className="block text-[10px] font-semibold uppercase text-muted">
                      Ads
                    </span>
                    <strong
                      className="mt-1 block font-display text-[1.12rem] font-semibold leading-none text-ink tabular-nums sm:text-[1.22rem]"
                      dir="ltr"
                    >
                      {formatInteger(adSet.ads.length)}
                    </strong>
                  </div>
                  <div className="rounded-[18px] border border-black/[0.05] bg-white/82 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <span className="block text-[10px] font-semibold uppercase text-muted">
                      Spend
                    </span>
                    <strong
                      className="mt-1 block font-display text-[1.02rem] font-semibold leading-none text-ink tabular-nums sm:text-[1.12rem]"
                      dir="ltr"
                    >
                      {formatDisplayCurrency(adSet.spend)}
                    </strong>
                  </div>
                </div>

                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.05] bg-white/85 text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition duration-200",
                    isOpen && "rotate-180 text-ink",
                  )}
                >
                  <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
              </div>
            </button>

            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
              id={`adset-panel-${adSet.id}`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-black/[0.05] px-4 pb-4 pt-3 sm:px-5">
                  <MetricPillGroup
                    followers={adSet.followers}
                    impressions={adSet.impressions}
                    messages={adSet.messages}
                    reach={adSet.reach}
                    spend={adSet.spend}
                  />
                </div>

                <div className="border-t border-[#7c3aed]/10 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                  <div className="grid gap-3 border-r border-[#7c3aed]/12 pr-4 sm:pr-5">
                  {adSet.ads.map((ad, adIndex) => (
                    <article
                      className="relative grid gap-3 rounded-[24px] border border-[#10b981]/12 bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(255,255,255,0.9)_34%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]"
                      key={ad.id}
                    >
                      <span className="absolute -right-[9px] top-7 h-4 w-4 rounded-full border-4 border-white bg-[#10b981]/70" />
                      <div className="grid gap-1.5">
                        <div className="flex flex-wrap gap-2">
                          <HierarchyBadge variant="ad">Ad</HierarchyBadge>
                          <span className="inline-flex w-fit items-center rounded-full border border-[#10b981]/12 bg-white/75 px-3 py-1 text-[11px] font-medium text-[#047857]">
                            {`الإعلان ${adIndex + 1}`}
                          </span>
                        </div>
                        <strong className="text-[15px] font-medium text-ink">
                          {ad.name}
                        </strong>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <AdMetric label="المصروف" value={formatDisplayCurrency(ad.spend)} />
                        <AdMetric label="رسائل" value={formatInteger(ad.messages)} />
                        <AdMetric label="وصول" value={formatInteger(ad.reach)} />
                      </div>
                    </article>
                  ))}

                  {!adSet.ads.length ? (
                    <p className="text-sm leading-7 text-muted">
                      لا توجد إعلانات ظاهرة تحت هذه المجموعة الإعلانية خلال الفترة الحالية.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
