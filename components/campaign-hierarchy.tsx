"use client";

import { formatDisplayCurrency } from "@/lib/currency";
import { type CampaignDetailData } from "@/lib/meta";
import { HierarchyBadge } from "@/components/ui/hierarchy-badge";
import { cn } from "@/lib/utils";

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

function formatPublishedDate(value?: string) {
  if (!value) {
    return "غير متوفر";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "غير متوفر";
  }

  return new Intl.DateTimeFormat("ar", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
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

function isAdRunning(ad: FlatAd) {
  return ad.status?.toUpperCase() === "ACTIVE";
}

function AdThumbnail({ ad }: { ad: FlatAd }) {
  const isRunning = isAdRunning(ad);
  const primaryLink = ad.permalinkUrl || ad.destinationUrl;
  const media = ad.thumbnailUrl ? (
    <img
      alt=""
      className="h-full w-full object-cover"
      loading="lazy"
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
      referrerPolicy="no-referrer"
      src={ad.thumbnailUrl}
    />
  ) : (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center text-[11px] font-semibold",
        isRunning
          ? "bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(0,113,227,0.1))] text-[#047857]"
          : "bg-[linear-gradient(135deg,rgba(142,142,147,0.14),rgba(246,248,251,0.9))] text-[#6e6e73]"
      )}
    >
      Ad
    </div>
  );

  const className =
    "block aspect-[1.2] min-h-[118px] overflow-hidden rounded-[18px] border border-black/[0.06] bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] sm:aspect-[1.35] lg:min-h-0";

  if (!primaryLink) {
    return <div className={className}>{media}</div>;
  }

  return (
    <a
      aria-label={`فتح الإعلان ${ad.name}`}
      className={className}
      href={primaryLink}
      rel="noreferrer"
      target="_blank"
    >
      {media}
    </a>
  );
}

function getPrimaryAdLink(ad: FlatAd) {
  if (ad.permalinkUrl) {
    if (ad.isPermalinkPlatformInferred) {
      return {
        href: ad.permalinkUrl,
        label: "فتح المنشور",
      };
    }

    if (ad.permalinkUrl === ad.instagramPermalinkUrl) {
      return {
        href: ad.permalinkUrl,
        label: "فتح إنستغرام",
      };
    }

    if (ad.permalinkUrl === ad.facebookPermalinkUrl) {
      return {
        href: ad.permalinkUrl,
        label: "فتح فيسبوك",
      };
    }

    return {
      href: ad.permalinkUrl,
      label: "فتح الإعلان",
    };
  }

  if (ad.destinationUrl) {
    return {
      href: ad.destinationUrl,
      label: "فتح الرابط",
    };
  }

  return null;
}

function AdLink({ ad }: { ad: FlatAd }) {
  const link = getPrimaryAdLink(ad);

  if (!link) {
    return null;
  }

  return (
    <a
      className="inline-flex min-h-[34px] w-fit items-center rounded-full border border-black/[0.07] bg-white/82 px-3 text-[12px] font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
      href={link.href}
      rel="noreferrer"
      target="_blank"
    >
      {link.label}
    </a>
  );
}

function getAdSortTimestamp(ad: FlatAd) {
  if (!ad.createdAt) {
    return 0;
  }

  const timestamp = Date.parse(ad.createdAt);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function flattenAds(adSets: CampaignDetailData["adSets"]) {
  return adSets
    .flatMap((adSet) => adSet.ads)
    .sort((left, right) => {
      const dateSort = getAdSortTimestamp(right) - getAdSortTimestamp(left);

      if (dateSort !== 0) {
        return dateSort;
      }

      return left.name.localeCompare(right.name);
    });
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
      {ads.map((ad: FlatAd, adIndex) => {
        const isRunning = isAdRunning(ad);

        return (
          <article
            className={cn(
              "relative grid gap-3 rounded-[24px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]",
              isRunning
                ? "border-[#10b981]/12 bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(255,255,255,0.9)_34%)]"
                : "border-[#8e8e93]/14 bg-[linear-gradient(180deg,rgba(142,142,147,0.09),rgba(255,255,255,0.9)_34%)]"
            )}
            key={ad.id}
          >
            <span
              className={cn(
                "absolute -right-[9px] top-7 h-4 w-4 rounded-full border-4 border-white",
                isRunning ? "bg-[#10b981]/70" : "bg-[#8e8e93]/65"
              )}
            />

            <div className="grid gap-3 lg:grid-cols-[minmax(116px,150px)_minmax(0,1fr)] lg:items-start">
              <AdThumbnail ad={ad} />

              <div className="grid min-w-0 gap-2">
                <div className="flex flex-wrap gap-2">
                  <HierarchyBadge tone={isRunning ? "default" : "muted"} variant="ad">
                    Ad
                  </HierarchyBadge>
                  <span
                    className={cn(
                      "inline-flex w-fit items-center rounded-full border bg-white/75 px-3 py-1 text-[11px] font-medium",
                      isRunning
                        ? "border-[#10b981]/12 text-[#047857]"
                        : "border-[#8e8e93]/16 text-[#6e6e73]"
                    )}
                  >
                    {`الإعلان ${adIndex + 1}`}
                  </span>
                  <span className="inline-flex w-fit items-center rounded-full border border-black/[0.06] bg-white/72 px-3 py-1 text-[11px] font-medium text-muted">
                    {`نشر ${formatPublishedDate(ad.createdAt)}`}
                  </span>
                </div>
                <strong className="break-words text-[15px] font-medium text-ink">
                  {ad.name}
                </strong>
                <AdLink ad={ad} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3 xl:grid-cols-6">
              <AdMetric label="المصروف" value={formatDisplayCurrency(ad.spend)} />
              <AdMetric label="الرسائل" value={formatInteger(ad.messages)} />
              <AdMetric label="متابعو إنستغرام" value={formatInteger(ad.followers)} />
              <AdMetric
                label="إعجابات صفحة فيسبوك"
                value={formatInteger(ad.facebookPageLikes)}
              />
              <AdMetric label="الوصول" value={formatInteger(ad.reach)} />
              <AdMetric label="الانطباعات" value={formatInteger(ad.impressions)} />
            </div>
          </article>
        );
      })}
    </div>
  );
}
