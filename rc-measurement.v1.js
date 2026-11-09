// Production measurement gate. Load before all analytics and advertising tags.
// ?rc_test=1 suppresses measurement for this tab's session; ?rc_test=0 clears it.
// This changes measurement only: forms and CRM delivery must continue normally.
(function (w) {
  'use strict';
  var key = 'rc_measurement_test', test = false, submissionId = '';
  try {
    var query = new URLSearchParams(w.location.search);
    test = query.get('rc_test') === '1';
    if (query.get('rc_test') === '0') w.sessionStorage.removeItem(key);
    if (test) w.sessionStorage.setItem(key, '1');
    test = test || w.sessionStorage.getItem(key) === '1';
  } catch (e) { /* Keep the URL flag effective if storage is unavailable. */ }
  function value(p, name) {
    try { return String(typeof p.get === 'function' ? p.get(name) || '' : p[name] || '').trim(); }
    catch (e) { return ''; }
  }
  w.rcMeasurement = {
    allowed: function () { return w.location.hostname === 'represent.au' && !test; },
    submissionId: function () { return submissionId; },
    // Called only after a confirmed form success. Personal details are inspected
    // locally to recognise known QA identities; they are never sent to analytics.
    enquiry: function (p) {
      if (!p) return;
      var id = value(p, 'website_submission_id');
      submissionId = /^[A-Za-z0-9._-]{8,128}$/.test(id) ? id : '';
      var email = value(p, 'email').toLowerCase();
      if (value(p, 'rc_test') === '1' ||
          /^(nick(?:\+[^@]+)?|test\+[^@]+)@represent\.au$/.test(email) ||
          /^nick\.otoole(?:\+[^@]+)?@gmail\.com$/.test(email) ||
          /^rc-r13-qa-20261023@example\.com$/.test(email)) {
        test = true;
        try { w.sessionStorage.setItem(key, '1'); } catch (e) {}
      }
    }
  };
})(window);
