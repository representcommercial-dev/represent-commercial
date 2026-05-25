// ── Home Page Sections ──

const Hero = ({ setPage }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const fade = (delay) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.9s ease ${delay}s, transform 0.9s ease ${delay}s`,
  });

  return (
    <section style={{ background: '#004225', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '120px 48px 72px', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative concentric circles */}
      {[700, 500, 320, 160].map((s, i) => (
        <div key={i} style={{ position: 'absolute', top: -s * 0.3, right: -s * 0.25, width: s, height: s, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
      ))}
      {/* Grid texture */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '80px 80px', pointerEvents: 'none' }} />
      {/* Bottom gradient */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to top, rgba(0,66,37,0.6), transparent)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1320, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ ...fade(0.1), display: 'inline-block', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: 28 }}>
          Principal-led Commercial Asset Management · SEQ
        </div>

        <div style={fade(0.3)}>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(60px, 8vw, 110px)', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 0.92, margin: 0 }}>
            YOUR ASSET.<br />OUR OBSESSION.
          </h1>
        </div>

        <div style={{ ...fade(0.5), width: 48, height: 2, background: '#C9A84C', margin: '32px 0' }} />

        <div style={{ ...fade(0.6), display: 'flex', gap: 80, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 500 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 23, color: 'rgba(255,255,255,0.65)', marginBottom: 18, lineHeight: 1.3 }}>
              Managed with intent.
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: '0 0 36px' }}>
              One decision-maker. One filter: does this grow net income? Twenty years managing commercial assets for private families — as the person making decisions, not filing reports.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setPage('contact')} style={{ background: '#C9A84C', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#002D18', padding: '15px 34px', borderRadius: 8, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Request appraisal</button>
              <button onClick={() => setPage('about')} style={{ background: 'transparent', border: '1.5px solid rgba(255,255,255,0.25)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: '#fff', padding: '15px 34px', borderRadius: 8, transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}>About Nick</button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 0, flexShrink: 0 }}>
            {[
              { label: 'Assets Under Mgmt', value: '$47.2M', color: '#fff' },
              { label: 'Avg. WALE', value: '4.3 yrs', color: '#C9A84C' },
              { label: 'Vacancy', value: '0%', color: '#00A35E' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '0 40px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 52, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 5 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ ...fade(1.2), position: 'absolute', bottom: -16, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', writingMode: 'vertical-rl' }}>Scroll</div>
          <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.15)' }} />
        </div>
      </div>
    </section>
  );
};

const OperatingModel = () => {
  const pillars = [
    { n: '01', title: 'Principal-led', body: 'Nick O'Toole is named on every management agreement. He reviews your lease, interrogates your outgoings, and negotiates your rent review. No account managers. No hand-offs. Ever.' },
    { n: '02', title: "Owner's mindset", body: "Every decision passes through one filter: does this grow net income? Not gross rent. Not portfolio size. Net income — the only number that matters to the person whose capital is at work." },
    { n: '03', title: '20 years\' depth', body: 'Built from two decades inside the private offices of wealthy families — not as a service provider, but as the person making the decisions. That context is the product.' },
    { n: '04', title: 'AI-native ops', body: 'Institutional-quality reporting without institutional overhead. Re-Leased, HubSpot, and AI-powered analytics — built for transparency, not to fill inboxes.' },
  ];

  return (
    <section style={{ background: '#F8F9F8', padding: '112px 48px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <Reveal>
          <SectionLabel>Why Represent</SectionLabel>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 700, color: '#004225', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 64, maxWidth: 600 }}>A DIFFERENT OPERATING MODEL</h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          {pillars.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ borderTop: '2px solid #E1E4E1', paddingTop: 24, height: '100%' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 56, fontWeight: 700, color: '#C9A84C', opacity: 0.5, lineHeight: 1, marginBottom: 16 }}>{p.n}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#004225', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{p.title}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#4A504A', lineHeight: 1.75 }}>{p.body}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const IronLeasePromise = ({ setPage }) => (
  <section style={{ background: '#002D18', padding: '112px 48px', position: 'relative', overflow: 'hidden' }}>
    {[600, 400, 220].map((s, i) => (
      <div key={i} style={{ position: 'absolute', top: '50%', left: '60%', transform: 'translate(-50%,-50%)', width: s, height: s, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.06)', pointerEvents: 'none' }} />
    ))}
    <div style={{ maxWidth: 1320, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <Reveal>
          <SectionLabel gold>The Iron Lease Promise</SectionLabel>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(40px, 5vw, 68px)', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 0.95, marginBottom: 28 }}>
            NOT A SLOGAN.<br />A CONTRACT.
          </h2>
          <GoldRule style={{ marginBottom: 28 }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
            A structured guarantee stack on lease performance outcomes. If we don't deliver, there are defined consequences. Most agencies promise results. We put them in writing.
          </p>
          <button onClick={() => setPage('contact')} style={{ background: 'transparent', border: '1.5px solid #C9A84C', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#C9A84C', padding: '13px 30px', borderRadius: 8, transition: 'background 0.2s, color 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#C9A84C'; e.currentTarget.style.color = '#002D18'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C9A84C'; }}
          >Discuss your asset</button>
        </Reveal>

        <Reveal delay={0.2}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { title: 'Lease Performance Guarantee', body: 'Defined rent review outcomes with contractual benchmarks. Below market recovery is not acceptable.' },
              { title: 'Vacancy Response SLA', body: 'Structured timeline for vacancy response, marketing, and tenant placement. Named remedies if missed.' },
              { title: 'Outgoings Reconciliation', body: 'Annual reconciliation completed by 31 March every year. No exceptions. No extensions.' },
              { title: 'Principal Accountability', body: "Nick O'Toole is personally liable for the obligations in this promise. Not a company. A person." },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '18px 22px', display: 'flex', gap: 16 }}>
                <div style={{ width: 2, background: '#C9A84C', flexShrink: 0, borderRadius: 2 }} />
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

const ServicesStrip = ({ setPage }) => {
  const services = [
    { n: '01', title: 'Asset Management', body: 'Full-scope management: leases, outgoings, maintenance, compliance, and net income optimisation across the asset lifecycle.' },
    { n: '02', title: 'Lease Advisory', body: 'Market rent reviews, lease renewals, incentive negotiation, and WALE extension strategies. Vacancy is not tolerated.' },
    { n: '03', title: 'Portfolio Reporting', body: 'Monthly net income statements, WALE dashboards, and anomaly alerts. Built in Re-Leased, delivered on time.' },
    { n: '04', title: 'Acquisition Due Diligence', body: 'Pre-purchase tenancy risk review, outgoings analysis, and WALE modelling for $2M–$30M SEQ industrial acquisitions.' },
  ];

  return (
    <section style={{ background: '#004225', padding: '112px 48px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <Reveal>
          <SectionLabel dark>Services</SectionLabel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 64 }}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>WHAT WE MANAGE</h2>
            <button onClick={() => setPage('services')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', padding: '10px 22px', borderRadius: 8, transition: 'border-color 0.2s, color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            >All services →</button>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {services.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '28px 24px', height: '100%', transition: 'background 0.25s, border-color 0.25s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 40, fontWeight: 700, color: '#C9A84C', opacity: 0.5, lineHeight: 1, marginBottom: 20 }}>{s.n}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{s.title}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{s.body}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const PrecinctFocus = ({ setPage }) => (
  <section style={{ background: '#F8F9F8', padding: '112px 48px' }}>
    <div style={{ maxWidth: 1320, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96, alignItems: 'center' }}>
        <Reveal>
          <SectionLabel>Precinct Specialisation</SectionLabel>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 700, color: '#004225', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 0.95, marginBottom: 28 }}>
            SEQ INDUSTRIAL.<br />KNOWN PRECINCTS.
          </h2>
          <GoldRule style={{ marginBottom: 28 }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: '#4A504A', lineHeight: 1.75, marginBottom: 36, maxWidth: 460 }}>
            Represent Commercial operates exclusively in Southeast Queensland industrial precincts. Deep knowledge of local tenant markets, comparable rents, and lease dynamics is not transferable from a national agency.
          </p>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 20, color: '#8A918A', borderLeft: '2px solid #C9A84C', paddingLeft: 20, marginBottom: 36 }}>
            "We know who the tenants are, what they pay, and what they'll pay next. That is the knowledge that creates value at renewal."
          </div>
          <button onClick={() => setPage('properties')} style={{ background: '#004225', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', padding: '14px 30px', borderRadius: 8, transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>View portfolio</button>
        </Reveal>

        <Reveal delay={0.2}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { name: 'Acacia Ridge', detail: 'South Brisbane industrial corridor. High-density logistics and distribution.', assets: '3 assets' },
              { name: 'Yatala', detail: 'Gold Coast–Brisbane corridor. Large-format warehousing and manufacturing.', assets: '1 asset' },
              { name: 'Hemmant', detail: 'East Brisbane industrial. Trade services, transport, and bulk storage.', assets: '1 asset' },
              { name: 'Brendale', detail: 'North Brisbane. Light industrial and trade precincts near arterial roads.', assets: '1 asset' },
            ].map((p, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E1E4E1', borderRadius: 12, padding: '22px 20px', transition: 'border-color 0.2s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#E1E4E1'}
              >
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, fontWeight: 700, color: '#004225', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{p.name}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#4A504A', lineHeight: 1.6, marginBottom: 14 }}>{p.detail}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C9A84C' }}>{p.assets}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

const CTAStrip = ({ setPage }) => (
  <section style={{ background: '#004225', padding: '80px 48px' }}>
    <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32 }}>
      <Reveal>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 8 }}>READY TO TALK ABOUT YOUR ASSET?</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>No obligation. No hand-offs. Nick responds personally.</div>
        </div>
      </Reveal>
      <button onClick={() => setPage('contact')} style={{ flexShrink: 0, background: '#C9A84C', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#002D18', padding: '16px 38px', borderRadius: 8, whiteSpace: 'nowrap', transition: 'opacity 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Request appraisal</button>
    </div>
  </section>
);

const HomePage = ({ setPage }) => (
  <div>
    <Hero setPage={setPage} />
    <OperatingModel />
    <IronLeasePromise setPage={setPage} />
    <ServicesStrip setPage={setPage} />
    <PrecinctFocus setPage={setPage} />
    <CTAStrip setPage={setPage} />
  </div>
);

Object.assign(window, { HomePage });
