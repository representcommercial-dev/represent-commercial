// Cloudflare Pages Function — POST /api/referral
// Receives the agents referral form JSON and emails a branded HTML copy of the
// reciprocal referral agreement to referrals@represent.au AND the agent.
//
// Zero-build: no npm dependencies, so Cloudflare Pages serves the site with no
// build step. Requires only the environment secret RESEND_API_KEY and a domain
// verified in Resend (represent.au).

const ACCEPTANCE_TEXT =
  'Ticking the acceptance box creates a reciprocal referral agreement: the referring agent refers the ' +
  'management of the property below to Represent Commercial, and Represent Commercial commits to referring ' +
  'any future sale or new leasing of this property back to the agent. This excludes lease renewals, rent ' +
  'reviews, and options with existing tenants, which remain part of Represent Commercial\u2019s management ' +
  'role. No fee is payable either way. This agreement records the date and time of acceptance and takes ' +
  'effect on submission.';

const DISCLAIMER =
  'The referral agreement is a mutual commitment to refer business and does not create an agency, ' +
  'partnership, or fee obligation between the parties. It does not oblige any property owner to appoint ' +
  'either party. Represent Commercial \u2014 REIQ Corporate Licence 4949809.';

export async function onRequestGet() {
  // Health check: if you see this JSON in a browser, the Function is deployed.
  // If you see a 405 instead, functions/ is NOT at the served root (fix the deploy layout).
  return json({ ok: true, endpoint: 'referral', ready: true }, 200);
}

export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();

    const name = (data.name || '').trim();
    const email = (data.email || '').trim();
    const property = (data.property_address || '').trim();
    if (!name || !email || !property || data.accepted !== true) {
      return json({ error: 'Missing required fields.' }, 422);
    }

    const acceptedAt = data.accepted_at || new Date().toISOString();
    const html = buildAgreementHtml({ ...data, name, email, property, acceptedAt });

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Represent Commercial <referrals@represent.au>',
        to: ['referrals@represent.au', email],
        reply_to: 'referrals@represent.au',
        subject: `Referral agreement — ${property}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text();
      return json({ error: 'Email send failed', detail }, 502);
    }

    return json({ ok: true }, 200);
  } catch (err) {
    return json({ error: 'Server error', detail: String(err) }, 500);
  }
}

// ─────────────────────────────────────────────────────────────

function buildAgreementHtml(d) {
  const rows = [];
  const row = (k, v) => { if (v) rows.push([k, v]); };

  const partiesRows = [
    ['Referring agent', esc(d.name) + (d.agency ? ',&nbsp; ' + esc(d.agency) : '')],
    ['Agent email', esc(d.email)],
  ];
  if (d.phone) partiesRows.push(['Agent phone', esc(d.phone)]);

  const propertyRows = [['Address', esc(d.property)]];
  if (d.current_rent) propertyRows.push(['Current gross rent', esc(d.current_rent)]);

  const ownerRows = [];
  row('Owner / entity', d.owner_name);
  row('Contact', d.owner_contact_name);
  row('Owner mobile', d.owner_mobile);
  row('Owner email', d.owner_email);
  // rows[] now holds owner rows
  const ownerData = rows.map(([k, v]) => [k, esc(v)]);

  const accepted = new Date(d.acceptedAt).toUTCString();

  const section = (title, pairs) => pairs.length ? `
    <tr><td style="padding:26px 40px 6px;">
      <div style="font:600 12px/1 'Barlow Condensed',Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#004225;border-bottom:1px solid #EDE9DF;padding-bottom:10px;">
        <span style="display:inline-block;width:16px;height:2px;background:#C9A84C;vertical-align:middle;margin-right:8px;"></span>${title}
      </div>
    </td></tr>
    ${pairs.map(([k, v]) => `
    <tr><td style="padding:8px 40px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="150" style="font:700 13px/1.5 Arial,sans-serif;color:#556158;vertical-align:top;">${k}</td>
        <td style="font:400 14px/1.5 Arial,sans-serif;color:#0E1A14;">${v}</td>
      </tr></table>
    </td></tr>`).join('')}` : '';

  return `<!DOCTYPE html>
<html><body style="margin:0;background:#F7F5F0;padding:24px 0;">
<table role="presentation" align="center" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E6E1D6;border-radius:14px;overflow:hidden;font-family:Arial,sans-serif;">
  <tr><td style="background:#004225;padding:24px 40px;">
    <div style="font:700 22px/1 'Barlow Condensed',Arial,sans-serif;letter-spacing:.04em;color:#fff;">REPRESENT</div>
    <div style="font:600 8px/1 Arial,sans-serif;letter-spacing:.35em;color:#D4C5A9;margin-top:4px;">C O M M E R C I A L</div>
    <div style="font:400 11px/1.4 Arial,sans-serif;color:#C9A84C;margin-top:14px;letter-spacing:.08em;text-transform:uppercase;">Reciprocal Referral Agreement</div>
  </td></tr>
  <tr><td style="height:3px;background:#C9A84C;"></td></tr>

  ${section('Parties', partiesRows)}
  ${section('Property', propertyRows)}
  ${section('Owner', ownerData)}
  ${d.notes ? `
  <tr><td style="padding:26px 40px 6px;">
    <div style="font:600 12px/1 'Barlow Condensed',Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#004225;border-bottom:1px solid #EDE9DF;padding-bottom:10px;">
      <span style="display:inline-block;width:16px;height:2px;background:#C9A84C;vertical-align:middle;margin-right:8px;"></span>Notes
    </div>
  </td></tr>
  <tr><td style="padding:8px 40px 0;font:400 14px/1.6 Arial,sans-serif;color:#0E1A14;">${esc(d.notes)}</td></tr>` : ''}

  <tr><td style="padding:26px 40px 6px;">
    <div style="font:600 12px/1 'Barlow Condensed',Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#004225;border-bottom:1px solid #EDE9DF;padding-bottom:10px;">
      <span style="display:inline-block;width:16px;height:2px;background:#C9A84C;vertical-align:middle;margin-right:8px;"></span>Terms of agreement
    </div>
  </td></tr>
  <tr><td style="padding:12px 40px 0;">
    <div style="background:#F4F1E8;border-left:3px solid #C9A84C;border-radius:8px;padding:16px 18px;font:400 13px/1.6 Arial,sans-serif;color:#3E4A42;">${ACCEPTANCE_TEXT}</div>
  </td></tr>
  <tr><td style="padding:20px 40px 0;">
    <div style="font:700 11px/1 Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#C9A84C;">Accepted electronically</div>
    <div style="font:700 15px/1.4 Arial,sans-serif;color:#004225;margin-top:6px;">${accepted}</div>
    <div style="font:400 12px/1.4 Arial,sans-serif;color:#6b7770;margin-top:2px;">Between ${esc(d.name)} and Represent Commercial Pty Ltd.</div>
  </td></tr>

  <tr><td style="padding:24px 40px 0;font:400 10px/1.6 Arial,sans-serif;color:#9A958A;">${DISCLAIMER}</td></tr>

  <tr><td style="height:2px;background:#C9A84C;margin-top:20px;"></td></tr>
  <tr><td style="background:#002D18;padding:18px 40px;">
    <div style="font:700 12px/1.4 Arial,sans-serif;color:#fff;">Represent Commercial Pty Ltd</div>
    <div style="font:400 11px/1.5 Arial,sans-serif;color:#b8c4be;">referrals@represent.au &nbsp;·&nbsp; represent.au &nbsp;·&nbsp; REIQ Corporate Licence 4949809</div>
  </td></tr>
</table>
</body></html>`;
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
