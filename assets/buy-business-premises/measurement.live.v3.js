/* Visitor measurement on normal sessions; conversions only after accepted non-QA enquiries.
   Google runs in a form-free same-origin document. Form/delivery code is unchanged. */
(function (w, d) {
  'use strict';
  var current = null, started = false, measured = Object.create(null);
  var frame = null, frameReady = false, pending = [];
  var ids = { meta: '1090298970505526', openai: 'UxYskuYbQ6m4DFAF3Xj4Gt', clarity: 'yyk80juahe' };
  var origin = 'https://represent.au';
  function allowed() { return !!(w.rcMeasurement && w.rcMeasurement.allowed()); }
  function script(id, src) {
    if (d.getElementById(id)) return;
    var el = d.createElement('script'); el.id = id; el.async = true; el.src = src; d.head.appendChild(el);
  }
  function queue(name) {
    if (w[name]) return;
    var fn = function () { fn.q.push(arguments); }; fn.q = []; w[name] = fn;
  }
  function pageDetails() {
    var url = new URL('/buy-business-premises', origin), query = new URLSearchParams(w.location.search);
    ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_adgroup', 'utm_term', 'utm_content'].forEach(function (k) {
      if (query.get(k)) url.searchParams.set(k, query.get(k).slice(0, 500));
    });
    var referrer = '';
    try { var ref = new URL(d.referrer); if (/^https?:$/.test(ref.protocol)) referrer = ref.origin + ref.pathname; } catch (_) {}
    return { page_location: url.href, page_referrer: referrer, page_title: d.title };
  }
  function google(message) {
    if (!allowed()) return;
    if (frameReady && frame && frame.contentWindow) frame.contentWindow.postMessage(message, origin);
    else pending.push(message);
  }
  function start() {
    if (started || !allowed()) return;
    started = true;
    var details = pageDetails(), url = new URL('/assets/buy-business-premises/google-visitor-frame.v1.html', origin);
    url.search = new URL(details.page_location).search;
    frame = d.createElement('iframe'); frame.id = 'bbp-google-visitor-frame';
    frame.hidden = true; frame.title = 'Site measurement'; frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true'); frame.src = url.href;
    frame.onload = function () {
      if (!allowed() || !frame || !frame.contentWindow) return;
      frameReady = true;
      frame.contentWindow.postMessage({ type: 'rc-bbp-init', details: details }, origin);
      pending.splice(0).forEach(function (m) { google(m); });
    };
    d.body.appendChild(frame);
    if (!w.fbq) {
      var fb = function () { fb.callMethod ? fb.callMethod.apply(fb, arguments) : fb.queue.push(arguments); };
      fb.push = fb; fb.loaded = true; fb.version = '2.0'; fb.queue = [];
      w.fbq = fb; if (!w._fbq) w._fbq = fb;
    }
    w.fbq('set', 'autoConfig', false, ids.meta); // Before init: no automatic submit/button events.
    w.fbq('init', ids.meta); w.fbq('track', 'PageView');
    script('bbp-meta', 'https://connect.facebook.net/en_US/fbevents.js');
    queue('oaiq'); w.oaiq('init', { pixelId: ids.openai, debug: false });
    script('bbp-openai', 'https://bzrcdn.openai.com/sdk/oaiq.min.js');
    queue('clarity'); script('bbp-clarity', 'https://www.clarity.ms/tag/' + ids.clarity);
  }
  function stopGoogleForQA() {
    pending = [];
    if (frame && frame.contentWindow) frame.contentWindow.postMessage({ type: 'rc-bbp-qa-stop' }, origin);
    if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
    frame = null; frameReady = false;
    try { if (w.fbq) w.fbq('consent', 'revoke'); } catch (_) {}
  }
  w.RCBusinessPremisesMeasurement = Object.freeze({
    snapshot: function (snap) {
      current = snap;
      try {
        var attr = w.rcAttribution ? w.rcAttribution.fields() : {}, p = Object.assign({}, snap.payload);
        ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_adgroup', 'utm_term', 'utm_content', 'landing_page', 'referrer'].forEach(function (k) {
          if (typeof attr[k] === 'string' && attr[k]) p[k] = attr[k].slice(0, k === 'referrer' ? 1000 : 500);
        });
        current = Object.freeze({ id: snap.id, size: snap.size, payload: Object.freeze(p) });
      } catch (_) {}
      return current;
    },
    accepted: function (snap) {
      try {
        var gate = w.rcMeasurement, form = d.getElementById('enquiry-form'), outcome = d.getElementById('outcome-accepted');
        if (!snap || !snap.payload || !gate || !form || !form.hidden || !outcome || outcome.hidden || measured[snap.id]) return;
        if (!/^bp-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(snap.id) || snap.payload.website_submission_id !== snap.id) return;
        gate.enquiry(snap.payload);
        if (!allowed() || /\b(?:website[ _-]*qa|live[ _-]*test|test[ _-]*enquiry)\b/i.test(snap.payload.first_name || '')) { stopGoogleForQA(); return; }
        measured[snap.id] = true;
        if (!gate.once('bbp_accepted', snap.id)) return;
        start();
        google({ type: 'rc-bbp-conversion', id: snap.id, form_stream: snap.payload.form_stream,
          buyer_type: snap.payload.buyer_type, cta_location: snap.payload.cta_clicked || 'direct' });
        if (w.rcEvents) w.rcEvents.enquirySuccess(snap.payload);
        if (snap.payload.enquiry_type === 'acquisition' && w.oaiq) w.oaiq('measure', 'lead_created', { type: 'customer_action' }, { event_id: snap.id });
      } catch (_) { /* Measurement failure never changes enquiry delivery. */ }
    },
    crm: function () {}
  });
  try { start(); } catch (_) { /* Visitor tracking must never prevent form initialization. */ }
})(window, document);
