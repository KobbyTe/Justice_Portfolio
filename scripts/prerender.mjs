// Build-time pre-rendering for search engines and AI crawlers.
//
// The site is a client-side React app, so without this step every URL returns
// the same empty <div id="root"> with the homepage title and canonical link.
// This script runs after `vite build` and writes a real HTML file for each
// public route (dist/about.html, dist/blog/<slug>.html, ...) with:
//   - the page's own <title>, description, canonical and Open Graph tags
//   - readable text content pulled from Supabase (public data only)
//   - JSON-LD structured data
// It also regenerates sitemap.xml and writes llms.txt for AI tools.
//
// React replaces this static markup as soon as it mounts, so visitors see the
// normal site. If Supabase is unreachable the script falls back to static
// text, and it never fails the build.

import fs from "node:fs";
import path from "node:path";

const SITE = "https://justiceansah.com";
const DIST = path.resolve("dist");
const NAME = "Justice Ansah";
const TAGLINE = "Ghanaian robotics and IoT engineer and STEM educator";
const DEFAULT_DESC =
  "Justice Ansah is a Ghanaian robotics and IoT engineer, STEM educator and self-taught innovator building practical technology for education, agriculture and sustainability.";

// ---------- helpers ----------
const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const stripHtml = (html = "") =>
  String(html)
    .replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();

const paragraphs = (text = "") =>
  stripHtml(text)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("\n");

const truncate = (s = "", n = 158) => {
  const t = stripHtml(s).replace(/\s+/g, " ").trim();
  return t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
};

const isoDate = (d) => {
  const t = d ? new Date(d) : null;
  return t && !isNaN(t) ? t.toISOString().slice(0, 10) : undefined;
};

