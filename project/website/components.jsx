// ── Shared components: Header, Footer, PropertyCard, useScrollReveal ──

const useScrollReveal = (threshold = 0.15) => {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

const Reveal = ({ children, delay = 0, style = {} }) => {
  const [ref, visible] = useScrollReveal();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(22px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      ...style,
    }}>{children}</div>
  );
};

const GoldRule = ({ style = {} }) => (
  <div style={{ width: 48, height: 2, background: '#C9A84C', ...style }} />
);

const SectionLabel = ({ children, dark = false, gold = false }) => (
  <div style={{
    fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 12,
    color: gold ? '#C9A84C' : dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,66,37,0.4)',
  }}>{children}</div>
);

const Header = ({ page, setPage }) => {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navLinks = [
    { label: 'About', key: 'about' },
    { label: 'Services', key: 'services' },
    { label: 'Portfolio', key: 'properties' },
  ];

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled ? 'rgba(0,45,24,0.97)' : '#002D18',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.04)',
      height: 68, display: 'flex', alignItems: 'center', padding: '0 48px',
      backdropFilter: 'blur(12px)',
      transition: 'background 0.4s ease, border-color 0.4s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1320, margin: '0 auto' }}>
        <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 38, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>REPRESENT</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.35em', marginTop: 4 }}>COMMERCIAL</div>
        </button>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navLinks.map(({ label, key }) => (
            <button key={key} onClick={() => setPage(key)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
              color: page === key ? '#fff' : 'rgba(255,255,255,0.48)',
              padding: '8px 18px', borderRadius: 6, transition: 'color 0.2s',
              borderBottom: page === key ? '1px solid #C9A84C' : '1px solid transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = page === key ? '#fff' : 'rgba(255,255,255,0.48)'}
            >{label}</button>
          ))}
          <button onClick={() => setPage('contact')} style={{
            background: '#C9A84C', border: 'none', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
            color: '#002D18', padding: '9px 22px', borderRadius: 8,
            marginLeft: 12, letterSpacing: '0.01em',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >Request appraisal</button>
        </nav>
      </div>
    </header>
  );
};

const Footer = ({ setPage }) => (
  <footer style={{ background: '#002D18', padding: '80px 48px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
    <div style={{ maxWidth: 1320, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 64, marginBottom: 64 }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1 }}>REPRESENT</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.35em', marginTop: 3, marginBottom: 20 }}>COMMERCIAL</div>
          <GoldRule style={{ marginBottom: 20 }} />
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 18, color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>Managed with intent.</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, maxWidth: 300 }}>
            Principal-led commercial asset management for SEQ. One decision-maker. One filter: net income.
          </div>
        </div>

        {[
          { heading: 'Navigate', items: [
            { l: 'Home', k: 'home' }, { l: 'About', k: 'about' },
            { l: 'Services', k: 'services' }, { l: 'Portfolio', k: 'properties' }, { l: 'Contact', k: 'contact' }
          ]},
          { heading: 'Precincts', items: [
            { l: 'Acacia Ridge' }, { l: 'Yatala' }, { l: 'Hemmant' }, { l: 'Brendale' }
          ]},
          { heading: 'Contact', items: null },
        ].map((col, i) => (
          <div key={i}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 20 }}>{col.heading}</div>
            {col.items ? col.items.map((item, j) => (
              <div key={j} style={{ marginBottom: 10 }}>
                {item.k ? (
                  <button onClick={() => setPage(item.k)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.48)', padding: 0, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.48)'}
                  >{item.l}</button>
                ) : (
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.48)' }}>{item.l}</div>
                )}
              </div>
            )) : (
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.48)', lineHeight: 2.1 }}>
                <div>Nick O'Toole</div>
                <div>Principal & Licensee</div>
                <div style={{ marginTop: 8 }}>+61 401 825 999</div>
                <div>nick@represent.au</div>
                <div style={{ marginTop: 8 }}>Brisbane, QLD</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>© 2026 Represent Commercial Pty Ltd. All rights reserved.</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>Queensland Real Estate Agent Licence · ABN pending</div>
      </div>
    </div>
  </footer>
);

const PropertyCard = ({ addr, suburb, state, type, status, income, wale, vacancy, value, precinct, onClick }) => {
  const sc = {
    'Leased':       { bg: 'rgba(0,163,94,0.1)',   color: '#005C34', dot: '#00A35E' },
    'Vacant':       { bg: 'rgba(196,52,45,0.08)',  color: '#C4342D', dot: '#C4342D' },
    'Under Review': { bg: 'rgba(201,168,76,0.12)', color: '#7A5F1A', dot: '#C9A84C' },
  }[status] || { bg: 'rgba(0,163,94,0.1)', color: '#005C34', dot: '#00A35E' };

  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 12, border: '1px solid #E1E4E1',
      cursor: 'pointer', overflow: 'hidden', transition: 'box-shadow 0.25s, transform 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,66,37,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Top band */}
      <div style={{ height: 4, background: status === 'Leased' ? '#00A35E' : status === 'Vacant' ? '#C4342D' : '#C9A84C' }} />
      <div style={{ padding: '22px 24px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <span style={{ background: sc.bg, color: sc.color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px', borderRadius: 4, fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
            {status}
          </span>
          <span style={{ fontSize: 11, color: '#8A918A', fontFamily: "'DM Sans', sans-serif", background: '#F8F9F8', padding: '3px 8px', borderRadius: 4 }}>{type}</span>
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 19, fontWeight: 700, color: '#004225', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.15, marginBottom: 3 }}>{addr}</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#8A918A', marginBottom: 18 }}>{suburb} {state}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 16 }}>
          {[
            { l: 'Net Income', v: income },
            { l: 'WALE', v: wale, gold: true },
            { l: 'Vacancy', v: vacancy, green: vacancy === '0%' },
            { l: 'Est. Value', v: value },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8A918A', marginBottom: 2 }}>{s.l}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: s.green ? '#00A35E' : s.gold ? '#C9A84C' : '#004225', lineHeight: 1 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: '#E1E4E1', marginBottom: 14 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ background: 'rgba(0,66,37,0.05)', border: '1px solid rgba(0,66,37,0.1)', borderRadius: 4, padding: '3px 10px', fontSize: 10, fontWeight: 600, color: '#004225', fontFamily: "'DM Sans', sans-serif" }}>{precinct}</span>
          <span style={{ fontSize: 12, color: '#C9A84C', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>View asset →</span>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Header, Footer, PropertyCard, Reveal, GoldRule, SectionLabel });
