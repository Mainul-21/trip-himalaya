import type { Express } from "express";
import { ENV } from "./env";

const MANAGED_ASSET_ORIGIN = "https://himalayatrip-ahqqbylp.manus.space";

export function getManagedAssetFallbackUrl(key: string) {
  const safeKey = key
    .split("/")
    .filter(Boolean)
    .map(segment => encodeURIComponent(segment))
    .join("/");
  return `${MANAGED_ASSET_ORIGIN}/manus-storage/${safeKey}`;
}

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      // The seeded Dharamshala images live in managed storage. A local or
      // standalone deployment has no Forge credentials, so let its public
      // project endpoint presign the existing asset instead of showing a 500.
      res.set("Cache-Control", "no-store");
      res.redirect(307, getManagedAssetFallbackUrl(key));
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
      });

      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const { url } = (await forgeResp.json()) as { url: string };
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}
