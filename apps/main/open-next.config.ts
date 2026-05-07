import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config — no R2 or Durable Objects required right now.
// Static pages are served from Cloudflare's asset CDN.
// Dynamic pages (auth-protected routes, AI features) are server-rendered per request.
//
// When you enable R2 on the Cloudflare dashboard, uncomment the block below
// and uncomment the r2_buckets + durable_objects sections in wrangler.jsonc:
//
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
// import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
// import doShardedTagCache from "@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache";
//
// export default defineCloudflareConfig({
//   incrementalCache: withRegionalCache(r2IncrementalCache, {
//     mode: "long-lived",
//     shouldLazilyUpdateOnCacheHit: true,
//     bypassTagCacheOnCacheHit: false,
//   }),
//   tagCache: doShardedTagCache({ baseShardSize: 12 }),
//   enableCacheInterception: true,
// });

export default defineCloudflareConfig({});
