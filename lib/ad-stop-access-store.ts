import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const dataDirectory = path.join(process.cwd(), "data");
const accessFile = path.join(dataDirectory, "ad-stop-access.json");
const MAX_AUDIT_ENTRIES = 100;

export type CampaignAdStopAuditEntry = {
  adId: string;
  adName?: string;
  campaignId: string;
  createdAt: string;
  id: string;
  previousStatus?: string;
  status: "PAUSED";
};

type InternalCampaignAdStopAccessRecord = {
  audit: CampaignAdStopAuditEntry[];
  campaignId: string;
  enabled: boolean;
  passcodeHash?: string;
  passcodeSalt?: string;
  passcodeUpdatedAt?: string;
  updatedAt: string;
};

export type CampaignAdStopAccessRecord = {
  audit: CampaignAdStopAuditEntry[];
  campaignId: string;
  enabled: boolean;
  hasPasscode: boolean;
  passcodeUpdatedAt?: string;
  updatedAt: string;
};

type CampaignAdStopAccessPayload = {
  campaigns: Record<string, InternalCampaignAdStopAccessRecord>;
};

function createEmptyPayload(): CampaignAdStopAccessPayload {
  return { campaigns: {} };
}

async function ensureAccessFile() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(accessFile, "utf8");
  } catch {
    await writeFile(accessFile, JSON.stringify(createEmptyPayload(), null, 2), "utf8");
  }
}

async function readAccessPayload(): Promise<CampaignAdStopAccessPayload> {
  await ensureAccessFile();
  const raw = await readFile(accessFile, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<CampaignAdStopAccessPayload>;
    return {
      campaigns: parsed.campaigns || {},
    };
  } catch {
    return createEmptyPayload();
  }
}

async function writeAccessPayload(payload: CampaignAdStopAccessPayload) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(accessFile, JSON.stringify(payload, null, 2), "utf8");
}

function normalizeInternalRecord(
  campaignId: string,
  record?: Partial<InternalCampaignAdStopAccessRecord>,
): InternalCampaignAdStopAccessRecord {
  const audit = Array.isArray(record?.audit) ? record.audit : [];

  return {
    audit: audit.slice(0, MAX_AUDIT_ENTRIES),
    campaignId,
    enabled: Boolean(record?.enabled),
    passcodeHash: record?.passcodeHash,
    passcodeSalt: record?.passcodeSalt,
    passcodeUpdatedAt: record?.passcodeUpdatedAt,
    updatedAt: record?.updatedAt || "",
  };
}

function toPublicRecord(record: InternalCampaignAdStopAccessRecord): CampaignAdStopAccessRecord {
  return {
    audit: record.audit,
    campaignId: record.campaignId,
    enabled: record.enabled,
    hasPasscode: Boolean(record.passcodeHash && record.passcodeSalt),
    passcodeUpdatedAt: record.passcodeUpdatedAt,
    updatedAt: record.updatedAt,
  };
}

function normalizePasscode(passcode?: string | null) {
  const normalized = passcode?.trim() || "";
  return normalized || undefined;
}

function validatePasscode(passcode: string) {
  if (passcode.length < 4) {
    throw new Error("Passcode must be at least 4 characters.");
  }

  if (passcode.length > 64) {
    throw new Error("Passcode must be 64 characters or less.");
  }
}

async function hashPasscode(passcode: string) {
  validatePasscode(passcode);
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(passcode, salt, 32)) as Buffer;

  return {
    hash: hash.toString("hex"),
    salt,
  };
}

async function comparePasscode(passcode: string, hash: string, salt: string) {
  const expected = Buffer.from(hash, "hex");
  const actual = (await scrypt(passcode, salt, expected.length)) as Buffer;

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function getCampaignAdStopAccess(campaignId: string) {
  const payload = await readAccessPayload();
  return toPublicRecord(normalizeInternalRecord(campaignId, payload.campaigns[campaignId]));
}

export async function saveCampaignAdStopAccess({
  campaignId,
  enabled,
  passcode,
}: {
  campaignId: string;
  enabled: boolean;
  passcode?: string | null;
}) {
  const normalizedCampaignId = campaignId.trim();

  if (!normalizedCampaignId) {
    throw new Error("Campaign ID is required.");
  }

  const payload = await readAccessPayload();
  const current = normalizeInternalRecord(
    normalizedCampaignId,
    payload.campaigns[normalizedCampaignId],
  );
  const normalizedPasscode = normalizePasscode(passcode);
  let passcodeHash = current.passcodeHash;
  let passcodeSalt = current.passcodeSalt;
  let passcodeUpdatedAt = current.passcodeUpdatedAt;
  const updatedAt = new Date().toISOString();

  if (normalizedPasscode) {
    const hashed = await hashPasscode(normalizedPasscode);
    passcodeHash = hashed.hash;
    passcodeSalt = hashed.salt;
    passcodeUpdatedAt = updatedAt;
  }

  if (enabled && (!passcodeHash || !passcodeSalt)) {
    throw new Error("Set a passcode before enabling client ad stop access.");
  }

  const nextRecord: InternalCampaignAdStopAccessRecord = {
    ...current,
    campaignId: normalizedCampaignId,
    enabled,
    passcodeHash,
    passcodeSalt,
    passcodeUpdatedAt,
    updatedAt,
  };

  payload.campaigns[normalizedCampaignId] = nextRecord;
  await writeAccessPayload(payload);

  return toPublicRecord(nextRecord);
}

export async function verifyCampaignAdStopPasscode(campaignId: string, passcode: string) {
  const payload = await readAccessPayload();
  const record = normalizeInternalRecord(campaignId, payload.campaigns[campaignId]);
  const normalizedPasscode = normalizePasscode(passcode);

  if (!record.enabled || !record.passcodeHash || !record.passcodeSalt || !normalizedPasscode) {
    return false;
  }

  try {
    return await comparePasscode(normalizedPasscode, record.passcodeHash, record.passcodeSalt);
  } catch {
    return false;
  }
}

export async function recordCampaignAdStop(entry: Omit<CampaignAdStopAuditEntry, "createdAt" | "id">) {
  const payload = await readAccessPayload();
  const current = normalizeInternalRecord(entry.campaignId, payload.campaigns[entry.campaignId]);
  const auditEntry: CampaignAdStopAuditEntry = {
    ...entry,
    createdAt: new Date().toISOString(),
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
  const nextRecord: InternalCampaignAdStopAccessRecord = {
    ...current,
    audit: [auditEntry, ...current.audit].slice(0, MAX_AUDIT_ENTRIES),
    updatedAt: auditEntry.createdAt,
  };

  payload.campaigns[entry.campaignId] = nextRecord;
  await writeAccessPayload(payload);

  return auditEntry;
}
