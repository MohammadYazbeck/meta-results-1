"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

type BulkPauseResponse = {
  eligibleCount?: number;
  error?: string;
  failed?: Array<{ campaignName: string; error: string }>;
  paused?: Array<{ campaignName: string }>;
  skipped?: Array<{ campaignName: string }>;
};

type StopNegativeCampaignsButtonProps = {
  campaignCount: number;
};

export function StopNegativeCampaignsButton({
  campaignCount,
}: StopNegativeCampaignsButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleStopAll() {
    if (isSubmitting || campaignCount === 0) {
      return;
    }

    const confirmed = window.confirm(
      `سيتم إيقاف ${campaignCount} حملات يقل متبقيها عن -$10 في Meta. هل تريد المتابعة؟`,
    );

    if (!confirmed) {
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/meta/campaigns/bulk-pause", {
        method: "POST",
      });
      const payload = (await response.json().catch(() => ({}))) as BulkPauseResponse;

      if (!response.ok) {
        throw new Error(payload.error || "تعذر إيقاف الحملات.");
      }

      const pausedCount = payload.paused?.length ?? 0;
      const failedCount = payload.failed?.length ?? 0;
      const skippedCount = payload.skipped?.length ?? 0;
      const parts = [`تم إيقاف ${pausedCount} حملة`];

      if (skippedCount > 0) {
        parts.push(`تم تجاوز ${skippedCount}`);
      }

      if (failedCount > 0) {
        parts.push(`تعذر إيقاف ${failedCount}`);
      }

      setFeedback(`${parts.join("، ")}.`);
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "تعذر إيقاف الحملات.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <button
        className={cn(
          "inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2.5 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition",
          campaignCount > 0
            ? "border-[#b42318]/20 bg-[#fff4f2] text-[#b42318] hover:border-[#b42318]/35 hover:bg-white"
            : "cursor-not-allowed border-black/[0.06] bg-white/55 text-muted",
          isSubmitting && "cursor-wait opacity-70",
        )}
        disabled={isSubmitting || campaignCount === 0}
        onClick={handleStopAll}
        type="button"
      >
        {isSubmitting
          ? "جارٍ إيقاف الحملات..."
          : `إيقاف الحملات تحت -$10 (${campaignCount})`}
      </button>
      {feedback ? (
        <p aria-live="polite" className="max-w-[34rem] text-xs leading-5 text-muted">
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
