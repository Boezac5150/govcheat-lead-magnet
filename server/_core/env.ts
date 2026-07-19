export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  samGovApiKey: process.env.SAM_GOV_API_KEY ?? "",
  // HighLevel CRM integration
  ghlApiKey: process.env.GHL_API_KEY ?? "",
  ghlLocationId: process.env.GHL_LOCATION_ID ?? "XwqBOfoCpwVip6rghwwx",
  ghlPipelineId: process.env.GHL_PIPELINE_ID ?? "yyfYtLYTPygyNlIjiRrW",
  ghlStageId: process.env.GHL_STAGE_ID ?? "56b32d10-5ecc-40af-8894-3a536c943efe",
};
