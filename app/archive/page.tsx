import { CampaignTable } from "@/components/campaign-table";
import { DateRangeForm } from "@/components/date-range-form";
import { ErrorPanel } from "@/components/ui/error-panel";
import {
  eyebrowClassName,
  mutedTextClassName,
  panelClassName,
} from "@/components/ui/class-names";
import { PageScene } from "@/components/ui/page-scene";
import { getAllCampaignBudgets } from "@/lib/budget-store";
import { getArchivedCampaigns } from "@/lib/campaign-archive-store";
import {
  getDefaultDateRange,
  getEmptySpendDashboardData,
  getSpendDashboardData,
  sanitizeDateRange,
  type SpendDashboardData,
} from "@/lib/meta";
import { cn } from "@/lib/utils";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function buildArchivedCampaignRows(
  campaigns: SpendDashboardData["campaigns"],
  archivedCampaigns: Awaited<ReturnType<typeof getArchivedCampaigns>>,
) {
  const campaignById = new Map(
    campaigns.map((campaign) => [campaign.campaignId, campaign]),
  );

  return Object.values(archivedCampaigns)
    .map((record) =>
      campaignById.get(record.campaignId) || {
        activeDays: 0,
        averageDailySpend: 0,
        campaignId: record.campaignId,
        campaignName: record.campaignName,
        spendInRange: 0,
        status: undefined,
        totalSpend: 0,
      },
    )
    .sort((left, right) => {
      const leftArchivedAt = archivedCampaigns[left.campaignId]?.archivedAt || "";
      const rightArchivedAt = archivedCampaigns[right.campaignId]?.archivedAt || "";
      return rightArchivedAt.localeCompare(leftArchivedAt);
    });
}

export default async function ArchivePage({ searchParams }: PageProps) {
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
  const archiveRows = buildArchivedCampaignRows(data.campaigns, archivedCampaigns);
  const dataUnavailable = data.source === "unavailable";
  const visibleErrorMessage =
    errorMessage ||
    "بيانات ميتا المباشرة غير متاحة حالياً. تحقق من بيانات الاعتماد وحاول مرة أخرى.";

  return (
    <main className="mx-auto w-full max-w-shell px-4 py-6 md:py-8">
      <PageScene variant="home">
        <section
          className={cn(
            panelClassName,
            "mb-6 bg-[radial-gradient(circle_at_8%_10%,rgba(242,140,40,0.13),transparent_18rem),radial-gradient(circle_at_90%_90%,rgba(8,102,255,0.09),transparent_22rem),#ffffff] p-5 sm:p-6",
          )}
        >
          <p className={eyebrowClassName}>الأرشيف</p>
          <h1 className="font-display text-[clamp(1.75rem,5vw,2.5rem)] font-bold leading-tight text-ink">
            الحملات المؤرشفة
          </h1>
          <p className={mutedTextClassName}>
            الحملات هنا مخفية من الصفحة الرئيسية ويمكن إرجاعها في أي وقت.
          </p>
        </section>

        <div className="mb-6">
          <DateRangeForm action="/archive" range={data.range} />
        </div>

        {dataUnavailable ? (
          <ErrorPanel
            message={visibleErrorMessage}
            title="تعذر تحميل بيانات ميتا المباشرة."
          />
        ) : null}

        {!dataUnavailable ? (
          <CampaignTable
            actionPath="/archive"
            budgets={budgets}
            campaigns={archiveRows}
            emptyMessage="لا توجد حملات مؤرشفة حالياً."
            initialQuery={query}
            mode="archive"
            range={data.range}
            searchEmptyMessage="لا توجد حملات مؤرشفة مطابقة لهذا البحث."
            secondaryHref="/"
            secondaryLabel="العودة للصفحة الرئيسية"
          />
        ) : null}
      </PageScene>
    </main>
  );
}
