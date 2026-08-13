import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  z,
  corsHeaders,
  json,
  safeString,
  getClientIp,
  checkRateLimit,
  rateLimited,
  parseBody,
} from "../_shared/security.ts";

const PushSchema = z.object({
  title: safeString(1, 120),
  body: safeString(1, 500),
  url: z.string().max(500).regex(/^\/[^\s]*$/, "url must be a relative path").optional(),
  event_type: safeString(0, 60).nullish(),
});

// Web Push utilities
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importVapidKeys(publicKeyB64: string, privateKeyB64: string) {
  const publicKeyBytes = base64UrlToUint8Array(publicKeyB64);
  const privateKeyBytes = base64UrlToUint8Array(privateKeyB64);

  // Build JWK for the private key
  // P-256 private key: 32 bytes, public key: 65 bytes (uncompressed)
  const x = btoa(String.fromCharCode(...publicKeyBytes.slice(1, 33)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const y = btoa(String.fromCharCode(...publicKeyBytes.slice(33, 65)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  const d = btoa(String.fromCharCode(...privateKeyBytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const privateKey = await crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", x, y, d },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  return { privateKey, publicKeyBytes };
}

async function createJwt(privateKey: CryptoKey, audience: string, subject: string) {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject };

  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const unsignedToken = `${encode(header)}.${encode(payload)}`;
  const encoded = new TextEncoder().encode(unsignedToken);

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    encoded
  );

  // Convert DER to raw r||s (64 bytes)
  const sigBytes = new Uint8Array(signature);
  let r: Uint8Array, s: Uint8Array;
  if (sigBytes.length === 64) {
    r = sigBytes.slice(0, 32);
    s = sigBytes.slice(32, 64);
  } else {
    // DER format
    const rLen = sigBytes[3];
    const rStart = 4;
    const rBytes = sigBytes.slice(rStart, rStart + rLen);
    const sLen = sigBytes[rStart + rLen + 1];
    const sStart = rStart + rLen + 2;
    const sBytes = sigBytes.slice(sStart, sStart + sLen);
    r = rBytes.length > 32 ? rBytes.slice(rBytes.length - 32) : rBytes;
    s = sBytes.length > 32 ? sBytes.slice(sBytes.length - 32) : sBytes;
    if (r.length < 32) { const p = new Uint8Array(32); p.set(r, 32 - r.length); r = p; }
    if (s.length < 32) { const p = new Uint8Array(32); p.set(s, 32 - s.length); s = p; }
  }

  const rawSig = new Uint8Array(64);
  rawSig.set(r, 0);
  rawSig.set(s, 32);

  const sigB64 = btoa(String.fromCharCode(...rawSig))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  return `${unsignedToken}.${sigB64}`;
}

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: CryptoKey,
  vapidPublicKeyBytes: Uint8Array
) {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const jwt = await createJwt(vapidPrivateKey, audience, "mailto:justiceansah@portfolio.com");

  const vapidKeyB64 = btoa(String.fromCharCode(...vapidPublicKeyBytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      Authorization: `vapid t=${jwt}, k=${vapidKeyB64}`,
      TTL: "86400",
      Urgency: "high",
    },
    body: new TextEncoder().encode(payload),
  });

  return response;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ip = getClientIp(req);
    if (!(await checkRateLimit("send-push", ip, 10, 60))) return rateLimited();

    const parsed = await parseBody(req, PushSchema);
    if (!parsed.ok) return parsed.response;
    const { title, body, url } = parsed.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKeyB64 = Deno.env.get("VAPID_PRIVATE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth");

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { privateKey, publicKeyBytes } = await importVapidKeys(vapidPublicKey, vapidPrivateKeyB64);

    const payload = JSON.stringify({ title, body, url: url || "/" });

    let sent = 0;
    const stale: string[] = [];

    for (const sub of subscriptions) {
      try {
        const res = await sendPushNotification(sub, payload, vapidPublicKey, privateKey, publicKeyBytes);
        if (res.status === 201 || res.status === 200) {
          sent++;
        } else if (res.status === 404 || res.status === 410) {
          stale.push(sub.endpoint);
        }
        // consume body
        await res.text();
      } catch (e) {
        console.error("Push send error:", e);
      }
    }

    // Clean up stale subscriptions
    if (stale.length > 0) {
      await supabase.from("push_subscriptions").delete().in("endpoint", stale);
    }

    return new Response(JSON.stringify({ sent, cleaned: stale.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-push error:", err);
    return json({ error: "Unexpected server error" }, 500);
  }
});
