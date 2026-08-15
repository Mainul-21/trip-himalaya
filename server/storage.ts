// Storage helpers for administrator-selected files.
// Owner-provided Cloudinary takes precedence for standalone local/Vercel use.
// Managed Forge storage remains available inside the hosted development environment.

import { createHash, randomUUID } from "node:crypto";
import { ENV } from "./_core/env";
import { parseCloudinaryUrl } from "./storageConfig";

function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;

  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY",
    );
  }

  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function toBlob(data: Buffer | Uint8Array | string, contentType: string): Blob {
  return typeof data === "string"
    ? new Blob([data], { type: contentType })
    : new Blob([data as any], { type: contentType });
}

function cloudinaryPublicId(key: string): string {
  const extensionStart = key.lastIndexOf(".");
  const withoutExtension = extensionStart === -1 ? key : key.slice(0, extensionStart);
  return withoutExtension.replace(/[^a-zA-Z0-9_./-]+/g, "-");
}

async function uploadToCloudinary(
  key: string,
  data: Buffer | Uint8Array | string,
  contentType: string,
): Promise<{ key: string; url: string } | null> {
  const config = parseCloudinaryUrl();
  if (!config) return null;

  const folder = "trip-himalaya";
  const publicId = cloudinaryPublicId(key);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHash("sha1")
    .update(`folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`)
    .digest("hex");

  const form = new FormData();
  form.append("file", toBlob(data, contentType), key.split("/").at(-1) ?? "upload");
  form.append("api_key", config.apiKey);
  form.append("folder", folder);
  form.append("public_id", publicId);
  form.append("signature", signature);
  form.append("timestamp", timestamp);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary image upload failed (${response.status}). Check CLOUDINARY_URL in your deployment settings.`);
  }

  const result = (await response.json()) as { public_id?: string; secure_url?: string };
  if (!result.public_id || !result.secure_url) {
    throw new Error("Cloudinary returned an incomplete image-upload response.");
  }

  return { key: `cloudinary:${result.public_id}`, url: result.secure_url };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));

  const cloudinaryUpload = await uploadToCloudinary(key, data, contentType);
  if (cloudinaryUpload) return cloudinaryUpload;

  const { forgeUrl, forgeKey } = getForgeConfig();

  // 1. Get presigned PUT URL from Forge
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);

  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }

  const { url: s3Url } = (await presignResp.json()) as { url: string };
  if (!s3Url) throw new Error("Forge returned empty presign URL");

  // 2. PUT file directly to S3
  const blob = toBlob(data, contentType);

  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }

  return { key, url: `/manus-storage/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = normalizeKey(relKey);

  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
  getUrl.searchParams.set("path", key);

  const resp = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });

  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Storage signed URL failed (${resp.status}): ${msg}`);
  }

  const { url } = (await resp.json()) as { url: string };
  return url;
}
