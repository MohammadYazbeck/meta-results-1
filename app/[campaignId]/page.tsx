import dynamic from "next/dynamic";

import { CampaignAdStopAccessPanel } from "@/components/campaign-ad-stop-access-panel";
import { CampaignBudgetPanel } from "@/components/campaign-budget-panel";
import { CampaignDetailHeader } from "@/components/campaign-detail-header";
import { ErrorPanel } from "@/components/ui/error-panel";
import { PageScene } from "@/components/ui/page-scene";
import { getCampaignAdStopAccess } from "@/lib/ad-stop-access-store";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCampaignBudget } from "@/lib/budget-store";
import {
  getCampaignDetailData,
  getEmptyCampaignDetailData,
  getSuggestedRangeLabel,
  type CampaignDetailData,
} from "@/lib/meta";

const CampaignHierarchy = dynamic(
  () =>
    import("@/components/campaign-hierarchy").then(
      (module) => module.CampaignHierarchy,
    ),
  {
    loading: () => (
      <div className="px-4 py-5 text-sm text-muted sm:px-6">
        جاري تحميل تفاصيل الأداء...
      </div>
    ),
  },
);

type PageProps = {
  params: Promise<{ campaignId: string }>;
};

function buildWallet(totalPaid: number, totalSpent: number) {
  return Math.round((totalPaid - totalSpent) * 100) / 100;
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { campaignId } = await params;
  const [isAdmin, budgetRecord, stopAccess] = await Promise.all([
    isAdminAuthenticated(),
    getCampaignBudget(campaignId),
    getCampaignAdStopAccess(campaignId),
  ]);
  let errorMessage: string | null = null;
  let campaign: CampaignDetailData;

  try {
    campaign = await getCampaignDetailData(campaignId);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Unexpected error while loading campaign data.";
    campaign = getEmptyCampaignDetailData(campaignId);
  }

  const totalPaid = budgetRecord.totalPaid ?? 0;
  const wallet = buildWallet(totalPaid, campaign.totals.spend);
  const rangeLabel = getSuggestedRangeLabel(campaign.range);
  const totalAds = campaign.adSets.reduce(
    (sum, adSet) => sum + adSet.ads.length,
    0,
  );
  const dataUnavailable = campaign.source === "unavailable";
  const visibleErrorMessage =
    errorMessage ||
    "بيانات ميتا المباشرة غير متاحة حالياً. تحقق من بيانات الاعتماد وحاول مرة أخرى.";

  return (
    <main className="mx-auto w-full max-w-detail px-0 py-0 sm:px-4 sm:py-6 lg:px-7 lg:py-8">
      <PageScene variant="campaign">
        {!dataUnavailable ? (
          <CampaignDetailHeader
            campaign={campaign}
            isAdmin={isAdmin}
            rangeLabel={rangeLabel}
            totalAds={totalAds}
            totalPaid={totalPaid}
            wallet={wallet}
          />
        ) : null}

        {dataUnavailable ? (
          <ErrorPanel
            message={visibleErrorMessage}
            title="تعذر تحميل بيانات ميتا المباشرة."
          />
        ) : null}

        {!dataUnavailable ? (
          <section className="grid gap-6 lg:gap-7">
            <section className="overflow-hidden bg-white/82 pt-1 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:rounded-[28px] sm:ring-1 sm:ring-black/[0.04]">
              <div className="px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
                <h2 className="font-display text-[clamp(1.65rem,5vw,2.25rem)] font-black text-ink">
                  الإعلانات
                </h2>
              </div>

              <CampaignHierarchy
                adSets={campaign.adSets}
                campaignStatus={campaign.status}
                campaignId={campaign.campaignId}
                canStopAds={stopAccess.enabled && stopAccess.hasPasscode}
              />
            </section>

            {isAdmin ? (
              <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
                <CampaignBudgetPanel
                  campaignId={campaign.campaignId}
                  payments={budgetRecord.payments}
                />
                <CampaignAdStopAccessPanel
                  access={stopAccess}
                  campaignId={campaign.campaignId}
                />
              </div>
            ) : null}
          </section>
        ) : null}
      </PageScene>
    </main>
  );
}
