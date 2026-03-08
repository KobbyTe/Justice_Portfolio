import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_PROMPT = `You are Justice Ansah's AI portfolio assistant. You help visitors learn about Justice's work, skills, and experience.

About Justice:
- Full-Stack Developer, STEM Educator, and Robotics Engineer
- Self-taught innovator bridging technology, agriculture, and sustainable development
- Specializes in Robotics, IoT, Web Development, and AI
- Passionate about mentoring students, especially girls in STEM
- Based in Ghana

You can help visitors with:
- Learning about Justice's projects and skills
- Understanding his experience and background
- Booking appointments or consultations (direct them to the /booking page)
- Navigating the portfolio website
- Answering questions about robotics, IoT, and STEM education

Keep responses concise, friendly, and professional. Write in clean plain text only. Never use hyphens, dashes, bullet points, asterisks, or any markdown formatting symbols in your responses. Use short paragraphs and line breaks to organize information instead.
If asked something you don't know about Justice specifically, say so honestly.`;

async function buildSystemPrompt(): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const [projectsRes, skillsRes, blogRes, aboutRes, impactRes] = await Promise.all([
    supabase.from("projects").select("title, description, category, technologies").limit(50),
    supabase.from("skills").select("name, percentage").eq("is_active", true).order("percentage", { ascending: false }),
    supabase.from("blog_posts").select("title, excerpt, category, slug").eq("is_published", true).order("published_at", { ascending: false }).limit(20),
    supabase.from("about_content").select("description, hero_description, about_description, location").limit(1),
    supabase.from("impact_metrics").select("*").limit(1),
  ]);

  let context = BASE_PROMPT;

  if (aboutRes.data?.[0]) {
    const a = aboutRes.data[0];
    context += `\n\nAbout page content:\n- Hero: ${a.hero_description || ''}\n- Description: ${a.description || ''}\n- About: ${a.about_description || ''}\n- Location: ${a.location || ''}`;
  }

  if (impactRes.data?.[0]) {
    const m = impactRes.data[0];
    context += `\n\nImpact metrics: ${m.students_impacted} students impacted, ${m.teachers_trained} teachers trained, ${m.girls_mentored} girls mentored, ${m.schools_taught} schools taught, ${m.years_of_experience} years experience, ${m.years_of_mentoring} years mentoring.`;
  }

  if (projectsRes.data?.length) {
    context += "\n\nJustice's Projects:";
    for (const p of projectsRes.data) {
      context += `\n- ${p.title} (${p.category}): ${p.description || 'No description'}. Tech: ${(p.technologies || []).join(', ')}`;
    }
  }

  if (skillsRes.data?.length) {
    context += "\n\nSkills (name / proficiency %):";
    context += "\n" + skillsRes.data.map((s: any) => `- ${s.name}: ${s.percentage}%`).join("\n");
  }

  if (blogRes.data?.length) {
    context += "\n\nRecent blog posts:";
    for (const b of blogRes.data) {
      context += `\n- "${b.title}" (${b.category}): ${b.excerpt || 'No excerpt'}`;
    }
  }

  return context;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = await buildSystemPrompt();

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
