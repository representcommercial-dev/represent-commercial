// ── About, Services, Properties, Contact Pages ──

const AboutPage = ({ setPage }) => (
  <div>
    <section style={{ background: '#004225', padding: '140px 48px 96px', position: 'relative', overflow: 'hidden' }}>
      {[500, 340, 200].map((s, i) => (
        <div key={i} style={{ position: 'absolute', top: -s * 0.2, right: -s * 0.2, width: s, height: s, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
      ))}
      <div style={{ maxWidth: 1320, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <SectionLabel gold>01 · About</SectionLabel>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 0.92, marginBottom: 32 }}>THE PRINCIPAL<br />BEHIND EVERY DEAL.</h1>
        <GoldRule style={{ marginBottom: 28 }} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 560 }}>
          Nick O'Toole has spent 20 years inside the private offices of wealthy families — not as a service provider, but as the person making decisions. That tenure produced Represent Commercial.
        </p>
      </div>
    </section>

    <section style={{ background: '#F8F9F8', padding: '96px 48px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
        <Reveal>
          <SectionLabel>Principal & Licensee</SectionLabel>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 56, fontWeight: 700, color: '#004225', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 0.95, marginBottom: 24 }}>NICK O'TOOLE</h2>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 22, color: '#4A504A', marginBottom: 28, borderLeft: '2px solid #C9A84C', paddingLeft: 20, lineHeight: 1.4 }}>
            "The person who signs your agreement is the same person reviewing your lease, interrogating your outgoings, and negotiating your rent review."
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#4A504A', lineHeight: 1.8, marginBottom: 20 }}>
            Two decades managing commercial assets for private wealthy families gave Nick a fundamentally different perspective on what asset management should be. He saw firsthand how large agencies failed the $2M–$30M market: junior property managers rotating every 18 months, accountability diffused across teams, decisions made by people who didn't understand the owner's real objective.
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#4A504A', lineHeight: 1.8, marginBottom: 36 }}>
            Represent Commercial was built to fix that. One principal. One filter. Net income.
          </p>
          <button onClick={() => setPage('contact')} style={{ background: '#004225', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', padding: '14px 30px', borderRadius: 8, transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Start a conversation</button>
        </Reveal>

        <Reveal delay={0.15}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(0,66,37,0.4)', marginBottom: 16 }}>Credentials</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {[
              { l: 'Experience', v: '20 years private family office management' },
              { l: 'Licence', v: 'Queensland Real Estate Agent Licence' },
              { l: 'Specialisation', v: 'SEQ Industrial — $2M–$30M range' },
              { l: 'Precincts', v: 'Acacia Ridge · Yatala · Hemmant · Brendale' },
              { l: 'Technology', v: 'Re-Leased · HubSpot · AI-powered reporting' },
            ].map((c, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E1E4E1', borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 16 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8A918A', width: 108, flexShrink: 0, paddingTop: 2 }}>{c.l}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#2E332E' }}>{c.v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#004225', borderRadius: 12, padding: '28px 28px' }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#C9A84C', marginBottom: 12 }}>The Iron Lease Promise</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75 }}>
              A structured guarantee stack on lease performance outcomes. If we don't deliver, there are defined consequences. Not a slogan — a contractual commitment backed by Nick's personal liability.
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <section style={{ background: '#002D18', padding: '80px 48px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32 }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 48, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em' }}>READY TO TALK?</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 18, color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>No obligation. No account managers. Nick responds personally.</div>
        </div>
        <button onClick={() => setPage('contact')} style={{ flexShrink: 0, background: '#C9A84C', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#002D18', padding: '16px 38px', borderRadius: 8, transition: 'opacity 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Request appraisal</button>
      </div>
    </section>
  </div>
);

const ServicesPage = ({ setPage }) => {
  const services = [
    { n: '01', title: 'Asset Management', sub: 'Full-scope commercial property management', items: ['Lease administration and compliance', 'Outgoings reconciliation and recovery', 'Planned and reactive maintenance oversight', 'Insurance and risk management coordination', 'Monthly net income reporting and variance analysis'] },
    { n: '02', title: 'Lease Advisory', sub: 'Protecting and growing rental income', items: ['Market rent reviews and comparable analysis', 'Lease renewal negotiation', 'Incentive structuring and WALE extension', 'Vacancy response and tenant procurement', 'Lease documentation and execution'] },
    { n: '03', title: 'Portfolio Reporting', sub: 'Institutional-quality data for private owners', items: ['Monthly net income statements', 'WALE and expiry schedule dashboards', 'Outgoings budget vs. actual reporting', 'Anomaly alerts and covenant monitoring', 'AI-powered narrative commentary'] },
    { n: '04', title: 'Acquisition Due Diligence', sub: 'Pre-purchase tenancy and lease risk review', items: ['Tenancy covenant assessment', 'Outgoings liability analysis', 'Rent reversion and WALE modelling', 'Comparable market rent benchmarking', 'Acquisition management strategy'] },
  ];

  return (
    <div>
      <section style={{ background: '#004225', padding: '140px 48px 96px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <SectionLabel gold>02 · Services</SectionLabel>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 0.92, marginBottom: 32 }}>WHAT WE<br />MANAGE.</h1>
          <GoldRule style={{ marginBottom: 28 }} />
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 520 }}>
            Every service is delivered by Nick O'Toole directly. Principal-led means exactly that — one person accountable for every outcome.
          </p>
        </div>
      </section>

      <section style={{ background: '#F8F9F8', padding: '96px 48px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {services.map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div style={{ background: '#fff', border: '1px solid #E1E4E1', borderRadius: 14, padding: '36px 40px', display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 40, alignItems: 'start' }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 56, fontWeight: 700, color: '#C9A84C', opacity: 0.45, lineHeight: 1 }}>{s.n}</div>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, color: '#004225', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 17, color: '#8A918A' }}>{s.sub}</div>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {s.items.map((item, j) => (
                    <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C9A84C', marginTop: 7, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#4A504A', lineHeight: 1.5 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section style={{ background: '#004225', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 48, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em' }}>DISCUSS YOUR ASSET.</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 18, color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>A conversation costs nothing. A bad manager costs a great deal more.</div>
          </div>
          <button onClick={() => setPage('contact')} style={{ flexShrink: 0, background: '#C9A84C', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#002D18', padding: '16px 38px', borderRadius: 8, transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Request appraisal</button>
        </div>
      </section>
    </div>
  );
};

const PropertiesPage = () => {
  const [filter, setFilter] = React.useState('All');
  const assets = [
    { addr: '446–452 Sheridan St', suburb: 'Cairns North', state: 'QLD 4870', type: 'Industrial', status: 'Leased', income: '$247,800', wale: '4.3 yrs', vacancy: '0%', value: '$4.2M', precinct: 'Cairns' },
    { addr: '18 Tile St', suburb: 'Wacol', state: 'QLD 4076', type: 'Industrial', status: 'Leased', income: '$186,400', wale: '3.1 yrs', vacancy: '0%', value: '$3.1M', precinct: 'Acacia Ridge' },
    { addr: '7 Jijaws St', suburb: 'Sumner Park', state: 'QLD 4074', type: 'Industrial', status: 'Under Review', income: '$124,000', wale: '1.8 yrs', vacancy: '0%', value: '$2.4M', precinct: 'Acacia Ridge' },
    { addr: '32 Spine St', suburb: 'Sumner', state: 'QLD 4074', type: 'Industrial', status: 'Leased', income: '$312,600', wale: '5.5 yrs', vacancy: '0%', value: '$5.8M', precinct: 'Acacia Ridge' },
    { addr: '14 Commerce Ct', suburb: 'Yatala', state: 'QLD 4207', type: 'Industrial', status: 'Leased', income: '$198,200', wale: '3.8 yrs', vacancy: '0%', value: '$3.6M', precinct: 'Yatala' },
    { addr: '9 Bile Rd', suburb: 'Hemmant', state: 'QLD 4174', type: 'Industrial', status: 'Vacant', income: '—', wale: '—', vacancy: '100%', value: '$2.1M', precinct: 'Hemmant' },
    { addr: '42 Kremzow Rd', suburb: 'Brendale', state: 'QLD 4500', type: 'Industrial', status: 'Leased', income: '$276,000', wale: '4.0 yrs', vacancy: '0%', value: '$4.9M', precinct: 'Brendale' },
  ];
  const precincts = ['All', ...Array.from(new Set(assets.map(a => a.precinct)))];
  const filtered = filter === 'All' ? assets : assets.filter(a => a.precinct === filter);

  return (
    <div>
      <section style={{ background: '#004225', padding: '140px 48px 96px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <SectionLabel gold>03 · Portfolio</SectionLabel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 32 }}>
            <div>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 0.92, marginBottom: 12 }}>MANAGED<br />ASSETS.</h1>
              <GoldRule />
            </div>
            <div style={{ display: 'flex', gap: 48 }}>
              {[{ l: 'Total AUM', v: '$47.2M' }, { l: 'Avg WALE', v: '4.3 yrs' }, { l: 'Occupancy', v: '86%' }].map((s, i) => (
                <div key={i} style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 44, fontWeight: 700, color: i === 2 ? '#00A35E' : '#fff', lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.38)', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: '#F8F9F8', padding: '64px 48px 96px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
            {precincts.map(p => (
              <button key={p} onClick={() => setFilter(p)} style={{ background: filter === p ? '#004225' : '#fff', border: `1px solid ${filter === p ? '#004225' : '#E1E4E1'}`, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: filter === p ? '#fff' : '#4A504A', padding: '8px 18px', borderRadius: 6, transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {filtered.map((a, i) => <PropertyCard key={i} {...a} onClick={() => {}} />)}
          </div>
        </div>
      </section>
    </div>
  );
};

const ContactPage = () => {
  const [form, setForm] = React.useState({ name: '', email: '', phone: '', address: '', value: '', notes: '' });
  const [sent, setSent] = React.useState(false);
  const [active, setActive] = React.useState(null);

  const inputStyle = (id) => ({
    width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#0D0F0D',
    background: '#F8F9F8', border: `1.5px solid ${active === id ? '#004225' : '#E1E4E1'}`,
    borderRadius: 8, padding: '11px 14px', outline: 'none', transition: 'border-color 0.2s',
  });

  return (
    <div>
      <section style={{ background: '#F8F9F8', padding: '140px 48px 96px', minHeight: '80vh' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96, alignItems: 'start' }}>
          <Reveal>
            <SectionLabel>04 · Contact</SectionLabel>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 700, color: '#004225', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 0.92, marginBottom: 28 }}>LET'S TALK<br />ABOUT YOUR<br />ASSET.</h1>
            <GoldRule style={{ marginBottom: 28 }} />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#4A504A', lineHeight: 1.8, marginBottom: 40, maxWidth: 440 }}>
              If you own commercial property in SEQ in the $2M–$30M range and you're not certain your current management is maximising net income, a conversation costs nothing.
            </p>
            {[
              { label: 'Mobile', value: '+61 401 825 999' },
              { label: 'Email', value: 'nick@represent.au' },
              { label: 'Website', value: 'represent.au' },
              { label: 'Location', value: 'Brisbane, Queensland' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 24, padding: '14px 0', borderBottom: '1px solid #E1E4E1' }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8A918A', width: 80, paddingTop: 2 }}>{c.label}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#004225', fontWeight: 500 }}>{c.value}</div>
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.15}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '44px', border: '1px solid #E1E4E1', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              {sent ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,163,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1.5px solid rgba(0,163,94,0.3)' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00A35E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 700, color: '#004225', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 }}>RECEIVED.</div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#4A504A', lineHeight: 1.75 }}>Nick will be in touch within one business day. No account managers. No hand-offs.</p>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#C9A84C', marginBottom: 24 }}>Appraisal Request</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    {[
                      { id: 'name', label: 'Full Name', placeholder: 'Nick Smith', type: 'text' },
                      { id: 'phone', label: 'Mobile', placeholder: '+61 4XX XXX XXX', type: 'tel' },
                    ].map(f => (
                      <div key={f.id}>
                        <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A504A', marginBottom: 6 }}>{f.label}</label>
                        <input type={f.type} placeholder={f.placeholder} value={form[f.id]} onChange={e => setForm({...form, [f.id]: e.target.value})} onFocus={() => setActive(f.id)} onBlur={() => setActive(null)} style={inputStyle(f.id)} />
                      </div>
                    ))}
                  </div>
                  {[
                    { id: 'email', label: 'Email Address', placeholder: 'you@example.com', type: 'email' },
                    { id: 'address', label: 'Property Address', placeholder: '446 Sheridan St, Cairns North QLD', type: 'text' },
                    { id: 'value', label: 'Approx. Asset Value', placeholder: '$4,200,000', type: 'text' },
                  ].map(f => (
                    <div key={f.id} style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A504A', marginBottom: 6 }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} value={form[f.id]} onChange={e => setForm({...form, [f.id]: e.target.value})} onFocus={() => setActive(f.id)} onBlur={() => setActive(null)} style={inputStyle(f.id)} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A504A', marginBottom: 6 }}>Additional Context</label>
                    <textarea rows={3} placeholder="Current management arrangement, specific concerns, timeline..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} onFocus={() => setActive('notes')} onBlur={() => setActive(null)} style={{ ...inputStyle('notes'), resize: 'vertical' }} />
                  </div>
                  <button type="submit" style={{ width: '100%', background: '#004225', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#fff', padding: '15px 0', borderRadius: 8, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Submit request</button>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#8A918A', textAlign: 'center', marginTop: 14 }}>Nick responds personally within one business day.</div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

Object.assign(window, { AboutPage, ServicesPage, PropertiesPage, ContactPage });
