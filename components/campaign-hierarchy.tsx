"use client";

import { useState, type FormEvent } from "react";

import { getAdPerformanceRating } from "@/lib/ad-recommendations";
import { formatDisplayCurrency } from "@/lib/currency";
import { type CampaignDetailData } from "@/lib/meta";
import { cn } from "@/lib/utils";

type CampaignHierarchyProps = {
  adSets: CampaignDetailData["adSets"];
  campaignStatus?: CampaignDetailData["status"];
  campaignId: string;
  canStopAds: boolean;
};

type FlatAd = CampaignDetailData["adSets"][number]["ads"][number] & {
  adSetId: string;
  adSetStatus?: string;
  optimizationGoal?: string;
};

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

type AdMetricIconName =
  | "followers"
  | "impressions"
  | "likes"
  | "messages"
  | "profile"
  | "reach"
  | "spend";

function AdMetricIcon({ name }: { name: AdMetricIconName }) {
  if (name === "messages") {
    return <path d="M5 6.5h14v9H9l-4 3v-12Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />;
  }
  if (name === "profile" || name === "followers") {
    return <><circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" /><path d="M6 19c.5-4 2.5-6 6-6s5.5 2 6 6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></>;
  }
  if (name === "likes") {
    return <path d="M8 20H5V10h3m0 10h8.5a2 2 0 0 0 2-1.7l1-6A2 2 0 0 0 17.5 10H14l.5-3a3 3 0 0 0-3-3L8 10v10Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />;
  }
  if (name === "reach") {
    return <><path d="M5 15a8 8 0 0 1 14 0M8 17.5a5 5 0 0 1 8 0" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /><circle cx="12" cy="20" r="1" fill="currentColor" /></>;
  }
  if (name === "impressions") {
    return <><path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" /></>;
  }
  if (name === "spend") {
    return <><path d="M7 8.5h10l1.5 10h-13L7 8.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" /><path d="M9 8.5a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.8" /></>;
  }
  return <path d="m5 18 5-5 3 3 6-8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />;
}

function AdMetric({ icon, label, value, wide }: { icon: AdMetricIconName; label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn("flex min-h-[88px] items-center justify-between gap-3 rounded-[18px] bg-white/88 px-4 py-3 shadow-[0_5px_16px_rgba(15,23,42,0.04)] ring-1 ring-black/[0.04]", wide && "col-span-2")}>
      <div className="min-w-0 text-right">
        <span className="text-[11px] font-semibold leading-5 text-muted">{label}</span>
        <strong className="mt-1 block font-display text-[1.15rem] font-bold leading-none text-ink tabular-nums" dir="ltr">{value}</strong>
      </div>
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1e8] text-[#ff5a00]">
        <svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22">
          <AdMetricIcon name={icon} />
        </svg>
      </span>
    </div>
  );
}

function isAdRunning(
  ad: FlatAd,
  campaignStatus?: CampaignDetailData["status"],
  adSetStatus?: string,
) {
  const normalizedCampaignStatus = campaignStatus?.toUpperCase();
  const normalizedAdSetStatus = adSetStatus?.toUpperCase();
  const campaignAllowsDelivery = normalizedCampaignStatus === "ACTIVE";
  const adSetAllowsDelivery = normalizedAdSetStatus === "ACTIVE";

  return campaignAllowsDelivery && adSetAllowsDelivery && ad.status?.toUpperCase() === "ACTIVE";
}

function AdThumbnail({
  ad,
  campaignStatus,
  adSetStatus,
}: {
  ad: FlatAd;
  campaignStatus?: CampaignDetailData["status"];
  adSetStatus?: string;
}) {
  const isRunning = isAdRunning(ad, campaignStatus, adSetStatus);
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
          ? "bg-[#e9f7ed] text-[#237b36]"
          : "bg-[var(--bg-soft)] text-muted",
      )}
    >
      Ad
    </div>
  );

  const className =
    "block aspect-square min-h-0 overflow-hidden rounded-[20px] bg-surface shadow-sm ring-1 ring-black/[0.04] sm:min-h-[170px] lg:aspect-[1.12] lg:min-h-[210px]";

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
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#ff5a00,#ff7418)] px-4 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(255,90,0,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(255,90,0,0.28)]"
      href={link.href}
      rel="noreferrer"
      target="_blank"
    >
      <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 24 24" width="16">
        <path d="M14 5h5v5m0-5-8 8M19 14v3.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5v-11A1.5 1.5 0 0 1 6.5 5H10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
      {link.label}
    </a>
  );
}

