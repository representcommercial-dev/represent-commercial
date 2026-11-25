/* Buy Your Premises (/buy-business-premises): page behaviour only.
   Content is in the HTML. Measurement reuses the existing production tags and shared gates.
   Delivery goes only through window.RCEnquiryTransport (created by the inline config);
   when it is missing or not ready the form stays disabled. */
(function () {
  'use strict';
  var doc = document;
  var $ = function (id) { return doc.getElementById(id); };
  var MSG_PHONE = 'Enter a phone number with 8 to 15 digits. Spaces, brackets, dots, hyphens and a leading + are fine.';

  /* Mobile menu */
  var menuBtn = $('menu-btn'), menu = $('mobile-menu');
  function setMenu(open, focusBtn) {
    if (!menuBtn || !menu) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    if (focusBtn) menuBtn.focus();
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(menu.hidden, false); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false, false); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu && !menu.hidden) setMenu(false, true); });
  var wide = window.matchMedia('(min-width: 960px)');
  var onWide = function () { if (wide.matches) setMenu(false, false); };
  if (wide.addEventListener) wide.addEventListener('change', onWide); else if (wide.addListener) wide.addListener(onWide);

  /* Enquiry links move focus to the form heading */
  var card = $('enquiry'), title = $('enquiry-title');
  Array.prototype.forEach.call(doc.querySelectorAll('[data-enquiry-link]'), function (a) {
    a.addEventListener('click', function (e) {
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      setMenu(false, false);
      try { if (location.hash !== '#brief') history.pushState(null, '', '#brief'); } catch (_) {}
      title.focus({ preventScroll: true });
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 16, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Enquiry form */
  var core = window.RCEnquiryCore;
  var form = $('enquiry-form'), submit = $('enquiry-submit'), notice = $('enquiry-notice');
  var fields = { first: $('first-name'), email: $('email'), phone: $('phone'), asset: $('asset-class'), size: $('size') };
  var errIds = { first: 'first-name-error', email: 'email-error', phone: 'phone-error', asset: 'asset-class-error', size: 'size-error' };
  var baseDesc = { first: '', email: '', phone: '', asset: '', size: '' };
  var pending = $('outcome-pending'), accepted = $('outcome-accepted'), uncertain = $('outcome-uncertain');
  var state = 'idle', snapshot = null;

  function transport() { return window.RCEnquiryTransport; }
  function ready() { var t = transport(); return !!(core && t && t.ready === true && typeof t.send === 'function'); }

  function setError(k, msg) {
    var el = $(errIds[k]), input = fields[k];
    el.textContent = msg || '';
    el.hidden = !msg;
    input.setAttribute('aria-invalid', String(!!msg));
    var d = (baseDesc[k] + (msg ? ' ' + errIds[k] : '')).trim();
    if (d) input.setAttribute('aria-describedby', d); else input.removeAttribute('aria-describedby');
  }
  function phoneError(raw) {
    var v = String(raw || '').trim();
    if (!v) return '';
    if (/[A-Za-z]/.test(v) || !/^\+?[0-9\s().\-]+$/.test(v)) return MSG_PHONE;
    var digits = v.replace(/\D/g, '').length;
    return digits < 8 || digits > 15 ? MSG_PHONE : '';
  }
  function validate(c) {
    var e = {};
    if (!c.first.trim()) e.first = 'Enter your first name.';
    if (!c.email.trim()) e.email = 'Enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) e.email = 'Enter a valid email address, such as name@business.com.au.';
    var pe = phoneError(c.phone); if (pe) e.phone = pe;
    if (core.ASSET_CLASSES.indexOf(c.asset)<0) e.asset='Select an asset class.';
    if (core.SIZES.indexOf(c.size)<0) e.size='Select an approximate size.';
    return e;
  }
  function values() { return { first: fields.first.value, email: fields.email.value, phone: fields.phone.value, asset: fields.asset.value, size: fields.size.value }; }
  function lock(on) { Object.keys(fields).forEach(function (k) { if(fields[k].tagName==='SELECT') fields[k].disabled=on; else fields[k].readOnly=on; }); }
  function render() {
    var connected = ready();
    submit.disabled = !connected || state !== 'idle';
    submit.textContent = state === 'pending' ? 'Sending…' : 'Discuss My Purchase';
    form.setAttribute('aria-busy', String(state === 'pending'));
    pending.hidden = state !== 'pending';
    uncertain.hidden = state !== 'uncertain';
    accepted.hidden = state !== 'accepted';
    form.hidden = state === 'accepted';
  }
  function focusEl(el) { if (el) el.focus(); }

  function showAccepted() {
    var p = snapshot.payload, dl = $('accepted-rows');
    while (dl.firstChild) dl.removeChild(dl.firstChild);
    [['First name', p.first_name], ['Email', p.email], ['Mobile', p.phone || '(not provided)'], ['Asset class', p.property_type], ['Size', snapshot.size]].forEach(function (r) {
      var row = doc.createElement('div'), dt = doc.createElement('dt'), dd = doc.createElement('dd');
      dt.textContent = r[0]; dd.textContent = r[1];
      row.appendChild(dt); row.appendChild(dd); dl.appendChild(row);
    });
  }
  function attempt(snap) {
    core.deliver(transport(), snap).then(function (res) {
      if (snapshot !== snap) return;
      if (res && res.category === 'accepted') {
        state = 'accepted'; showAccepted(); render(); focusEl($('accepted-title'));
        try { if (window.RCBusinessPremisesMeasurement) window.RCBusinessPremisesMeasurement.accepted(snap); } catch (_) {}
      } else {
        state = 'uncertain'; render(); focusEl($('uncertain-title'));
      }
    }, function () {
      if (snapshot !== snap) return;
      state = 'uncertain'; render(); focusEl($('uncertain-title'));
    });
  }

  Object.keys(fields).forEach(function (k) {
    fields[k].addEventListener(fields[k].tagName==='SELECT'?'change':'input', function () {
      if (state !== 'idle') return;
      if (!$(errIds[k]).hidden) setError(k, '');
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (state !== 'idle' || !ready()) return;
    var c = values(), errors = validate(c);
    var order = ['first', 'email', 'phone', 'asset', 'size'], firstBad = null;
    order.forEach(function (k) { setError(k, errors[k]); if (errors[k] && !firstBad) firstBad = k; });
    if (firstBad) { fields[firstBad].focus(); return; }
    var snap = core.buildSnapshot(c);
    if (!snap) { setError('asset','Check your asset class and size.'); fields.asset.focus(); return; }
    if (window.RCBusinessPremisesMeasurement) snap = window.RCBusinessPremisesMeasurement.snapshot(snap);
    snapshot = snap; state = 'pending'; lock(true); render(); focusEl(pending);
    attempt(snap);
  });
  $('resend').addEventListener('click', function () {
    if (state !== 'uncertain' || !snapshot) return;
    state = 'pending'; render(); focusEl(pending);
    attempt(snapshot);
  });

  if (ready()) notice.textContent = 'Choose the asset class and approximate size you need. No call is booked by submitting.';
  render();
})();
