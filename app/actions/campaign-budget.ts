"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { addCampaignPayment } from "@/lib/budget-store";

function normalizeCurrencyInput(input: FormDataEntryValue | null) {
  const parsed = Number.parseFloat(String(input ?? "0"));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function saveCampaignBudgetAction(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }

  const campaignId = String(formData.get("campaignId") ?? "").trim();
  const start = String(formData.get("start") ?? "").trim();
  const end = String(formData.get("end") ?? "").trim();
  const paymentAmount = normalizeCurrencyInput(formData.get("paymentAmount"));

  if (!campaignId) {
    throw new Error("Campaign ID is required to save budget.");
  }

  if (paymentAmount === 0) {
    throw new Error("Payment amount must not be zero.");
  }

  await addCampaignPayment(campaignId, paymentAmount);
  revalidatePath("/");
  revalidatePath(`/${campaignId}`);

  const query = new URLSearchParams();

  if (start) {
    query.set("start", start);
  }

  if (end) {
    query.set("end", end);
  }

  redirect(`/${campaignId}${query.toString() ? `?${query.toString()}` : ""}`);
}
