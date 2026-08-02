# Go-live guide — Agents referral form → email agreement

The form at `/referrals/agents` POSTs its JSON to `/api/referral`. That endpoint
(`functions/api/referral.js`) emails a branded copy of the reciprocal referral agreement to
**referrals@represent.au** and to the agent.

Your site is a **Cloudflare Pages** project (`represent-commercial`, repo
`representcommercial-dev/represent-commercial`, domain represent.au). This is a **zero-build**
setup — no npm, no `package.json`, no build step — so the whole folder deploys as static files
plus one Pages Function.

---

## What's in the package

```
<root>/
├─ index.html, referrals.html, referrals-agents.html, tools.html, services.html, ...
├─ styles.css, images, robots.txt, sitemap.xml, llms.txt, _headers
└─ functions/
    └─ api/
        └─ referral.js      ← POST /api/referral (emails the agreement)
```

**Critical:** `functions/` must sit at the **root of what Cloudflare Pages serves** — the same
level as `index.html`. In Pages, set **Build command: (empty)** and **Build output directory** to the
folder that contains `index.html`. (This is what the earlier failed deploy got wrong.)

---

## Step 1 — Google Workspace alias (receiving)

Your represent.au mail is on Google Workspace, so create `referrals@` there — **not** Cloudflare
Email Routing (that would clash with Google's MX).

1. admin.google.com → **Directory → Users** → open your user (e.g. Nick).
2. **Add alternate email (alias)** → `referrals` → Save.
   Mail to referrals@represent.au now lands in that inbox. (Or use a dedicated user / Google Group.)

---

## Step 2 — Resend (sending)

1. Sign up at resend.com (any login email). Free tier is fine.
2. **Domains → Add Domain** → `represent.au`.
3. Add the DNS records Resend gives you (usually a `send.` subdomain MX + SPF, and a
   `resend._domainkey` DKIM TXT) in **Cloudflare → represent.au → DNS**, set to **DNS only (grey cloud)**.
   - Do **not** touch your existing Google MX. If Resend asks for a root SPF and Google's already
     exists, **merge** into one record — never two SPF TXT records.
4. Click **Verify** in Resend (a few minutes).
5. **API Keys → Create API Key** (label e.g. `represent-pages`). Copy the `re_...` value.

---

## Step 3 — Cloudflare secret

1. **Workers & Pages → represent-commercial → Settings → Variables and Secrets**.
2. Select **Production**. **Add variable:** name `RESEND_API_KEY`, value the `re_...` key, click **Encrypt**.
3. Save. (Env vars apply on the **next** deployment.)

---

## Step 4 — Deploy

Push the folder contents to the repo root (or direct-upload the folder). Confirm Pages **Build output
directory** points at the folder holding `index.html`, **Build command** is empty, **Framework preset**
is None. Deploy. The endpoint goes live at `https://represent.au/api/referral`.

---

## Step 5 — Test

1. Open `https://represent.au/referrals/agents`.
2. Submit with a real "Your email", a property address, tick the box.
3. Success screen appears; within seconds both referrals@ and the agent email receive the branded
   agreement.

---

## Troubleshooting

- **Site shows raw/gibberish text:** wrong **Build output directory** — point it at the folder with
  `index.html`, redeploy.
- **"Something went wrong" on submit:** Pages → latest deployment → **Functions → Real-time Logs**,
  submit again, read the error.
  - `Email send failed` (502) → `RESEND_API_KEY` missing/wrong, or domain not verified yet.
  - 404 on `/api/referral` → `functions/` isn't at the served root.
- **No email but logs say ok:** check spam; confirm the alias (Step 1) and that Resend DKIM/SPF are verified.

---

## Notes

- **PDF attachment:** this build emails an HTML agreement (no attachment) to stay build-free. A PDF
  version can be added later with a vendored PDF library.
- **Switching providers:** only the `fetch('https://api.resend.com/emails', …)` block is Resend-specific.
