# Go-live guide — Agents referral form → PDF agreement email

This wires `/referrals/agents` so that on acceptance a branded PDF agreement is emailed to
**referrals@represent.au** and to the agent. Your site is a **Cloudflare Pages** project
(`represent-commercial`, repo `representcommercial-dev/represent-commercial`, domain represent.au),
so this uses a **Pages Function** at `/api/referral`.

Nothing in the website pages needs to change — the form already POSTs the right JSON.

---

## What's already in the repo

```
<repo root>/
├─ index.html, referrals.html, referrals-agents.html, ...   ← your site
├─ functions/
│   └─ api/
│       └─ referral.js      ← the backend endpoint (POST /api/referral)
└─ package.json             ← tells Cloudflare to install pdf-lib
```

**Critical:** `functions/` and `package.json` must sit at the **root of the folder Cloudflare Pages
builds from** — the same level as `index.html`. If they're nested in a subfolder, Cloudflare won't
find them and the endpoint returns 404.
(If your Pages project has a *Root directory* set under Settings → Builds & deployments, "root" means
that directory.)

---

## Step 1 — Resend account + verify your domain (~10 min, mostly DNS)

Resend is the service that actually sends the email with the PDF attached.

1. Go to resend.com and sign up (free tier is fine to start — 3,000 emails/month, 100/day).
2. In the Resend dashboard: **Domains → Add Domain** → enter `represent.au`.
3. Resend shows a set of DNS records to add (typically 3): one **MX**, one **TXT (SPF)**,
   and one or more **TXT (DKIM)**. Keep this tab open.
4. In another tab open **Cloudflare → represent.au → DNS → Records** (the same panel you've used before).
5. For each record Resend lists, click **Add record** in Cloudflare and copy it across exactly:
   - Match **Type** (MX / TXT), **Name**, and **Value** precisely.
   - **Important:** set **Proxy status to "DNS only" (grey cloud)** for these — do not proxy mail records.
   - Leave TTL on Auto.
6. Back in Resend, click **Verify**. It can take a few minutes (occasionally up to an hour) for DNS to
   propagate. When all records show green/verified, you can send from `@represent.au`.
7. **API key:** Resend → **API Keys → Create API Key** (name it e.g. "represent-pages",
   permission "Sending access"). Copy the key now — you can't see it again. It looks like `re_...`.

---

## Step 2 — Give Cloudflare the API key (secret)

1. Cloudflare dashboard → **Workers & Pages → represent-commercial → Settings**.
2. Scroll to **Variables and Secrets** (a.k.a. Environment variables).
3. **Add variable:**
   - Name: `RESEND_API_KEY`
   - Value: the `re_...` key from Step 1.7
   - Click **Encrypt** so it's stored as a secret.
   - Add it to **Production** (and **Preview** too if you test on preview URLs).
4. Save.

The Function reads this as `env.RESEND_API_KEY`. Without it, submissions return a 502 and the
agent sees the "something went wrong" message.

---

## Step 3 — Receive your copy via Google Workspace

Your represent.au mailboxes are on **Google Workspace**, which already owns your inbound MX records.
So you do **NOT** use Cloudflare Email Routing — that would conflict with Google and break your mail.
Instead, just make sure `referrals@represent.au` is a real, deliverable address in Google:

**Option A — alias on your existing mailbox (simplest):**
1. Google **Admin console** (admin.google.com) → **Directory → Users** → open your user (e.g. Nick).
2. **Add alternate email (alias)** → `referrals@represent.au` → Save.
   Mail to referrals@ now lands in your existing inbox. Propagation is usually minutes.

**Option B — dedicated user / shared inbox:**
- Create a new user `referrals@represent.au`, or a **Google Group** with that address and yourself as a
  member (good if more than one person should see referrals). Either works.

That's all for receiving — no Cloudflare Email Routing, no root MX changes.

> Note on DNS: in Step 1, only add the records Resend gives you. Do **not** touch or remove your existing
> Google MX records. If Resend asks for an **SPF** record on the root and you already have a Google SPF
> (`v=spf1 include:_spf.google.com ~all`), **merge** them into one record
> (`v=spf1 include:_spf.google.com include:amazonses.com ~all`) — never create a second SPF TXT.
> Most current Resend setups place SPF on a `send.represent.au` subdomain, so this usually won't arise.

---

## Step 4 — Push and deploy

1. Commit the three items to the repo (at root level as shown above):
   `functions/api/referral.js`, `package.json`, and the updated site pages.
2. Push to the `representcommercial-dev/represent-commercial` branch Pages builds from
   (the one shown in your Pages project — likely `main`).
3. Cloudflare Pages auto-builds: it runs `npm install` (pulling in `pdf-lib`), bundles the Function,
   and publishes. Watch the deployment in **Workers & Pages → represent-commercial → Deployments**.
4. When the deployment is **Success**, the endpoint is live at
   `https://represent.au/api/referral`.

---

## Step 5 — Test it

1. Open `https://represent.au/referrals/agents`.
2. Fill in a real email you can check as the "Your email" field, a property address, tick the box, submit.
3. Expected: button shows "Sending…", then the success screen appears.
4. Within seconds, **both** referrals@represent.au (→ your inbox) and the test email receive a message
   with `Referral-Agreement-<property>.pdf` attached.

---

## If something goes wrong

- **Success screen never appears / "something went wrong":** open Cloudflare → represent-commercial →
  the latest deployment → **Functions** tab → **Real-time Logs**, then submit again and read the error.
  - `Email send failed` (502) → the Resend key is missing/wrong, or the domain isn't verified yet.
  - 404 on `/api/referral` → `functions/` or `package.json` isn't at the repo root Pages builds from.
- **Email doesn't arrive but logs say ok:** check spam; confirm `referrals@represent.au` exists in Google
  Workspace (alias or user, Step 3); confirm the DKIM/SPF records in Step 1 are all verified in Resend
  (unverified domains get filtered).
- **PDF looks wrong:** it's generated in `functions/api/referral.js` (`buildAgreementPdf`) — send me a
  sample and I'll adjust.

---

## Notes

- **Cost:** Cloudflare Pages Functions and Resend both have free tiers that comfortably cover this volume.
- **Fonts:** the PDF uses a clean standard typeface (Helvetica-family) to keep it simple; brand colours,
  logo lockup and layout match the site. True Barlow/Cormorant/DM Sans embedding is possible later with
  the TTF/OTF files.
- **Switching providers:** only the `fetch('https://api.resend.com/emails', …)` block is Resend-specific.
