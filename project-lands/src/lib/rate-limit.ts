// Best-effort, in-memory, per-serverless-instance rate limiter. It resets
// whenever a new instance spins up and isn't shared across instances, so it
// does not guarantee a hard limit — it's a cheap first line of defense against
// casual abuse until a shared store (e.g. Upstash Redis free tier) is worth
// adding.
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
