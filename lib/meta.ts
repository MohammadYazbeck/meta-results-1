import { convertAccountCurrencyAmount } from "@/lib/currency";

const DEFAULT_START_OFFSET_DAYS = 13;
const DEFAULT_LOOKBACK_DAYS = 14;
const META_CACHE_TTL_MS = 60_000;
const SAMPLE_PREFIX = "replace_with_";
const MESSAGES_ALIASES = [
  "messaging_conversation_started",
  "messaging_first_reply",
  "total_messaging_connection",
  "messaging_replied",
];
const FOLLOWERS_ALIASES = [
  "omni_follow",
  "follow",
  "profile_follow",
  "instagram_profile_follow",
];
const metaResponseCache = new Map<string, { expiresAt: number; value: unknown }>();

export type DateRange = {
  start: string;
  end: string;
};

type MetaActionStat = {
  action_type?: string;
  value?: string;
};

type MetaInsightsRow = {
  actions?: MetaActionStat[];
  ad_id?: string;
  ad_name?: string;
  adset_id?: string;
  adset_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  date_start?: string;
  impressions?: string;
  reach?: string;
  spend?: string;
};

type MetaEntity = {
  adset_id?: string;
  campaign_id?: string;
  id: string;
  name?: string;
  status?: string;
};

type MetaPage<T> = {
  data: T[];
  paging?: {
    next?: string;
  };
};

export type MetricTotals = {
  followers: number;
  impressions: number;
  messages: number;
  reach: number;
  spend: number;
};

export type CampaignSpend = {
  activeDays: number;
  averageDailySpend: number;
  campaignId: string;
  campaignName: string;
  status?: string;
  totalSpend: number;
};

export type DailySpend = {
  date: string;
  spend: number;
};

export type SpendDashboardData = {
  accountId: string;
  campaigns: CampaignSpend[];
  daily: DailySpend[];
  range: DateRange;
  source: "live" | "mock";
  summary: {
    averageDailySpend: number;
    daysInRange: number;
    topCampaignName: string;
    topCampaignSpend: number;
    totalCampaigns: number;
    totalSpend: number;
    totalSpendInRange: number;
  };
};

export type AdPerformance = MetricTotals & {
  id: string;
  name: string;
};

export type AdSetPerformance = MetricTotals & {
  ads: AdPerformance[];
  id: string;
  name: string;
};

export type CampaignDetailData = {
  adSets: AdSetPerformance[];
  campaignId: string;
  campaignName: string;
  range: DateRange;
  source: "live" | "mock";
  totals: MetricTotals;
};

