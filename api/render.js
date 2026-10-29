// Live HTML for search engines, AI tools and link previews.
//
// The site is a React app, so its raw HTML is an empty shell. This Vercel
// function builds each public page on request from live Supabase data, so new
// posts, videos and edits show up within about a minute — no redeploy needed.
// It returns the normal app shell (dist/spa-shell.html, served at /spa-shell)
// with the page's own title, description, canonical, structured data and a
// readable text version inside #root, which React replaces on load.
//
// Routed here from vercel.json as /api/render?path=<original path>.
// Any failure falls back to the plain shell, so the site never breaks.

const SITE = "https://justiceansah.com";
// Public, read-only project URL and publishable key (also shipped in the site's JS bundle).
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://gedyuhvplhezskysdacv.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZHl1aHZwbGhlenNreXNkYWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMzg1MzMsImV4cCI6MjA3MTkxNDUzM30.wwjLMmkbFL3DrIOpPuO6L_rMzXHJE7yDo_r1qvxyOEE";

const NAME = "Justice Ansah";
const TAGLINE = "Ghanaian robotics and IoT engineer and STEM educator";
const DEFAULT_DESC =
  "Justice Ansah is a Ghanaian robotics and IoT engineer, STEM educator and self-taught innovator building practical technology for education, agriculture and sustainability.";
const DEFAULT_IMAGE = `${SITE}/og-image.png`;

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

const isUrl = (u) => /^https?:\/\//.test(u || "");
const isVlog = (p) => !!(p && typeof p.featured_video_url === "string" && p.featured_video_url.trim());
const postPath = (p) => (isVlog(p) ? `/watch/${p.slug}` : `/blog/${p.slug}`);
const youTubeId = (u = "") =>
  (u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/) || [])[1];
const thumbFor = (p) =>
  isUrl(p.featured_image_url)
    ? p.featured_image_url
    : youTubeId(p.featured_video_url)
      ? `https://img.youtube.com/vi/${youTubeId(p.featured_video_url)}/hqdefault.jpg`
      : undefined;

