import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  archiveCampaign,
  archiveCampaigns,
  unarchiveCampaign,
} from "@/lib/campaign-archive-store";

type ArchiveRequest = {
  campaigns?: Array<{ campaignId?: string; campaignName?: string }>;
  campaignId?: string;
  campaignName?: string;
  mode?: "archive" | "unarchive" | "archive-all";
};

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = (await request.json()) as ArchiveRequest;

    if (body.mode === "archive-all") {
      const campaigns = (body.campaigns || [])
        .map((campaign) => ({
          campaignId: campaign.campaignId?.trim() || "",
          campaignName: campaign.campaignName?.trim() || "",
        }))
        .filter((campaign) => campaign.campaignId);

      if (!campaigns.length) {
        return NextResponse.json({ error: "No campaigns to archive." }, { status: 400 });
      }

      await archiveCampaigns(campaigns);
      revalidatePath("/");
      revalidatePath("/archive");
      return NextResponse.json({ ok: true, count: campaigns.length });
    }

    const campaignId = body.campaignId?.trim();

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required." },
        { status: 400 },
      );
    }

    if (body.mode === "unarchive") {
      await unarchiveCampaign(campaignId);
    } else {
      await archiveCampaign(campaignId, body.campaignName?.trim() || "");
    }

    revalidatePath("/");
    revalidatePath("/archive");

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
