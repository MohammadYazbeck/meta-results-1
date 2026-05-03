import { NextRequest, NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCampaignDebugData } from "@/lib/meta";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "Admin authentication required.",
        },
        {
          status: 403,
        },
      );
    }

    const { campaignId } = await context.params;
    const data = await getCampaignDebugData(campaignId);

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}
