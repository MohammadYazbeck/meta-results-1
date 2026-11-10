import type { FinancialSettingsSnapshot } from "@/lib/financial-settings-store";
import type {
  CampaignDailySpend,
  CampaignDetailData,
  CampaignSpend,
  MetricTotals,
} from "@/lib/meta";

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function resolveCampaignFinancialSettings(
  settings: FinancialSettingsSnapshot,
  campaignId: string,
) {
  const override = settings.campaigns[campaignId];

  return {
    exchangeRate:
      override?.exchangeRate ?? settings.resolvedGeneral.exchangeRate,
    negativeBalanceAddOnPercent:
      override?.negativeBalanceAddOnPercent ??
      settings.resolvedGeneral.negativeBalanceAddOnPercent,
  };
}

export function convertDashboardSpend(
  amount: number,
  campaignId: string,
  settings: FinancialSettingsSnapshot,
) {
  const { exchangeRate } = resolveCampaignFinancialSettings(settings, campaignId);
  const baseRate = settings.baseExchangeRate || 1;
  return roundCurrency((amount / baseRate) * exchangeRate);
}

export function applyNegativeBalanceAddOn(
  remaining: number,
  addOnPercent: number,
) {
  const roundedRemaining = roundCurrency(remaining);

  if (roundedRemaining >= 0 || addOnPercent <= 0) {
    return roundedRemaining;
  }

  return roundCurrency(roundedRemaining * (1 + addOnPercent / 100));
}

export function getAdjustedRemaining(
  totalPaid: number,
  totalSpend: number,
  addOnPercent: number,
) {
  return applyNegativeBalanceAddOn(totalPaid - totalSpend, addOnPercent);
}

export function applyFinancialSettingsToCampaigns(
  campaigns: CampaignSpend[],
  settings: FinancialSettingsSnapshot,
) {
  return campaigns
    .map((campaign) => ({
      ...campaign,
      averageDailySpend: convertDashboardSpend(
        campaign.averageDailySpend,
        campaign.campaignId,
        settings,
      ),
      spendInRange: convertDashboardSpend(
        campaign.spendInRange,
        campaign.campaignId,
        settings,
      ),
      totalSpend: convertDashboardSpend(
        campaign.totalSpend,
        campaign.campaignId,
        settings,
      ),
    }))
    .sort((left, right) => {
      if (right.totalSpend !== left.totalSpend) {
        return right.totalSpend - left.totalSpend;
      }

      return left.campaignName.localeCompare(right.campaignName);
    });
}

export function applyFinancialSettingsToCampaignDaily(
  entries: CampaignDailySpend[],
  settings: FinancialSettingsSnapshot,
) {
  return entries.map((entry) => ({
    ...entry,
    spend: convertDashboardSpend(
      entry.spend,
      entry.campaignId,
      settings,
    ),
  }));
}

function applyRateToMetricTotals<T extends MetricTotals>(
  totals: T,
  campaignId: string,
  settings: FinancialSettingsSnapshot,
): T {
  return {
    ...totals,
    cpm: convertDashboardSpend(totals.cpm, campaignId, settings),
    spend: convertDashboardSpend(totals.spend, campaignId, settings),
  };
}

export function applyFinancialSettingsToCampaignDetail(
  campaign: CampaignDetailData,
  settings: FinancialSettingsSnapshot,
): CampaignDetailData {
  return {
    ...campaign,
    adSets: campaign.adSets.map((adSet) => ({
      ...applyRateToMetricTotals(adSet, campaign.campaignId, settings),
      ads: adSet.ads.map((ad) =>
        applyRateToMetricTotals(ad, campaign.campaignId, settings),
      ),
    })),
    totals: applyRateToMetricTotals(
      campaign.totals,
      campaign.campaignId,
      settings,
    ),
  };
}
