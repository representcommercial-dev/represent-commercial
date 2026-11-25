/* Page-specific accepted-enquiry measurement. No vendor SDK before acceptance.
   Delivery, validation and the shared production scripts remain unchanged. */
(function (w, d) {
  'use strict';
  var current = null, started = false, measured = Object.create(null);
  var ids = { ads: 'AW-18457265873', ga4: 'G-D0RB6DF7H3',
    meta: '1090298970505526', openai: 'UxYskuYbQ6m4DFAF3Xj4Gt', clarity: 'yyk80juahe' };

  function script(id, src) {
    if (d.getElementById(id)) return;
    var el = d.createElement('script');
    el.id = id; el.async = true; el.src = src;
    d.head.appendChild(el);
  }
  function queue(name) {
    if (w[name]) return;
    var fn = function () { fn.q.push(arguments); };
    fn.q = []; w[name] = fn;
  }
  function start() {
    if (started) return;
    started = true;
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () {
      var m = w.rcMeasurement;
      if (!m || !m.allowed()) return;
      if (arguments[0] === 'event') {
        var details = arguments[2] || {};
        // Only the explicit accepted enquiry may enter Google measurement here.
        if (arguments[1] !== 'buyer_agency_form_submit' || !m.event(arguments[1], details)) return;
        arguments[2] = details;
      }
      w.dataLayer.push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', ids.ads, { send_page_view: false });
    w.gtag('config', ids.ga4, { send_page_view: false });
    script('bbp-google', 'https://www.googletagmanager.com/gtag/js?id=' + ids.ads);

    if (!w.fbq) {
      var fb = function () { fb.callMethod ? fb.callMethod.apply(fb, arguments) : fb.queue.push(arguments); };
      fb.push = fb; fb.loaded = true; fb.version = '2.0'; fb.queue = [];
      w.fbq = fb; if (!w._fbq) w._fbq = fb;
    }
    // Opt out before init; do not let automatic button/form events count as enquiries.
    w.fbq('set', 'autoConfig', false, ids.meta);
    w.fbq('init', ids.meta);
    script('bbp-meta', 'https://connect.facebook.net/en_US/fbevents.js');

    queue('oaiq');
    w.oaiq('init', { pixelId: ids.openai, debug: false });
    script('bbp-openai', 'https://bzrcdn.openai.com/sdk/oaiq.min.js');
    queue('clarity');
    script('bbp-clarity', 'https://www.clarity.ms/tag/' + ids.clarity);
  }

  w.RCBusinessPremisesMeasurement = Object.freeze({
    snapshot: function (snap) {
      current = snap;
      try {
        var attr = w.rcAttribution ? w.rcAttribution.fields() : {};
        var p = Object.assign({}, snap.payload);
        ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_adgroup',
          'utm_term', 'utm_content', 'landing_page', 'referrer'].forEach(function (k) {
          if (typeof attr[k] === 'string' && attr[k]) p[k] = attr[k].slice(0, k === 'referrer' ? 1000 : 500);
        });
        current = Object.freeze({ id: snap.id, size: snap.size, payload: Object.freeze(p) });
      } catch (_) { /* Attribution must not prevent delivery. */ }
      return current;
    },
    accepted: function (snap) {
      try {
        var gate = w.rcMeasurement, form = d.getElementById('enquiry-form');
        var outcome = d.getElementById('outcome-accepted');
        // The unchanged controller calls this only after confirmed Web3Forms success.
        // Fail closed if invoked before the accepted UI has replaced the form.
        if (!snap || !snap.payload || !gate || !form || !form.hidden || !outcome || outcome.hidden) return;
        if (!/^bp-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(snap.id) ||
            snap.payload.website_submission_id !== snap.id || measured[snap.id]) return;
        gate.enquiry(snap.payload); // Identifies QA before any vendor script/queue exists.
        if (!gate.allowed() || /\b(?:website[ _-]*qa|live[ _-]*test|test[ _-]*enquiry)\b/i.test(snap.payload.first_name || '')) return;
        measured[snap.id] = true;
        if (!gate.once('bbp_accepted', snap.id)) return;
        start();
        w.gtag('event', 'buyer_agency_form_submit', {
          form_stream: snap.payload.form_stream, buyer_type: snap.payload.buyer_type,
          cta_location: snap.payload.cta_clicked || 'direct'
        });
        // The shared helper emits one Clarity enquiry event and one deduplicated Meta Lead.
        if (w.rcEvents) w.rcEvents.enquirySuccess(snap.payload);
        if (snap.payload.enquiry_type === 'acquisition') {
          w.oaiq('measure', 'lead_created', { type: 'customer_action' }, { event_id: snap.id });
        }
      } catch (_) { /* SDK/storage failures never alter the working form or CRM handoff. */ }
    },
    // CRM outcomes, clicks and form starts are diagnostics, not accepted enquiries.
    crm: function () {}
  });
})(window, document);
