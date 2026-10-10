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
const GHL_OPPORTUNITIES_VERSION = 'v3';

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
  currentAgent: 'GgatUG6PjGGGQQHhGviX',

  // Buyer qualification (Opportunity-level TEXT fields)
  acquisitionBudgetBand: 'vhG5ctIOildZP0ApkB0B',      // opportunity.acquisition_budget_band
  acquisitionTiming: 'jYi6lbL8NIU6nIXNtqdO',          // opportunity.acquisition_timing
  preferredAcquisitionArea: 'YMZqyBx7BvZtRCOx81r8',   // opportunity.preferred_acquisition_area
  propertyIdentified: 'rUbRxCVCrp4Y9AjrM53q'          // opportunity.property_identified
};

// Review streams enrich the Contact before creating/reusing an intake Opportunity.
// Preserve the existing first-touch fields and per-submission enquiry notes.
const REVIEW_STREAMS = {
  'commercial-property-performance-review': {
    leadOffer: 'Property Performance Review',
    intentFamily: 'Owner Performance',
    noteTitle: 'Commercial Property Performance Review: website submission'
  }
};

// Contact-level fields (confirmed in HighLevel, 6 October 2026). Resolved to IDs at runtime
// from GET /locations/{id}/customFields?model=contact by fieldKey, then by exact name.
// The contact write API has no native GCLID property. Store the captured click ID
// in Website First-touch GCLID; native HighLevel attribution is left untouched.
const CONTACT_FIELDS = {
  leadOffer:              { key: 'contact.lead_offer',               name: 'Lead Offer' },
  intentFamily:           { key: 'contact.intent_family',            name: 'Intent Family' },
  originalEnquiry:        { key: 'contact.original_enquiry',         name: 'Original Enquiry' },
  websitePropertyAddress: { key: 'contact.website_property_address', name: 'Website Property Address' },
  propertyStatus:         { key: 'contact.property_status',          name: 'Property Status' },
  gclid:                  { key: 'contact.website_firsttouch_gclid', name: 'Website First-touch GCLID' },
  utmSource:              { key: 'contact.utm_source',               name: 'UTM Source' },
  utmMedium:              { key: 'contact.utm_medium',               name: 'UTM Medium' },
  utmCampaign:            { key: 'contact.utm_campaign',             name: 'UTM Campaign' },
  utmAdGroup:             { key: 'contact.utm_ad_group',             name: 'UTM Ad Group' },
  utmTerm:                { key: 'contact.utm_term',                 name: 'UTM Term' },
  utmContent:             { key: 'contact.utm_content',              name: 'UTM Content' },
  landingPage:            { key: 'contact.landing_page',             name: 'Landing Page' },
  ctaClicked:             { key: 'contact.cta_clicked',              name: 'CTA Clicked' },
  originalReferrer:       { key: 'contact.original_referrer',        name: 'Original Referrer' },
  formStream:             { key: 'contact.form_stream',              name: 'Form Stream' },
  enquiryService:         { key: 'contact.enquiry_service',          name: 'Enquiry Service' },
  websiteSubmissionId:    { key: 'contact.website_submission_id',    name: 'Website Submission ID' }
};

// First-touch fields: written only while empty on the contact, so a repeat
// submission never overwrites the original concern or the original source.
const FILL_IF_EMPTY = ['originalEnquiry', 'gclid', 'utmSource', 'utmMedium', 'utmCampaign',
  'utmAdGroup', 'utmTerm', 'utmContent', 'landingPage', 'originalReferrer'];

