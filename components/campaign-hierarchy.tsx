"use client";

import { formatDisplayCurrency } from "@/lib/currency";
import { type CampaignDetailData } from "@/lib/meta";
import { HierarchyBadge } from "@/components/ui/hierarchy-badge";

type CampaignHierarchyProps = {
  adSets: CampaignDetailData["adSets"];
};

type FlatAd = CampaignDetailData["adSets"][number]["ads"][number];

function formatInteger(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

function AdMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-h-[78px] gap-1 rounded-[18px] border border-black/[0.05] bg-white/92 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.96)] sm:min-h-[88px] sm:px-3.5 sm:py-3">
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

function flattenAds(adSets: CampaignDetailData["adSets"]) {
  return adSets
    .flatMap((adSet) => adSet.ads)
    .sort((left, right) => right.spend - left.spend);
}

export function CampaignHierarchy({ adSets }: CampaignHierarchyProps) {
  const ads = flattenAds(adSets);

  if (!ads.length) {
    return (
      <p className="px-5 pb-5 pt-2 text-sm leading-7 text-muted sm:px-6 sm:pb-6">
        لا توجد إعلانات ظاهرة لهذه الحملة حالياً.
      </p>
    );
  }

  return (
    <div className="grid gap-3 px-5 pb-5 pt-2 sm:px-6 sm:pb-6">
      {ads.map((ad: FlatAd, adIndex) => (
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

          <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3 xl:grid-cols-5">
            <AdMetric label="المصروف" value={formatDisplayCurrency(ad.spend)} />
            <AdMetric label="الرسائل" value={formatInteger(ad.messages)} />
            <AdMetric label="المتابعون" value={formatInteger(ad.followers)} />
            <AdMetric label="الوصول" value={formatInteger(ad.reach)} />
            <AdMetric label="الانطباعات" value={formatInteger(ad.impressions)} />
          </div>
        </article>
      ))}
    </div>
  );
}
