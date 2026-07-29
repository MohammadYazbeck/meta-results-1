"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { saveCampaignAdStopAccess } from "@/lib/ad-stop-access-store";

export async function saveAdStopAccessAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const campaignId = String(formData.get("campaignId") ?? "").trim();
  const enabled = formData.get("enabled") === "on";
  const passcode = String(formData.get("passcode") ?? "").trim();

  if (!campaignId) {
    throw new Error("Campaign ID is required.");
  }

  await saveCampaignAdStopAccess({
    campaignId,
    enabled,
    passcode,
  });

  revalidatePath(`/${campaignId}`);
  redirect(`/${campaignId}`);
}
