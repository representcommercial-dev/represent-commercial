// Represent Commercial: Clarity Smart Events and Meta Lead, v3.
// Clarity: only fixed event names are sent. Never send form values, amounts,
// contact details, addresses, link text, query strings or calculator inputs/results.
// Meta: one standard Lead per confirmed website enquiry. enquirySuccess(payload)
// is called only inside the form's confirmed-success branch (Web3Forms
// success === true). Only the website submission ID (as eventID, for CAPI
// deduplication) and a fixed service-line label are sent. Never names, emails,
// phone numbers, property addresses or free text. Referral introductions
// (form_stream "referrals") are not Leads. A call without a payload sends no Lead.
(function () {
  'use strict';
  if (window.rcEvents) return;
  var enquirySent = false, calculatorSent = false, formStartSent = false, editedAt = 0, leadSent = false;
  var SAFE_LABEL = /^[A-Za-z][A-Za-z0-9 &'\u2019()\/,.:_-]{0,79}$/;

  function emit(name) {
    try {
      if (!window.rcMeasurement || !window.rcMeasurement.allowed() || typeof window.clarity !== 'function') return false;
      window.clarity('event', name);
      return true;
    } catch (err) { return false; }
  }

  function field(p, k) {
    try {
      var v = typeof p.get === 'function' ? p.get(k) : p[k];
      return v == null ? '' : String(v).trim();
    } catch (err) { return ''; }
  }

  function newId() {
    return (window.crypto && typeof window.crypto.randomUUID === 'function')
      ? window.crypto.randomUUID()
      : 'web-' + Date.now() + '-' + Math.random().toString(36).slice(2, 12);
  }

  function metaLead(p) {
    try {
      if (!window.rcMeasurement || !window.rcMeasurement.allowed() || leadSent || !p || typeof window.fbq !== 'function') return;
      if (field(p, 'form_stream') === 'referrals') return;
      var id = field(p, 'website_submission_id');
      if (!/^[A-Za-z0-9._-]{8,128}$/.test(id)) id = newId();
      var key = 'rc_meta_lead_' + id;
      try { if (window.sessionStorage.getItem(key)) { leadSent = true; return; } } catch (err) { /* storage unavailable */ }
      leadSent = true;
      var params = { content_name: 'Website enquiry' };
      var service = field(p, 'service_line') || field(p, 'enquiry_service');
      if (service && SAFE_LABEL.test(service)) params.service_line = service;
      window.fbq('track', 'Lead', params, { eventID: id });
      try { window.sessionStorage.setItem(key, '1'); } catch (err) { /* storage unavailable */ }
    } catch (err) { /* Tracking must never interrupt a form or the CRM handoff. */ }
  }

  window.rcEvents = {
    // Call only inside the form's confirmed-success response branch.
    // Recognises known QA identities first (rc-measurement.v1.js), so a QA
    // submission suppresses every enquiry event that follows it.
    enquirySuccess: function (payload) {
      try {
        if (window.rcMeasurement) window.rcMeasurement.enquiry(payload);
        if (!window.rcMeasurement || !window.rcMeasurement.allowed()) return;
        if (!enquirySent) enquirySent = emit('enquiry_submitted');
        metaLead(payload);
      } catch (err) { /* Tracking must never interrupt a form or the CRM handoff. */ }
    },
    // Call after rendering a valid calculation. Initial example calculations,
    // resets, invalid models and contact-form edits are not completions.
    calculatorComplete: function (valid) {
      var edited = editedAt && Date.now() - editedAt < 1000;
      editedAt = 0;
      if (valid && edited && !calculatorSent) {
        calculatorSent = emit('calculator_completed');
      }
    }
  };

  function edited(e) {
    var target = e.target;
    if (e.isTrusted && target && target.closest &&
        target.closest('.calc-body, .cgt-body') && !target.closest('form')) {
      editedAt = Date.now();
    }
  }
  document.addEventListener('input', edited, true);
  document.addEventListener('change', edited, true);
  document.addEventListener('focusin', function (e) {
    try {
      var target = e.target;
      if (formStartSent || !e.isTrusted || !target || !target.closest ||
          !target.closest('form')) return;
      formStartSent = emit('form_start');
    } catch (err) { /* Tracking must never interrupt form use. */ }
  }, true);
  document.addEventListener('click', function (e) {
    try {
      if (!e.isTrusted || (e.button != null && e.button !== 0)) return;
      var target = e.target && e.target.closest && e.target.closest('a, button');
      if (!target || target.disabled) return;
      var href = target.getAttribute('href') || '';
      if (/^tel:/i.test(href)) { emit('phone_click'); return; }
      if (/^mailto:/i.test(href)) { emit('email_click'); return; }
      if (target.matches('a.btn--gold, a.cta, a[data-cta], button.form-submit, button.lead-btn')) {
        emit('primary_cta_click');
      }
    } catch (err) { /* Tracking must never interrupt navigation or a form. */ }
  }, true);
})();
