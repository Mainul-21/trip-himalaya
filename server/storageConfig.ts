export type CloudinaryConfig = {
  apiKey: string;
  apiSecret: string;
  cloudName: string;
};

/**
 * Reads a server-only Cloudinary URL without exposing its secret to browser code.
 * Empty values mean the project should use its managed storage fallback instead.
 */
export function parseCloudinaryUrl(value = process.env.CLOUDINARY_URL): CloudinaryConfig | null {
  if (!value?.trim()) return null;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("CLOUDINARY_URL is invalid. Copy the complete API Environment Variable from Cloudinary.");
  }

  const apiKey = decodeURIComponent(parsed.username);
  const apiSecret = decodeURIComponent(parsed.password);
  const cloudName = parsed.hostname;

  if (parsed.protocol !== "cloudinary:" || !apiKey || !apiSecret || !cloudName) {
    throw new Error("CLOUDINARY_URL is incomplete. Use cloudinary://API_KEY:API_SECRET@CLOUD_NAME.");
  }

  return { apiKey, apiSecret, cloudName };
}