function getDisplayStopError(message: string) {
  if (message.includes("Incorrect passcode")) {
    return "الرمز غير صحيح.";
  }

  if (message.includes("Too many")) {
    return "تمت محاولات كثيرة. حاول لاحقاً.";
  }

  if (message.includes("not active")) {
    return "هذا الإعلان غير نشط حالياً.";
  }

  if (message.includes("not enabled")) {
    return "صلاحية إيقاف الإعلان غير مفعّلة لهذه الحملة.";
  }

  if (message.includes("Meta rejected")) {
    return "ميتا رفضت إيقاف الإعلان. تأكد أن التوكن يملك صلاحية ads_management وله وصول لهذا الحساب الإعلاني.";
  }

  return message || "تعذر إيقاف الإعلان.";
}

function StopAdControl({
  ad,
  campaignId,
  onStopped,
}: {
  ad: FlatAd;
  campaignId: string;
  onStopped: (adId: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passcode, setPasscode] = useState("");

  function closeDialog() {
    if (isSubmitting) {
      return;
    }

    setError(null);
    setIsOpen(false);
    setPasscode("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/meta/campaign/${encodeURIComponent(campaignId)}`,
        {
          body: JSON.stringify({
            adId: ad.id,
            mode: "stop-ad",
            passcode,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      );
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "تعذر إيقاف الإعلان.");
      }

      setPasscode("");
      setIsOpen(false);
      onStopped(ad.id);
    } catch (caughtError) {
      setError(
        getDisplayStopError(
          caughtError instanceof Error ? caughtError.message : "تعذر إيقاف الإعلان.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        className="inline-flex min-h-[34px] w-fit items-center rounded-md border border-danger/20 bg-[#fff0f2] px-3.5 text-[12px] font-semibold text-danger transition-colors hover:border-danger/30 hover:bg-white"
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        type="button"
      >
        إيقاف الإعلان
      </button>

      {isOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 py-4 sm:items-center"
          role="dialog"
        >
          <form
            className="w-full max-w-[420px] rounded-[20px] bg-surface p-4 text-right shadow-[0_24px_70px_rgba(15,23,42,0.22)] ring-1 ring-black/[0.06] sm:p-5"
            onSubmit={handleSubmit}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="mb-2 text-[11px] font-semibold text-danger">
                  إجراء حساس
                </p>
                <h3 className="font-display text-xl leading-tight text-ink">
                  إيقاف الإعلان؟
                </h3>
                <p className="mt-2 break-words text-sm leading-7 text-muted">
                  سيتم إرسال أمر إيقاف مباشر إلى ميتا لهذا الإعلان.
                </p>
              </div>
              <button
                aria-label="إغلاق"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f2f5] text-lg leading-none text-muted transition hover:bg-[#e7eaf0]"
                disabled={isSubmitting}
                onClick={closeDialog}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="mb-4 rounded-2xl bg-[#f5f7fa] px-4 py-3">
              <span className="block text-[11px] font-semibold uppercase text-muted">
                الإعلان
              </span>
              <strong className="mt-1 block break-words text-sm font-medium text-ink">
                {ad.name}
              </strong>
            </div>

            <label
              className="mb-2 block text-sm font-medium text-muted"
              htmlFor={`stop-passcode-${ad.id}`}
            >
              رمز الإيقاف
            </label>
            <input
              autoComplete="off"
              autoFocus
              className="mb-3 min-h-11 w-full rounded-xl border border-transparent bg-[#f2f4f7] px-4 text-sm text-ink outline-none transition focus:bg-white focus:ring-4 focus:ring-danger/10"
              id={`stop-passcode-${ad.id}`}
              maxLength={64}
              minLength={4}
              onChange={(event) => setPasscode(event.target.value)}
              placeholder="أدخل الرمز"
              required
              type="password"
              value={passcode}
            />

            {error ? (
              <p className="mb-3 rounded-lg border border-danger/20 bg-[#fff0f2] px-3 py-2 text-sm leading-6 text-danger">
                {error}
              </p>
            ) : null}

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#e41e3f] px-4 text-sm font-semibold text-[#ffffff] shadow-[0_8px_18px_rgba(228,30,63,0.2)] transition hover:-translate-y-0.5 hover:bg-[#c91937] disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "جاري الإيقاف..." : "تأكيد الإيقاف"}
              </button>
              <button
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#f0f2f5] px-4 text-sm font-semibold text-ink transition hover:bg-[#e7eaf0]"
                disabled={isSubmitting}
                onClick={closeDialog}
                type="button"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
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
    .flatMap((adSet) =>
      adSet.ads.map((ad) => ({
        ...ad,
        adSetId: adSet.id,
        adSetStatus: adSet.status,
        optimizationGoal: adSet.optimizationGoal,
      })),
    )
    .sort((left, right) => {
      const dateSort = getAdSortTimestamp(right) - getAdSortTimestamp(left);

      if (dateSort !== 0) {
        return dateSort;
      }

      return left.name.localeCompare(right.name);
    });
}

export function CampaignHierarchy({
  adSets,
  campaignStatus,
  campaignId,
  canStopAds,
}: CampaignHierarchyProps) {
  const ads = flattenAds(adSets);
  const [stoppedAdIds, setStoppedAdIds] = useState<Set<string>>(() => new Set());

  function markAdStopped(adId: string) {
    setStoppedAdIds((current) => {
      const next = new Set(current);
      next.add(adId);
      return next;
    });
  }

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
        const displayAd = stoppedAdIds.has(ad.id) ? { ...ad, status: "PAUSED" } : ad;
        const isRunning = isAdRunning(displayAd, campaignStatus, ad.adSetStatus);
        const performanceRating = getAdPerformanceRating(
          displayAd,
          campaignStatus,
          ad.adSetStatus,
          ad.optimizationGoal,
          adSets.find((adSet) => adSet.id === ad.adSetId)?.ads,
        );

        return (
          <article
            className={cn(
              "relative grid gap-4 rounded-[24px] bg-white/92 p-4 shadow-[0_12px_34px_rgba(15,23,42,0.07)] ring-1 ring-black/[0.045] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] sm:p-5",
            )}
            key={ad.id}
          >
            <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(110px,0.8fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.48fr)] lg:items-start lg:gap-6">
              <div className="grid min-w-0 content-start gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#f4f5f7] px-3 py-1.5 text-[11px] font-semibold text-muted ring-1 ring-black/[0.035]">
                    {`نشر ${formatPublishedDate(ad.createdAt)}`}
                  </span>
                  <span className="inline-flex w-fit items-center rounded-full bg-[#f4f5f7] px-3 py-1.5 text-[11px] font-semibold text-muted ring-1 ring-black/[0.035]">
                    {`الإعلان ${adIndex + 1}`}
                  </span>
                  <span
                    className={cn(
                      "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold",
                      isRunning
                        ? "bg-[#e9f7ed] text-[#237b36]"
                        : "bg-[#f0f2f5] text-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        isRunning
                          ? "bg-[#31a24c] shadow-[0_0_0_3px_rgba(49,162,76,0.14)]"
                          : "bg-[#8a8d91]",
                      )}
                    />
                    {isRunning ? "نشط" : "متوقف"}
                  </span>
                </div>
                <div className="grid gap-2">
                  <strong className="break-words font-display text-[clamp(1.15rem,4vw,1.55rem)] font-black leading-tight text-ink">
                    {ad.name}
                  </strong>
                  <span
                    className={cn(
                      "inline-flex w-fit max-w-full rounded-full px-3 py-1.5 text-[12px] font-bold leading-5",
                      performanceRating.tone === "excellent"
                        ? "bg-[#e7f8ef] text-[#036b4f]"
                        : performanceRating.tone === "good"
                        ? "bg-[#f0fbf5] text-[#047857]"
                        : performanceRating.tone === "under"
                          ? "bg-[#fff0e7] text-[#e95712]"
                          : "bg-[#f4f4f5] text-[#6e6e73]",
                    )}
                  >
                    {`التقييم: ${performanceRating.label}`}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <AdLink ad={ad} />
                  {canStopAds && isRunning ? (
                    <StopAdControl
                      ad={ad}
                      campaignId={campaignId}
                      onStopped={markAdStopped}
                    />
                  ) : null}
                  {stoppedAdIds.has(ad.id) ? (
                    <span className="inline-flex min-h-[34px] w-fit items-center rounded-xl bg-white/80 px-3 text-[12px] font-medium text-muted ring-1 ring-black/[0.035]">
                      تم إرسال أمر الإيقاف
                    </span>
                  ) : null}
                </div>
              </div>

              <AdThumbnail
                ad={displayAd}
                adSetStatus={ad.adSetStatus}
                campaignStatus={campaignStatus}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              <AdMetric icon="spend" label="المصروف" value={formatDisplayCurrency(ad.spend)} />
              <AdMetric icon="messages" label="إجمالي المحادثات من الإعلان" value={formatInteger(ad.messages)} />
              <AdMetric icon="followers" label="متابعات إنستغرام من الإعلان" value={formatInteger(ad.followers)} />
              <AdMetric icon="profile" label="زيارات الملف الشخصي" value={formatInteger(ad.profileVisits)} />
              <AdMetric
                icon="likes"
                label="إعجابات صفحة فيسبوك"
                value={formatInteger(ad.facebookPageLikes)}
              />
              <AdMetric icon="reach" label="الوصول" value={formatInteger(ad.reach)} />
              <AdMetric icon="impressions" label="الانطباعات" value={formatInteger(ad.impressions)} wide />
            </div>
          </article>
        );
      })}
    </div>
  );
}
