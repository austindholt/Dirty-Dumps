const fs = require("fs");
const path = require("path");

const root = process.cwd();
const siteUrl = "https://dirtydumpshaulingco.com";
const reportDir = path.join(root, "reports");
const reportPath = path.join(reportDir, "seo-audit.md");
const pages = [];
const findings = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "reports") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name.endsWith(".html")) pages.push(full);
  }
}

function rel(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function add(file, issue, detail) {
  findings.push({ file: rel(file), issue, detail });
}

function checkLocalLink(file, href) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
  if (/^(https?:)?\/\//.test(href)) return;
  const withoutHash = href.split("#")[0];
  if (!withoutHash) return;
  const base = path.dirname(file);
  const target = path.resolve(base, withoutHash);
  const candidates = [target, path.join(target, "index.html")];
  if (!candidates.some((candidate) => fs.existsSync(candidate))) {
    add(file, "Broken local link", href);
  }
}

walk(root);

for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1];
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  const h1s = [...html.matchAll(/<h1[\s\S]*?>([\s\S]*?)<\/h1>/gi)].map((m) => cleanText(m[1].replace(/<[^>]+>/g, "")));
  const ctaCount = (html.match(/Get a Free Quote|Send Quote Request|Book|Send Photos|Start .*Quote/gi) || []).length;

  if (!title) add(file, "Missing title", "Add a unique local title tag.");
  if (title && (title.length < 25 || title.length > 70)) add(file, "Title length", `${title.length} chars: ${title}`);
  if (!description) add(file, "Missing meta description", "Add a unique search-result description.");
  if (description && (description.length < 70 || description.length > 170)) add(file, "Meta description length", `${description.length} chars.`);
  if (!canonical || !canonical.startsWith(siteUrl)) add(file, "Missing/invalid canonical", canonical || "none");
  if (h1s.length !== 1) add(file, "H1 count", `${h1s.length} H1 tags found.`);
  if (!ctaCount) add(file, "Missing CTA", "Add a visible quote/contact CTA.");
  if (!/Boise|Meridian|Nampa|Caldwell|Eagle|Kuna|Star|Treasure Valley/i.test(html)) add(file, "Weak local relevance", "No primary service area term found.");

  for (const img of html.matchAll(/<img\b([^>]+)>/gi)) {
    if (!/\salt=["'][^"']+["']/.test(img[1])) add(file, "Missing image alt text", img[0]);
  }

  for (const link of html.matchAll(/\shref=["']([^"']+)["']/gi)) {
    checkLocalLink(file, link[1]);
  }

  for (const script of html.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(script[1]);
    } catch (error) {
      add(file, "Invalid JSON-LD", error.message);
    }
  }
}

if (!fs.existsSync(path.join(root, "robots.txt"))) findings.push({ file: "robots.txt", issue: "Missing robots.txt", detail: "Add crawler guidance." });
if (!fs.existsSync(path.join(root, "sitemap.xml"))) findings.push({ file: "sitemap.xml", issue: "Missing sitemap.xml", detail: "Add canonical URLs." });

fs.mkdirSync(reportDir, { recursive: true });
const rows = findings.length
  ? findings.map((item) => `| ${item.file} | ${item.issue} | ${item.detail.replaceAll("|", "\\|")} |`).join("\n")
  : "| All pages | No blocking issues found | Keep reviewing copy, CTAs, and service-area accuracy. |";

const report = `# Dirty Dumps Weekly SEO Audit

Generated: ${new Date().toISOString()}

Pages checked: ${pages.length}

| File | Issue | Detail |
| --- | --- | --- |
${rows}

## Human review reminders

- Confirm any public phone number before adding call/text CTAs.
- Confirm hours, address, insurance/licensing claims, and Google Business Profile before publishing them.
- Keep service-area pages useful and unique; avoid doorway pages that only swap city names.
- Photos and clear access details should stay central to the quote flow.
`;

fs.writeFileSync(reportPath, report);
console.log(report);
