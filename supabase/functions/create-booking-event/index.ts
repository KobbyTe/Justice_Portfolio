// Creates a Google Calendar event for a confirmed booking via the Lovable connector gateway.
import {
  z,
  corsHeaders,
  json,
  safeString,
  emailSchema,
  getClientIp,
  checkRateLimit,
  rateLimited,
  parseBody,
} from "../_shared/security.ts";

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_calendar/calendar/v3';

const BookingSchema = z.object({
  slot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Expected HH:MM:SS"),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Expected HH:MM:SS"),
  name: safeString(1, 100),
  email: emailSchema,
  phone: safeString(0, 30).nullish(),
  message: safeString(0, 1000).nullish(),
  timeZone: z.string().regex(/^[A-Za-z0-9_+\-\/]{1,64}$/).optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    // Rate limit: 5 booking events per minute per IP
    const ip = getClientIp(req);
    if (!(await checkRateLimit('create-booking-event', ip, 5, 60))) return rateLimited();

    const parsed = await parseBody(req, BookingSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const connKey = Deno.env.get('GOOGLE_CALENDAR_API_KEY');
    if (!lovableKey || !connKey) {
      console.error('Google Calendar connection not configured');
      return json({ error: 'Google Calendar connection not configured' }, 500);
    }

    const pad = (t: string) => (t.length === 5 ? `${t}:00` : t);
    const tz = body.timeZone || 'UTC';
    const startDateTime = `${body.slot_date}T${pad(body.start_time)}`;
    const endDateTime = `${body.slot_date}T${pad(body.end_time)}`;

    if (new Date(`${endDateTime}Z`) <= new Date(`${startDateTime}Z`)) {
      return json({ error: 'End time must be after start time' }, 400);
    }

    const event = {
      summary: `Appointment with ${body.name}`,
      description: [
        `Name: ${body.name}`,
        `Email: ${body.email}`,
        body.phone ? `Phone: ${body.phone}` : null,
        body.message ? `\nMessage:\n${body.message}` : null,
        `\nBooked via portfolio.`,
      ].filter(Boolean).join('\n'),
      start: { dateTime: startDateTime, timeZone: tz },
      end: { dateTime: endDateTime, timeZone: tz },
      attendees: [{ email: body.email, displayName: body.name }],
      reminders: { useDefault: true },
    };

    const resp = await fetch(
      `${GATEWAY_URL}/calendars/primary/events?sendUpdates=all`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'X-Connection-Api-Key': connKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      },
    );

    const text = await resp.text();
    if (!resp.ok) {
      console.error('Google Calendar error', resp.status, text);
      return json({ error: 'Calendar API error' }, 502);
    }

    const data = JSON.parse(text);
    return json({ ok: true, eventId: data.id, htmlLink: data.htmlLink });
  } catch (err) {
    console.error('create-booking-event failure', err);
    return json({ error: 'Unexpected server error' }, 500);
  }
});
