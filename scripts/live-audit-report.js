const fs = require("fs");
const path = require("path");

const reportsDir = path.join(process.cwd(), "reports");
const lighthousePath = path.join(reportsDir, "lighthouse.json");
const staticAuditPath = path.join(reportsDir, "seo-audit.md");
const reportPath = path.join(reportsDir, "weekly-site-audit.md");
const summaryPath = path.join(reportsDir, "audit-summary.json");
const thresholds = {
  performance: 85,
  accessibility: 90,
  "best-practices": 90,
  seo: 90
};

fs.mkdirSync(reportsDir, { recursive: true });

let scores = {};
let opportunities = [];
let lighthouseError = "";

try {
  const lhr = JSON.parse(fs.readFileSync(lighthousePath, "utf8"));
  for (const [key, threshold] of Object.entries(thresholds)) {
    scores[key] = Math.round((lhr.categories[key]?.score ?? 0) * 100);
  }
  opportunities = Object.values(lhr.audits || {})
    .filter((audit) => audit.score !== null && audit.score < 1 && audit.title)
    .sort((a, b) => (Number(b.numericValue) || 0) - (Number(a.numericValue) || 0))
    .slice(0, 10)
    .map((audit) => `- ${audit.title}: ${audit.displayValue || audit.description || "Review in Lighthouse report."}`);
} catch (error) {
  lighthouseError = `Lighthouse report was not available or could not be parsed: ${error.message}`;
  scores = { performance: 0, accessibility: 0, "best-practices": 0, seo: 0 };
}

const failing = Object.entries(thresholds)
  .filter(([key, threshold]) => (scores[key] ?? 0) < threshold)
  .map(([key, threshold]) => `${key}: ${scores[key] ?? 0} (target ${threshold}+)`);

const staticAudit = fs.existsSync(staticAuditPath)
  ? fs.readFileSync(staticAuditPath, "utf8")
  : "Static SEO audit did not run.";

const scoreRows = Object.entries(thresholds)
  .map(([key, threshold]) => `| ${key} | ${scores[key] ?? "n/a"} | ${threshold}+ |`)
  .join("\n");

const report = `# Weekly Website SEO & Performance Audit

URL: https://dirtydumpshaulingco.com

Generated: ${new Date().toISOString()}

## Lighthouse scores

| Category | Score | Target |
| --- | ---: | ---: |
${scoreRows}

${lighthouseError ? `## Lighthouse error\n\n${lighthouseError}\n` : ""}

## Problems found

${failing.length ? failing.map((item) => `- ${item}`).join("\n") : "- No Lighthouse score thresholds failed."}

## Suggested fixes

${opportunities.length ? opportunities.join("\n") : "- Keep monitoring mobile performance, accessibility, metadata, and contact paths."}

## Static SEO/content audit

${staticAudit}
`;

fs.writeFileSync(reportPath, report);
fs.writeFileSync(summaryPath, JSON.stringify({ scores, thresholds, failing, issueNeeded: failing.length > 0 || Boolean(lighthouseError) }, null, 2));
console.log(report);
