import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const source = await readFile(new URL('../functions/api/website-lead.js', import.meta.url), 'utf8');
const submission = {
  form_stream: 'commercial-property-performance-review',
  first_name: 'Integration', last_name: 'Test', email: 'test@example.com',
  website_submission_id: 'submission-1', property_address: 'Test property',
  property_status: 'Vacant', owner_concern: 'Review the leasing strategy',
  gclid: 'test-click', utm_source: 'google'
};
const ids = {
  submission: 'ZEOPYBowxYLCAhwkV6qN', property: 'aWcZGSnaUeHcieurAxSP',
  service: 'gbsSuGaJLVUhxmhOvXeU', gclid: 'zTDJ9XVob0hNHsZeyKGF'
};
function opportunity(status, sameId = false) {
  return { id: 'existing-opportunity', status, customFields: [
    { id: ids.submission, fieldValue: sameId ? 'submission-1' : 'older-submission' },
    { id: ids.property, fieldValue: 'Test property' },
    { id: ids.service, fieldValue: 'Commercial Property Performance Review' }
  ] };
}
async function run(options = {}) {
  const { onRequestPost } = await import('data:text/javascript;base64,' +
    Buffer.from(source + '\n// ' + Math.random()).toString('base64'));
  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const path = new URL(url).pathname;
    const body = init.body ? JSON.parse(init.body) : null;
    calls.push({ url, path, method: init.method, body });
    let data;
    let status = 200;
    if (path === '/contacts/upsert') data = { contact: { id: 'test-contact' }, new: true };
    else if (path.endsWith('/customFields')) data = { customFields: [
      { id: 'contact-submission', fieldKey: 'contact.website_submission_id' },
      { id: 'original-enquiry', fieldKey: 'contact.original_enquiry' },
      { id: 'contact-gclid', fieldKey: 'contact.website_firsttouch_gclid' }
    ] };
    else if (path === '/contacts/test-contact' && init.method === 'GET') data = { contact: {
      source: 'Original source', customFields: [
        { id: 'original-enquiry', value: 'Original concern' },
        { id: 'contact-gclid', value: 'original-click' },
        ...(options.enriched ? [{ id: 'contact-submission', value: 'submission-1' }] : [])
      ]
    } };
    else if (path === '/contacts/test-contact' && init.method === 'PUT') {
      status = options.enrichmentFailure ? 502 : 200;
      data = {};
    } else if (path.endsWith('/notes')) data = {};
    else if (path === '/opportunities/search') {
      status = options.lookupFailure ? 502 : 200;
      data = { opportunities: options.opportunities || [] };
    } else if (path === '/opportunities/' && init.method === 'POST') {
      status = options.creationFailure ? 502 : 201;
      data = { opportunity: { id: 'new-opportunity' } };
    } else if (path === '/opportunities/existing-opportunity') data = {};
    else throw new Error('Unexpected request: ' + init.method + ' ' + url);
    return new Response(JSON.stringify(data), { status });
  };
  try {
    const response = await onRequestPost({
      env: { GHL_LOCATION_ID: 'test-location', GHL_PRIVATE_INTEGRATION_TOKEN: 'mock-only' },
      request: new Request('https://example.com/api/website-lead', {
        method: 'POST', body: JSON.stringify({ ...submission, ...options.payload })
      })
    });
    return { status: response.status, body: await response.json(), calls };
  } finally { globalThis.fetch = originalFetch; }
}
const creates = r => r.calls.filter(c => c.path === '/opportunities/' && c.method === 'POST');

test('Performance Review creates in the initial PM stage and preserves contact first touch', async () => {
  const r = await run();
  assert.equal(r.status, 201);
  assert.equal(r.body.opportunity_created, true);
  assert.equal(creates(r).length, 1);
  const body = creates(r)[0].body;
  assert.equal(body.pipelineId, 'REUXHKTWrVxrvnx7ilkY');
  assert.equal(body.pipelineStageId, 'c3f152a3-142e-4869-8e8c-a2596976679b');
  assert.equal(body.status, 'open');
  assert.equal(body.contactId, 'test-contact');
  assert.ok(body.customFields.some(f => f.id === ids.submission && f.fieldValue === 'submission-1'));
  assert.ok(body.customFields.some(f => f.id === ids.gclid && f.fieldValue === 'test-click'));
  const update = r.calls.find(c => c.path === '/contacts/test-contact' && c.method === 'PUT').body;
  assert.ok(!update.customFields.some(f => ['original-enquiry', 'contact-gclid'].includes(f.id)));
  assert.equal(update.source, undefined);
});
test('retry after contact enrichment still recovers a missing opportunity', async () => {
  const r = await run({ enriched: true });
  assert.equal(r.body.opportunity_created, true);
  assert.equal(creates(r).length, 1);
  assert.ok(!r.calls.some(c => c.path.endsWith('/notes')));
});
for (const status of ['open', 'won', 'lost']) {
  test('same submission reuses an ' + status + ' opportunity', async () => {
    const r = await run({ enriched: true, opportunities: [opportunity(status, true)] });
    assert.equal(r.body.opportunity_id, 'existing-opportunity');
    assert.equal(creates(r).length, 0);
  });
}
test('new submission reuses open property/service match without moving its stage', async () => {
  const r = await run({ opportunities: [opportunity('open')] });
  assert.equal(r.body.opportunity_id, 'existing-opportunity');
  assert.equal(creates(r).length, 0);
  assert.ok(!r.calls.some(c => c.body && c.body.pipelineStageId && c.method === 'PUT'));
});
test('new submission creates when property/service match is closed', async () => {
  const r = await run({ opportunities: [opportunity('lost')] });
  assert.equal(creates(r).length, 1);
});
test('failed lookup defers creation rather than risk a duplicate', async () => {
  const r = await run({ lookupFailure: true });
  assert.equal(r.body.ok, false);
  assert.equal(creates(r).length, 0);
});
test('failed enrichment stops before opportunity intake', async () => {
  const r = await run({ enrichmentFailure: true });
  assert.equal(r.status, 502);
  assert.ok(!r.calls.some(c => c.path.startsWith('/opportunities')));
});
test('failed opportunity creation is reported as a failure', async () => {
  const r = await run({ creationFailure: true });
  assert.equal(r.status, 502);
  assert.equal(r.body.ok, false);
});
test('Before You Buy stays contact-only', async () => {
  const r = await run({ payload: { form_stream: 'before-you-buy-pilot' } });
  assert.equal(r.body.ok, true);
  assert.equal(r.body.opportunity_created, false);
  assert.ok(!r.calls.some(c => c.path.startsWith('/opportunities')));
});
