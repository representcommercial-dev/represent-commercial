// Cloudflare Pages Function — POST /api/website-lead
// Secure server-side handoff from confirmed website enquiries into HighLevel.
// The browser still uses Web3Forms for enquiry email delivery. After Web3Forms
// confirms success, the page posts a non-secret payload here for CRM creation.
//
// Required Preview/Production environment variables:
//   GHL_PRIVATE_INTEGRATION_TOKEN (Secret)
//   GHL_LOCATION_ID (Text or Secret)

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';

const ROUTES = {
  pm: {
    serviceLine: 'Property Management & Leasing',
    pipelineId: 'REUXHKTWrVxrvnx7ilkY',
    stageId: 'c3f152a3-142e-4869-8e8c-a2596976679b',
    defaultOpportunityType: 'Property Review / Advisory'
  },
  buyer: {
    serviceLine: 'Buyer-Side Acquisition / Advisory',
    pipelineId: 'v8z9NrC8f37OZypoEpHj',
    stageId: '80b9f2d7-ab8a-4892-9be5-d6878b9dbb86',
    defaultOpportunityType: 'Acquisition Advisory'
  },
  tenant: {
    serviceLine: 'Commercial Tenant Representation',
    pipelineId: 'KUfwo1AWriKvXhaCxXdy',
    stageId: '6087d9be-4b4b-4c3a-af4c-04f57520e845',
    defaultOpportunityType: 'New Lease Search'
  }
};

const CF = {
  serviceLine: 'rInWdBTszGKja9Yzlu6e',
  originalLeadSource: '7p1YG0kK6hAQhN0fkKd1',
  campaignSourceDetail: 'VerhhwmV5X2zqdBSe5KE',
  opportunityType: 'mGb2HAFSgpuAtnY84Dtt',
  enquiryReceivedTimestamp: 'oAELbnXH5pU5SSsVhYoJ',
  nextAction: '3AfFwYI37lANyEBK1tL6',

  gclid: 'zTDJ9XVob0hNHsZeyKGF',
  utmSource: '3TU0EGLKAZWRhAqCP9SQ',
  utmMedium: 'XIOPyxUtJPeiU2n9DnDX',
  utmCampaign: 'cEPrijYs2t4MHP2glwF2',
  utmAdGroup: 'HOZ8TWOFSE6g74LWyo2A',
  utmTerm: '574uBMwTho0kd6U2ZHkY',
  utmContent: 'bkovS2za6tFPSBrIDU10',
  landingPage: 'YmhqCCMU145Vtmrbrqu2',
  formStream: 'rmnCsL58EePstE4CYePo',
  enquiryService: 'gbsSuGaJLVUhxmhOvXeU',
  ctaClicked: 'bHL6jo0HsnUeAOr9a5gr',
  referrer: 'Q5QdNAnojA2KUjGy84da',
  websiteSubmissionId: 'ZEOPYBowxYLCAhwkV6qN',

  websitePropertyAddress: 'aWcZGSnaUeHcieurAxSP',
  propertyStatus: 'yYlNpGzcjjADqaHcg1ww',
  websiteEnquiryDetail: 'v5a3MDmy65a6YetZPOW4',
  currentAgent: 'GgatUG6PjGGGQQHhGviX'
};

