import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

/* ─── Typing animation for hero input ─── */
const DEMO_QUESTIONS = [
  'Show total revenue by region',
  'Which product had the most returns?',
  'Monthly growth rate trend',
  'Top 10 customers by spend',
  'Compare Q3 vs Q4 performance'
];

function TypingDemo() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = DEMO_QUESTIONS[idx];
    let t;
    if (!deleting && text.length < target.length) {
      t = setTimeout(() => setText(target.slice(0, text.length + 1)), 45 + Math.random() * 25);
    } else if (!deleting && text.length === target.length) {
      t = setTimeout(() => setDeleting(true), 2400);
    } else if (deleting && text.length > 0) {
      t = setTimeout(() => setText(text.slice(0, -1)), 20);
    } else {
      setDeleting(false);
      setIdx((i) => (i + 1) % DEMO_QUESTIONS.length);
    }
    return () => clearTimeout(t);
  }, [text, deleting, idx]);

  return (
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--text-primary)' }}>
      {text}
      <span style={{
        display: 'inline-block', width: '2px', height: '16px',
        background: 'var(--accent)', marginLeft: '2px', verticalAlign: 'text-bottom',
        animation: 'typewriter-caret 1s step-end infinite'
      }} />
    </span>
  );
}

/* ─── Animated stat counter ─── */
function Counter({ end, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let n = 0;
        const step = Math.max(1, Math.ceil(end / 40));
        const id = setInterval(() => {
          n += step;
          if (n >= end) { setVal(end); clearInterval(id); }
          else setVal(n);
        }, 30);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{val}{suffix}</span>;
}

export default function Landing() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>

      {/* ═══ STICKY NAV ═══ */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8" style={{
        height: '56px', borderBottom: '1px solid var(--border)'
      }}>
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-gradient">
            <span className="text-white text-xs font-bold">Q</span>
          </div>
          <span className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>QueryWise</span>
        </a>
        <Link
          to="/workspace"
          className="text-[13px] px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Get Started
        </Link>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 dot-grid overflow-hidden" style={{
        minHeight: '100vh', paddingTop: '56px'
      }}>
        {/* Background orbs */}
        <div className="hero-orb" style={{ width: '600px', height: '600px', background: 'var(--grad-from)', opacity: 0.06, top: '5%', left: '10%' }} />
        <div className="hero-orb" style={{ width: '500px', height: '500px', background: 'var(--grad-to)', opacity: 0.05, bottom: '10%', right: '5%', animationDelay: '-8s' }} />

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Pill badge */}
          <div className="fade-in mb-8">
            <span className="inline-flex items-center gap-2 text-xs font-medium px-3.5 py-1.5 rounded-full" style={{
              background: 'var(--accent-glow)', color: 'var(--accent)',
              border: '1px solid var(--accent-soft)'
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'glow-pulse 2s infinite' }} />
              AI-Powered Data Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 className="fade-in-1 text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[1.08] tracking-tight mb-5" style={{ color: 'var(--text-primary)' }}>
            Ask your data anything.{' '}
            <span className="text-gradient">Get answers instantly.</span>
          </h1>

          <p className="fade-in-2 text-[15px] sm:text-base leading-relaxed mb-8 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Upload a spreadsheet, ask a question in plain English, and get AI-generated charts, insights, and analysis in seconds.
          </p>

          {/* CTA row */}
          <div className="fade-in-3 flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link to="/workspace">
              <button className="px-7 py-3 rounded-xl text-[15px] font-semibold text-white bg-accent-gradient transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg" style={{
                boxShadow: '0 4px 20px rgba(59,130,246,0.25)'
              }}>
                Start analyzing — free
              </button>
            </Link>
            <a href="#how-it-works" className="px-5 py-3 rounded-xl text-sm font-medium transition-colors duration-200" style={{
              color: 'var(--text-secondary)', border: '1px solid var(--border)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              See how it works ↓
            </a>
          </div>

          <p className="fade-in-4 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            No signup · CSV, XLSX, XLS supported · Enterprise-grade AI
          </p>

          {/* ── Fake terminal demo ── */}
          <div className="fade-in-4 mt-14 rounded-2xl overflow-hidden mx-auto max-w-lg text-left" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            boxShadow: '0 24px 80px -12px var(--shadow-color)'
          }}>
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
              <span className="ml-3 text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>QueryWise AI</span>
            </div>
            <div className="px-5 py-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Ask anything…</div>
              <div className="rounded-lg px-4 py-3" style={{ background: 'var(--bg-tertiary)', minHeight: '32px' }}>
                <TypingDemo />
              </div>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>⌘K to focus</span>
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>↵ to run</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ METRICS BAR ═══ */}
      <section style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: 'var(--border)' }}>
          {[
            { val: 10, suf: 'x', label: 'Faster than SQL' },
            { val: 3, suf: '+', label: 'Formats: CSV, XLSX, XLS' },
            { val: 5, suf: 's', label: 'Avg query time' },
            { val: 99, suf: '%', label: 'Query accuracy' }
          ].map((s, i) => (
            <div key={i} className="py-8 px-4 text-center" style={{ background: 'var(--bg-secondary)' }}>
              <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                <Counter end={s.val} suffix={s.suf} />
              </div>
              <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-center mb-3" style={{ color: 'var(--accent)' }}>How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-4" style={{ color: 'var(--text-primary)' }}>
            Three steps to <span className="text-gradient">data clarity</span>
          </h2>
          <p className="text-sm text-center mb-14 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            No setup. No configuration. Just answers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { n: '01', title: 'Upload', desc: 'Drag & drop any CSV or Excel file. AI scans your schema automatically.', color: 'var(--grad-from)',
                icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { n: '02', title: 'Ask', desc: 'Type a question in plain English. The AI converts it to database queries.', color: 'var(--accent)',
                icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { n: '03', title: 'Discover', desc: 'Get auto-generated charts, key insights, and exportable results instantly.', color: 'var(--grad-to)',
                icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round"/><line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round"/><line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round"/></svg> }
            ].map((step, i) => (
              <div key={i} className="rounded-2xl p-6 text-center card-hover" style={{ background: 'var(--bg-card)' }}>
                <div className="text-[10px] font-bold tracking-widest mb-4" style={{ color: 'var(--text-tertiary)' }}>STEP {step.n}</div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent-glow)', color: step.color }}>
                  {step.icon}
                </div>
                <h3 className="font-semibold text-[15px] mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-24 px-6" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-center mb-3" style={{ color: 'var(--accent)' }}>Capabilities</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-14" style={{ color: 'var(--text-primary)' }}>
            Everything you need to <span className="text-gradient">understand your data</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '✦', title: 'Natural Language Queries', desc: 'Ask questions the way you think — no SQL required.' },
              { icon: '◎', title: 'Smart Visualizations', desc: 'Auto-selected charts based on data shape and query intent.' },
              { icon: '◈', title: 'AI-Generated Insights', desc: 'Surface trends, anomalies, and key takeaways automatically.' },
              { icon: '↻', title: 'Conversational Follow-ups', desc: 'Refine analysis with natural follow-up questions.' },
              { icon: '⊞', title: 'Multi-File Analysis', desc: 'Upload multiple files — AI discovers join keys automatically.' },
              { icon: '⇗', title: 'Export & Share', desc: 'Download charts, export CSV, or share results via link.' }
            ].map((f, i) => (
              <div key={i} className="rounded-xl p-5 flex gap-4 card-hover" style={{ background: 'var(--bg-card)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-medium" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[13px] mb-1" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON TABLE ═══ */}
      <section className="py-24 px-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-3" style={{ color: 'var(--text-primary)' }}>
            Why teams choose <span className="text-gradient">QueryWise</span>
          </h2>
          <p className="text-sm text-center mb-12 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Traditional BI tools need engineers and hours. QueryWise takes seconds.
          </p>

          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Capability', 'QueryWise', 'Metabase', 'Tableau', 'Power BI'].map((h, i) => (
                    <th key={i} className="text-left text-[11px] font-medium uppercase tracking-wider px-4 py-3" style={{
                      background: i === 1 ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                      color: i === 1 ? 'var(--accent)' : 'var(--text-tertiary)',
                      borderBottom: '1px solid var(--border)',
                      borderLeft: i === 1 ? '2px solid var(--accent)' : 'none',
                      borderRight: i === 1 ? '2px solid var(--accent)' : 'none'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Setup time', '< 1 min', '30+ min', '1+ hr', '1+ hr'],
                  ['Needs engineer', '❌ No', '⚠️ Some', '✅ Yes', '✅ Yes'],
                  ['Natural language', '✅ Built-in', '❌ No', '❌ No', '⚠️ Limited'],
                  ['AI insights', '✅ Auto', '❌ No', '❌ No', '❌ No'],
                  ['File upload', '✅ Yes', '❌ No', '✅ Yes', '✅ Yes'],
                  ['Price', 'Free', 'Free/Paid', '$70/mo', '$10/mo']
                ].map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-3 text-[13px]" style={{
                        borderBottom: '1px solid var(--border)',
                        color: ci === 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
                        fontWeight: ci === 0 ? 500 : 400,
                        background: ci === 1 ? 'var(--accent-glow)' : 'transparent',
                        borderLeft: ci === 1 ? '2px solid var(--accent)' : 'none',
                        borderRight: ci === 1 ? '2px solid var(--accent)' : 'none'
                      }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="hero-orb" style={{ width: '500px', height: '500px', background: 'var(--grad-from)', opacity: 0.04, top: '-30%', right: '-15%' }} />
        <div className="max-w-lg mx-auto text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
            Ready to unlock your data?
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            No signup, no credit card, no configuration.
          </p>
          <Link to="/workspace">
            <button className="px-8 py-3.5 rounded-xl text-[15px] font-semibold text-white bg-accent-gradient transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg" style={{
              boxShadow: '0 4px 20px rgba(59,130,246,0.2)'
            }}>
              Start for free →
            </button>
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-accent-gradient">
            <span className="text-white text-[9px] font-bold">Q</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>QueryWise</span>
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          AI-powered data intelligence · Built for teams who move fast
        </p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)', opacity: 0.5 }}>
          © {new Date().getFullYear()} QueryWise
        </p>
      </footer>
    </div>
  );
}
