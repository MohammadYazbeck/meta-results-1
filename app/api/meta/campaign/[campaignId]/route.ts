import { NextRequest, NextResponse } from "next/server";

import { getCampaignDebugData } from "@/lib/meta";

function getOptionalSearchParam(value: string | null) {
  return value ?? undefined;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { campaignId } = await context.params;
    const { searchParams } = new URL(request.url);
    const data = await getCampaignDebugData(campaignId, {
      end: getOptionalSearchParam(searchParams.get("end")),
      start: getOptionalSearchParam(searchParams.get("start")),
    });

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