// ---------- data ----------
async function q(path) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      signal: ctrl.signal,
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    return Array.isArray(j) ? j : [];
  } catch (e) {
    console.warn(`[render] ${path.split("?")[0]}: ${e.message}`);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

const POST_FIELDS =
  "title,slug,excerpt,category,tags,published_at,updated_at,featured_image_url,featured_video_url";

async function loadData(needs) {
  const want = new Set(needs);
  const [about, projects, posts, certs, recs, impact, social, skills] = await Promise.all([
    want.has("about") ? q("about_content?select=description,hero_description,about_description,location&limit=1") : [],
    want.has("projects")
      ? q("projects?select=title,description,category,technologies,project_url,github_url,created_at&order=created_at.desc")
      : [],
    want.has("posts") ? q(`blog_posts?select=${POST_FIELDS}&is_published=eq.true&order=published_at.desc`) : [],
    want.has("certs") ? q("certificates?select=title,issuer,issued_on,description&is_active=eq.true&order=sort_order") : [],
    want.has("recs") ? q("recommendations?select=name,position,company,message&is_active=eq.true&order=sort_order") : [],
    want.has("impact") ? q("impact_metrics?select=*&limit=1") : [],
    q("social_links?select=platform,url&is_active=eq.true&order=sort_order"),
    want.has("skills") ? q("skills?select=name&is_active=eq.true&order=sort_order") : [],
  ]);
  return {
    about: about[0] || null,
    projects,
    posts: posts.filter((p) => p.slug && /^[a-z0-9-]+$/i.test(p.slug)),
    certs,
    recs,
    impact: impact[0] || null,
    social: social.filter((s) => isUrl(s.url)),
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

// Minimal styling so the text version is readable for the moment before React loads.
const STYLE = `<style id="prerender-style">
#prerender{max-width:820px;margin:0 auto;padding:96px 20px 64px;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.65;color:#e5e7eb;background:#0b0f14}
#prerender a{color:#38bdf8}#prerender h1{font-size:2rem;line-height:1.2;margin:0 0 .5rem;color:#fff}
#prerender h2{font-size:1.25rem;margin:2rem 0 .5rem;color:#fff}#prerender nav{display:flex;flex-wrap:wrap;gap:.75rem 1.25rem;margin-bottom:2rem;font-size:.95rem}
#prerender ul{padding-left:1.2rem}#prerender .lead{font-size:1.1rem;color:#cbd5e1}
</style>`;

const shellBody = (inner, data) => {
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
          const link = isUrl(p.project_url) ? ` <a href="${esc(p.project_url)}">Visit</a>` : "";
          const code = isUrl(p.github_url) ? ` <a href="${esc(p.github_url)}">Code</a>` : "";
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
            `<li><a href="${postPath(p)}">${esc(p.title)}</a>${isVlog(p) ? " (video)" : ""}${p.published_at ? ` <small>(${isoDate(p.published_at)})</small>` : ""}${p.excerpt ? ` — ${esc(truncate(p.excerpt, 160))}` : ""}</li>`
        )
        .join("\n")}</ul>`
    : "";

const skillList = (skills) =>
  skills.length ? `<h2>Skills</h2><ul>${skills.map((s) => `<li>${esc(s.name)}</li>`).join("")}</ul>` : "";

// ---------- pages ----------
const personRef = { "@id": `${SITE}/#person` };

const STATIC_PAGES = {
  "/": {
    needs: ["about", "projects", "posts", "recs", "impact"],
    build: (d) => ({
      title: "Justice Ansah | Robotics, IoT & STEM Engineer",
      description: DEFAULT_DESC,
      body: `<h1>${esc(NAME)} — Robotics, IoT &amp; STEM Engineer</h1>
${intro(d)}
${impactList(d.impact)}
${d.projects.length ? `<h2>Selected projects</h2>${projectList(d.projects.slice(0, 6))}<p><a href="/projects">All projects</a></p>` : ""}
${d.posts.length ? `<h2>Latest posts and videos</h2>${postList(d.posts, 6)}<p><a href="/blog">All posts</a></p>` : ""}
${d.recs.length ? `<h2>What people say</h2><ul>${d.recs.map((r) => `<li>${esc(r.name)}${r.position ? `, ${esc(r.position)}` : ""}${r.company ? ` at ${esc(r.company)}` : ""}: “${esc(truncate(r.message, 300))}”</li>`).join("\n")}</ul>` : ""}`,
    }),
  },
  "/about": {
    needs: ["about", "skills", "impact"],
    build: (d) => ({
      title: "About Justice Ansah | Ghanaian Robotics & IoT Engineer",
      description:
        "About Justice Ansah: Ghanaian self-taught robotics and IoT engineer, robotics instructor at InovTech STEM Center, and innovator in AgriTech and sustainability.",
      jsonLd: { "@context": "https://schema.org", "@type": "ProfilePage", mainEntity: personRef, url: `${SITE}/about` },
      body: `<h1>About ${esc(NAME)}</h1>
${intro(d)}
${d.about?.about_description ? paragraphs(d.about.about_description) : d.about?.description ? paragraphs(d.about.description) : ""}
${skillList(d.skills)}
${impactList(d.impact)}`,
    }),
  },
  "/projects": {
    needs: ["projects"],
    build: (d) => ({
      title: "Projects | Justice Ansah — Robotics, IoT & Web",
      description:
        "Robotics, IoT and web projects by Justice Ansah, including an intelligent solar crop dryer, a STEM exam platform and a digital birth registration system for rural Ghana.",
      body: `<h1>Projects by ${esc(NAME)}</h1>
<p class="lead">Robotics, IoT and web projects built to solve real problems in education, agriculture and public services.</p>
${projectList(d.projects, true)}`,
    }),
  },
  "/blog": {
    needs: ["posts"],
    build: (d) => ({
      title: "Blog & Vlogs | Justice Ansah",
      description:
        "Articles and vlogs by Justice Ansah on robotics, STEM education, coding for kids, IoT and technology in Ghana.",
      body: `<h1>Blog &amp; vlogs by ${esc(NAME)}</h1>
<p class="lead">Writing and videos on robotics, STEM education and technology in Ghana.</p>
${postList(d.posts)}`,
    }),
  },
  "/resume": {
    needs: ["skills"],
    build: (d) => ({
      title: "Resume | Justice Ansah — Robotics Engineer & STEM Educator",
      description:
        "Resume of Justice Ansah: STEM instructor and junior robotics engineer at InovTech STEM Center, Technovation mentor, and former intern at Academic City University.",
      body: `<h1>Resume — ${esc(NAME)}</h1>
${intro(d)}
<h2>Experience</h2>
<ul>
<li>2025 – present: STEM Instructor &amp; Junior Robotics Engineer, InovTech STEM Center — robotics workshops with LEGO Mindstorms, Arduino and Avishkaar.</li>
<li>2025: Girls' mentor, Technovation — guiding girls to solve global problems with technology.</li>
<li>2024: Intern, Academic City University — helped build a plastic shredder and a 3D-printer filament extruder.</li>
</ul>
<h2>Education</h2>
<ul><li>2023: General Science (ICT), Aggrey Memorial A.M.E. Zion Senior High School</li></ul>
${skillList(d.skills)}`,
    }),
  },
  "/certificates": {
    needs: ["certs"],
    build: (d) => ({
      title: "Certificates & Awards | Justice Ansah",
      description: "Certificates, awards and recognitions earned by Justice Ansah in robotics, STEM and innovation.",
      body: `<h1>Certificates &amp; awards — ${esc(NAME)}</h1>
${d.certs.length ? `<ul>${d.certs.map((c) => `<li><strong>${esc(c.title)}</strong>${c.issuer ? ` — ${esc(c.issuer)}` : ""}${c.issued_on ? ` (${isoDate(c.issued_on)})` : ""}${c.description ? `: ${esc(truncate(c.description, 200))}` : ""}</li>`).join("\n")}</ul>` : ""}`,
    }),
  },
  "/gallery": {
    needs: [],
    build: () => ({
      title: "Gallery | Justice Ansah",
      description: "Photos of Justice Ansah's robotics workshops, STEM outreach and innovation projects in Ghana.",
      body: `<h1>Gallery — ${esc(NAME)}</h1><p class="lead">Photos from robotics workshops, STEM outreach and innovation projects across Ghana.</p>`,
    }),
  },
  "/booking": {
    needs: [],
    build: () => ({
      title: "Book a Meeting | Justice Ansah",
      description: "Book a meeting or consultation with Justice Ansah about robotics, IoT, STEM training or collaboration.",
      body: `<h1>Book a meeting with ${esc(NAME)}</h1><p class="lead">Schedule a call about robotics projects, STEM training for schools, IoT work or collaboration.</p>`,
    }),
  },
  "/wall": {
    needs: [],
    build: () => ({
      title: "Community Wall | Justice Ansah",
      description: "Leave a message for Justice Ansah on his community wall.",
      body: `<h1>Community wall</h1><p class="lead">Messages from students, colleagues and friends of ${esc(NAME)}.</p>`,
    }),
  },
};

async function loadPost(slug) {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const rows = await q(
    `blog_posts?select=${POST_FIELDS},content&is_published=eq.true&slug=eq.${encodeURIComponent(slug)}&limit=1`
  );
  return rows[0] || null;
}

function postPage(p) {
  const vlog = isVlog(p);
  const desc = truncate(p.excerpt || p.content || "", 158) || `${vlog ? "A video" : "A post"} by ${NAME}.`;
  const image = thumbFor(p);
  const url = `${SITE}${postPath(p)}`;
  const ytId = youTubeId(p.featured_video_url);
  const jsonLd = vlog
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: p.title,
        description: desc,
        thumbnailUrl: [image || DEFAULT_IMAGE],
        uploadDate: p.published_at || undefined,
        ...(ytId
          ? { embedUrl: `https://www.youtube.com/embed/${ytId}` }
          : isUrl(p.featured_video_url)
            ? { contentUrl: p.featured_video_url }
            : {}),
        author: personRef,
        publisher: personRef,
        url,
        keywords: (p.tags || []).join(", ") || undefined,
      }
    : {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: p.title,
        description: desc,
        image: image || undefined,
        datePublished: p.published_at || undefined,
        dateModified: p.updated_at || p.published_at || undefined,
        author: personRef,
        mainEntityOfPage: url,
        keywords: (p.tags || []).join(", ") || undefined,
      };
  return {
    title: `${p.title} | Justice Ansah`,
    description: desc,
    type: vlog ? "video.other" : "article",
    image,
    video: vlog && isUrl(p.featured_video_url) && !ytId ? p.featured_video_url : undefined,
    jsonLd,
    body: `<article>
<h1>${esc(p.title)}</h1>
<p><small>${vlog ? "Video" : "Post"} by <a href="/about">${esc(NAME)}</a>${p.published_at ? ` · ${isoDate(p.published_at)}` : ""}${p.category ? ` · ${esc(p.category)}` : ""}</small></p>
${vlog && p.excerpt ? `<p>${esc(stripHtml(p.excerpt))}</p>` : ""}
${!vlog && p.content ? paragraphs(p.content) : !vlog && p.excerpt ? `<p>${esc(p.excerpt)}</p>` : ""}
${vlog && p.content ? paragraphs(p.content) : ""}
</article>
<p><a href="/blog">More posts and videos</a></p>`,
  };
}

// ---------- shell ----------
let shellCache = null;
async function getShell(host) {
  if (shellCache) return shellCache;
  const hosts = [...new Set([host, "justiceansah.com"].filter(Boolean))];
  for (const h of hosts) {
    try {
      const r = await fetch(`https://${h}/spa-shell`, { headers: { "x-render-internal": "1" } });
      if (r.ok) {
        const t = await r.text();
        if (t.includes('<div id="root">')) {
          shellCache = t;
          return t;
        }
      }
    } catch {
      /* try next */
    }
  }
  throw new Error("could not load app shell");
}

function setTag(html, re, replacement) {
  return re.test(html) ? html.replace(re, () => replacement) : html.replace("</head>", () => `    ${replacement}\n  </head>`);
}

function renderHtml(shell, path, page, data) {
  const url = `${SITE}${path}`;
  let html = shell;
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
  if (page.video) extra += `\n    <meta property="og:video" content="${esc(page.video)}" />\n    <meta property="og:video:type" content="video/mp4" />`;
  if (page.noindex) extra += `\n    <meta name="robots" content="noindex" />`;
  if (page.jsonLd) {
    extra += `\n    <script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, "\\u003c")}</script>`;
  }
  html = html.replace("</head>", () => `    ${extra}\n  </head>`);
  html = html.replace(/<div id="root">\s*<\/div>/, () => `<div id="root">${shellBody(page.body, data)}</div>`);
  return html;
}

// ---------- sitemap / llms.txt ----------
async function sitemap() {
  const posts = (await q(`blog_posts?select=slug,published_at,updated_at,featured_video_url&is_published=eq.true&order=published_at.desc`)).filter(
    (p) => p.slug && /^[a-z0-9-]+$/i.test(p.slug)
  );
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...Object.keys(STATIC_PAGES).map((r) => [r, today, r === "/" ? "1.0" : "0.8"]),
    ...posts.map((p) => [postPath(p), isoDate(p.updated_at || p.published_at) || today, "0.6"]),
  ]
    .map(([r, d, pri]) => `  <url><loc>${SITE}${r}</loc><lastmod>${d}</lastmod><priority>${pri}</priority></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function llmsTxt() {
  const d = await loadData(["projects", "posts"]);
  const pages = Object.entries(STATIC_PAGES).map(([r, def]) => [r, def.build({ ...d, about: null, impact: null, recs: [], certs: [], skills: [] })]);
  const lines = [
    `# ${NAME}`,
    "",
    `> ${DEFAULT_DESC}`,
    "",
    `${NAME} (justiceansah.com) is a ${TAGLINE} based in Accra, Ghana. He works as a STEM instructor and junior robotics engineer at InovTech STEM Center, mentors girls through Technovation, and builds projects in robotics, IoT, AgriTech and web development.`,
    "",
    "## Pages",
    ...pages.map(([r, p]) => `- [${p.title}](${SITE}${r}): ${p.description}`),
  ];
  if (d.projects.length) lines.push("", "## Projects", ...d.projects.map((p) => `- ${p.title}: ${truncate(p.description || "", 200)}`));
  const articles = d.posts.filter((p) => !isVlog(p));
  const videos = d.posts.filter(isVlog);
  if (articles.length) lines.push("", "## Articles", ...articles.map((p) => `- [${p.title}](${SITE}${postPath(p)})`));
  if (videos.length) lines.push("", "## Videos", ...videos.map((p) => `- [${p.title}](${SITE}${postPath(p)})`));
  lines.push("", "## Contact", "- Email: justiceansah@gmail.com", ...d.social.map((s) => `- ${s.platform}: ${s.url}`));
  return lines.join("\n") + "\n";
}

