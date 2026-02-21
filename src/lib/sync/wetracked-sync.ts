export async function runWeTrackedSync() {
  // TODO: Implement wetracked.io stats sync.
  // Suggested adapter boundary:
  // 1) fetchWeTrackedStats(apiKey, baseUrl, dateRange)
  // 2) normalize to creative/ad level key
  // 3) upsert DailyWeTracked
  return {
    ok: false,
    message: "sync:wetracked is a stub. Configure WETRACKED_API_KEY and WETRACKED_BASE_URL, then implement adapter.",
  };
}
