# Dirty Dumps Hauling Co. LLC Landing Page

Simple static GitHub Pages landing page for Dirty Dumps Hauling Co. LLC.

## Included

- `index.html` - one-page landing page and the GitHub Pages entry file
- `quote/index.html` - focused quote request page
- `services/*/index.html` - static service landing pages
- `CNAME` - custom domain configuration for `dirtydumpshaulingco.com`
- `robots.txt` - basic crawler guidance
- `sitemap.xml` - canonical page URL for search engines
- `.nojekyll` - keeps GitHub Pages serving static files directly
- `.github/workflows/weekly-seo-audit.yml` - weekly static SEO audit report
- `scripts/seo-audit.js` - no-dependency local SEO/content audit script
- `assets/site.css` - shared styles for service and quote pages
- `assets/quote.js` - shared Formspree quote form confirmation/error handling
- `assets/logo.png` - main logo
- `assets/logo-display.png` - optimized display logo used on the page
- `assets/social-share.png` - Open Graph/social sharing preview image
- `assets/promo-square.png` - square promotional graphic
- `assets/cover-wide.png` - wide banner / cover graphic
- `assets/favicon.png` - favicon

## Contact and social links

- Email: dirtydumpshaulingco@gmail.com
- Instagram: https://www.instagram.com/dirtydumpshaulingco/?hl=en
- Facebook: https://www.facebook.com/profile.php?id=61588967134368
- Nextdoor: https://nextdoor.com/page/dirty-dumps-hauling-co?share_platform=10&utm_campaign=1778139532807&share_action_id=d45abfc2-8a3a-4b5c-892f-e46fa3151ce6

## Quote form

The quote form submits directly to Formspree:

`https://formspree.io/f/xbdwkbjv`

The static form does not upload photos directly. Customers are prompted to paste a shared photo link or send photos by follow-up email or social message after submitting.

## Local SEO maintenance

Run the static audit manually:

```sh
npm run seo:audit
```

The audit writes `reports/seo-audit.md` and checks for common static-site issues:

- Missing or weak title/meta descriptions
- Missing canonical URLs
- Missing H1 or missing visible CTAs
- Missing image alt text
- Broken local links
- Weak local service-area mentions
- Invalid JSON-LD blocks

GitHub Actions also runs the same audit weekly on Mondays at 15:00 UTC and uploads the report as an artifact. The workflow does not publish content changes automatically.

Before adding new public business details, confirm them first:

- Public business phone number for call/text CTAs
- Hours
- Public address
- Google Business Profile link
- Any licensing, insurance, awards, guarantees, or review/rating claims

## Adding pages safely

- Add service pages under `services/service-name/index.html`.
- Give each page a unique title, description, H1, helpful service copy, FAQ, and quote CTA.
- Link related services together.
- Add the new URL to `sitemap.xml`.
- Avoid duplicate city pages that only swap location names.

## Deploy on GitHub Pages

1. Use `main` as the source branch.
2. Use `/` root as the publishing folder.
3. Keep `index.html` at the repository root.
4. Keep `CNAME` set to `dirtydumpshaulingco.com`.
