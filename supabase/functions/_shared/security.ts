// Shared server-side security helpers: schema validation, sanitization,
// rate limiting and safe JSON responses. Used by every edge function.
import { z } from "npm:zod@3.23.8";
import { createClient } from "npm:@supabase/supabase-js@2";

export { z };

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

/** Strips control characters and collapses whitespace. Never returns HTML. */
export function sanitizeText(input: string): string {
  return input
    // deno-lint-ignore no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

/** Escapes a string for safe interpolation into HTML. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** A trimmed, sanitized, length-bounded string schema. */
export const safeString = (min: number, max: number) =>
  z.string().transform(sanitizeText).pipe(z.string().min(min).max(max));

export const emailSchema = z
  .string()
  .max(255)
  .transform((v) => sanitizeText(v).toLowerCase())
  .pipe(z.string().email());

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim().slice(0, 64);
  return req.headers.get("cf-connecting-ip")?.slice(0, 64) ?? "unknown";
}

function serviceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}

/**
 * Sliding-window rate limit backed by Postgres.
 * Returns true when the request is allowed.
 */
export async function checkRateLimit(
  scope: string,
  identity: string,
  maxRequests: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    const { data, error } = await serviceClient().rpc("check_rate_limit", {
      _bucket: `${scope}:${identity}`.slice(0, 200),
      _max_requests: maxRequests,
      _window_seconds: windowSeconds,
    });
    if (error) {
      console.error("rate limit check failed", error.message);
      return true; // fail open so a limiter outage never breaks the site
    }
    return data === true;
  } catch (e) {
    console.error("rate limit exception", e);
    return true;
  }
}

export const rateLimited = () =>
  json({ error: "Too many requests. Please slow down and try again shortly." }, 429, {
    "Retry-After": "60",
  });

/** Parses JSON body against a Zod schema, returning a 400 response on failure. */
export async function parseBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; response: Response }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, response: json({ error: "Invalid JSON body" }, 400) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, 400),
    };
  }
  return { ok: true, data: parsed.data };
}
