import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { getAccountToDisplayRate } from "@/lib/currency";

export type FinancialSettingValues = {
  exchangeRate?: number;
  negativeBalanceAddOnPercent?: number;
  updatedAt?: string;
};

export type FinancialSettingsPayload = {
  campaigns: Record<string, FinancialSettingValues>;
  general: FinancialSettingValues;
};

export type FinancialSettingsSnapshot = FinancialSettingsPayload & {
  baseExchangeRate: number;
  resolvedGeneral: {
    exchangeRate: number;
    negativeBalanceAddOnPercent: number;
  };
};

const dataDirectory = path.join(process.cwd(), "data");
const settingsFile = path.join(dataDirectory, "financial-settings.json");

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isPercentage(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function normalizeValues(values?: FinancialSettingValues): FinancialSettingValues {
  return {
    exchangeRate: isPositiveNumber(values?.exchangeRate)
      ? values.exchangeRate
      : undefined,
    negativeBalanceAddOnPercent: isPercentage(
      values?.negativeBalanceAddOnPercent,
    )
      ? values.negativeBalanceAddOnPercent
      : undefined,
    updatedAt: typeof values?.updatedAt === "string" ? values.updatedAt : undefined,
  };
}

async function ensureSettingsFile() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(settingsFile, "utf8");
  } catch {
    await writeFile(
      settingsFile,
      JSON.stringify({ campaigns: {}, general: {} }, null, 2),
      "utf8",
    );
  }
}

async function readSettingsPayload(): Promise<FinancialSettingsPayload> {
  await ensureSettingsFile();

  try {
    const raw = await readFile(settingsFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<FinancialSettingsPayload>;
    const campaigns = Object.fromEntries(
      Object.entries(parsed.campaigns || {}).map(([campaignId, values]) => [
        campaignId,
        normalizeValues(values),
      ]),
    );

    return {
      campaigns,
      general: normalizeValues(parsed.general),
    };
  } catch {
    return { campaigns: {}, general: {} };
  }
}

async function writeSettingsPayload(payload: FinancialSettingsPayload) {
  await ensureSettingsFile();
  await writeFile(settingsFile, JSON.stringify(payload, null, 2), "utf8");
}

export async function getFinancialSettings(): Promise<FinancialSettingsSnapshot> {
  const payload = await readSettingsPayload();
  const baseExchangeRate = getAccountToDisplayRate();

  return {
    ...payload,
    baseExchangeRate,
    resolvedGeneral: {
      exchangeRate: payload.general.exchangeRate ?? baseExchangeRate,
      negativeBalanceAddOnPercent:
        payload.general.negativeBalanceAddOnPercent ?? 0,
    },
  };
}

export async function saveGeneralFinancialSettings(values: {
  exchangeRate: number;
  negativeBalanceAddOnPercent: number;
}) {
  if (!isPositiveNumber(values.exchangeRate)) {
    throw new Error("The general exchange rate must be greater than zero.");
  }

  if (!isPercentage(values.negativeBalanceAddOnPercent)) {
    throw new Error("The general add-on must be zero or greater.");
  }

  const payload = await readSettingsPayload();
  payload.general = {
    exchangeRate: values.exchangeRate,
    negativeBalanceAddOnPercent: values.negativeBalanceAddOnPercent,
    updatedAt: new Date().toISOString(),
  };
  await writeSettingsPayload(payload);
}

export async function saveCampaignFinancialSettings(
  campaignId: string,
  values: {
    exchangeRate?: number;
    negativeBalanceAddOnPercent?: number;
  },
) {
  const normalizedCampaignId = campaignId.trim();

  if (!normalizedCampaignId) {
    throw new Error("Campaign ID is required.");
  }

  if (values.exchangeRate !== undefined && !isPositiveNumber(values.exchangeRate)) {
    throw new Error("The campaign exchange rate must be greater than zero.");
  }

  if (
    values.negativeBalanceAddOnPercent !== undefined &&
    !isPercentage(values.negativeBalanceAddOnPercent)
  ) {
    throw new Error("The campaign add-on must be zero or greater.");
  }

  const payload = await readSettingsPayload();

  if (
    values.exchangeRate === undefined &&
    values.negativeBalanceAddOnPercent === undefined
  ) {
    delete payload.campaigns[normalizedCampaignId];
  } else {
    payload.campaigns[normalizedCampaignId] = {
      ...values,
      updatedAt: new Date().toISOString(),
    };
  }

  await writeSettingsPayload(payload);
}
