import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type ArchivedCampaignRecord = {
  archivedAt: string;
  campaignId: string;
  campaignName: string;
};

type ArchivePayload = {
  campaigns: Record<string, ArchivedCampaignRecord>;
};

const dataDirectory = path.join(process.cwd(), "data");
const archiveFile = path.join(dataDirectory, "campaign-archive.json");

async function ensureArchiveFile() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(archiveFile, "utf8");
  } catch {
    await writeFile(archiveFile, JSON.stringify({ campaigns: {} }, null, 2), "utf8");
  }
}

async function readArchivePayload(): Promise<ArchivePayload> {
  await ensureArchiveFile();
  const raw = await readFile(archiveFile, "utf8");

  try {
    const parsed = JSON.parse(raw) as ArchivePayload;
    return {
      campaigns: parsed.campaigns || {},
    };
  } catch {
    return { campaigns: {} };
  }
}

async function writeArchivePayload(payload: ArchivePayload) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(archiveFile, JSON.stringify(payload, null, 2), "utf8");
}

export async function getArchivedCampaigns() {
  const payload = await readArchivePayload();
  return payload.campaigns;
}

export async function archiveCampaign(campaignId: string, campaignName: string) {
  const payload = await readArchivePayload();

  payload.campaigns[campaignId] = {
    archivedAt: new Date().toISOString(),
    campaignId,
    campaignName: campaignName || `Campaign ${campaignId}`,
  };

  await writeArchivePayload(payload);
  return payload.campaigns[campaignId];
}

export async function unarchiveCampaign(campaignId: string) {
  const payload = await readArchivePayload();
  delete payload.campaigns[campaignId];
  await writeArchivePayload(payload);
}
