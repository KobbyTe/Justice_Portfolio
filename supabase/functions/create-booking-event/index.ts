// Creates a Google Calendar event for a confirmed booking via the Lovable connector gateway.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_calendar/calendar/v3';

interface BookingPayload {
  slot_date: string;       // YYYY-MM-DD
  start_time: string;      // HH:MM:SS
  end_time: string;        // HH:MM:SS
  name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  timeZone?: string;       // optional IANA tz, defaults to UTC
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    const connKey = Deno.env.get('GOOGLE_CALENDAR_API_KEY');
    if (!lovableKey || !connKey) {
      return new Response(
        JSON.stringify({ error: 'Google Calendar connection not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const body = (await req.json()) as BookingPayload;
    const required = ['slot_date', 'start_time', 'end_time', 'name', 'email'] as const;
    for (const k of required) {
      if (!body[k] || typeof body[k] !== 'string') {
        return new Response(
          JSON.stringify({ error: `Missing or invalid field: ${k}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    const tz = body.timeZone || 'UTC';
    const startDateTime = `${body.slot_date}T${body.start_time}`;
    const endDateTime = `${body.slot_date}T${body.end_time}`;

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
      return new Response(
        JSON.stringify({ error: 'Calendar API error', status: resp.status, details: text }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = JSON.parse(text);
    return new Response(
      JSON.stringify({ ok: true, eventId: data.id, htmlLink: data.htmlLink }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('create-booking-event failure', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