export async function onRequestGet({ env }) {
  return json({
    ok: true,
    endpoint: 'website-lead',
    deployed: true,
    ghl_token_configured: Boolean(env && env.GHL_PRIVATE_INTEGRATION_TOKEN),
    ghl_location_configured: Boolean(env && env.GHL_LOCATION_ID)
  }, 200);
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env || !env.GHL_PRIVATE_INTEGRATION_TOKEN || !env.GHL_LOCATION_ID) {
      return json({ ok: false, error: 'CRM handoff is not configured.' }, 503);
    }

    const data = await request.json();
    if (clean(data.botcheck, 200)) return json({ ok: true, ignored: true }, 200);

    const name = clean(data.name || [data.first_name, data.last_name].filter(Boolean).join(' '), 200);
    const email = clean(data.email, 320).toLowerCase();
    const phone = clean(data.phone, 80);
    if (!email && !phone) return json({ ok: false, error: 'Email or phone is required.' }, 422);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: 'Invalid email address.' }, 422);
    }

    const route = routeFor(data.service_line, data.enquiry_service);
    if (!route) return json({ ok: false, error: 'Unsupported service line.' }, 422);

    const submissionId = clean(data.website_submission_id, 128);
    if (!submissionId || !/^[A-Za-z0-9._-]+$/.test(submissionId)) {
      return json({ ok: false, error: 'Website submission ID is required.' }, 422);
    }

    const propertyAddress = clean(data.property_address || data.address || data.property, 500);
    const propertyStatus = clean(data.property_status || data.owner_situation, 500);
    const enquiryService = clean(data.enquiry_service, 300) || route.serviceLine;
    const currentAgent = clean(data.current_agent, 300);
    const enquiryDetail = buildEnquiryDetail(data);
    const originalLeadSource = deriveOriginalLeadSource(data);
    const campaignDetail = buildCampaignDetail(data);
    const opportunityType = deriveOpportunityType(data, route);
    const receivedAt = new Date().toISOString();

    const contactRes = await ghl('/contacts/upsert', env, {
      method: 'POST',
      body: {
        locationId: env.GHL_LOCATION_ID,
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        createNewIfDuplicateAllowed: false
      }
    });
    if (!contactRes.ok || !contactRes.data || !contactRes.data.contact || !contactRes.data.contact.id) {
      return json({ ok: false, error: 'CRM contact upsert failed.', upstream_status: contactRes.status }, 502);
    }
    const contactId = contactRes.data.contact.id;

    const existing = await findExistingOpportunity(env, {
      contactId,
      route,
      submissionId,
      propertyAddress,
      enquiryService
    });
    if (existing) {
      return json({
        ok: true,
        contact_id: contactId,
        opportunity_id: existing.id,
        opportunity_created: false,
        duplicate_controlled: true
      }, 200);
    }

    const fields = [];
    addField(fields, CF.serviceLine, route.serviceLine);
    addField(fields, CF.originalLeadSource, originalLeadSource);
    addField(fields, CF.campaignSourceDetail, campaignDetail);
    addField(fields, CF.opportunityType, opportunityType);
    addField(fields, CF.enquiryReceivedTimestamp, receivedAt);
    addField(fields, CF.nextAction, 'Review website enquiry and make contact');

    addField(fields, CF.gclid, clean(data.gclid, 500));
    addField(fields, CF.utmSource, clean(data.utm_source, 500));
    addField(fields, CF.utmMedium, clean(data.utm_medium, 500));
    addField(fields, CF.utmCampaign, clean(data.utm_campaign, 500));
    addField(fields, CF.utmAdGroup, clean(data.utm_adgroup, 500));
    addField(fields, CF.utmTerm, clean(data.utm_term, 500));
    addField(fields, CF.utmContent, clean(data.utm_content, 500));
    addField(fields, CF.landingPage, clean(data.landing_page, 500));
    addField(fields, CF.formStream, clean(data.form_stream, 500));
    addField(fields, CF.enquiryService, enquiryService);
    addField(fields, CF.ctaClicked, clean(data.cta_clicked, 500));
    addField(fields, CF.referrer, clean(data.referrer, 1000));
    addField(fields, CF.websiteSubmissionId, submissionId);

    addField(fields, CF.websitePropertyAddress, propertyAddress);
    addField(fields, CF.propertyStatus, propertyStatus);
    addField(fields, CF.websiteEnquiryDetail, enquiryDetail);
    addField(fields, CF.currentAgent, currentAgent);

    const oppName = buildOpportunityName(enquiryService, propertyAddress, name);
    const oppRes = await ghl('/opportunities/', env, {
      method: 'POST',
      body: {
        locationId: env.GHL_LOCATION_ID,
        pipelineId: route.pipelineId,
        pipelineStageId: route.stageId,
        status: 'open',
        contactId,
        name: oppName,
        customFields: fields
      }
    });
    if (!oppRes.ok || !oppRes.data || !oppRes.data.opportunity || !oppRes.data.opportunity.id) {
      return json({ ok: false, error: 'CRM opportunity creation failed.', upstream_status: oppRes.status }, 502);
    }

    return json({
      ok: true,
      contact_id: contactId,
      contact_created: contactRes.data.new === true,
      opportunity_id: oppRes.data.opportunity.id,
      opportunity_created: true,
      pipeline: route.serviceLine
    }, 201);
  } catch (err) {
    return json({ ok: false, error: 'CRM handoff error.', detail: String(err && err.message ? err.message : err) }, 500);
  }
}

