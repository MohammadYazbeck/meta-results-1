import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getArchivedCampaigns } from "@/lib/campaign-archive-store";
import { getAllCampaignBudgets } from "@/lib/budget-store";
import {
  applyFinancialSettingsToCampaigns,
  getAdjustedRemaining,
  resolveCampaignFinancialSettings,
} from "@/lib/financial-calculations";
import { getFinancialSettings } from "@/lib/financial-settings-store";
import { getSpendDashboardData, pauseCampaign } from "@/lib/meta";

const NEGATIVE_REMAINING_THRESHOLD = -10;

export async function POST() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [data, budgets, archivedCampaigns, financialSettings] = await Promise.all([
      getSpendDashboardData(),
      getAllCampaignBudgets(),
      getArchivedCampaigns(),
      getFinancialSettings(),
    ]);

    if (data.source === "unavailable") {
      return NextResponse.json(
        {
          error: "Live Meta data is unavailable. No campaigns were changed.",
        },
        { status: 503 },
      );
    }

    const archivedCampaignIds = new Set(Object.keys(archivedCampaigns));
    const adjustedCampaigns = applyFinancialSettingsToCampaigns(
      data.campaigns,
      financialSettings,
    );
    const eligibleCampaigns = adjustedCampaigns.filter((campaign) => {
      const totalPaid = budgets[campaign.campaignId]?.totalPaid ?? 0;
      const { negativeBalanceAddOnPercent } = resolveCampaignFinancialSettings(
        financialSettings,
        campaign.campaignId,
      );
      const remaining = getAdjustedRemaining(
        totalPaid,
        campaign.totalSpend,
        negativeBalanceAddOnPercent,
      );

      return (
        !archivedCampaignIds.has(campaign.campaignId) &&
        campaign.status === "ACTIVE" &&
        remaining < NEGATIVE_REMAINING_THRESHOLD
      );
    });
    const paused: Array<{ campaignId: string; campaignName: string }> = [];
    const skipped: Array<{ campaignId: string; campaignName: string }> = [];
    const failed: Array<{
      campaignId: string;
      campaignName: string;
      error: string;
    }> = [];

    for (const campaign of eligibleCampaigns) {
      try {
        const result = await pauseCampaign(campaign.campaignId);

        if (result.skipped) {
          skipped.push({
            campaignId: campaign.campaignId,
            campaignName: campaign.campaignName,
          });
        } else {
          paused.push({
            campaignId: campaign.campaignId,
            campaignName: campaign.campaignName,
          });
        }

        revalidatePath(`/${campaign.campaignId}`);
      } catch (error) {
        failed.push({
          campaignId: campaign.campaignId,
          campaignName: campaign.campaignName,
          error: error instanceof Error ? error.message : "Unexpected error.",
        });
      }
    }

    revalidatePath("/");

    return NextResponse.json({
      eligibleCount: eligibleCampaigns.length,
      failed,
      paused,
      skipped,
      threshold: NEGATIVE_REMAINING_THRESHOLD,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected error.",
      },
      { status: 500 },
    );
  }
}
