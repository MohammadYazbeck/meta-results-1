import { CampaignTable } from "@/components/campaign-table";
import { DashboardSummaryGrid } from "@/components/dashboard-summary-grid";
import { DateRangeForm } from "@/components/date-range-form";
import { HomeHero } from "@/components/home-hero";
import { SpendChart } from "@/components/spend-chart";
import { ErrorPanel } from "@/components/ui/error-panel";
import { PageScene } from "@/components/ui/page-scene";
import { getAllCampaignBudgets } from "@/lib/budget-store";
import { getArchivedCampaigns } from "@/lib/campaign-archive-store";
import {
  getEmptySpendDashboardData,
  getDefaultDateRange,
  getSpendDashboardData,
  getSuggestedRangeLabel,
  sanitizeDateRange,
  type SpendDashboardData,
} from "@/lib/meta";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function buildVisibleSummary(
  summary: SpendDashboardData["summary"],
  campaigns: SpendDashboardData["campaigns"],
  daily: SpendDashboardData["daily"],
) {
  const totalSpend = Math.round(
    campaigns.reduce((sum, campaign) => sum + campaign.totalSpend, 0) * 100,
  ) / 100;
  const totalSpendInRange = Math.round(
    daily.reduce((sum, entry) => sum + entry.spend, 0) * 100,
  ) / 100;
  const topCampaign = campaigns[0];

  return {
    ...summary,
    averageDailySpend: summary.daysInRange
      ? Math.round((totalSpendInRange / summary.daysInRange) * 100) / 100
      : 0,
    topCampaignName: topCampaign?.campaignName || "No campaign data",
    topCampaignSpend: topCampaign?.totalSpend || 0,
    totalCampaigns: campaigns.length,
    totalSpend,
    totalSpendInRange,
  };
}

function buildVisibleDailySpend(
  daily: SpendDashboardData["daily"],
  campaignDaily: SpendDashboardData["campaignDaily"],
  campaigns: SpendDashboardData["campaigns"],
) {
  const visibleCampaignIds = new Set(
    campaigns.map((campaign) => campaign.campaignId),
  );
  const dailyMap = new Map(daily.map((entry) => [entry.date, 0]));

  for (const entry of campaignDaily) {
    if (!visibleCampaignIds.has(entry.campaignId)) {
      continue;
    }

    dailyMap.set(
      entry.date,
      Math.round(((dailyMap.get(entry.date) || 0) + entry.spend) * 100) / 100,
    );
  }

  return daily.map((entry) => ({
    date: entry.date,
    spend: Math.round((dailyMap.get(entry.date) || 0) * 100) / 100,
  }));
}

function getBudgetTotalForCampaigns(
  budgets: Awaited<ReturnType<typeof getAllCampaignBudgets>>,
  campaigns: SpendDashboardData["campaigns"],
) {
  return campaigns.reduce(
    (sum, campaign) =>
      sum + (budgets[campaign.campaignId]?.totalPaid ?? 0),
    0,
  );
}

function getNegativeRemainingTotalForCampaigns(
  budgets: Awaited<ReturnType<typeof getAllCampaignBudgets>>,
  campaigns: SpendDashboardData["campaigns"],
) {
  const total = campaigns.reduce((sum, campaign) => {
    const totalPaid = budgets[campaign.campaignId]?.totalPaid ?? 0;
    const remaining =
      Math.round((totalPaid - campaign.totalSpend) * 100) / 100;

    return remaining < 0 ? sum + remaining : sum;
  }, 0);

  return Math.round(total * 100) / 100;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const fallbackRange = getDefaultDateRange();
  const query = (getSingleValue(resolvedSearchParams.q) ?? "").trim();
  const range = sanitizeDateRange(
    getSingleValue(resolvedSearchParams.start) ?? fallbackRange.start,
    getSingleValue(resolvedSearchParams.end) ?? fallbackRange.end,
  );
  let errorMessage: string | null = null;
  let data: SpendDashboardData;

  try {
    data = await getSpendDashboardData(range);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Unexpected error while loading Meta spend data.";
    data = getEmptySpendDashboardData(range);
  }

  const budgets = await getAllCampaignBudgets();
  const archivedCampaigns = await getArchivedCampaigns();
  const archivedCampaignIds = new Set(Object.keys(archivedCampaigns));
  const activeCampaigns = data.campaigns.filter(
    (campaign) => !archivedCampaignIds.has(campaign.campaignId),
  );
  const visibleDaily = buildVisibleDailySpend(
    data.daily,
    data.campaignDaily,
    activeCampaigns,
  );
  const visibleSummary = buildVisibleSummary(
    data.summary,
    activeCampaigns,
    visibleDaily,
  );
  const totalPaid = getBudgetTotalForCampaigns(budgets, activeCampaigns);
  const remaining = Math.round((totalPaid - visibleSummary.totalSpend) * 100) / 100;
  const negativeRemaining = getNegativeRemainingTotalForCampaigns(
    budgets,
    activeCampaigns,
  );
  const rangeLabel = getSuggestedRangeLabel(data.range);

  return (
    <main className="mx-auto w-full max-w-shell px-3 py-4 sm:px-4 sm:py-6 lg:px-7 lg:py-8">
      <PageScene variant="home">
        <HomeHero
          accountId={data.accountId}
          rangeLabel={rangeLabel}
          source={data.source}
        />

        <div className="mb-8">
          <DateRangeForm range={data.range} />
        </div>

        {errorMessage ? (
          <ErrorPanel
            message={errorMessage}
            title="الواجهة جاهزة، لكن البيانات المباشرة تحتاج System User Token ثابت."
          />
        ) : null}

        <DashboardSummaryGrid
          negativeRemaining={negativeRemaining}
          remaining={remaining}
          summary={visibleSummary}
          totalPaid={totalPaid}
        />

        <section className="mb-6">
          <SpendChart daily={visibleDaily} />
        </section>

        <CampaignTable
          archivedCount={Object.keys(archivedCampaigns).length}
          budgets={budgets}
          campaigns={activeCampaigns}
          emptyMessage="لا توجد بيانات حملات غير مؤرشفة لهذه الفترة."
          initialQuery={query}
          range={data.range}
          searchEmptyMessage="لا توجد حملات مطابقة لهذا البحث."
          secondaryHref="/archive"
          secondaryLabel="الحملات المؤرشفة"
        />
      </PageScene>
    </main>
  );
}
