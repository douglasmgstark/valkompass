/**
 * Completion counter for the valkompass page.
 *
 * GET  /count  -> { count }            read the total
 * POST /count  -> { count, counted }   increment, once per IP per day
 *
 * Privacy: the caller's IP is never stored. It is salted and hashed only to build a
 * short-lived dedupe key that expires after 24 hours. No cookies, no logging, no
 * per-visitor records of any kind. The only durable state is a single integer.
 */

const ALLOWED_ORIGINS = [
  "https://douglasmgstark.github.io",
];

const DAY = 86400;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    const headers = {
      "Access-Control-Allow-Origin": allow,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

    const url = new URL(request.url);
    if (url.pathname !== "/count") {
      return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers });
    }

    const total = async () => parseInt((await env.COUNTER.get("total")) || "0", 10);

    if (request.method === "GET") {
      return new Response(JSON.stringify({ count: await total() }), { headers });
    }

    if (request.method === "POST") {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const key = "seen:" + (await hash(ip + "|" + env.SALT + "|" + today()));

      if (await env.COUNTER.get(key)) {
        return new Response(JSON.stringify({ count: await total(), counted: false }), { headers });
      }
      await env.COUNTER.put(key, "1", { expirationTtl: DAY });

      const next = (await total()) + 1;
      await env.COUNTER.put("total", String(next));
      return new Response(JSON.stringify({ count: next, counted: true }), { headers });
    }

    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers });
  },
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function hash(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
