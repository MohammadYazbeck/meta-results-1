import dynamic from "next/dynamic";

import { CampaignAdStopAccessPanel } from "@/components/campaign-ad-stop-access-panel";
import { CampaignBudgetPanel } from "@/components/campaign-budget-panel";
import { CampaignDetailHeader } from "@/components/campaign-detail-header";
import { ErrorPanel } from "@/components/ui/error-panel";
import { HierarchyBadge } from "@/components/ui/hierarchy-badge";
import { panelClassName } from "@/components/ui/class-names";
import { PageScene } from "@/components/ui/page-scene";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCampaignAdStopAccess } from "@/lib/ad-stop-access-store";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCampaignBudget } from "@/lib/budget-store";
import {
  getCampaignDetailData,
  getEmptyCampaignDetailData,
  getSuggestedRangeLabel,
  type CampaignDetailData,
} from "@/lib/meta";
import { cn } from "@/lib/utils";

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

  return (
    <main className="mx-auto w-full max-w-detail px-3 py-4 sm:px-4 sm:py-6 lg:px-7 lg:py-8">
      <PageScene variant="campaign">
        <CampaignDetailHeader
          campaign={campaign}
          isAdmin={isAdmin}
          rangeLabel={rangeLabel}
          totalAds={totalAds}
          totalPaid={totalPaid}
          wallet={wallet}
        />

        {errorMessage ? (
          <ErrorPanel
            message={errorMessage}
            title="يتم عرض التقرير حالياً بدون البيانات المباشرة."
          />
        ) : null}

        <section className="grid gap-6 lg:gap-7">
          <section className={cn(panelClassName, "overflow-hidden")}>
            <SectionHeading
              action={
                <div className="flex flex-col gap-2 sm:items-end">
                  <p className="m-0 text-sm text-muted">{rangeLabel}</p>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <HierarchyBadge variant="campaign">Campaign</HierarchyBadge>
                    <HierarchyBadge variant="ad">Ad</HierarchyBadge>
                  </div>
                </div>
              }
              eyebrow="الأداء"
              title="الإعلانات"
            />

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
      </PageScene>
    </main>
  );
}
