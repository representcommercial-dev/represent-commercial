/* Delivery integration candidate. No transport is installed or enabled by this factory.
   No analytics, browser storage, automatic retries or CRM-only retry interface. */
(function () {
  'use strict';
  function create(options) {
    var o = options || {}, core = o.core, request = o.fetch;
    var ready = o.enabled === true && typeof request === 'function' && core &&
      /^https:\/\//.test(o.origin || '') && (o.allowedOrigins || []).indexOf(o.origin) >= 0 &&
      /^[a-f0-9-]{36}$/i.test(o.accessKey || '');
    var attempts = new Map();
    var allowed = ['first_name', 'email', 'phone', 'property_type', 'preferred_location',
      'budget', 'timing', 'requirement', 'form_stream', 'enquiry_service',
      'website_submission_id', 'cta_clicked', 'service_line', 'enquiry_type',
      'intent_family', 'buyer_type', 'gclid', 'utm_source', 'utm_medium', 'utm_campaign',
      'utm_adgroup', 'utm_term', 'utm_content', 'landing_page', 'referrer'];
    function pick(snapshot) {
      var p = {};
      allowed.forEach(function (k) { if (typeof snapshot.payload[k] === 'string') p[k] = snapshot.payload[k]; });
      return p;
    }
    // Timeout covers response headers AND body. A late response never starts CRM intake.
    function post(url, payload, ms, keepalive) {
      var controller = typeof AbortController === 'function' ? new AbortController() : null;
      var timer;
      var network = Promise.resolve().then(function () {
        return request(url, { method: 'POST', credentials: 'omit', redirect: 'error',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload), signal: controller ? controller.signal : undefined,
          keepalive: !!keepalive });
      }).then(function (r) {
        return r.text().then(function (body) {
          return { kind: 'response', status: r.status,
            contentType: r.headers.get('content-type') || '', bodyText: body };
        });
      }).catch(function () { return { kind: 'network-error' }; });
      var timeout = new Promise(function (resolve) {
        timer = setTimeout(function () {
          if (controller) controller.abort();
          resolve({ kind: 'timeout' });
        }, ms);
      });
      return Promise.race([network, timeout]).then(function (raw) { clearTimeout(timer); return raw; });
    }
    function reportCrm(raw) {
      var body = null;
      try { if (/^application\/json\b/i.test(raw.contentType || '')) body = JSON.parse(raw.bodyText); } catch (_) {}
      // Even ok:true is not proof that all contact fields were updated.
      var outcome = raw.kind === 'response' && raw.status >= 200 && raw.status < 300 &&
        body && body.ok === true && body.ignored !== true ? 'accepted' : 'unconfirmed';
      try { if (typeof o.onCrmResult === 'function') o.onCrmResult({ outcome: outcome }); } catch (_) {}
    }
    function send(snapshot) {
      if (!ready) return Promise.resolve({ kind: 'disabled' });
      if (!snapshot || !snapshot.payload || !core.ID_RX.test(snapshot.id) ||
        snapshot.payload.website_submission_id !== snapshot.id) return Promise.resolve({ kind: 'invalid-snapshot' });
      var payload = pick(snapshot), signature = JSON.stringify(payload), previous = attempts.get(snapshot.id);
      if (previous) {
        if (previous.signature !== signature) return Promise.resolve({ kind: 'snapshot-mismatch' });
        if (previous.accepted) return Promise.resolve(previous.accepted);
        if (previous.pending) return previous.pending;
      }
      var entry = previous || { signature: signature, pending: null, accepted: null, crmStarted: false };
      attempts.set(snapshot.id, entry);
      var email = Object.assign({}, payload, { access_key: o.accessKey,
        subject: 'Buy Your Premises brief, Represent Commercial',
        from_name: 'Represent Commercial Website', name: payload.first_name,
        replyto: payload.email, botcheck: '' });
      entry.pending = post('https://api.web3forms.com/submit', email, o.emailTimeoutMs || 18000, false)
        .then(function (raw) {
          entry.pending = null;
          if (core.classify(raw) === 'accepted') {
            entry.accepted = raw;
            if (!entry.crmStarted) {
              entry.crmStarted = true;
              var crm = Object.assign({}, payload, { opportunity_type: 'Owner-Occupier Acquisition' });
              // Separate bounded request. Its failure cannot unset email acceptance or resend email.
              post(o.origin + '/api/website-lead', crm, o.crmTimeoutMs || 15000, true).then(reportCrm);
            }
          }
          return raw;
        });
      return entry.pending;
    }
    return Object.freeze({ mode: 'delivery-candidate', ready: !!ready, connected: !!ready, send: send });
  }
  window.RCEnquiryDeliveryFactory = Object.freeze({ create: create });
})();
