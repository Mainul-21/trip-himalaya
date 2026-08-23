const STALE_ASSET_RELOAD_STORAGE_PREFIX = "trip-himalaya:stale-asset-reload:";

type SessionStorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error ?? "");
}

/**
 * Identifies errors caused when a cached application shell requests a route
 * chunk that no longer exists after a deployment.
 */
export function isStaleAssetError(error: unknown) {
  const message = errorMessage(error).toLowerCase();
  return [
    "failed to fetch dynamically imported module",
    "error loading dynamically imported module",
    "importing a module script failed",
    "chunkloaderror",
    "loading chunk",
  ].some((signature) => message.includes(signature));
}

export function staleAssetReloadKey(pathname: string) {
  return `${STALE_ASSET_RELOAD_STORAGE_PREFIX}${pathname || "/"}`;
}

/**
 * Allows one automatic reload per route within a browser session. If the
 * server is still incomplete after that refresh, the caller must show a
 * manual retry instead of creating a refresh loop.
 */
export function claimStaleAssetReload(storage: SessionStorageLike, pathname: string) {
  const key = staleAssetReloadKey(pathname);

  try {
    if (storage.getItem(key)) return false;
    storage.setItem(key, "1");
    return true;
  } catch {
    // Private-browsing or restricted storage must never cause repeated reloads.
    return false;
  }
}

export function clearStaleAssetReload(storage: SessionStorageLike, pathname: string) {
  try {
    storage.removeItem(staleAssetReloadKey(pathname));
  } catch {
    // A manual retry can still proceed when session storage is unavailable.
  }
}
