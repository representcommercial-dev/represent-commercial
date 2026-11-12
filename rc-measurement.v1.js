// Production measurement gate. Load synchronously before all analytics and advertising tags.
// Measurement runs only on the exact hostname represent.au and never in test mode.
// ?rc_test=1 suppresses measurement for this tab's session; ?rc_test=0 clears it.
// This changes measurement only: forms, success messages and CRM delivery continue normally.
(function (w) {
  'use strict';
  if (w.rcMeasurement) return;
  var KEY = 'rc_measurement_test', SENT = 'rc_measured_', test = false, submissionId = '', seen = {};
  var ID = /^[A-Za-z0-9._-]{8,128}$/;
  try {
    var flag = new URLSearchParams(w.location.search).get('rc_test');
    if (flag === '1') test = true;
    if (flag === '0') w.sessionStorage.removeItem(KEY);
    if (test) w.sessionStorage.setItem(KEY, '1');
    if (flag !== '0') test = test || w.sessionStorage.getItem(KEY) === '1';
  } catch (e) { /* The URL flag stays effective for this page if storage is unavailable. */ }

  function value(p, name) {
    try { return String((typeof p.get === 'function' ? p.get(name) : p[name]) || '').trim(); }
    catch (e) { return ''; }
  }
  // Known internal QA identities. Checked locally only; never sent anywhere.
  var QA_EMAIL = [
    /^nick(?:\+[^@]+)?@represent\.au$/,
    /^test(?:\+[^@]+)?@represent\.au$/,
    /^nick\.otoole(?:\+[^@]+)?@gmail\.com$/,
    /@example\.(?:com|net|org)$/
  ];
  function qaPhone(s) {
    var d = String(s || '').replace(/\D/g, '');
    return d === '0401825999' || d === '61401825999' || d === '401825999';
  }
  function once(scope, id) {
    if (!id) return true;
    var k = SENT + scope + '_' + id;
    if (seen[k]) return false;
    try { if (w.sessionStorage.getItem(k)) { seen[k] = true; return false; } } catch (e) {}
    seen[k] = true;
    try { w.sessionStorage.setItem(k, '1'); } catch (e) {}
    return true;
  }

  w.rcMeasurement = {
    allowed: function () {
      try { return w.location.hostname === 'represent.au' && !test; } catch (e) { return false; }
    },
    testMode: function () { return test; },
    submissionId: function () { return submissionId; },
    once: once,
    // Called by the gtag wrapper for every event. Returns false to drop a repeat.
    // Enquiry events carry the website submission ID for reconciliation and are
    // recorded at most once per ID per tab session; so are Ads conversions by transaction_id.
    event: function (name, details) {
      try {
        if (/_form_submit$/.test(name) && submissionId) {
          if (!once(name, submissionId)) return false;
          details.website_submission_id = submissionId;
        } else if (name === 'conversion' && details.transaction_id) {
          if (!once('conversion_' + String(details.send_to || ''), String(details.transaction_id))) return false;
        }
      } catch (e) {}
      return true;
    },
    // Called only after a confirmed form success, before any enquiry event is sent.
    enquiry: function (p) {
      try {
        if (!p) return;
        var id = value(p, 'website_submission_id');
        submissionId = ID.test(id) ? id : '';
        var email = value(p, 'email').toLowerCase();
        var qa = value(p, 'rc_test') === '1' ||
          QA_EMAIL.some(function (r) { return r.test(email); }) ||
          qaPhone(value(p, 'phone')) || qaPhone(value(p, 'referrer_phone'));
        if (qa) {
          test = true;
          try { w.sessionStorage.setItem(KEY, '1'); } catch (e) {}
        }
      } catch (e) { /* Measurement must never interrupt a form or the CRM handoff. */ }
    }
  };
})(window);
