import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getCampaignAdStopAccess,
  recordCampaignAdStop,
  verifyCampaignAdStopPasscode,
} from "@/lib/ad-stop-access-store";
import { getCampaignDebugData, pauseCampaignAd } from "@/lib/meta";

const ATTEMPT_LIMIT = 8;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

type StopAdRequestBody = {
  adId?: string;
  mode?: "stop-ad";
  passcode?: string;
};

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

function getAttemptKey(request: NextRequest, campaignId: string, adId: string) {
  return `${getClientIp(request)}:${campaignId}:${adId}`;
}

function getAttemptState(key: string) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    const next = { count: 0, resetAt: now + ATTEMPT_WINDOW_MS };
    attempts.set(key, next);
    return next;
  }

  return current;
}

function isRateLimited(key: string) {
  return getAttemptState(key).count >= ATTEMPT_LIMIT;
}

function registerFailedAttempt(key: string) {
  const current = getAttemptState(key);
  current.count += 1;
  attempts.set(key, current);
}

function clearAttempts(key: string) {
  attempts.delete(key);
}

function errorStatusFromMessage(message: string) {
  if (message.includes("does not belong")) {
    return 403;
  }

  if (message.includes("not active")) {
    return 409;
  }

  if (message.includes("Meta rejected")) {
    return 403;
  }

  if (message.includes("not configured")) {
    return 503;
  }

  return 500;
}

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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ campaignId: string }> },
) {
  try {
    const { campaignId } = await context.params;
    const body = (await request.json()) as StopAdRequestBody;
    const adId = body.adId?.trim() || "";
    const passcode = body.passcode?.trim() || "";

    if (body.mode !== "stop-ad") {
      return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
    }

    if (!campaignId || !adId || !passcode) {
      return NextResponse.json(
        { error: "Campaign, ad, and passcode are required." },
        { status: 400 },
      );
    }

    const access = await getCampaignAdStopAccess(campaignId);

    if (!access.enabled || !access.hasPasscode) {
      return NextResponse.json(
        { error: "Client ad stopping is not enabled for this campaign." },
        { status: 403 },
      );
    }

    const attemptKey = getAttemptKey(request, campaignId, adId);

    if (isRateLimited(attemptKey)) {
      return NextResponse.json(
        { error: "Too many passcode attempts. Try again later." },
        { status: 429 },
      );
    }

    const isValidPasscode = await verifyCampaignAdStopPasscode(campaignId, passcode);

    if (!isValidPasscode) {
      registerFailedAttempt(attemptKey);
      return NextResponse.json({ error: "Incorrect passcode." }, { status: 403 });
    }

    clearAttempts(attemptKey);

    const result = await pauseCampaignAd(campaignId, adId);
    const auditEntry = await recordCampaignAdStop({
      adId: result.adId,
      adName: result.adName,
      campaignId,
      previousStatus: result.previousStatus,
      status: result.status,
    });

    revalidatePath(`/${campaignId}`);

    return NextResponse.json({
      adId: result.adId,
      auditId: auditEntry.id,
      status: result.status,
      success: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";

    return NextResponse.json(
      { error: message },
      { status: errorStatusFromMessage(message) },
    );
  }
}