function readEnv() {
  const env = { ...process.env };
  try {
    const raw = fs.readFileSync(path.resolve(".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2];
    }
  } catch {
    /* no .env file */
  }
  return env;
}

async function loadData() {
  const env = readEnv();
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const empty = { about: null, projects: [], posts: [], certs: [], recs: [], impact: null, social: [], skills: [] };
  if (!url || !key) {
    console.warn("[prerender] Supabase env vars missing; using static content only.");
    return empty;
  }
  const q = async (p) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const r = await fetch(`${url}/rest/v1/${p}`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        signal: ctrl.signal,
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      return Array.isArray(j) ? j : [];
    } catch (e) {
      console.warn(`[prerender] Could not load ${p.split("?")[0]}: ${e.message}`);
      return [];
    } finally {
      clearTimeout(timer);
    }
  };
  const [about, projects, posts, certs, recs, impact, social, skills] = await Promise.all([
    q("about_content?select=description,hero_description,about_description,location&limit=1"),
    q("projects?select=title,description,category,technologies,project_url,github_url,created_at&order=created_at.desc"),
    q("blog_posts?select=title,slug,excerpt,content,category,tags,published_at,updated_at,featured_image_url&is_published=eq.true&order=published_at.desc"),
    q("certificates?select=title,issuer,issued_on,description&is_active=eq.true&order=sort_order"),
    q("recommendations?select=name,position,company,message&is_active=eq.true&order=sort_order"),
    q("impact_metrics?select=*&limit=1"),
    q("social_links?select=platform,url&is_active=eq.true&order=sort_order"),
    q("skills?select=name&is_active=eq.true&order=sort_order"),
  ]);
  return {
    about: about[0] || null,
    projects,
    posts: posts.filter((p) => p.slug && /^[a-z0-9-]+$/i.test(p.slug)),
    certs,
    recs,
    impact: impact[0] || null,
    social: social.filter((s) => /^https?:\/\//.test(s.url || "")),
    skills,
  };
}

// ---------- shared markup ----------
const NAV = [
  ["/", "Home"],
  ["/about", "About"],
  ["/resume", "Resume"],
  ["/projects", "Projects"],
  ["/blog", "Blog"],
  ["/gallery", "Gallery"],
  ["/certificates", "Certificates"],
  ["/booking", "Book a meeting"],
  ["/wall", "Community wall"],
];

// Minimal styling so the static copy is readable for the moment before React loads.
const STYLE = `<style id="prerender-style">
#prerender{max-width:820px;margin:0 auto;padding:96px 20px 64px;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.65;color:#e5e7eb;background:#0b0f14}
#prerender a{color:#38bdf8}#prerender h1{font-size:2rem;line-height:1.2;margin:0 0 .5rem;color:#fff}
#prerender h2{font-size:1.25rem;margin:2rem 0 .5rem;color:#fff}#prerender nav{display:flex;flex-wrap:wrap;gap:.75rem 1.25rem;margin-bottom:2rem;font-size:.95rem}
#prerender ul{padding-left:1.2rem}#prerender .lead{font-size:1.1rem;color:#cbd5e1}
</style>`;

const shell = (inner, data) => {
  const links = data.social.length
    ? `<p>Find Justice online: ${data.social
        .map((s) => `<a href="${esc(s.url)}" rel="me">${esc(s.platform)}</a>`)
        .join(" · ")}</p>`
    : "";
  return `<div id="prerender">
<nav aria-label="Main">${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>
<main>
${inner}
</main>
<footer><p>${esc(NAME)} — ${esc(TAGLINE)}, based in Accra, Ghana. Contact: <a href="mailto:justiceansah@gmail.com">justiceansah@gmail.com</a></p>${links}</footer>
</div>`;
};

const intro = (data) => {
  const loc = data.about?.location ? `${data.about.location}, Ghana` : "Accra, Ghana";
  return `<p class="lead">${esc(NAME)} is a ${esc(TAGLINE)} based in ${esc(loc)}. He builds practical technology for education, agriculture and sustainability, and teaches robotics to young learners as a STEM instructor at InovTech STEM Center.</p>`;
};

const impactList = (m) =>
  m
    ? `<h2>Impact</h2><ul>
<li>${esc(m.students_impacted)}+ students impacted</li>
<li>${esc(m.teachers_trained)}+ teachers trained</li>
<li>${esc(m.girls_mentored)}+ girls mentored</li>
<li>${esc(m.schools_taught)}+ schools taught</li>
</ul>`
    : "";

const projectList = (projects, full = false) =>
  projects.length
    ? `<ul>${projects
        .map((p) => {
          const tech = (p.technologies || []).join(", ");
          const desc = full ? stripHtml(p.description || "") : truncate(p.description || "", 200);
          const link = /^https?:\/\//.test(p.project_url || "") ? ` <a href="${esc(p.project_url)}">Visit</a>` : "";
          const code = /^https?:\/\//.test(p.github_url || "") ? ` <a href="${esc(p.github_url)}">Code</a>` : "";
          return `<li><strong>${esc(p.title)}</strong>${p.category ? ` (${esc(p.category)})` : ""}: ${esc(desc)}${tech ? ` Built with ${esc(tech)}.` : ""}${link}${code}</li>`;
        })
        .join("\n")}</ul>`
    : "";

const postList = (posts, limit) =>
  posts.length
    ? `<ul>${posts
        .slice(0, limit || posts.length)
        .map(
          (p) =>
            `<li><a href="/blog/${esc(p.slug)}">${esc(p.title)}</a>${p.published_at ? ` <small>(${isoDate(p.published_at)})</small>` : ""}${p.excerpt ? ` — ${esc(truncate(p.excerpt, 160))}` : ""}</li>`
        )
        .join("\n")}</ul>`
    : "";

const skillList = (skills) =>
  skills.length ? `<h2>Skills</h2><ul>${skills.map((s) => `<li>${esc(s.name)}</li>`).join("")}</ul>` : "";

// ---------- page definitions ----------
function buildPages(data) {
  const pages = [];
  const personRef = { "@id": `${SITE}/#person` };

  pages.push({
    route: "/",
    title: "Justice Ansah | Robotics, IoT & STEM Engineer",
    description: DEFAULT_DESC,
    body: `<h1>${esc(NAME)} — Robotics, IoT &amp; STEM Engineer</h1>
${intro(data)}
${impactList(data.impact)}
${data.projects.length ? `<h2>Selected projects</h2>${projectList(data.projects.slice(0, 6))}<p><a href="/projects">All projects</a></p>` : ""}
${data.posts.length ? `<h2>Latest from the blog</h2>${postList(data.posts, 5)}<p><a href="/blog">All posts</a></p>` : ""}
${data.recs.length ? `<h2>What people say</h2><ul>${data.recs.map((r) => `<li>${esc(r.name)}${r.position ? `, ${esc(r.position)}` : ""}${r.company ? ` at ${esc(r.company)}` : ""}: “${esc(truncate(r.message, 300))}”</li>`).join("\n")}</ul>` : ""}`,
  });

  pages.push({
    route: "/about",
    title: "About Justice Ansah | Ghanaian Robotics & IoT Engineer",
    description:
      "About Justice Ansah: Ghanaian self-taught robotics and IoT engineer, robotics instructor at InovTech STEM Center, and innovator in AgriTech and sustainability.",
    jsonLd: { "@context": "https://schema.org", "@type": "ProfilePage", mainEntity: personRef, url: `${SITE}/about` },
    body: `<h1>About ${esc(NAME)}</h1>
${intro(data)}
${data.about?.about_description ? paragraphs(data.about.about_description) : data.about?.description ? paragraphs(data.about.description) : ""}
${skillList(data.skills)}
${impactList(data.impact)}`,
  });

  pages.push({
    route: "/projects",
    title: "Projects | Justice Ansah — Robotics, IoT & Web",
    description:
      "Robotics, IoT and web projects by Justice Ansah, including an intelligent solar crop dryer, a STEM exam platform and a digital birth registration system for rural Ghana.",
    body: `<h1>Projects by ${esc(NAME)}</h1>
<p class="lead">Robotics, IoT and web projects built to solve real problems in education, agriculture and public services.</p>
${projectList(data.projects, true)}`,
  });

  pages.push({
    route: "/blog",
    title: "Blog & Vlogs | Justice Ansah",
    description: "Articles and vlogs by Justice Ansah on robotics, STEM education, coding for kids, IoT and technology in Ghana.",
    body: `<h1>Blog &amp; vlogs by ${esc(NAME)}</h1>
<p class="lead">Writing and videos on robotics, STEM education and technology in Ghana.</p>
${postList(data.posts)}`,
  });

  pages.push({
    route: "/resume",
    title: "Resume | Justice Ansah — Robotics Engineer & STEM Educator",
    description:
      "Resume of Justice Ansah: STEM instructor and junior robotics engineer at InovTech STEM Center, Technovation mentor, and former intern at Academic City University.",
    body: `<h1>Resume — ${esc(NAME)}</h1>
${intro(data)}
<h2>Experience</h2>
<ul>
<li>2025 – present: STEM Instructor &amp; Junior Robotics Engineer, InovTech STEM Center — robotics workshops with LEGO Mindstorms, Arduino and Avishkaar.</li>
<li>2025: Girls' mentor, Technovation — guiding girls to solve global problems with technology.</li>
<li>2024: Intern, Academic City University — helped build a plastic shredder and a 3D-printer filament extruder.</li>
</ul>
<h2>Education</h2>
<ul><li>2023: General Science (ICT), Aggrey Memorial A.M.E. Zion Senior High School</li></ul>
${skillList(data.skills)}`,
  });

  pages.push({
    route: "/certificates",
    title: "Certificates & Awards | Justice Ansah",
    description: "Certificates, awards and recognitions earned by Justice Ansah in robotics, STEM and innovation.",
    body: `<h1>Certificates &amp; awards — ${esc(NAME)}</h1>
${data.certs.length ? `<ul>${data.certs.map((c) => `<li><strong>${esc(c.title)}</strong>${c.issuer ? ` — ${esc(c.issuer)}` : ""}${c.issued_on ? ` (${isoDate(c.issued_on)})` : ""}${c.description ? `: ${esc(truncate(c.description, 200))}` : ""}</li>`).join("\n")}</ul>` : ""}`,
  });

  pages.push({
    route: "/gallery",
    title: "Gallery | Justice Ansah",
    description: "Photos of Justice Ansah's robotics workshops, STEM outreach and innovation projects in Ghana.",
    body: `<h1>Gallery — ${esc(NAME)}</h1><p class="lead">Photos from robotics workshops, STEM outreach and innovation projects across Ghana.</p>`,
  });

  pages.push({
    route: "/booking",
    title: "Book a Meeting | Justice Ansah",
    description: "Book a meeting or consultation with Justice Ansah about robotics, IoT, STEM training or collaboration.",
    body: `<h1>Book a meeting with ${esc(NAME)}</h1><p class="lead">Schedule a call about robotics projects, STEM training for schools, IoT work or collaboration.</p>`,
  });

  pages.push({
    route: "/wall",
    title: "Community Wall | Justice Ansah",
    description: "Leave a message for Justice Ansah on his community wall.",
    body: `<h1>Community wall</h1><p class="lead">Messages from students, colleagues and friends of ${esc(NAME)}.</p>`,
  });

  for (const p of data.posts) {
    const desc = truncate(p.excerpt || p.content || "", 158) || `A post by ${NAME}.`;
    pages.push({
      route: `/blog/${p.slug}`,
      title: `${p.title} | Justice Ansah`,
      description: desc,
      type: "article",
      image: /^https?:\/\//.test(p.featured_image_url || "") ? p.featured_image_url : undefined,
      lastmod: isoDate(p.updated_at || p.published_at),
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: p.title,
        description: desc,
        datePublished: p.published_at || undefined,
        dateModified: p.updated_at || p.published_at || undefined,
        author: personRef,
        mainEntityOfPage: `${SITE}/blog/${p.slug}`,
        keywords: (p.tags || []).join(", ") || undefined,
      },
      body: `<article>
<h1>${esc(p.title)}</h1>
<p><small>By <a href="/about">${esc(NAME)}</a>${p.published_at ? ` · ${isoDate(p.published_at)}` : ""}${p.category ? ` · ${esc(p.category)}` : ""}</small></p>
${p.content ? paragraphs(p.content) : p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ""}
</article>
<p><a href="/blog">More posts</a></p>`,
    });
  }
  return pages;
}

