// Mobile navigation toggle. Injects a hamburger button into the header and
// toggles the nav dropdown on small screens. Progressive enhancement — the
// links exist in markup; this only adds the open/close control.
(function () {
  var inner = document.querySelector('.site-header__inner');
  var nav = document.querySelector('.site-nav');
  if (!inner || !nav) return;

  var btn = document.createElement('button');
  btn.className = 'nav-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Toggle menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  inner.appendChild(btn);

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

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) close();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 600) close();
  });
})();
