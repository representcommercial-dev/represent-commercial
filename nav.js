// Self-contained mobile navigation. Injects its own styles + a hamburger button,
// so it works regardless of whether styles.css is in sync. Progressive enhancement.
(function () {
  var inner = document.querySelector('.site-header__inner');
  var nav = document.querySelector('.site-nav');
  if (!inner || !nav) return;

  // ── inject styles (idempotent) ──
  if (!document.getElementById('nav-mobile-styles')) {
    var css = document.createElement('style');
    css.id = 'nav-mobile-styles';
    css.textContent =
      '.nav-toggle{display:none;flex-direction:column;justify-content:center;gap:5px;width:44px;height:44px;padding:11px;margin-left:auto;background:transparent;border:0;cursor:pointer;}' +
      '.nav-toggle span{display:block;width:22px;height:2px;background:#fff;border-radius:2px;transition:transform .22s ease,opacity .2s ease;}' +
      '.nav-toggle.is-open span:nth-child(1){transform:translateY(7px) rotate(45deg);}' +
      '.nav-toggle.is-open span:nth-child(2){opacity:0;}' +
      '.nav-toggle.is-open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}' +
      '.nav-extra{display:none;}' +
      '@media(max-width:600px){' +
        '.nav-toggle{display:inline-flex;}' +
        '.site-nav{position:absolute;top:60px;left:0;right:0;display:none;flex-direction:column;align-items:stretch;gap:0;padding:6px 0 12px;background:rgba(0,45,24,0.98);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,0.08);box-shadow:0 16px 30px rgba(0,0,0,.35);}' +
        '.site-nav.is-open{display:flex;}' +
        '.site-nav__link{display:block !important;padding:14px 24px;font-size:15px;color:rgba(255,255,255,.74);border-bottom:0;border-radius:0;}' +
        '.site-nav__link.is-active{color:#fff;border-bottom-color:transparent;box-shadow:inset 3px 0 0 var(--gold,#C9A84C);}' +
        '.site-nav__cta{display:block;margin:10px 24px 4px !important;text-align:center;}' +
        '.nav-extra{display:block !important;}' +
      '}';
    document.head.appendChild(css);
  }

  // ── hamburger button ──
  var btn = document.createElement('button');
  btn.className = 'nav-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Toggle menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  inner.appendChild(btn);

  // ── ensure every page is reachable from the mobile menu ──
  function ensureLink(href, text, atStart) {
    var has = Array.prototype.some.call(nav.querySelectorAll('a'), function (a) {
      return (a.getAttribute('href') || '') === href;
    });
    if (has) return;
    var a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    a.className = 'site-nav__link nav-extra';
    if (atStart) nav.insertBefore(a, nav.firstChild);
    else {
      var cta = nav.querySelector('.site-nav__cta');
      if (cta) nav.insertBefore(a, cta); else nav.appendChild(a);
    }
  }
  ensureLink('index.html', 'Home', true);
  ensureLink('contact.html', 'Contact', false);

  function close() {
    nav.classList.remove('is-open');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  window.addEventListener('resize', function () { if (window.innerWidth > 600) close(); });
})();
