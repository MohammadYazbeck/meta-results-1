import { convertAccountCurrencyAmount } from "@/lib/currency";

const DEFAULT_START_OFFSET_DAYS = 13;
const DEFAULT_LOOKBACK_DAYS = 14;
const META_CACHE_TTL_MS = 60_000;
const SAMPLE_PREFIX = "replace_with_";
const MESSAGES_ALIASES = [
  "messaging_conversation_started",
];
const FOLLOWERS_ALIASES = [
  "ig_follow",
  "ig_follows",
  "ig_profile_follow",
  "instagram_follow",
  "instagram_follows",
  "instagram_profile_follow",
  "omni_follow",
  "follow",
  "follows",
  "post_save",
  "profile_follow",
];
const FACEBOOK_PAGE_LIKE_ACTION_TYPES = [
  "like",
];
const PROFILE_VISIT_ALIASES = [
  "business_profile_view",
  "business_profile_views",
  "ig_profile_visit",
  "ig_profile_visits",
  "ig_profile_view",
  "ig_profile_views",
  "instagram_business_profile_view",
  "instagram_business_profile_views",
  "instagram_profile_visit",
  "instagram_profile_visits",
  "instagram_profile_view",
  "instagram_profile_views",
  "omni_profile_visit",
  "omni_profile_visits",
  "omni_profile_view",
  "omni_profile_views",
  "page_profile_visit",
  "page_profile_visits",
  "page_profile_view",
  "page_profile_views",
  "profile_visit",
  "profile_visits",
  "profile_view",
  "profile_views",
  "visit_instagram_profile",
];
const AD_CREATIVE_FIELDS =
  "id,status,effective_status,created_time,updated_time,creative{id,thumbnail_url,image_url,link_url,object_url,effective_object_story_id,object_story_id,instagram_permalink_url,object_story_spec}";
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
  publisher_platform?: string;
  reach?: string;
  spend?: string;
};

type MetaCreativeCallToAction = {
  value?: {
    link?: string;
  };
};

type MetaCreativeStorySpec = {
  link_data?: {
    call_to_action?: MetaCreativeCallToAction;
    link?: string;
  };
  template_data?: {
    call_to_action?: MetaCreativeCallToAction;
    child_attachments?: Array<{
      image_url?: string;
      link?: string;
      picture?: string;
    }>;
    link?: string;
  };
  video_data?: {
    call_to_action?: MetaCreativeCallToAction;
    image_url?: string;
  };
};

type MetaAdCreative = {
  effective_object_story_id?: string;
  id?: string;
  image_url?: string;
  instagram_permalink_url?: string;
  link_url?: string;
  object_story_id?: string;
  object_story_spec?: MetaCreativeStorySpec;
  object_url?: string;
  thumbnail_url?: string;
};

type MetaAdEntity = {
  created_time?: string;
  creative?: MetaAdCreative;
  effective_status?: string;
  id: string;
  status?: string;
  updated_time?: string;
};

type MetaEntity = {
  adset_id?: string;
  campaign_id?: string;
  configured_status?: string;
  effective_status?: string;
  id: string;
  name?: string;
  start_time?: string;
  status?: string;
  stop_time?: string;
};

type MetaPage<T> = {
  data: T[];
  paging?: {
    next?: string;
  };
};

type AdDeliveryPlatform = "facebook" | "instagram";
type InsightsRequestOptions = {
  breakdowns?: string[];
  datePreset?: string;
  fields: string;
  level: "campaign" | "adset" | "ad";
  range?: DateRange;
  timeIncrement: "1" | "all_days";
};

export type MetricTotals = {
  facebookPageLikes: number;
  followers: number;
  impressions: number;
  messages: number;
  profileVisits: number;
  reach: number;
  spend: number;
};

export type CampaignSpend = {
  activeDays: number;
  averageDailySpend: number;
  campaignId: string;
  campaignName: string;
  spendInRange: number;
  status?: string;
  totalSpend: number;
};

export type DailySpend = {
  date: string;
  spend: number;
};

export type CampaignDailySpend = DailySpend & {
  campaignId: string;
};

