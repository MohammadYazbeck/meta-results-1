import { NextRequest, NextResponse } from "next/server";

import { getSpendDashboardData } from "@/lib/meta";

function getOptionalSearchParam(value: string | null) {
  return value ?? undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = await getSpendDashboardData({
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