let contactFieldCache = null;

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

    const firstName = clean(data.first_name, 100);
    const lastName = clean(data.last_name, 100);
    const name = clean(data.name || [firstName, lastName].filter(Boolean).join(' '), 200);
    const email = clean(data.email, 320).toLowerCase();
    const phone = clean(data.phone, 80);
    if (!email && !phone) return json({ ok: false, error: 'Email or phone is required.' }, 422);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: 'Invalid email address.' }, 422);
    }

    const reviewStream = REVIEW_STREAMS[clean(data.form_stream, 200)];
    const route = reviewStream ? ROUTES.pm : routeFor(data.service_line, data.enquiry_service);
    if (!route) return json({ ok: false, error: 'Unsupported service line.' }, 422);

    const submissionId = clean(data.website_submission_id, 128);
    if (!submissionId || !/^[A-Za-z0-9._-]+$/.test(submissionId)) {
      return json({ ok: false, error: 'Website submission ID is required.' }, 422);
    }

    const propertyAddress = clean(data.property_address || data.address || data.property, 500);
    const propertyStatus = clean(data.property_status || data.owner_situation, 500);
    const enquiryService = reviewStream ? 'Commercial Property Performance Review' : clean(data.enquiry_service, 300) || route.serviceLine;
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
        // Separate first/last name where the form collects them; single-name forms are unchanged.
        ...(firstName || lastName
          ? { firstName: firstName || undefined, lastName: lastName || undefined }
          : { name: name || undefined }),
        email: email || undefined,
        phone: phone || undefined,
        createNewIfDuplicateAllowed: false
      }
    });
    if (!contactRes.ok || !contactRes.data || !contactRes.data.contact || !contactRes.data.contact.id) {
      return json({ ok: false, error: 'CRM contact upsert failed.', upstream_status: contactRes.status }, 502);
    }
    const contactId = contactRes.data.contact.id;

    if (reviewStream) {
      const enrichment = await reviewContactHandoff(env, data, reviewStream, {
        contactId,
        contactCreated: contactRes.data.new === true,
        submissionId,
        propertyAddress,
        propertyStatus,
        enquiryService,
        enquiryDetail
      });
      if (!enrichment.ok) return enrichment;
    }

    const existing = await findExistingOpportunity(env, {
      contactId,
      route,
      submissionId,
      propertyAddress,
      enquiryService,
      formStream: clean(data.form_stream, 200)
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
    addField(fields, CF.nextAction, reviewStream ? 'Contact owner and arrange Commercial Property Performance Review' : 'Review website enquiry and make contact');

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

    // Buyer-side only: Preliminary Acquisition Brief payload names
    if (route === ROUTES.buyer) {
      addField(fields, CF.acquisitionBudgetBand, clean(data.budget, 200));
      addField(fields, CF.acquisitionTiming, clean(data.timing, 200));
      addField(fields, CF.preferredAcquisitionArea, clean(data.preferred_location, 500));
      addField(fields, CF.propertyIdentified, clean(data.property_identified, 50));
    }

    const oppName = buildOpportunityName(enquiryService, propertyAddress, name);
    const oppRes = await ghl('/opportunities/', env, {
      method: 'POST',
      version: GHL_OPPORTUNITIES_VERSION,
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

async function reviewContactHandoff(env, data, stream, ctx) {
  const resolved = await resolveContactFields(env);
  const refs = {};
  const unresolved = [];
  for (const k of Object.keys(CONTACT_FIELDS)) {
    if (resolved.map[k]) refs[k] = { id: resolved.map[k] };
    else {
      refs[k] = { key: CONTACT_FIELDS[k].key.replace(/^contact\./, '') };
      unresolved.push(CONTACT_FIELDS[k].key);
    }
  }

  const current = await ghl('/contacts/' + encodeURIComponent(ctx.contactId), env, { method: 'GET' });
  // Never treat an unreadable existing contact as empty: that could overwrite first touch.
  if (!current.ok || !current.data || !current.data.contact || !Array.isArray(current.data.contact.customFields)) {
    return json({ ok: false, error: 'CRM contact lookup failed; original attribution was not updated.', contact_id: ctx.contactId, upstream_status: current.status }, 502);
  }
  const existing = {};
  const cfs = current.ok && current.data && current.data.contact && Array.isArray(current.data.contact.customFields)
    ? current.data.contact.customFields : [];
  for (const f of cfs) {
    if (!f || !f.id) continue;
    const v = f.value !== undefined ? f.value : (f.fieldValue !== undefined ? f.fieldValue : f.field_value);
    existing[f.id] = v === undefined || v === null ? '' : String(v);
  }

  // Idempotency: a retried handoff for the same submission writes nothing further.
  if (refs.websiteSubmissionId.id && existing[refs.websiteSubmissionId.id] === ctx.submissionId) {
    return json({
      ok: true,
      contact_id: ctx.contactId,
      contact_enriched: true,
      opportunity_created: false,
      duplicate_controlled: true
    }, 200);
  }

  // Owner's concern verbatim: no trimming or reformatting, length cap only.
  const concernRaw = data.owner_concern === undefined || data.owner_concern === null ? '' : String(data.owner_concern);
  const concern = concernRaw.trim() ? concernRaw.slice(0, 10000) : '';

  const values = {
    leadOffer: stream.leadOffer,
    intentFamily: stream.intentFamily,
    originalEnquiry: concern,
    websitePropertyAddress: ctx.propertyAddress,
    propertyStatus: ctx.propertyStatus,
    gclid: clean(data.gclid, 500),
    utmSource: clean(data.utm_source, 500),
    utmMedium: clean(data.utm_medium, 500),
    utmCampaign: clean(data.utm_campaign, 500),
    utmAdGroup: clean(data.utm_adgroup, 500),
    utmTerm: clean(data.utm_term, 500),
    utmContent: clean(data.utm_content, 500),
    landingPage: clean(data.landing_page, 500),
    ctaClicked: clean(data.cta_clicked, 500),
    originalReferrer: clean(data.referrer, 1000),
    formStream: clean(data.form_stream, 500),
    enquiryService: ctx.enquiryService,
    websiteSubmissionId: ctx.submissionId
  };

  const customFields = [];
  const preserved = [];
  for (const k of Object.keys(values)) {
    const v = values[k];
    if (v === undefined || v === null || String(v) === '') continue;
    const ref = refs[k];
    if (FILL_IF_EMPTY.includes(k) && ref.id && String(existing[ref.id] || '').trim() !== '') {
      preserved.push(CONTACT_FIELDS[k].key);
      continue;
    }
    customFields.push(Object.assign({}, ref, { field_value: k === 'originalEnquiry' ? v : String(v).trim() }));
  }

  // Contact Source is the standard contact-level roll-up. The granular platform
  // remains in UTM Source. Fill Source only while empty, using any established
  // first-touch UTM source rather than a later submission's campaign.
  const updateBody = { customFields };
  const contact = current.data.contact;
  if (!clean(contact.source, 500)) {
    const savedSource = refs.utmSource.id && existing[refs.utmSource.id];
    updateBody.source = deriveOriginalLeadSource(savedSource
      ? { utm_source: savedSource, gclid: (refs.gclid.id && existing[refs.gclid.id]) || contact.gclid || '' }
      : data);
  }

  const upd = await ghl('/contacts/' + encodeURIComponent(ctx.contactId), env, {
    method: 'PUT',
    body: updateBody
  });
  if (!upd.ok) {
    return json({ ok: false, error: 'CRM contact field update failed.', contact_id: ctx.contactId, upstream_status: upd.status }, 502);
  }

  // Per-submission note keeps the full Website Enquiry Detail, including later concerns.
  const noteLines = [stream.noteTitle, 'Website Submission ID: ' + ctx.submissionId];
  if (ctx.propertyAddress) noteLines.push('Property address: ' + ctx.propertyAddress);
  if (ctx.propertyStatus) noteLines.push('Property status: ' + ctx.propertyStatus);
  if (concern) noteLines.push('', 'Owner concern (verbatim):', concern);
  const note = await ghl('/contacts/' + encodeURIComponent(ctx.contactId) + '/notes', env, {
    method: 'POST',
    body: { body: noteLines.join('\n').slice(0, 20000) }
  });

  return json({
    ok: true,
    contact_id: ctx.contactId,
    contact_created: ctx.contactCreated,
    contact_enriched: true,
    opportunity_created: false,
    fields_written: customFields.length,
    first_touch_preserved: preserved,
    unresolved_fields: unresolved,
    note_created: note.ok === true
  }, ctx.contactCreated ? 201 : 200);
}

async function resolveContactFields(env) {
  const loc = env.GHL_LOCATION_ID;
  if (contactFieldCache && contactFieldCache.loc === loc && Date.now() - contactFieldCache.at < 600000) {
    return contactFieldCache;
  }
  const res = await ghl('/locations/' + encodeURIComponent(loc) + '/customFields?model=contact', env, { method: 'GET' });
  const list = res.ok && res.data && Array.isArray(res.data.customFields) ? res.data.customFields : null;
  const map = {};
  if (list) {
    for (const k of Object.keys(CONTACT_FIELDS)) {
      const def = CONTACT_FIELDS[k];
      const hit = list.find(f => f && f.fieldKey === def.key) ||
        list.find(f => f && normal(f.name) === normal(def.name) && (!f.model || f.model === 'contact'));
      if (hit && hit.id) map[k] = hit.id;
    }
    contactFieldCache = { loc, at: Date.now(), map };
    return contactFieldCache;
  }
  return { loc, at: 0, map };
}

async function findExistingOpportunity(env, opts) {
  const qs = new URLSearchParams({
    locationId: env.GHL_LOCATION_ID,
    pipelineId: opts.route.pipelineId,
    contactId: opts.contactId,
    ...(REVIEW_STREAMS[opts.formStream] ? {} : { status: 'open' }),
    limit: '100'
  });
  const res = await ghl('/opportunities/search?' + qs.toString(), env, { method: 'GET', version: GHL_OPPORTUNITIES_VERSION });
  if (!res.ok || !res.data || !Array.isArray(res.data.opportunities)) {
    if (REVIEW_STREAMS[opts.formStream]) throw new Error('Could not verify existing review opportunities; creation deferred.');
    return null;
  }

  for (const opp of res.data.opportunities) {
    const values = fieldMap(opp.customFields || []);
    if (values[CF.websiteSubmissionId] === opts.submissionId) return opp;

    const sameProperty = opts.propertyAddress &&
      normal(values[CF.websitePropertyAddress]) === normal(opts.propertyAddress);
    const sameService = normal(values[CF.enquiryService]) === normal(opts.enquiryService);
    if (sameProperty && sameService && (!REVIEW_STREAMS[opts.formStream] || opp.status === 'open')) return opp;
  }
  return null;
}

async function ghl(path, env, options) {
  const init = {
    method: options.method || 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + env.GHL_PRIVATE_INTEGRATION_TOKEN,
      'Version': options.version || GHL_VERSION
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
  if (src.includes('linkedin')) return 'LinkedIn';
  if (src.includes('youtube')) return 'YouTube';
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
    else if (typeof f.value === 'string') out[f.id] = f.value;
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
