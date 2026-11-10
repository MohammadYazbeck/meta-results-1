"use server";

import { revalidatePath } from "next/cache";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  saveCampaignFinancialSettings,
  saveGeneralFinancialSettings,
} from "@/lib/financial-settings-store";

function parseRequiredNumber(value: FormDataEntryValue | null, label: string) {
  const parsed = Number.parseFloat(String(value ?? ""));

  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} is required.`);
  }

  return parsed;
}

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return undefined;
  }

  const parsed = Number.parseFloat(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error("Enter a valid number or leave the field empty.");
  }

  return parsed;
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

export async function saveGeneralFinancialSettingsAction(formData: FormData) {
  await requireAdmin();
  await saveGeneralFinancialSettings({
    exchangeRate: parseRequiredNumber(
      formData.get("exchangeRate"),
      "Exchange rate",
    ),
    negativeBalanceAddOnPercent: parseRequiredNumber(
      formData.get("negativeBalanceAddOnPercent"),
      "Negative balance add-on",
    ),
  });
  revalidatePath("/");
}

export async function saveCampaignFinancialSettingsAction(formData: FormData) {
  await requireAdmin();
  const campaignId = String(formData.get("campaignId") ?? "").trim();

  await saveCampaignFinancialSettings(campaignId, {
    exchangeRate: parseOptionalNumber(formData.get("exchangeRate")),
    negativeBalanceAddOnPercent: parseOptionalNumber(
      formData.get("negativeBalanceAddOnPercent"),
    ),
  });
  revalidatePath("/");
}
