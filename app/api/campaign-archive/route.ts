import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  archiveCampaign,
  unarchiveCampaign,
} from "@/lib/campaign-archive-store";

type ArchiveRequest = {
  campaignId?: string;
  campaignName?: string;
  mode?: "archive" | "unarchive";
};

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = (await request.json()) as ArchiveRequest;
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
