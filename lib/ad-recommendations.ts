import type { AdPerformance } from "@/lib/meta";

export type AdPerformanceRating = {
  label: "أقل من المتوسط" | "متوسط" | "جيد" | "ممتاز" | "عند انتهاء الإعلان";
  tone: "under" | "average" | "good" | "excellent" | "pending";
};

type ResultMetric = {
  getValue: (ad: AdPerformance) => number;
};

const AVERAGE_RATING: AdPerformanceRating = {
  label: "متوسط",
  tone: "average",
};

function status(value?: string) {
  return value?.toUpperCase();
}

function median(values: number[]) {
  const sorted = values.filter(Number.isFinite).sort((left, right) => left - right);

  if (!sorted.length) {
    return undefined;
  }

  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function percentDifference(value: number, baseline: number) {
  return baseline > 0 ? ((value - baseline) / baseline) * 100 : undefined;
}

function resolveResultMetric(
  optimizationGoal: string | undefined,
  ads: AdPerformance[],
): ResultMetric | undefined {
  const goal = optimizationGoal?.toUpperCase() || "";

  if (goal.includes("CONVERSATION") || goal.includes("MESSAGE")) {
    return { getValue: (ad) => ad.messages };
  }

  if (goal.includes("FOLLOW")) {
    return { getValue: (ad) => ad.followers };
  }

  if (goal.includes("PAGE_LIKE")) {
    return { getValue: (ad) => ad.facebookPageLikes };
  }

  if (goal.includes("PROFILE") || goal.includes("PAGE_ENGAGEMENT")) {
    const profileVisits = ads.reduce((sum, item) => sum + item.profileVisits, 0);

    if (profileVisits > 0) {
      return { getValue: (item) => item.profileVisits };
    }

    const followers = ads.reduce((sum, item) => sum + item.followers, 0);
    if (followers > 0) {
      return { getValue: (item) => item.followers };
    }
  }

  return undefined;
}

export function getAdPerformanceRating(
  ad: AdPerformance,
  campaignStatus?: string,
  adSetStatus?: string,
  optimizationGoal?: string,
  peerAds: AdPerformance[] = [],
): AdPerformanceRating {
  const isRunning =
    status(campaignStatus) === "ACTIVE" &&
    status(adSetStatus) === "ACTIVE" &&
    status(ad.status) === "ACTIVE";

  if (isRunning) {
    return { label: "عند انتهاء الإعلان", tone: "pending" };
  }

  const comparisonAds = peerAds.length ? peerAds : [ad];
  const resultMetric = resolveResultMetric(optimizationGoal, comparisonAds);

  if (!resultMetric) {
    return AVERAGE_RATING;
  }

  const results = resultMetric.getValue(ad);
  const hasEarlyData = ad.impressions >= 1500 && results >= 3;

  if (results === 0 && ad.impressions >= 1500) {
    return { label: "أقل من المتوسط", tone: "under" };
  }

  if (!hasEarlyData) {
    return AVERAGE_RATING;
  }

  const eligiblePeers = comparisonAds.filter(
    (peer) =>
      peer.id !== ad.id &&
      peer.impressions >= 1500 &&
      resultMetric.getValue(peer) >= 3,
  );
  const peerCpr = median(
    eligiblePeers.map((peer) => peer.spend / resultMetric.getValue(peer)),
  );
  const peerCtr = median(eligiblePeers.map((peer) => peer.ctr));
  const peerResultRate = median(
    eligiblePeers.map(
      (peer) => (resultMetric.getValue(peer) / peer.impressions) * 1000,
    ),
  );

  if (peerCpr === undefined || peerCtr === undefined || peerResultRate === undefined) {
    return AVERAGE_RATING;
  }

  const costPerResult = ad.spend / results;
  const cprDifference = percentDifference(costPerResult, peerCpr) ?? 0;
  const ctrDifference = percentDifference(ad.ctr, peerCtr) ?? 0;
  const resultRate = (results / ad.impressions) * 1000;
  const resultRateDifference = percentDifference(resultRate, peerResultRate) ?? 0;
  const attentionIsHealthy = ctrDifference >= -20;
  const resultRateIsHealthy = resultRateDifference >= -20;

  if (
    cprDifference <= -40 &&
    attentionIsHealthy &&
    resultRateIsHealthy &&
    ad.impressions >= 3000 &&
    results >= 5
  ) {
    return { label: "ممتاز", tone: "excellent" };
  }

  if (cprDifference <= -20 && attentionIsHealthy) {
    return { label: "جيد", tone: "good" };
  }

  if (
    (cprDifference >= 25 &&
      (ctrDifference <= -20 || resultRateDifference <= -20)) ||
    cprDifference >= 50
  ) {
    return { label: "أقل من المتوسط", tone: "under" };
  }

  return AVERAGE_RATING;
}
