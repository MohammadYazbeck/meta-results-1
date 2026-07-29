"use client";

import { useState, type FormEvent } from "react";

import { HierarchyBadge } from "@/components/ui/hierarchy-badge";
import { formatDisplayCurrency } from "@/lib/currency";
import { type CampaignDetailData } from "@/lib/meta";
import { cn } from "@/lib/utils";

type CampaignHierarchyProps = {
  adSets: CampaignDetailData["adSets"];
  campaignId: string;
  canStopAds: boolean;
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
          : "bg-[linear-gradient(135deg,rgba(142,142,147,0.14),rgba(246,248,251,0.9))] text-[#6e6e73]",
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
        className="inline-flex min-h-[34px] w-fit items-center rounded-full border border-[#b42318]/15 bg-[#fff5f5] px-3.5 text-[12px] font-semibold text-[#b42318] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] transition hover:border-[#b42318]/25 hover:bg-white"
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/28 px-3 py-4 backdrop-blur-sm sm:items-center"
          role="dialog"
        >
          <form
            className="w-full max-w-[420px] rounded-[28px] border border-white/70 bg-white/96 p-4 text-right shadow-[0_24px_80px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.95)] sm:p-5"
            onSubmit={handleSubmit}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="mb-2 text-[11px] font-semibold uppercase text-[#b42318]">
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
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-white text-lg leading-none text-muted"
                disabled={isSubmitting}
                onClick={closeDialog}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="mb-4 rounded-[20px] border border-black/[0.05] bg-[var(--bg-soft)] px-4 py-3">
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
              className="mb-3 min-h-[48px] w-full rounded-[18px] border border-black/[0.06] bg-white px-4 text-sm text-ink outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus:border-[#b42318]/20 focus:ring-2 focus:ring-[#b42318]/10"
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
              <p className="mb-3 rounded-[16px] border border-[#b42318]/10 bg-[#fff5f5] px-3 py-2 text-sm leading-6 text-[#b42318]">
                {error}
              </p>
            ) : null}

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#b42318] px-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "جاري الإيقاف..." : "تأكيد الإيقاف"}
              </button>
              <button
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-black/[0.06] bg-white px-4 text-sm font-medium text-ink"
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
    .flatMap((adSet) => adSet.ads)
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
        const isRunning = isAdRunning(displayAd);

        return (
          <article
            className={cn(
              "relative grid gap-3 rounded-[24px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]",
              isRunning
                ? "border-[#10b981]/12 bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(255,255,255,0.9)_34%)]"
                : "border-[#8e8e93]/14 bg-[linear-gradient(180deg,rgba(142,142,147,0.09),rgba(255,255,255,0.9)_34%)]",
            )}
            key={ad.id}
          >
            <span
              className={cn(
                "absolute -right-[9px] top-7 h-4 w-4 rounded-full border-4 border-white",
                isRunning ? "bg-[#10b981]/70" : "bg-[#8e8e93]/65",
              )}
            />

            <div className="grid gap-3 lg:grid-cols-[minmax(116px,150px)_minmax(0,1fr)] lg:items-start">
              <AdThumbnail ad={displayAd} />

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
                        : "border-[#8e8e93]/16 text-[#6e6e73]",
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
                    <span className="inline-flex min-h-[34px] w-fit items-center rounded-full border border-[#8e8e93]/16 bg-white/75 px-3 text-[12px] font-medium text-[#6e6e73]">
                      تم إرسال أمر الإيقاف
                    </span>
                  ) : null}
                </div>
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
