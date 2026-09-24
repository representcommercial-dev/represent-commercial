// Self-contained mobile navigation — v14.
// v14: extensionless root-relative routes (Cloudflare Pages clean URLs); matching also tolerates legacy .html hrefs.
// Styles the hamburger + dropdown with INLINE styles and decides the breakpoint
// in JS (matchMedia), so it works even if styles.css or the injected <style> is
// stale, cached, or blocked. Progressive enhancement.
(function () {
  var inner = document.querySelector('.site-header__inner');
  var nav = document.querySelector('.site-nav');
  if (!inner || !nav || inner.querySelector('.nav-toggle')) return;

  var GOLD = '#C9A84C';
  var MENU_BG = 'rgba(0,45,24,0.98)';

  // ── hamburger button (all critical styles inline) ──
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-label', 'Toggle menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.style.cssText = 'flex-direction:column;justify-content:center;gap:5px;width:44px;height:44px;padding:11px;margin-left:auto;background:transparent;border:0;cursor:pointer;';
  var bars = [];
  for (var i = 0; i < 3; i++) {
    var s = document.createElement('span');
    s.style.cssText = 'display:block;width:22px;height:2px;background:#fff;border-radius:2px;transition:transform .22s ease,opacity .2s ease;';
    btn.appendChild(s);
    bars.push(s);
  }
  inner.insertBefore(btn, nav);

  // ── dropdown styles (need :hover / :focus-within, so a stylesheet not inline) ──
  var st = document.createElement('style');
  st.textContent =
    '.nav-drop{position:relative;display:flex;align-items:center}' +
    // hover bridge: keeps the parent hovered while the cursor crosses the gap to the menu
    '.nav-drop::after{content:"";position:absolute;top:100%;left:0;right:0;height:14px}' +
    '.nav-drop__trigger{display:inline-flex;align-items:center;gap:5px}' +
    '.nav-drop__caret{width:7px;height:7px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:translateY(-2px) rotate(45deg);opacity:.6;transition:transform .2s,opacity .2s}' +
    '.nav-drop:hover .nav-drop__caret,.nav-drop:focus-within .nav-drop__caret{opacity:1}' +
    '.nav-drop__menu{position:absolute;top:100%;left:0;min-width:212px;padding:8px;margin-top:6px;background:rgba(0,45,24,0.98);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.09);border-radius:10px;box-shadow:0 18px 34px rgba(0,0,0,.34);display:flex;flex-direction:column;gap:1px;opacity:0;visibility:hidden;transform:translateY(-4px);transition:opacity .16s ease,transform .16s ease,visibility .16s;z-index:210}' +
    '.nav-drop:hover .nav-drop__menu,.nav-drop:focus-within .nav-drop__menu{opacity:1;visibility:visible;transform:translateY(0)}' +
    '.nav-drop.is-dismissed .nav-drop__menu{opacity:0;visibility:hidden;transform:translateY(-4px)}' +
    '.nav-drop__menu a{font-family:var(--f-body),sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,0.6);padding:10px 12px;border-radius:6px;text-decoration:none;white-space:nowrap;transition:color .18s,background .18s}' +
    '.nav-drop__menu a:hover{color:#fff;background:rgba(255,255,255,0.07)}' +
    '.nav-drop__menu a.is-active{color:' + GOLD + '}' +
    '.site-nav--mobile .nav-drop{display:block}' +
    '.site-nav--mobile .nav-drop::after{display:none}' +
    '.site-nav--mobile .nav-drop__caret{display:none}' +
    '.site-nav--mobile .nav-drop__menu{position:static;opacity:1;visibility:visible;transform:none;margin:0;padding:0 0 6px;min-width:0;background:transparent;border:0;border-radius:0;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none}' +
    '.site-nav--mobile .nav-drop__menu a{display:flex;align-items:center;min-height:44px;box-sizing:border-box;padding:11px 24px 11px 40px;font-size:14px;color:rgba(255,255,255,0.55)}';
  document.head.appendChild(st);

  function norm(h) {
    h = String(h || '').split('#')[0].split('?')[0];
    try { h = decodeURIComponent(h); } catch (e) {}
    h = h.replace(/^\/+/, '').replace(/\.html$/, '');
    return h === '' ? 'index' : h;
  }
  function findLink(href) {
    var t = norm(href);
    return Array.prototype.filter.call(nav.querySelectorAll('a'), function (a) { return norm(a.getAttribute('href')) === t && (a.getAttribute('href') || '').indexOf('#') === -1; })[0] || null;
  }
  function styleHref(href, like) {
    if (href.charAt(0) === '/' || (like || '').charAt(0) !== '/') return href;
    var p = href.split('#'), b = p[0].replace(/\.html$/, '');
    return '/' + (b === 'index' ? '' : b) + (p[1] ? '#' + p[1] : '');
  }
  // ── group secondary pages under their parent link (desktop dropdowns) ──
  function makeDrop(parentHref, items) {
    var trigger = findLink(parentHref);
    if (!trigger || trigger.closest('.nav-drop')) return;
    var wrap = document.createElement('div');
    wrap.className = 'nav-drop';
    nav.insertBefore(wrap, trigger);
    trigger.classList.add('nav-drop__trigger');
    wrap.appendChild(trigger);
    var caret = document.createElement('span');
    caret.className = 'nav-drop__caret';
    caret.setAttribute('aria-hidden', 'true');
    trigger.appendChild(caret);
    var menu = document.createElement('div');
    menu.className = 'nav-drop__menu';
    var here = norm(location.pathname.split('/').pop());
    var like = trigger.getAttribute('href');
    items.forEach(function (it) {
      var a = document.createElement('a');
      a.href = styleHref(it[1], like);
      a.textContent = it[0];
      if (it[1].indexOf('#') === -1 && norm(it[1]) === here) a.className = 'is-active';
      menu.appendChild(a);
    });
    wrap.appendChild(menu);
  }
  makeDrop('/services', [['Commercial Property Management', '/services'], ['Commercial Property Leasing', '/leasing'], ['Locations', '/locations']]);
  makeDrop('/insights', [['Market Intelligence', '/insights'], ['Guides & Explainers', '/insights#guides'], ['Case Studies', '/case-studies'], ['Tools & Calculators', '/tools']]);
  makeDrop('/about', [['About', '/about'], ['Referrals', '/referrals'], ['Contact', '/contact']]);

  // ── ensure every page is reachable from the mobile menu ──
  function ensureLink(href, text, atStart) {
    if (findLink(href)) return;
    var first = nav.querySelector('a');
    var a = document.createElement('a');
    a.href = styleHref(href, first ? first.getAttribute('href') : '');
    a.textContent = text;
    a.className = 'site-nav__link nav-extra';
    if (atStart) nav.insertBefore(a, nav.firstChild);
    else {
      var cta = nav.querySelector('.site-nav__cta');
      if (cta) nav.insertBefore(a, cta); else nav.appendChild(a);
    }
  }
  ensureLink('/', 'Home', true);

  var mq = window.matchMedia('(max-width: 1080px)');
  var open = false;

  function paintMenu() {
    // Called only in mobile mode. Style the dropdown container + links inline.
    var header = document.querySelector('.site-header');
    var h = Math.ceil((header || inner).getBoundingClientRect().height) || 60;
    nav.style.cssText =
      'position:absolute;top:' + h + 'px;left:0;right:0;flex-direction:column;align-items:stretch;gap:0;' +
      'padding:6px 0 14px;background:' + MENU_BG + ';backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
      'border-bottom:1px solid rgba(255,255,255,0.08);box-shadow:0 16px 30px rgba(0,0,0,.35);z-index:200;' +
      'display:' + (open ? 'flex' : 'none') + ';';
    // Bound the panel to what is left of the viewport and let it scroll on short screens.
    nav.style.maxHeight = 'calc(100vh - ' + h + 'px)';
    if (window.CSS && CSS.supports && CSS.supports('height', '100dvh')) {
      nav.style.maxHeight = 'calc(100dvh - ' + h + 'px)';
    }
    nav.style.overflowY = 'auto';
    nav.style.overscrollBehavior = 'contain';
    nav.style.webkitOverflowScrolling = 'touch';
    nav.classList.add('site-nav--mobile');
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      if (a.closest('.nav-drop__menu')) return;   // submenu links styled by stylesheet
      var isCta = a.classList.contains('site-nav__cta');
      a.style.cssText = isCta
        ? 'min-height:44px;box-sizing:border-box;display:block;margin:12px 24px 4px;text-align:center;'
        : 'display:block;min-height:44px;box-sizing:border-box;padding:14px 24px;font-size:16px;color:rgba(255,255,255,.82);border:0;border-radius:0;text-align:left;';
    });
  }

  function drawBars() {
    if (open) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      bars[0].style.transform = '';
      bars[1].style.opacity = '1';
      bars[2].style.transform = '';
    }
  }

  function applyMode() {
    if (mq.matches) {
      btn.style.display = 'inline-flex';
      paintMenu();
    } else {
      btn.style.display = 'none';
      open = false;
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      drawBars();
      nav.classList.remove('site-nav--mobile');
      nav.style.cssText = '';                 // hand back to stylesheet on desktop
      Array.prototype.forEach.call(nav.querySelectorAll('.nav-drop'), function (d) { d.classList.remove('is-dismissed'); });
      Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) { a.style.cssText = ''; });
    }
  }

  btn.addEventListener('click', function () {
    open = !open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.classList.toggle('is-open', open);
    drawBars();
    paintMenu();
    if (open) {
      var first = nav.querySelector('a');
      if (first) first.focus();
    }
  });
  nav.addEventListener('click', function (e) {
    // Mobile only: a desktop click must not repaint the menu in mobile styles,
    // and modifier-clicks (new tab/window) must leave this page's nav intact.
    if (!mq.matches || !e.target.closest('a')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
    open = false; btn.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); drawBars(); paintMenu();
  });
  // Escape closes the mobile menu; on desktop it dismisses a hover- or focus-open dropdown
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (mq.matches && open) {
      open = false; btn.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); drawBars(); paintMenu(); btn.focus();
    } else if (!mq.matches) {
      var a = document.activeElement;
      var drop = a && a.closest ? a.closest('.nav-drop') : null;
      if (!drop) drop = nav.querySelector('.nav-drop:hover');
      if (!drop) return;
      drop.classList.add('is-dismissed');
      var trigger = drop.querySelector('.nav-drop__trigger');
      if (a && a.closest('.nav-drop__menu') && trigger) trigger.focus();
      else if (a && a.blur) a.blur();
    }
  });
  // A dropdown dismissed with Escape re-arms once the pointer leaves it
  nav.addEventListener('mouseleave', function (e) {
    var drop = e.target.closest ? e.target.closest('.nav-drop') : null;
    if (drop) drop.classList.remove('is-dismissed');
  }, true);
  // Tapping outside the open mobile menu closes it
  document.addEventListener('click', function (e) {
    if (!mq.matches || !open) return;
    if (e.target.closest('.site-nav') || e.target.closest('.nav-toggle')) return;
    open = false; btn.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); drawBars(); paintMenu();
  });

  if (mq.addEventListener) mq.addEventListener('change', applyMode);
  else if (mq.addListener) mq.addListener(applyMode);
  window.addEventListener('resize', applyMode);
  applyMode();
})();
