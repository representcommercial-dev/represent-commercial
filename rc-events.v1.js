// Represent Commercial: Clarity Smart Events, v1.
// Only fixed event names are sent. Never send form values, amounts, contact
// details, addresses, link text, query strings or calculator inputs/results.
(function () {
  'use strict';
  if (window.rcEvents) return;
  var enquirySent = false, calculatorSent = false, editedAt = 0;

  function emit(name) {
    try {
      if (typeof window.clarity !== 'function') return false;
      window.clarity('event', name);
      return true;
    } catch (err) { return false; }
  }

  window.rcEvents = {
    // Call only inside the form's confirmed-success response branch.
    enquirySuccess: function () {
      if (!enquirySent) enquirySent = emit('enquiry_submitted');
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
