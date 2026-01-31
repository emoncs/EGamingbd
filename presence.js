// /presence.js
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { sid } = req.body || {};
    if (!sid || typeof sid !== "string" || sid.length < 6) {
      return res.status(400).json({ error: "Invalid sid" });
    }

    const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
    const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      return res.status(500).json({ error: "Missing Upstash env vars" });
    }

    const now = Date.now();
    const WINDOW_MS = 45000; // active in last 45 seconds
    const cutoff = now - WINDOW_MS;

    const call = async (command) => {
      const r = await fetch(UPSTASH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
        },
        body: JSON.stringify({ command }),
      });
      if (!r.ok) throw new Error("Upstash error");
      return r.json();
    };

    // Use a sorted set for presence:
    // ZADD eg:presence <now> <sid>
    // ZREMRANGEBYSCORE eg:presence 0 <cutoff>
    // ZCARD eg:presence  -> count
    await call(["ZADD", "eg:presence", now, sid]);
    await call(["ZREMRANGEBYSCORE", "eg:presence", 0, cutoff]);
    const countRes = await call(["ZCARD", "eg:presence"]);

    // Upstash REST returns { result: <number> }
    const active = Number(countRes?.result || 0);

    // avoid caching
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ active });
  } catch (e) {
    return res.status(200).json({ active: 0 }); // keep UI safe
  }
}
