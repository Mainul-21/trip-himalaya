export const LOCAL_CREDENTIAL_APP_ID = "trip-himalaya-local";

export function getSessionAppId() {
  return process.env.VITE_APP_ID?.trim() || LOCAL_CREDENTIAL_APP_ID;
}

export const ENV = {
  // Credential-only local deployments do not need a Manus OAuth app ID.
  // Sessions still use JWT_SECRET for cryptographic verification.
  appId: getSessionAppId(),
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  initialAdminSetupKey: process.env.INITIAL_ADMIN_SETUP_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
