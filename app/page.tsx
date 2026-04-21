import { CampaignTable } from "@/components/campaign-table";
import { DashboardSummaryGrid } from "@/components/dashboard-summary-grid";
import { DateRangeForm } from "@/components/date-range-form";
import { HomeHero } from "@/components/home-hero";
import { SpendChart } from "@/components/spend-chart";
import { ErrorPanel } from "@/components/ui/error-panel";
import { PageScene } from "@/components/ui/page-scene";
import { getAllCampaignBudgets } from "@/lib/budget-store";
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

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const fallbackRange = getDefaultDateRange();
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
  const totalPaid = Object.values(budgets).reduce(
    (sum, budget) => sum + budget.totalPaid,
    0,
  );
  const remaining = Math.round((totalPaid - data.summary.totalSpend) * 100) / 100;
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
          remaining={remaining}
          summary={data.summary}
          totalPaid={totalPaid}
        />

        <section className="mb-6">
          <SpendChart daily={data.daily} />
        </section>

        <CampaignTable
          budgets={budgets}
          campaigns={data.campaigns}
          range={data.range}
        />
      </PageScene>
    </main>
  );
}