export type SpendDashboardData = {
  accountId: string;
  campaignDaily: CampaignDailySpend[];
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
  createdAt?: string;
  creativeId?: string;
  deliveryPlatform?: AdDeliveryPlatform;
  destinationUrl?: string;
  facebookPermalinkUrl?: string;
  id: string;
  instagramPermalinkUrl?: string;
  isPermalinkPlatformInferred?: boolean;
  name: string;
  permalinkUrl?: string;
  status?: string;
  thumbnailUrl?: string;
};

type AdCreativeLinkData = Pick<
  AdPerformance,
  | "createdAt"
  | "creativeId"
  | "destinationUrl"
  | "facebookPermalinkUrl"
  | "instagramPermalinkUrl"
  | "status"
  | "thumbnailUrl"
>;

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
  status?: string;
  totals: MetricTotals;
};

export type CampaignDebugData = {
  accountId: string;
  campaignId: string;
  campaignMatched: boolean;
  campaignName: string;
  facebookPageLikeActionTypes: string[];
  followerAliases: string[];
  messageAliases: string[];
  profileVisitAliases: string[];
  rows: {
    ads: CampaignDebugInsightRow[];
    adSets: CampaignDebugInsightRow[];
    campaign: CampaignDebugInsightRow[];
  };
  storage: {
    metricsSaved: boolean;
    persistedFile: string;
    savedFields: string[];
  };
  totalsComparison: {
    adLevelSum: MetricTotals;
    adSetLevelSum: MetricTotals;
    campaignLevel: MetricTotals;
    currentRenderedCampaign: MetricTotals;
  };
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

type CampaignDebugAction = {
  actionType: string;
  countedAsFacebookPageLike: boolean;
  countedAsFollower: boolean;
  countedAsMessage: boolean;
  countedAsProfileVisit: boolean;
  rawValue: string;
  value: number;
};

type CampaignDebugInsightRow = MetricTotals & {
  actions: CampaignDebugAction[];
  adId?: string;
  adName?: string;
  adSetId?: string;
  adSetName?: string;
  campaignId?: string;
  campaignName?: string;
  level: "campaign" | "adset" | "ad";
  raw: MetaInsightsRow;
  rawImpressions?: string;
  rawReach?: string;
  rawSpend?: string;
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

function buildObjectEdgeUrl(objectId: string, edge: "ads", fields: string) {
  const version = getApiVersion();
  const url = new URL(`https://graph.facebook.com/${version}/${objectId}/${edge}`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", "500");
  return url.toString();
}

function buildGraphNodeUrl(objectId: string, fields: string) {
  const version = getApiVersion();
  const url = new URL(`https://graph.facebook.com/${version}/${objectId}`);
  url.searchParams.set("fields", fields);
  return url.toString();
}

function buildInsightsUrl(path: string, options: InsightsRequestOptions) {
  const version = getApiVersion();
  const url = new URL(`https://graph.facebook.com/${version}/${path}/insights`);
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

  if (options.breakdowns?.length) {
    url.searchParams.set("breakdowns", options.breakdowns.join(","));
  }

  if (options.fields.split(",").some((field) => field.trim() === "actions")) {
    url.searchParams.set("action_breakdowns", "action_type");
  }

  return url.toString();
}

function buildAccountInsightsUrl(options: InsightsRequestOptions) {
  return buildInsightsUrl(getAccountId(), options);
}

function buildObjectInsightsUrl(objectId: string, options: InsightsRequestOptions) {
  return buildInsightsUrl(objectId, options);
}

function normalizeUrl(value?: string) {
  const normalized = value?.trim();

  return normalized || undefined;
}

function buildFacebookStoryUrl(storyId?: string) {
  const normalizedStoryId = storyId?.trim();

  if (!normalizedStoryId) {
    return undefined;
  }

  return `https://www.facebook.com/${encodeURIComponent(normalizedStoryId)}`;
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

function actionTypeExactMatches(actionType: string, actionTypes: string[]) {
  const normalized = actionType.toLowerCase();

  return actionTypes.some((candidate) => normalized === candidate);
}

function isProfileVisitActionType(actionType: string) {
  const normalized = actionType.toLowerCase();

  return (
    actionTypeMatches(normalized, PROFILE_VISIT_ALIASES) ||
    (normalized.includes("profile") &&
      (normalized.includes("visit") || normalized.includes("view")))
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

function sumExactActionValues(actions: MetaActionStat[] | undefined, actionTypes: string[]) {
  if (!actions?.length) {
    return 0;
  }

  return roundCount(
    actions.reduce((sum, action) => {
      if (!action.action_type || !actionTypeExactMatches(action.action_type, actionTypes)) {
        return sum;
      }

      return sum + parseNumericValue(action.value);
    }, 0),
  );
}

function sumProfileVisitActionValues(actions: MetaActionStat[] | undefined) {
  if (!actions?.length) {
    return 0;
  }

  return roundCount(
    actions.reduce((sum, action) => {
      if (!action.action_type || !isProfileVisitActionType(action.action_type)) {
        return sum;
      }

      return sum + parseNumericValue(action.value);
    }, 0),
  );
}

function metricsFromInsights(row?: MetaInsightsRow): MetricTotals {
  return {
    facebookPageLikes: sumExactActionValues(row?.actions, FACEBOOK_PAGE_LIKE_ACTION_TYPES),
    followers: sumActionValues(row?.actions, FOLLOWERS_ALIASES),
    impressions: roundCount(parseNumericValue(row?.impressions)),
    messages: sumActionValues(row?.actions, MESSAGES_ALIASES),
    profileVisits: sumProfileVisitActionValues(row?.actions),
    reach: roundCount(parseNumericValue(row?.reach)),
    spend: roundCurrency(convertAccountCurrencyAmount(parseNumericValue(row?.spend))),
  };
}

function debugActionsFromInsights(row: MetaInsightsRow): CampaignDebugAction[] {
  return (row.actions || []).map((action) => {
    const actionType = action.action_type || "";

    return {
      actionType,
      countedAsFacebookPageLike: actionType
        ? actionTypeExactMatches(actionType, FACEBOOK_PAGE_LIKE_ACTION_TYPES)
        : false,
      countedAsFollower: actionType ? actionTypeMatches(actionType, FOLLOWERS_ALIASES) : false,
      countedAsMessage: actionType ? actionTypeMatches(actionType, MESSAGES_ALIASES) : false,
      countedAsProfileVisit: actionType ? isProfileVisitActionType(actionType) : false,
      rawValue: action.value || "0",
      value: parseNumericValue(action.value),
    };
  });
}

function debugRowFromInsights(
  level: CampaignDebugInsightRow["level"],
  row: MetaInsightsRow,
): CampaignDebugInsightRow {
  return {
    ...metricsFromInsights(row),
    actions: debugActionsFromInsights(row),
    adId: row.ad_id,
    adName: row.ad_name,
    adSetId: row.adset_id,
    adSetName: row.adset_name,
    campaignId: row.campaign_id,
    campaignName: row.campaign_name,
    level,
    raw: row,
    rawImpressions: row.impressions,
    rawReach: row.reach,
    rawSpend: row.spend,
  };
}

function getCreativeThumbnailUrl(creative?: MetaAdCreative) {
  const childAttachment = creative?.object_story_spec?.template_data?.child_attachments?.find(
    (attachment) => attachment.image_url || attachment.picture,
  );

  return (
    normalizeUrl(creative?.thumbnail_url) ||
    normalizeUrl(creative?.image_url) ||
    normalizeUrl(creative?.object_story_spec?.video_data?.image_url) ||
    normalizeUrl(childAttachment?.image_url) ||
    normalizeUrl(childAttachment?.picture)
  );
}

function getCreativeDestinationUrl(creative?: MetaAdCreative) {
  const storySpec = creative?.object_story_spec;
  const childAttachment = storySpec?.template_data?.child_attachments?.find(
    (attachment) => attachment.link,
  );

  return (
    normalizeUrl(creative?.link_url) ||
    normalizeUrl(creative?.object_url) ||
    normalizeUrl(storySpec?.link_data?.link) ||
    normalizeUrl(storySpec?.link_data?.call_to_action?.value?.link) ||
    normalizeUrl(storySpec?.video_data?.call_to_action?.value?.link) ||
    normalizeUrl(storySpec?.template_data?.link) ||
    normalizeUrl(storySpec?.template_data?.call_to_action?.value?.link) ||
    normalizeUrl(childAttachment?.link)
  );
}

function getRecognizedPublisherPlatform(platform?: string): AdDeliveryPlatform | undefined {
  const normalized = platform?.toLowerCase();

  if (normalized === "facebook" || normalized === "instagram") {
    return normalized;
  }

  return undefined;
}

function getAdDisplayStatus(ad?: MetaAdEntity) {
  return (ad?.effective_status || ad?.status)?.toUpperCase();
}

function getAdPermalinkChoice(creative?: AdCreativeLinkData, platform?: AdDeliveryPlatform) {
  const facebookUrl = creative?.facebookPermalinkUrl;
  const instagramUrl = creative?.instagramPermalinkUrl;

  if (platform === "instagram") {
    return {
      isInferred: !instagramUrl && Boolean(facebookUrl),
      url: instagramUrl || facebookUrl,
    };
  }

  if (platform === "facebook") {
    return {
      isInferred: !facebookUrl && Boolean(instagramUrl),
      url: facebookUrl || instagramUrl,
    };
  }

  if (facebookUrl && !instagramUrl) {
    return {
      isInferred: false,
      url: facebookUrl,
    };
  }

  if (instagramUrl && !facebookUrl) {
    return {
      isInferred: false,
      url: instagramUrl,
    };
  }

  return {
    isInferred: Boolean(facebookUrl || instagramUrl),
    url: facebookUrl || instagramUrl,
  };
}

function buildAdCreativeMap(ads: MetaAdEntity[]) {
  const creativeMap = new Map<string, AdCreativeLinkData>();

  for (const ad of ads) {
    const facebookPermalinkUrl = buildFacebookStoryUrl(
      ad.creative?.effective_object_story_id || ad.creative?.object_story_id,
    );
    const instagramPermalinkUrl = normalizeUrl(ad.creative?.instagram_permalink_url);

    creativeMap.set(ad.id, {
      createdAt: ad.created_time || ad.updated_time,
      creativeId: ad.creative?.id,
      destinationUrl: getCreativeDestinationUrl(ad.creative),
      facebookPermalinkUrl,
      instagramPermalinkUrl,
      status: getAdDisplayStatus(ad),
      thumbnailUrl: getCreativeThumbnailUrl(ad.creative),
    });
  }

  return creativeMap;
}

function buildAdPlatformMap(rows: MetaInsightsRow[]) {
  const platformStats = new Map<
    string,
    Record<AdDeliveryPlatform, { impressions: number; reach: number; spend: number }>
  >();

  for (const row of rows) {
    if (!row.ad_id) {
      continue;
    }

    const platform = getRecognizedPublisherPlatform(row.publisher_platform);

    if (!platform) {
      continue;
    }

    const current =
      platformStats.get(row.ad_id) ||
      {
        facebook: { impressions: 0, reach: 0, spend: 0 },
        instagram: { impressions: 0, reach: 0, spend: 0 },
      };

    current[platform].spend += parseNumericValue(row.spend);
    current[platform].impressions += parseNumericValue(row.impressions);
    current[platform].reach += parseNumericValue(row.reach);
    platformStats.set(row.ad_id, current);
  }

  const platformMap = new Map<string, AdDeliveryPlatform>();

  for (const [adId, stats] of platformStats) {
    const facebookScore =
      stats.facebook.spend > 0
        ? stats.facebook.spend
        : stats.facebook.impressions || stats.facebook.reach;
    const instagramScore =
      stats.instagram.spend > 0
        ? stats.instagram.spend
        : stats.instagram.impressions || stats.instagram.reach;

    if (facebookScore === 0 && instagramScore === 0) {
      continue;
    }

    platformMap.set(adId, instagramScore > facebookScore ? "instagram" : "facebook");
  }

  return platformMap;
}

function zeroTotals(): MetricTotals {
  return {
    facebookPageLikes: 0,
    followers: 0,
    impressions: 0,
    messages: 0,
    profileVisits: 0,
    reach: 0,
    spend: 0,
  };
}

function mergeTotals(base: MetricTotals, next: MetricTotals): MetricTotals {
  return {
    facebookPageLikes: roundCount(base.facebookPageLikes + next.facebookPageLikes),
    followers: roundCount(base.followers + next.followers),
    impressions: roundCount(base.impressions + next.impressions),
    messages: roundCount(base.messages + next.messages),
    profileVisits: roundCount(base.profileVisits + next.profileVisits),
    reach: roundCount(base.reach + next.reach),
    spend: roundCurrency(base.spend + next.spend),
  };
}

function getMaxMetric(items: MetricTotals[], key: keyof MetricTotals) {
  return items.reduce((max, item) => Math.max(max, item[key]), 0);
}

function reconcileParentCountTotals(
  parent: MetricTotals,
  children: MetricTotals[],
): MetricTotals {
  if (!children.length) {
    return parent;
  }

  const childTotals = children.reduce((sum, child) => mergeTotals(sum, child), zeroTotals());

  return {
    ...parent,
    facebookPageLikes: Math.max(parent.facebookPageLikes, childTotals.facebookPageLikes),
    followers: Math.max(parent.followers, childTotals.followers),
    impressions: Math.max(parent.impressions, childTotals.impressions),
    messages: childTotals.messages,
    profileVisits: Math.max(parent.profileVisits, childTotals.profileVisits),
    reach: Math.max(parent.reach, getMaxMetric(children, "reach")),
  };
}

function reconcileSingleAdWithAdSet(ad: AdPerformance, adSetTotals: MetricTotals): AdPerformance {
  return {
    ...ad,
    facebookPageLikes: Math.max(ad.facebookPageLikes, adSetTotals.facebookPageLikes),
    followers: Math.max(ad.followers, adSetTotals.followers),
    impressions: Math.max(ad.impressions, adSetTotals.impressions),
    messages: Math.max(ad.messages, adSetTotals.messages),
    profileVisits: Math.max(ad.profileVisits, adSetTotals.profileVisits),
    reach: Math.max(ad.reach, adSetTotals.reach),
    spend: Math.max(ad.spend, adSetTotals.spend),
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
    campaignDaily: [],
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
    status: undefined,
    totals: zeroTotals(),
  };
}

function getLifetimeRangeFromRows(campaignId: string, rows: MetaInsightsRow[]): DateRange {
  const fallbackEnd = formatDate(new Date());
  const campaignDates = rows
    .filter((row) => (!row.campaign_id || row.campaign_id === campaignId) && row.date_start)
    .map((row) => row.date_start as string)
    .sort();

  const start = campaignDates[0] || fallbackEnd;

  return {
    end: fallbackEnd,
    start,
  };
}

function formatMetaDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? formatDate(new Date(timestamp)) : undefined;
}

function getCampaignLifetimeRange(
  campaignId: string,
  rows: MetaInsightsRow[],
  campaign?: MetaEntity,
): DateRange {
  const rowRange = getLifetimeRangeFromRows(campaignId, rows);

  return {
    ...rowRange,
    start: formatMetaDate(campaign?.start_time) || rowRange.start,
  };
}

function isPastMetaDate(value?: string) {
  if (!value) {
    return false;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= Date.now();
}

function getCampaignDisplayStatus(campaign?: MetaEntity) {
  if (!campaign) {
    return undefined;
  }

  const configuredStatuses = [
    campaign.configured_status,
    campaign.status,
  ]
    .filter(Boolean)
    .map((status) => (status as string).toUpperCase());
  const statuses = [
    campaign.effective_status,
    campaign.configured_status,
    campaign.status,
  ]
    .filter(Boolean)
    .map((status) => (status as string).toUpperCase());

  if (statuses.some((status) => status.includes("COMPLETED")) || isPastMetaDate(campaign.stop_time)) {
    return "COMPLETED";
  }

  if (configuredStatuses.includes("ACTIVE") || campaign.effective_status?.toUpperCase() === "ACTIVE") {
    return "ACTIVE";
  }

  return statuses[0] || campaign.status;
}

function buildOverviewData(
  campaigns: MetaEntity[],
  dailyRows: MetaInsightsRow[],
  lifetimeRows: MetaInsightsRow[],
  range: DateRange,
): SpendDashboardData {
  const dates = createDateSeries(range);
  const dailyMap = new Map(dates.map((date) => [date, 0]));
  const campaignDailyMap = new Map<string, CampaignDailySpend>();
  const inRangeSpendByCampaign = new Map<string, { activeDays: number; name: string; spend: number }>();
  const lifetimeSpendByCampaign = new Map<string, number>();
  const campaignNames = new Map<string, string>();

  for (const row of dailyRows) {
    if (!row.campaign_id || !row.date_start) {
      continue;
    }

    const spend = roundCurrency(convertAccountCurrencyAmount(parseNumericValue(row.spend)));
    dailyMap.set(row.date_start, roundCurrency((dailyMap.get(row.date_start) || 0) + spend));
    const campaignDailyKey = `${row.campaign_id}:${row.date_start}`;
    const currentCampaignDaily = campaignDailyMap.get(campaignDailyKey);

    campaignDailyMap.set(campaignDailyKey, {
      campaignId: row.campaign_id,
      date: row.date_start,
      spend: roundCurrency((currentCampaignDaily?.spend || 0) + spend),
    });
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
        spendInRange: inRange?.spend ?? 0,
        status: getCampaignDisplayStatus(campaign),
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
  const campaignDaily = [...campaignDailyMap.values()].sort((left, right) => {
    const dateSort = left.date.localeCompare(right.date);

    if (dateSort !== 0) {
      return dateSort;
    }

    return left.campaignId.localeCompare(right.campaignId);
  });
  const totalSpendInRange = roundCurrency(daily.reduce((sum, item) => sum + item.spend, 0));
  const totalSpend = roundCurrency(mergedCampaigns.reduce((sum, campaign) => sum + campaign.totalSpend, 0));
  const topCampaign = mergedCampaigns[0];

  return {
    accountId: getAccountId(),
    campaignDaily,
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
  adCreativeMap = new Map<string, AdCreativeLinkData>(),
  adPlatformMap = new Map<string, AdDeliveryPlatform>(),
) {
  const hierarchy = new Map<string, AdSetPerformance>();

  for (const row of adSetInsights) {
    if ((row.campaign_id && row.campaign_id !== campaignId) || !row.adset_id) {
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
    if ((row.campaign_id && row.campaign_id !== campaignId) || !row.ad_id || !row.adset_id) {
      continue;
    }

    const creative = adCreativeMap.get(row.ad_id);
    const deliveryPlatform = adPlatformMap.get(row.ad_id);
    const permalinkChoice = getAdPermalinkChoice(creative, deliveryPlatform);
    const ad: AdPerformance = {
      ...metricsFromInsights(row),
      ...creative,
      deliveryPlatform,
      id: row.ad_id,
      isPermalinkPlatformInferred: permalinkChoice.isInferred,
      name: row.ad_name || `Ad ${row.ad_id}`,
      permalinkUrl: permalinkChoice.url,
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
      const rawAdsTotals = adSet.ads.reduce((sum, ad) => mergeTotals(sum, ad), zeroTotals());
      const levelTotals =
        adSet.ads.length > 0 &&
        adSet.spend === 0 &&
        adSet.facebookPageLikes === 0 &&
        adSet.impressions === 0 &&
        adSet.messages === 0 &&
        adSet.profileVisits === 0 &&
        adSet.followers === 0 &&
        adSet.reach === 0
          ? rawAdsTotals
          : {
              facebookPageLikes: adSet.facebookPageLikes,
              followers: adSet.followers,
              impressions: adSet.impressions,
              messages: adSet.messages,
              profileVisits: adSet.profileVisits,
              reach: adSet.reach,
              spend: adSet.spend,
            };
      const sortedAds = adSet.ads.sort((left, right) => right.spend - left.spend);
      const displayAds =
        sortedAds.length === 1
          ? [reconcileSingleAdWithAdSet(sortedAds[0], levelTotals)]
          : sortedAds;
      const displayAdsTotals = displayAds.reduce(
        (sum, ad) => mergeTotals(sum, ad),
        zeroTotals(),
      );
      const totals = {
        ...reconcileParentCountTotals(levelTotals, displayAds),
        spend: levelTotals.spend || displayAdsTotals.spend,
      };

      return {
        ...totals,
        ads: displayAds,
        id: adSet.id,
        name: adSet.name,
      };
    })
    .sort((left, right) => right.spend - left.spend);
}

async function fetchCampaignEntity(campaignId: string) {
  const fields = "id,name,status,effective_status,configured_status,start_time,stop_time";

  try {
    return await fetchMetaJson<MetaEntity>(buildGraphNodeUrl(campaignId, fields));
  } catch (error) {
    console.warn(
      "Meta campaign status fetch failed; falling back to account campaigns.",
      error instanceof Error ? error.message : error,
    );
    const campaigns = await fetchAllPages<MetaEntity>(buildAccountEdgeUrl("campaigns", fields));
    return campaigns.find((campaign) => campaign.id === campaignId);
  }
}

async function fetchCampaignScopedInsights(campaignId: string, options: InsightsRequestOptions) {
  try {
    return await fetchAllPages<MetaInsightsRow>(buildObjectInsightsUrl(campaignId, options));
  } catch (error) {
    console.warn(
      "Meta campaign-scoped insights fetch failed; falling back to account insights.",
      error instanceof Error ? error.message : error,
    );
    return fetchAllPages<MetaInsightsRow>(buildAccountInsightsUrl(options));
  }
}

async function fetchAdCreativeRows(campaignId?: string) {
  try {
    const url = campaignId
      ? buildObjectEdgeUrl(campaignId, "ads", AD_CREATIVE_FIELDS)
      : buildAccountEdgeUrl("ads", AD_CREATIVE_FIELDS);
    return await fetchAllPages<MetaAdEntity>(url);
  } catch (error) {
    console.warn(
      "Meta ad creative fetch failed; continuing without ad thumbnails.",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

async function fetchAdPlatformRows(campaignId?: string) {
  const options: InsightsRequestOptions = {
    breakdowns: ["publisher_platform"],
    datePreset: "maximum",
    fields: "campaign_id,ad_id,spend,impressions,reach",
    level: "ad",
    timeIncrement: "all_days",
  };

  try {
    const url = campaignId
      ? buildObjectInsightsUrl(campaignId, options)
      : buildAccountInsightsUrl(options);
    return await fetchAllPages<MetaInsightsRow>(url);
  } catch (error) {
    console.warn(
      "Meta ad platform fetch failed; continuing with creative link fallback.",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export async function getSpendDashboardData(inputRange?: Partial<DateRange>) {
  const range = sanitizeDateRange(inputRange?.start, inputRange?.end);

  if (!isConfigured()) {
    return getEmptySpendDashboardData(range);
  }

  const [campaigns, dailyRows, lifetimeRows] = await Promise.all([
    fetchAllPages<MetaEntity>(
      buildAccountEdgeUrl(
        "campaigns",
        "id,name,status,effective_status,configured_status,start_time,stop_time",
      ),
    ),
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
  const fallbackRange = sanitizeDateRange(inputRange?.start, inputRange?.end);

  if (!isConfigured()) {
    return getEmptyCampaignDetailData(campaignId, fallbackRange);
  }

  const [
    campaignEntity,
    lifetimeRows,
    adSetInsights,
    adInsights,
    adsWithCreative,
    adPlatformRows,
  ] = await Promise.all([
    fetchCampaignEntity(campaignId),
    fetchCampaignScopedInsights(campaignId, {
      datePreset: "maximum",
      fields: "campaign_id,campaign_name,date_start,date_stop,spend,impressions,reach,actions",
      level: "campaign",
      timeIncrement: "all_days",
    }),
    fetchCampaignScopedInsights(campaignId, {
      datePreset: "maximum",
      fields: "campaign_id,campaign_name,adset_id,adset_name,impressions,reach,spend,actions",
      level: "adset",
      timeIncrement: "all_days",
    }),
    fetchCampaignScopedInsights(campaignId, {
      datePreset: "maximum",
      fields:
        "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,impressions,reach,spend,actions",
      level: "ad",
      timeIncrement: "all_days",
    }),
    fetchAdCreativeRows(campaignId),
    fetchAdPlatformRows(campaignId),
  ]);

  const lifetimeRow = lifetimeRows.find((row) => !row.campaign_id || row.campaign_id === campaignId);
  const adCreativeMap = buildAdCreativeMap(adsWithCreative);
  const adPlatformMap = buildAdPlatformMap(adPlatformRows);
  const hierarchy = buildCampaignHierarchyFromInsights(
    campaignId,
    adSetInsights,
    adInsights,
    adCreativeMap,
    adPlatformMap,
  );
  const hierarchyTotals = hierarchy.reduce((sum, adSet) => mergeTotals(sum, adSet), zeroTotals());
  const totals = reconcileParentCountTotals(
    lifetimeRow ? metricsFromInsights(lifetimeRow) : hierarchyTotals,
    hierarchy,
  );
  const range = getCampaignLifetimeRange(campaignId, lifetimeRows, campaignEntity);

  if (lifetimeRow?.spend) {
    totals.spend = roundCurrency(convertAccountCurrencyAmount(parseNumericValue(lifetimeRow.spend)));
  }

  return {
    adSets: hierarchy,
    campaignId,
    campaignName:
      campaignEntity?.name ||
      lifetimeRow?.campaign_name ||
      adSetInsights.find((row) => row.campaign_name)?.campaign_name ||
      adInsights.find((row) => row.campaign_name)?.campaign_name ||
      `Campaign ${campaignId}`,
    range,
    source: "live",
    status: getCampaignDisplayStatus(campaignEntity),
    totals,
  };
}

export async function getCampaignDebugData(campaignId: string): Promise<CampaignDebugData> {
  const emptyTotals = zeroTotals();
  const storage = {
    metricsSaved: false,
    persistedFile: "data/campaign-budgets.json",
    savedFields: ["campaignId", "payments", "totalPaid", "updatedAt"],
  };

  if (!isConfigured()) {
    return {
      accountId: getAccountId(),
      campaignId,
      campaignMatched: false,
      campaignName: `Campaign ${campaignId}`,
      facebookPageLikeActionTypes: FACEBOOK_PAGE_LIKE_ACTION_TYPES,
      followerAliases: FOLLOWERS_ALIASES,
      messageAliases: MESSAGES_ALIASES,
      profileVisitAliases: PROFILE_VISIT_ALIASES,
      rows: {
        ads: [],
        adSets: [],
        campaign: [],
      },
      storage,
      totalsComparison: {
        adLevelSum: emptyTotals,
        adSetLevelSum: emptyTotals,
        campaignLevel: emptyTotals,
        currentRenderedCampaign: emptyTotals,
      },
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
  const campaignLevel = filteredCampaigns.reduce(
    (sum, item) => mergeTotals(sum, metricsFromInsights(item)),
    zeroTotals(),
  );
  const adSetLevelSum = filteredAdSets.reduce(
    (sum, item) => mergeTotals(sum, metricsFromInsights(item)),
    zeroTotals(),
  );
  const adLevelSum = filteredAds.reduce(
    (sum, item) => mergeTotals(sum, metricsFromInsights(item)),
    zeroTotals(),
  );
  const hierarchy = buildCampaignHierarchyFromInsights(campaignId, adSetInsights, adInsights);
  const currentRenderedCampaign = reconcileParentCountTotals(
    filteredCampaigns.length ? campaignLevel : adSetLevelSum,
    hierarchy,
  );

  return {
    accountId: getAccountId(),
    campaignId,
    campaignMatched: Boolean(campaignInsight),
    campaignName: campaignInsight?.campaign_name || `Campaign ${campaignId}`,
    facebookPageLikeActionTypes: FACEBOOK_PAGE_LIKE_ACTION_TYPES,
    followerAliases: FOLLOWERS_ALIASES,
    messageAliases: MESSAGES_ALIASES,
    profileVisitAliases: PROFILE_VISIT_ALIASES,
    rows: {
      ads: filteredAds.map((item) => debugRowFromInsights("ad", item)),
      adSets: filteredAdSets.map((item) => debugRowFromInsights("adset", item)),
      campaign: filteredCampaigns.map((item) => debugRowFromInsights("campaign", item)),
    },
    storage,
    totalsComparison: {
      adLevelSum,
      adSetLevelSum,
      campaignLevel,
      currentRenderedCampaign,
    },
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
