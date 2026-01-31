export default async function handler(req, res) {
  // CORS (safe for same-origin; still ok)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
  const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    return res.status(500).json({ error: "Missing Upstash env vars" });
  }

  const KEY = "eg_presence_zset";
  const WINDOW_MS = 45_000;
  const now = Date.now();

  const redis = async (commands) => {
    const r = await fetch(`${UPSTASH_REDIS_REST_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    });
    if (!r.ok) throw new Error("Upstash request failed");
    return r.json();
  };

  try {
    // GET = only read active count (also cleanup)
    if (req.method === "GET") {
      const out = await redis([
        ["ZREMRANGEBYSCORE", KEY, 0, now - WINDOW_MS],
        ["ZCARD", KEY],
      ]);
      const active = Number(out?.[1]?.result ?? 0);
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ active });
    }

    // POST = ping + read active
    if (req.method === "POST") {
      let sid = "";
      try {
        sid = (req.body?.sid || "").toString();
      } catch {}
      if (!sid) sid = `sid_${now}_${Math.random().toString(16).slice(2)}`;

      const out = await redis([
        ["ZADD", KEY, now, sid],
        ["ZREMRANGEBYSCORE", KEY, 0, now - WINDOW_MS],
        ["ZCARD", KEY],
      ]);

      const active = Number(out?.[2]?.result ?? 0);
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ active });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}
