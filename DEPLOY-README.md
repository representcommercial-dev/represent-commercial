# Deploy — Represent Commercial (Cloudflare Pages)

## Repo layout (IMPORTANT)
Commit the **contents** of this package to the **repo root** — do NOT nest them in a
`website/` subfolder. Cloudflare Pages finds `functions/` only at the project root.

```
<repo root>/
├─ index.html
├─ about.html  services.html  tools.html  referrals.html  referrals-agents.html
├─ calculator.html  management-estimator.html  contact.html  listings.html
├─ styles.css   nav.js
├─ images, favicons, og-default.jpg, robots.txt, sitemap.xml, llms.txt, _headers
└─ functions/
    └─ api/
        └─ referral.js      ← the /api/referral endpoint (must be at repo root/functions)
```

## Cloudflare Pages settings (Settings → Builds & deployments)
- **Root directory:** *(empty)*  — the repo root
- **Build command:** *(empty)*
- **Build output directory:** `/`
- **Framework preset:** None

With this, a deploy log shows:
`Found Functions directory at /functions. Uploading.` and `✨ Compiled Worker successfully`.

## Environment variable (Settings → Variables and Secrets, Production)
- `RESEND_API_KEY` = your Resend key (`re_...`)

## Verify after deploy
1. Visit `https://represent.au/api/referral` → should return
   `{"ok":true,"endpoint":"referral","ready":true}` (NOT the homepage).
2. Submit a test referral at `/referrals-agents.html` → success screen; email arrives to
   referrals@ and the agent.

If `/api/referral` shows the homepage, `functions/` is not at the repo root — fix the layout above.

See `SETUP-referral-endpoint.md` for the Resend + Google Workspace alias setup.