// ---------- handler ----------
const CACHE = "public, max-age=0, s-maxage=60, stale-while-revalidate=86400";

export default async function handler(req, res) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  let path = "/";
  try {
    path = new URL(req.url, "https://x").searchParams.get("path") || "/";
  } catch {
    /* default */
  }
  path = ("/" + path.replace(/^\/+/, "")).replace(/\/+$/, "") || "/";

  try {
    if (path === "/sitemap.xml") {
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", CACHE);
      return res.status(200).send(await sitemap());
    }
    if (path === "/llms.txt") {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", CACHE);
      return res.status(200).send(await llmsTxt());
    }

    const shell = await getShell(host);
    let page;
    let data;
    let status = 200;

    const m = path.match(/^\/(blog|watch)\/([^/]+)$/);
    if (m) {
      const post = await loadPost(m[2]);
      if (post) {
        const canonical = postPath(post);
        if (canonical !== path) {
          // e.g. /blog/<video> -> /watch/<video>, /watch/<article> -> /blog/<article>
          res.setHeader("Cache-Control", CACHE);
          res.setHeader("Location", canonical);
          return res.status(301).end();
        }
        data = await loadData([]);
        page = postPage(post);
      } else {
        data = await loadData([]);
        status = 404;
        page = {
          title: "Not found | Justice Ansah",
          description: DEFAULT_DESC,
          noindex: true,
          body: `<h1>Page not found</h1><p><a href="/blog">See all posts and videos</a></p>`,
        };
      }
    } else if (STATIC_PAGES[path]) {
      const def = STATIC_PAGES[path];
      data = await loadData(def.needs);
      page = def.build(data);
    } else {
      // Unknown route: plain app shell, let React handle it.
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", CACHE);
      return res.status(200).send(shell);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", status === 200 ? CACHE : "public, max-age=0, s-maxage=30");
    return res.status(status).send(renderHtml(shell, path, page, data));
  } catch (e) {
    console.error("[render] failed:", e);
    // Last resort: send the visitor to the static app shell so the site keeps working.
    try {
      const shell = await getShell(host);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).send(shell);
    } catch {
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Location", "/spa-shell");
      return res.status(302).end();
    }
  }
}
