/* Existing production measurement, selected by Nick for this landing page.
   Uses the existing QA/domain gate, GA4 buyer event, Meta/Clarity helper,
   ChatGPT lead event and first-touch attribution. No new Ads action or goal. */
(function (w, d) {
  'use strict';
  var measured = {}, current = null;
  function track(name, params) {
    if (!w.rcMeasurement || !w.rcMeasurement.allowed()) return;
    params = params || {};
    w.dataLayer = w.dataLayer || [];
    var event = { event: name };
    Object.keys(params).forEach(function (k) { event[k] = params[k]; });
    w.dataLayer.push(event);
    if (typeof w.gtag === 'function') w.gtag('event', name, params);
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
      } catch (_) { /* An unavailable attribution store must not prevent an enquiry. */ }
      return current;
    },
    accepted: function (snap) {
      try {
        if (!snap || measured[snap.id]) return;
        measured[snap.id] = true;
        var p = snap.payload;
        if (w.rcEvents) w.rcEvents.enquirySuccess(p);
        else if (w.rcMeasurement) w.rcMeasurement.enquiry(p);
        if (!w.rcMeasurement || !w.rcMeasurement.allowed()) return;
        track('buyer_agency_form_submit', {
          form_stream: p.form_stream, buyer_type: p.buyer_type,
          cta_location: p.cta_clicked || 'direct'
        });
        if (p.enquiry_type === 'acquisition' && typeof w.oaiq === 'function') {
          w.oaiq('measure', 'lead_created', { type: 'customer_action' }, { event_id: snap.id });
        }
      } catch (_) { /* Measurement must not interrupt the form or CRM delivery. */ }
    },
    crm: function (result) {
      try {
        if (!current) return;
        track(result && result.outcome === 'accepted' ? 'crm_handoff_success' : 'crm_handoff_failed',
          { form_stream: current.payload.form_stream });
      } catch (_) {}
    }
  });
  Array.prototype.forEach.call(d.querySelectorAll('#enquiry a[href^="tel:"]'), function (link) {
    link.addEventListener('click', function () {
      try { track('click_to_call', { call_location: 'page' }); } catch (_) {}
    });
  });
})(window, document);
