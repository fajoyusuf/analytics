export async function runMetaSync() {
  // TODO: Implement Meta Marketing API ads + insights sync.
  // Suggested adapter boundary:
  // 1) fetchAds(accountId, token)
  // 2) fetchInsights(accountId, token, dateRange)
  // 3) upsert MetaAd + DailyMetaInsights
  return {
    ok: false,
    message: "sync:meta is a stub. Configure META_ACCESS_TOKEN and META_AD_ACCOUNT_ID, then implement adapter.",
  };
}