export type CampaignDebugData = {
  accountId: string;
  campaignId: string;
  campaignMatched: boolean;
  campaignName: string;
  counts: {
    accountAds: number;
    accountAdSets: number;
    accountCampaigns: number;
    filteredAds: number;
    filteredAdSets: number;
    matchedAdInsights: number;
    matchedAdSetInsights: number;
  };
  sample: {
    adIds: string[];
    adNames: string[];
    adSetIds: string[];
    adSetNames: string[];
  };
};

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function roundCount(value: number) {
  return Number.isFinite(value) ? Math.round(value) : 0;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseNumericValue(value?: string) {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function getApiVersion() {
  return getEnv("META_API_VERSION") || "v25.0";
}

function getAccountId() {
  return getEnv("META_AD_ACCOUNT_ID") || "act_123456789";
}

function isConfigured() {
  const token = getEnv("META_ACCESS_TOKEN");
  const accountId = getEnv("META_AD_ACCOUNT_ID");

  return Boolean(
    token &&
      accountId &&
      !token.startsWith(SAMPLE_PREFIX) &&
      !accountId.startsWith("act_123456789"),
  );
}

function withAccessToken(url: string) {
  const urlObject = new URL(url);

  if (!urlObject.searchParams.get("access_token")) {
    urlObject.searchParams.set("access_token", getEnv("META_ACCESS_TOKEN"));
  }

  return urlObject.toString();
}

async function fetchMetaJson<T>(url: string) {
  const resolvedUrl = withAccessToken(url);
  const cached = metaResponseCache.get(resolvedUrl);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }

  const response = await fetch(resolvedUrl);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meta API request failed with ${response.status}: ${errorText}`);
  }

  const payload = (await response.json()) as T & {
    error?: { message?: string };
  };

  if (payload.error?.message) {
    throw new Error(payload.error.message);
  }

  metaResponseCache.set(resolvedUrl, {
    expiresAt: Date.now() + META_CACHE_TTL_MS,
    value: payload,
  });

  return payload;
}

async function fetchAllPages<T>(url: string) {
  const rows: T[] = [];
  let nextUrl: string | undefined = url;
  let pageCount = 0;

  while (nextUrl && pageCount < 20) {
    const payload: MetaPage<T> = await fetchMetaJson<MetaPage<T>>(nextUrl);
    rows.push(...payload.data);
    nextUrl = payload.paging?.next;
    pageCount += 1;
  }

  return rows;
}

function buildAccountEdgeUrl(edge: "campaigns" | "adsets" | "ads", fields: string) {
  const version = getApiVersion();
  const url = new URL(`https://graph.facebook.com/${version}/${getAccountId()}/${edge}`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", "500");
  return url.toString();
}

function buildAccountInsightsUrl(options: {
  datePreset?: string;
  fields: string;
  level: "campaign" | "adset" | "ad";
  range?: DateRange;
  timeIncrement: "1" | "all_days";
}) {
  const version = getApiVersion();
  const url = new URL(`https://graph.facebook.com/${version}/${getAccountId()}/insights`);
  url.searchParams.set("fields", options.fields);
  url.searchParams.set("level", options.level);
  url.searchParams.set("time_increment", options.timeIncrement);
  url.searchParams.set("limit", "500");

  if (options.range) {
    url.searchParams.set(
      "time_range",
      JSON.stringify({
        since: options.range.start,
        until: options.range.end,
      }),
    );
  }

  if (options.datePreset) {
    url.searchParams.set("date_preset", options.datePreset);
  }

  return url.toString();
}

function actionTypeMatches(actionType: string, aliases: string[]) {
  const normalized = actionType.toLowerCase();

  return aliases.some(
    (alias) =>
      normalized === alias ||
      normalized.startsWith(`${alias}_`) ||
      normalized.endsWith(`_${alias}`) ||
      normalized.includes(`.${alias}`),
  );
}

function sumActionValues(actions: MetaActionStat[] | undefined, aliases: string[]) {
  if (!actions?.length) {
    return 0;
  }

  return roundCount(
    actions.reduce((sum, action) => {
      if (!action.action_type || !actionTypeMatches(action.action_type, aliases)) {
        return sum;
      }

      return sum + parseNumericValue(action.value);
    }, 0),
  );
}

function metricsFromInsights(row?: MetaInsightsRow): MetricTotals {
  return {
    followers: sumActionValues(row?.actions, FOLLOWERS_ALIASES),
    impressions: roundCount(parseNumericValue(row?.impressions)),
    messages: sumActionValues(row?.actions, MESSAGES_ALIASES),
    reach: roundCount(parseNumericValue(row?.reach)),
    spend: roundCurrency(convertAccountCurrencyAmount(parseNumericValue(row?.spend))),
  };
}

function zeroTotals(): MetricTotals {
  return {
    followers: 0,
    impressions: 0,
    messages: 0,
    reach: 0,
    spend: 0,
  };
}

function mergeTotals(base: MetricTotals, next: MetricTotals): MetricTotals {
  return {
    followers: roundCount(base.followers + next.followers),
    impressions: roundCount(base.impressions + next.impressions),
    messages: roundCount(base.messages + next.messages),
    reach: roundCount(base.reach + next.reach),
    spend: roundCurrency(base.spend + next.spend),
  };
}

function createDateSeries(range: DateRange) {
  const cursor = new Date(range.start);
  const end = new Date(range.end);
  const dates: string[] = [];

  while (cursor <= end) {
    dates.push(formatDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function getDefaultDateRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - DEFAULT_START_OFFSET_DAYS);

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

export function sanitizeDateRange(startInput?: string | null, endInput?: string | null): DateRange {
  const fallback = getDefaultDateRange();
  const start = startInput && /^\d{4}-\d{2}-\d{2}$/.test(startInput) ? startInput : fallback.start;
  const end = endInput && /^\d{4}-\d{2}-\d{2}$/.test(endInput) ? endInput : fallback.end;

  if (start <= end) {
    return { start, end };
  }

  return { start: end, end: start };
}

export function getEmptySpendDashboardData(inputRange?: Partial<DateRange>): SpendDashboardData {
  const range = sanitizeDateRange(inputRange?.start, inputRange?.end);
  const dates = createDateSeries(range);

  return {
    accountId: getAccountId(),
    campaigns: [],
    daily: dates.map((date) => ({ date, spend: 0 })),
    range,
    source: "live",
    summary: {
      averageDailySpend: 0,
      daysInRange: dates.length,
      topCampaignName: "No campaign data",
      topCampaignSpend: 0,
      totalCampaigns: 0,
      totalSpend: 0,
      totalSpendInRange: 0,
    },
  };
}

export function getEmptyCampaignDetailData(
  campaignId: string,
  inputRange?: Partial<DateRange>,
): CampaignDetailData {
  const range = sanitizeDateRange(inputRange?.start, inputRange?.end);

  return {
    adSets: [],
    campaignId,
    campaignName: `Campaign ${campaignId}`,
    range,
    source: "live",
    totals: zeroTotals(),
  };
}

function buildOverviewData(
  campaigns: MetaEntity[],
  dailyRows: MetaInsightsRow[],
  lifetimeRows: MetaInsightsRow[],
  range: DateRange,
): SpendDashboardData {
  const dates = createDateSeries(range);
  const dailyMap = new Map(dates.map((date) => [date, 0]));
  const inRangeSpendByCampaign = new Map<string, { activeDays: number; name: string; spend: number }>();
  const lifetimeSpendByCampaign = new Map<string, number>();
  const campaignNames = new Map<string, string>();

  for (const row of dailyRows) {
    if (!row.campaign_id || !row.date_start) {
      continue;
    }

    const spend = roundCurrency(convertAccountCurrencyAmount(parseNumericValue(row.spend)));
    dailyMap.set(row.date_start, roundCurrency((dailyMap.get(row.date_start) || 0) + spend));
    campaignNames.set(row.campaign_id, row.campaign_name || `Campaign ${row.campaign_id}`);

    const current = inRangeSpendByCampaign.get(row.campaign_id) || {
      activeDays: 0,
      name: row.campaign_name || `Campaign ${row.campaign_id}`,
      spend: 0,
    };

    current.activeDays += 1;
    current.name = row.campaign_name || current.name;
    current.spend = roundCurrency(current.spend + spend);
    inRangeSpendByCampaign.set(row.campaign_id, current);
  }

  for (const row of lifetimeRows) {
    if (!row.campaign_id) {
      continue;
    }

    lifetimeSpendByCampaign.set(
      row.campaign_id,
      roundCurrency(convertAccountCurrencyAmount(parseNumericValue(row.spend))),
    );
    campaignNames.set(row.campaign_id, row.campaign_name || `Campaign ${row.campaign_id}`);
  }

  for (const campaign of campaigns) {
    campaignNames.set(campaign.id, campaign.name || `Campaign ${campaign.id}`);
  }

  const campaignIds = new Set<string>([
    ...campaigns.map((campaign) => campaign.id),
    ...dailyRows.map((row) => row.campaign_id || "").filter(Boolean),
    ...lifetimeRows.map((row) => row.campaign_id || "").filter(Boolean),
  ]);

  const mergedCampaigns = [...campaignIds]
    .map((campaignId) => {
      const campaign = campaigns.find((item) => item.id === campaignId);
      const inRange = inRangeSpendByCampaign.get(campaignId);
      const totalSpend = lifetimeSpendByCampaign.get(campaignId) ?? inRange?.spend ?? 0;

      return {
        activeDays: inRange?.activeDays ?? 0,
        averageDailySpend:
          (inRange?.activeDays ?? 0) > 0
            ? roundCurrency((inRange?.spend ?? 0) / (inRange?.activeDays ?? 1))
            : 0,
        campaignId,
        campaignName: campaign?.name || inRange?.name || campaignNames.get(campaignId) || `Campaign ${campaignId}`,
        status: campaign?.status,
        totalSpend,
      };
    })
    .sort((left, right) => {
      if (right.totalSpend !== left.totalSpend) {
        return right.totalSpend - left.totalSpend;
      }

      return left.campaignName.localeCompare(right.campaignName);
    });

  const daily = dates.map((date) => ({
    date,
    spend: roundCurrency(dailyMap.get(date) || 0),
  }));
  const totalSpendInRange = roundCurrency(daily.reduce((sum, item) => sum + item.spend, 0));
  const totalSpend = roundCurrency(mergedCampaigns.reduce((sum, campaign) => sum + campaign.totalSpend, 0));
  const topCampaign = mergedCampaigns[0];

  return {
    accountId: getAccountId(),
    campaigns: mergedCampaigns,
    daily,
    range,
    source: "live",
    summary: {
      averageDailySpend: daily.length ? roundCurrency(totalSpendInRange / daily.length) : 0,
      daysInRange: daily.length,
      topCampaignName: topCampaign?.campaignName || "No campaign data",
      topCampaignSpend: topCampaign?.totalSpend || 0,
      totalCampaigns: mergedCampaigns.length,
      totalSpend,
      totalSpendInRange,
    },
  };
}

function buildCampaignHierarchyFromInsights(
  campaignId: string,
  adSetInsights: MetaInsightsRow[],
  adInsights: MetaInsightsRow[],
) {
  const hierarchy = new Map<string, AdSetPerformance>();

  for (const row of adSetInsights) {
    if (row.campaign_id !== campaignId || !row.adset_id) {
      continue;
    }

    hierarchy.set(row.adset_id, {
      ...metricsFromInsights(row),
      ads: [],
      id: row.adset_id,
      name: row.adset_name || `Ad Set ${row.adset_id}`,
    });
  }

  for (const row of adInsights) {
    if (row.campaign_id !== campaignId || !row.ad_id || !row.adset_id) {
      continue;
    }

    const ad: AdPerformance = {
      ...metricsFromInsights(row),
      id: row.ad_id,
      name: row.ad_name || `Ad ${row.ad_id}`,
    };

    const currentAdSet =
      hierarchy.get(row.adset_id) ||
      {
        ...zeroTotals(),
        ads: [],
        id: row.adset_id,
        name: row.adset_name || `Ad Set ${row.adset_id}`,
      };

    currentAdSet.ads.push(ad);

    if (!hierarchy.has(row.adset_id)) {
      hierarchy.set(row.adset_id, currentAdSet);
    }
  }

  return [...hierarchy.values()]
    .map((adSet) => {
      const adsTotals = adSet.ads.reduce((sum, ad) => mergeTotals(sum, ad), zeroTotals());
      const totals =
        adSet.ads.length > 0 &&
        adSet.spend === 0 &&
        adSet.impressions === 0 &&
        adSet.messages === 0 &&
        adSet.followers === 0 &&
        adSet.reach === 0
          ? adsTotals
          : {
              followers: adSet.followers,
              impressions: adSet.impressions,
              messages: adSet.messages,
              reach: adSet.reach,
              spend: adSet.spend,
            };

      return {
        ...totals,
        ads: adSet.ads.sort((left, right) => right.spend - left.spend),
        id: adSet.id,
        name: adSet.name,
      };
    })
    .sort((left, right) => right.spend - left.spend);
}

export async function getSpendDashboardData(inputRange?: Partial<DateRange>) {
  const range = sanitizeDateRange(inputRange?.start, inputRange?.end);

  if (!isConfigured()) {
    return getEmptySpendDashboardData(range);
  }

  const [campaigns, dailyRows, lifetimeRows] = await Promise.all([
    fetchAllPages<MetaEntity>(buildAccountEdgeUrl("campaigns", "id,name,status")),
    fetchAllPages<MetaInsightsRow>(
      buildAccountInsightsUrl({
        fields: "campaign_id,campaign_name,date_start,spend",
        level: "campaign",
        range,
        timeIncrement: "1",
      }),
    ),
    fetchAllPages<MetaInsightsRow>(
      buildAccountInsightsUrl({
        datePreset: "maximum",
        fields: "campaign_id,campaign_name,spend",
        level: "campaign",
        timeIncrement: "all_days",
      }),
    ),
  ]);

  return buildOverviewData(campaigns, dailyRows, lifetimeRows, range);
}

export async function getCampaignDetailData(
  campaignId: string,
  inputRange?: Partial<DateRange>,
): Promise<CampaignDetailData> {
  const range = sanitizeDateRange(inputRange?.start, inputRange?.end);

  if (!isConfigured()) {
    return getEmptyCampaignDetailData(campaignId, range);
  }

  const [lifetimeRows, adSetInsights, adInsights] = await Promise.all([
    fetchAllPages<MetaInsightsRow>(
      buildAccountInsightsUrl({
        datePreset: "maximum",
        fields: "campaign_id,campaign_name,spend,impressions,reach,actions",
        level: "campaign",
        timeIncrement: "all_days",
      }),
    ),
    fetchAllPages<MetaInsightsRow>(
      buildAccountInsightsUrl({
        datePreset: "maximum",
        fields: "campaign_id,campaign_name,adset_id,adset_name,impressions,reach,spend,actions",
        level: "adset",
        timeIncrement: "all_days",
      }),
    ),
    fetchAllPages<MetaInsightsRow>(
      buildAccountInsightsUrl({
        datePreset: "maximum",
        fields:
          "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,impressions,reach,spend,actions",
        level: "ad",
        timeIncrement: "all_days",
      }),
    ),
  ]);

  const lifetimeRow = lifetimeRows.find((row) => row.campaign_id === campaignId);
  const hierarchy = buildCampaignHierarchyFromInsights(campaignId, adSetInsights, adInsights);
  const totals = lifetimeRow ? metricsFromInsights(lifetimeRow) : hierarchy.reduce((sum, adSet) => mergeTotals(sum, adSet), zeroTotals());

  totals.spend = roundCurrency(convertAccountCurrencyAmount(parseNumericValue(lifetimeRow?.spend)));

  return {
    adSets: hierarchy,
    campaignId,
    campaignName: lifetimeRow?.campaign_name || `Campaign ${campaignId}`,
    range,
    source: "live",
    totals,
  };
}

export async function getCampaignDebugData(campaignId: string, inputRange?: Partial<DateRange>): Promise<CampaignDebugData> {
  const range = sanitizeDateRange(inputRange?.start, inputRange?.end);

  if (!isConfigured()) {
    return {
      accountId: getAccountId(),
      campaignId,
      campaignMatched: false,
      campaignName: `Campaign ${campaignId}`,
      counts: {
        accountAds: 0,
        accountAdSets: 0,
        accountCampaigns: 0,
        filteredAds: 0,
        filteredAdSets: 0,
        matchedAdInsights: 0,
        matchedAdSetInsights: 0,
      },
      sample: {
        adIds: [],
        adNames: [],
        adSetIds: [],
        adSetNames: [],
      },
    };
  }

  const [campaignInsights, adSetInsights, adInsights] = await Promise.all([
    fetchAllPages<MetaInsightsRow>(
      buildAccountInsightsUrl({
        datePreset: "maximum",
        fields: "campaign_id,campaign_name,spend,impressions,reach,actions",
        level: "campaign",
        timeIncrement: "all_days",
      }),
    ),
    fetchAllPages<MetaInsightsRow>(
      buildAccountInsightsUrl({
        datePreset: "maximum",
        fields: "campaign_id,campaign_name,adset_id,adset_name,impressions,reach,spend,actions",
        level: "adset",
        timeIncrement: "all_days",
      }),
    ),
    fetchAllPages<MetaInsightsRow>(
      buildAccountInsightsUrl({
        datePreset: "maximum",
        fields:
          "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,impressions,reach,spend,actions",
        level: "ad",
        timeIncrement: "all_days",
      }),
    ),
  ]);

  const filteredCampaigns = campaignInsights.filter((item) => item.campaign_id === campaignId);
  const filteredAdSets = adSetInsights.filter((item) => item.campaign_id === campaignId);
  const filteredAds = adInsights.filter((item) => item.campaign_id === campaignId);
  const matchedAdSetInsights = adSetInsights.filter((item) => item.campaign_id === campaignId);
  const matchedAdInsights = adInsights.filter((item) => item.campaign_id === campaignId);
  const campaignInsight = filteredCampaigns[0];

  return {
    accountId: getAccountId(),
    campaignId,
    campaignMatched: Boolean(campaignInsight),
    campaignName: campaignInsight?.campaign_name || `Campaign ${campaignId}`,
    counts: {
      accountAds: adInsights.length,
      accountAdSets: adSetInsights.length,
      accountCampaigns: campaignInsights.length,
      filteredAds: filteredAds.length,
      filteredAdSets: filteredAdSets.length,
      matchedAdInsights: matchedAdInsights.length,
      matchedAdSetInsights: matchedAdSetInsights.length,
    },
    sample: {
      adIds: filteredAds.slice(0, 8).map((item) => item.ad_id || ""),
      adNames: filteredAds.slice(0, 8).map((item) => item.ad_name || item.ad_id || ""),
      adSetIds: filteredAdSets.slice(0, 8).map((item) => item.adset_id || ""),
      adSetNames: filteredAdSets.slice(0, 8).map((item) => item.adset_name || item.adset_id || ""),
    },
  };
}

export function getSuggestedRangeLabel(range: DateRange) {
  const start = new Date(range.start);
  const end = new Date(range.end);
  const difference = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

  if (difference === DEFAULT_LOOKBACK_DAYS) {
    return "Last 14 days";
  }

  return `${difference} day${difference === 1 ? "" : "s"}`;
}
