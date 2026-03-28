import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* ─── HERO ─── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6" style={{
        minHeight: '100vh',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }}>
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'var(--accent)' }} />

        <div className="relative z-10 fade-in">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span className="text-white text-xl font-bold">Q</span>
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>QueryWise</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: 'var(--text-primary)', maxWidth: '720px' }}>
            Query your company data{' '}
            <br className="hidden sm:block" />
            in <span style={{ color: 'var(--accent)' }}>plain English</span>
          </h1>

          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Upload a spreadsheet. Ask a question. Get instant charts and SQL. No coding needed.
          </p>

          <Link to="/workspace">
            <button className="px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg" style={{
              background: 'var(--accent)',
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.target.style.background = 'var(--accent)'}
            >
              Try it free — no signup →
            </button>
          </Link>

          <p className="text-xs mt-4" style={{ color: 'var(--text-tertiary)' }}>
            No login required · Works with CSV and Excel · Powered by NVIDIA NIM
          </p>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12" style={{ color: 'var(--text-primary)' }}>
            How it works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector lines (hidden on mobile) */}
            <div className="hidden md:block absolute top-1/2 left-[33%] w-[34%] h-px" style={{ background: 'var(--border)' }} />

            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: 'Upload',
                desc: 'Drop your CSV or Excel file'
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                title: 'Ask',
                desc: 'Type your question in plain English'
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="1.5">
                    <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round"/><line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round"/><line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round"/>
                  </svg>
                ),
                title: 'Explore',
                desc: 'Get instant charts, SQL, and insights'
              }
            ].map((step, i) => (
              <div key={i} className="rounded-xl p-6 text-center relative" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)'
              }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-tertiary)' }}>
                  {step.icon}
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{
                  background: 'var(--accent)',
                  color: '#fff'
                }}>
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4" style={{ color: 'var(--text-primary)' }}>
            Built for speed. Built to win.
          </h2>
          <p className="text-center text-sm mb-10" style={{ color: 'var(--text-secondary)' }}>
            See how QueryWise compares to traditional BI tools
          </p>

          <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Feature', 'QueryWise', 'Metabase', 'Tableau', 'Power BI'].map((h, i) => (
                    <th key={i} className="text-left text-xs font-medium uppercase tracking-wider px-5 py-3" style={{
                      background: i === 1 ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                      color: i === 1 ? 'var(--accent)' : 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border)',
                      borderLeft: i === 1 ? '2px solid var(--accent)' : 'none',
                      borderRight: i === 1 ? '2px solid var(--accent)' : 'none'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Setup time', '< 1 min', '30+ min', '1+ hour', '1+ hour'],
                  ['Needs engineer', '❌ No', '⚠️ Some', '✅ Yes', '✅ Yes'],
                  ['Natural language', '✅ Yes', '❌ No', '❌ No', '⚠️ Partial'],
                  ['Shows SQL', '✅ Yes', '✅ Yes', '❌ No', '❌ No'],
                  ['File upload', '✅ Yes', '❌ No', '✅ Yes', '✅ Yes'],
                  ['Price', 'Free', 'Free/Paid', '$70/mo', '$10/mo']
                ].map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-5 py-3 text-sm" style={{
                        borderBottom: '1px solid var(--border)',
                        color: ci === 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
                        fontWeight: ci === 0 ? 500 : 400,
                        background: ci === 1 ? 'var(--accent-glow)' : 'transparent',
                        borderLeft: ci === 1 ? '2px solid var(--accent)' : 'none',
                        borderRight: ci === 1 ? '2px solid var(--accent)' : 'none'
                      }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section className="py-16 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-lg font-semibold mb-8" style={{ color: 'var(--text-secondary)' }}>Built with</h2>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { name: 'NVIDIA NIM', color: '#76B900' },
              { name: 'DuckDB', color: '#FFC107' },
              { name: 'Convex', color: '#F97316' },
              { name: 'React', color: '#61DAFB' },
              { name: 'Vercel', color: '#fff' }
            ].map((tech, i) => (
              <div key={i} className="text-sm font-semibold px-4 py-2 rounded-lg" style={{
                color: tech.color,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)'
              }}>
                {tech.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          QueryWise · Built at Cursor Hackathon 2025
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
          Powered by NVIDIA NIM · Real-time sync by Convex · Deployed on Vercel
        </p>
      </footer>
    </div>
  );
}
