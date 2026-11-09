// Management-switch article journey. Other contact enquiry paths retain their fields and handling.
(function () {
  'use strict';
  var q = new URLSearchParams(location.search);
  if (q.get('context') !== 'change-manager' || q.get('service') !== 'management') return;
  var form = document.getElementById('appraisal-form');
  if (!form) return;
  var article = 'changing-commercial-property-managers-brisbane';
  var placement = ['checklist', 'end'].indexOf(q.get('cta')) !== -1 ? q.get('cta') : 'direct';
  var address = form.querySelector('[name="address"]');
  var notes = form.querySelector('[name="notes"]');
  var label = form.querySelector('label[for="notes"]');
  var eyebrow = form.querySelector('.form-card__eyebrow');
  var subject = form.querySelector('[name="subject"]');
  var stream = form.querySelector('[name="form_stream"]');
  var original = { label: label.textContent, placeholder: notes.placeholder, required: notes.required,
    addressRequired: address.required, eyebrow: eyebrow.textContent, subject: subject.value, stream: stream.value };
  var optionalFields = ['value', 'management'].map(function (id) { return document.getElementById(id); });
  var sent = false, submissionId = '';

  function active() {
    var selected = form.querySelector('[name="enquiry_type"]:checked');
    return selected && selected.value === 'management';
  }
  function sync() {
    var enabled = active();
    optionalFields.forEach(function (field) {
      field.closest('.field').hidden = enabled;
      field.disabled = enabled || !active();
    });
    label.textContent = enabled ? 'What would you like improved?' : original.label;
    notes.placeholder = enabled ? 'Tell Nick what is not working and what you would like your next manager to handle differently.' : original.placeholder;
    notes.required = enabled || original.required;
    address.required = enabled || original.addressRequired;
    eyebrow.textContent = enabled ? 'Discuss your property’s management' : original.eyebrow;
    subject.value = enabled ? 'Property management discussion | Changing managers | Represent Commercial' : original.subject;
    stream.value = enabled ? 'management-switch-article' : original.stream;
  }
  function track(event) {
    try {
      if (location.hostname === 'represent.au' && typeof window.gtag === 'function') {
        window.gtag('event', event, { send_to: 'G-D0RB6DF7H3', service_line: 'management', cta_location: placement });
      }
    } catch (err) { /* Measurement never blocks delivery. */ }
  }
  form.querySelectorAll('[name="enquiry_type"]').forEach(function (radio) { radio.addEventListener('change', sync); });
  sync();

  window.rcManagementSwitch = {
    prepare: function (payload) {
      if (!active()) return;
      // Read at submit time, after the site's existing first-touch script has run.
      var attr = {};
      try { if (window.rcAttribution) attr = window.rcAttribution.fields(); } catch (err) {}
      ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_adgroup', 'utm_term', 'utm_content', 'referrer', 'landing_page'].forEach(function (key) {
        if (attr[key]) payload.set(key, attr[key]);
      });
      if (!payload.get('landing_page')) payload.set('landing_page', '/' + article);
      if (!submissionId) submissionId = window.crypto && typeof window.crypto.randomUUID === 'function'
        ? window.crypto.randomUUID() : 'web-' + Date.now() + '-' + Math.random().toString(36).slice(2, 12);
      payload.set('website_submission_id', submissionId);
      payload.set('cta_clicked', article + ':' + placement);
      payload.set('form_stream', 'management-switch-article');
      payload.set('service_line', 'Property Management & Leasing');
      payload.set('property_address', payload.get('address') || '');
      payload.set('owner_concern', payload.get('notes') || '');
      payload.set('opportunity_type', 'Management Only');
    },
    confirmed: function (payload) {
      if (sent || payload.get('form_stream') !== 'management-switch-article') return;
      sent = true;
      // Called only after Web3Forms confirms success, never on clicks or form starts.
      track('management_switch_enquiry');
      var crm = {};
      payload.forEach(function (value, key) {
        if (['access_key', 'subject', 'from_name', 'redirect', 'replyto', 'botcheck'].indexOf(key) === -1) crm[key] = value;
      });
      try {
        fetch('/api/website-lead', {
          method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(crm), keepalive: true
        }).then(function (response) {
          if (!response.ok) throw new Error('CRM handoff failed');
          return response.json();
        }).then(function (result) {
          if (!result || result.ok !== true) throw new Error('CRM handoff unconfirmed');
          track('management_switch_crm_success');
        }).catch(function () {
          track('management_switch_crm_failed');
          if (window.console) console.error('Management enquiry CRM handoff failed; the enquiry email was delivered.');
        });
      } catch (err) { track('management_switch_crm_failed'); }
    }
  };
})();