// ---------- head rewriting ----------
function setTag(html, re, replacement) {
  return re.test(html) ? html.replace(re, () => replacement) : html.replace("</head>", () => `    ${replacement}\n  </head>`);
}

function renderPage(template, page, data) {
  const url = `${SITE}${page.route}`;
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(page.title)}</title>`);
  html = setTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${esc(page.description)}" />`);
  html = setTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  html = setTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(page.title)}" />`);
  html = setTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(page.description)}" />`);
  html = setTag(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  html = setTag(html, /<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${page.type || "website"}" />`);
  html = setTag(html, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(page.title)}" />`);
  html = setTag(html, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(page.description)}" />`);
  if (page.image) {
    html = setTag(html, /<meta property="og:image" [^>]*>/, `<meta property="og:image" content="${esc(page.image)}" />`);
    html = setTag(html, /<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${esc(page.image)}" />`);
    html = html.replace(/\s*<meta property="og:image:(width|height|alt)"[^>]*>/g, "");
  }
  let extra = STYLE;
  if (page.jsonLd) {
    extra += `\n    <script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, "\\u003c")}</script>`;
  }
  html = html.replace("</head>", () => `    ${extra}\n  </head>`);
  html = html.replace(/<div id="root">\s*<\/div>/, () => `<div id="root">${shell(page.body, data)}</div>`);
  return html;
}

function writeSitemap(pages) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map((p) => {
      const pri = p.route === "/" ? "1.0" : p.route.startsWith("/blog/") ? "0.6" : "0.8";
      return `  <url><loc>${SITE}${p.route}</loc><lastmod>${p.lastmod || today}</lastmod><priority>${pri}</priority></url>`;
    })
    .join("\n");
  fs.writeFileSync(
    path.join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
}

function writeLlmsTxt(pages, data) {
  const lines = [
    `# ${NAME}`,
    "",
    `> ${DEFAULT_DESC}`,
    "",
    `${NAME} (justiceansah.com) is a ${TAGLINE} based in Accra, Ghana. He works as a STEM instructor and junior robotics engineer at InovTech STEM Center, mentors girls through Technovation, and builds projects in robotics, IoT, AgriTech and web development.`,
    "",
    "## Pages",
    ...pages.filter((p) => !p.route.startsWith("/blog/")).map((p) => `- [${p.title}](${SITE}${p.route}): ${p.description}`),
  ];
  if (data.projects.length) {
    lines.push("", "## Projects", ...data.projects.map((p) => `- ${p.title}: ${truncate(p.description || "", 200)}`));
  }
  const posts = pages.filter((p) => p.route.startsWith("/blog/"));
  if (posts.length) {
    lines.push("", "## Blog posts", ...posts.map((p) => `- [${p.title.replace(/ \| Justice Ansah$/, "")}](${SITE}${p.route})`));
  }
  lines.push("", "## Contact", "- Email: justiceansah@gmail.com", ...data.social.map((s) => `- ${s.platform}: ${s.url}`));
  fs.writeFileSync(path.join(DIST, "llms.txt"), lines.join("\n") + "\n");
}

// ---------- main ----------
async function main() {
  const templatePath = path.join(DIST, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.warn("[prerender] dist/index.html not found; skipping.");
    return;
  }
  // Keep a pristine copy of the SPA shell so re-running never stacks content.
  const pristine = path.join(DIST, ".spa-template.html");
  if (!fs.existsSync(pristine)) fs.copyFileSync(templatePath, pristine);
  const template = fs.readFileSync(pristine, "utf8");
  const data = await loadData();
  const pages = buildPages(data);

  for (const page of pages) {
    const html = renderPage(template, page, data);
    // "/about" -> dist/about.html, served at /about via `cleanUrls` in vercel.json.
    const out = page.route === "/" ? templatePath : path.join(DIST, `${page.route.slice(1)}.html`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
  }
  writeSitemap(pages);
  writeLlmsTxt(pages, data);
  console.log(`[prerender] Wrote ${pages.length} pages, sitemap.xml and llms.txt.`);
}

main().catch((e) => {
  // Never break the deploy because of pre-rendering.
  console.warn("[prerender] Skipped due to error:", e);
});
