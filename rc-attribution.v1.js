// Represent Commercial first-party attribution — v1.
// Runs on every page. First-party browser storage only; nothing is sent anywhere
// until the visitor submits a form that chooses to read it.
//   localStorage  rc_ft   first touch, kept 90 days from the first visit, never
//                         overwritten by a later visit (a direct-only first touch
//                         is upgraded once by the first campaign/referral visit)
//   sessionStorage rc_attr last touch for this session (unchanged legacy format)
(function () {
  var FT = 'rc_ft', LT = 'rc_attr', TTL = 90 * 864e5, now = Date.now();
  var MAP = { utm_source: 'utm_source', utm_medium: 'utm_medium', utm_campaign: 'utm_campaign', utm_adgroup: 'utm_adgroup', adgroup: 'utm_adgroup', utm_term: 'utm_term', keyword: 'utm_term', utm_content: 'utm_content', gclid: 'gclid' };
  var KEYS = ['gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_adgroup', 'utm_term', 'utm_content'];

  function read(store, key) { try { return JSON.parse(store.getItem(key) || 'null'); } catch (e) { return null; } }
  function write(store, key, v) { try { store.setItem(key, JSON.stringify(v)); } catch (e) {} }

  var params = {};
  try {
    var q = new URLSearchParams(location.search);
    Object.keys(MAP).forEach(function (k) { var v = q.get(k); if (v && !(k !== MAP[k] && q.get(MAP[k]))) params[MAP[k]] = v.slice(0, 500); });
  } catch (e) {}
  var extRef = '';
  try {
    if (document.referrer) {
      var r = new URL(document.referrer);
      if (r.host !== location.host) extRef = (r.origin + r.pathname).slice(0, 1000);
    }
  } catch (e) {}
  var path = (location.pathname.replace(/\.html$/, '') || '/').slice(0, 500);

  // Last touch (session): same semantics as the legacy inline capture.
  var lt = read(window.sessionStorage, LT) || {};
  Object.keys(params).forEach(function (k) { lt[k] = params[k]; });
  if (!lt.referrer && document.referrer && document.referrer.indexOf(location.host) === -1) lt.referrer = document.referrer;
  write(window.sessionStorage, LT, lt);

  // First touch (90 days).
  var ft = read(window.localStorage, FT);
  if (ft && (!ft.ts || now - ft.ts > TTL || now < ft.ts - 864e5)) ft = null;
  var hasSignal = Object.keys(params).length > 0 || !!extRef;
  if (!ft || (ft.direct && hasSignal)) {
    ft = { ts: now, landing_page: path, referrer: extRef, direct: !hasSignal };
    KEYS.forEach(function (k) { if (params[k]) ft[k] = params[k]; });
    write(window.localStorage, FT, ft);
  }

  window.rcAttribution = {
    firstTouch: function () { return read(window.localStorage, FT); },
    lastTouch: function () { return read(window.sessionStorage, LT) || {}; },
    // Canonical values for a form: first touch; GCLID falls back to this session's click ID.
    fields: function () {
      var f = this.firstTouch() || {}, l = this.lastTouch(), out = {};
      KEYS.forEach(function (k) { if (f[k]) out[k] = f[k]; });
      if (!out.gclid && l.gclid) out.gclid = l.gclid;
      out.referrer = f.referrer || l.referrer || '';
      if (f.landing_page) out.landing_page = f.landing_page;
      return out;
    }
  };
})();