async function findExistingOpportunity(env, opts) {
  const qs = new URLSearchParams({
    locationId: env.GHL_LOCATION_ID,
    pipelineId: opts.route.pipelineId,
    contactId: opts.contactId,
    status: 'open',
    limit: '100'
  });
  const res = await ghl('/opportunities/search?' + qs.toString(), env, { method: 'GET' });
  if (!res.ok || !res.data || !Array.isArray(res.data.opportunities)) return null;

  for (const opp of res.data.opportunities) {
    const values = fieldMap(opp.customFields || []);
    if (values[CF.websiteSubmissionId] === opts.submissionId) return opp;

    const sameProperty = opts.propertyAddress &&
      normal(values[CF.websitePropertyAddress]) === normal(opts.propertyAddress);
    const sameService = normal(values[CF.enquiryService]) === normal(opts.enquiryService);
    if (sameProperty && sameService) return opp;
  }
  return null;
}

async function ghl(path, env, options) {
  const init = {
    method: options.method || 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + env.GHL_PRIVATE_INTEGRATION_TOKEN,
      'Version': GHL_VERSION
    }
  };
  if (options.body) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(options.body);
  }

  const res = await fetch(GHL_BASE + path, init);
  let data = null;
  try { data = await res.json(); } catch (e) {}
  return { ok: res.ok, status: res.status, data };
}

function routeFor(serviceLine, enquiryService) {
  const s = normal(serviceLine + ' ' + enquiryService);
  if (s.includes('tenant representation')) return ROUTES.tenant;
  if (s.includes('buyer') || s.includes('acquisition')) return ROUTES.buyer;
  if (s.includes('property management') || s.includes('leasing') || s.includes('performance review')) return ROUTES.pm;
  return null;
}

function deriveOriginalLeadSource(d) {
  const src = normal(d.utm_source);
  if (clean(d.gclid, 500) || src.includes('google')) return 'Google';
  if (src.includes('facebook') || src.includes('instagram') || src.includes('meta')) return 'Meta';
  if (src.includes('chatgpt') || src.includes('openai')) return 'ChatGPT';
  if (src.includes('realcommercial')) return 'RealCommercial';
  return 'Direct / Organic';
}

function deriveOpportunityType(d, route) {
  const requested = clean(d.opportunity_type, 200);
  const allowed = [
    'Management + Leasing', 'Leasing Only', 'Management Only', 'Property Review / Advisory',
    'Owner-Occupier Acquisition', 'Investor Acquisition', 'Acquisition Advisory',
    'Due Diligence / Negotiation', 'New Lease Search', 'Relocation',
    'Renewal / Renegotiation', 'Expansion / Contraction', 'Other'
  ];
  return allowed.includes(requested) ? requested : route.defaultOpportunityType;
}

function buildCampaignDetail(d) {
  const parts = [];
  if (clean(d.utm_source, 200)) parts.push('source=' + clean(d.utm_source, 200));
  if (clean(d.utm_medium, 200)) parts.push('medium=' + clean(d.utm_medium, 200));
  if (clean(d.utm_campaign, 300)) parts.push('campaign=' + clean(d.utm_campaign, 300));
  if (clean(d.utm_adgroup, 300)) parts.push('adgroup=' + clean(d.utm_adgroup, 300));
  if (clean(d.utm_term, 300)) parts.push('term=' + clean(d.utm_term, 300));
  return parts.join(' | ').slice(0, 1000);
}

function buildEnquiryDetail(d) {
  const rows = [];
  const put = (label, value) => {
    const v = clean(value, 1500);
    if (v) rows.push(label + ': ' + v);
  };
  put('Concern / requirement', d.owner_concern || d.message || d.requirement);
  put('Owner situation', d.owner_situation);
  put('Property status', d.property_status);
  put('Current agent', d.current_agent);
  put('Listing URL', d.listing_url);
  put('Lease expiry', d.lease_expiry);
  put('Currently marketed', d.currently_marketed);
  return rows.join('\n').slice(0, 5000);
}

function buildOpportunityName(enquiryService, propertyAddress, name) {
  const left = enquiryService || 'Website Enquiry';
  const right = propertyAddress || name || 'New lead';
  return (left + ' | ' + right).slice(0, 200);
}

function addField(arr, id, value) {
  if (value !== undefined && value !== null && String(value).trim() !== '') {
    arr.push({ id, fieldValue: String(value).trim() });
  }
}

function fieldMap(fields) {
  const out = {};
  for (const f of fields || []) {
    if (!f || !f.id) continue;
    if (typeof f.fieldValueString === 'string') out[f.id] = f.fieldValueString;
    else if (typeof f.fieldValue === 'string') out[f.id] = f.fieldValue;
  }
  return out;
}

function clean(value, max) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, max || 1000);
}

function normal(value) {
  return clean(value, 2000).toLowerCase().replace(/\s+/g, ' ');
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
