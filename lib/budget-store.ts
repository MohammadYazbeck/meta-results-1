import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type CampaignPaymentEntry = {
  amount: number;
  campaignId: string;
  createdAt: string;
  id: string;
};

export type CampaignBudgetRecord = {
  campaignId: string;
  payments: CampaignPaymentEntry[];
  totalPaid: number;
  updatedAt: string;
};

type BudgetPayload = {
  budgets: Record<string, CampaignBudgetRecord>;
};

const dataDirectory = path.join(process.cwd(), "data");
const budgetFile = path.join(dataDirectory, "campaign-budgets.json");

async function ensureBudgetFile() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(budgetFile, "utf8");
  } catch {
    await writeFile(budgetFile, JSON.stringify({ budgets: {} }, null, 2), "utf8");
  }
}

async function readBudgetPayload(): Promise<BudgetPayload> {
  await ensureBudgetFile();
  const raw = await readFile(budgetFile, "utf8");

  try {
    const parsed = JSON.parse(raw) as BudgetPayload;
    return {
      budgets: parsed.budgets || {},
    };
  } catch {
    return { budgets: {} };
  }
}

function sumPayments(payments: CampaignPaymentEntry[]) {
  return Math.round(payments.reduce((sum, payment) => sum + payment.amount, 0) * 100) / 100;
}

function normalizeRecord(campaignId: string, record?: Partial<CampaignBudgetRecord> & { payments?: CampaignPaymentEntry[] }) {
  const payments = Array.isArray(record?.payments) ? record.payments : [];

  return {
    campaignId,
    payments,
    totalPaid: typeof record?.totalPaid === "number" ? record.totalPaid : sumPayments(payments),
    updatedAt: record?.updatedAt || "",
  };
}

export async function getCampaignBudget(campaignId: string) {
  const payload = await readBudgetPayload();

  return normalizeRecord(campaignId, payload.budgets[campaignId]);
}

export async function getAllCampaignBudgets() {
  const payload = await readBudgetPayload();

  return Object.fromEntries(
    Object.entries(payload.budgets).map(([campaignId, record]) => [
      campaignId,
      normalizeRecord(campaignId, record),
    ]),
  );
}

export async function addCampaignPayment(campaignId: string, amount: number) {
  const payload = await readBudgetPayload();
  const current = normalizeRecord(campaignId, payload.budgets[campaignId]);

  const nextPayment: CampaignPaymentEntry = {
    amount: Math.round(amount * 100) / 100,
    campaignId,
    createdAt: new Date().toISOString(),
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
  const payments = [nextPayment, ...current.payments];
  const nextRecord: CampaignBudgetRecord = {
    campaignId,
    payments,
    totalPaid: sumPayments(payments),
    updatedAt: nextPayment.createdAt,
  };

  payload.budgets[campaignId] = nextRecord;

  await writeFile(budgetFile, JSON.stringify(payload, null, 2), "utf8");

  return nextRecord;
}
