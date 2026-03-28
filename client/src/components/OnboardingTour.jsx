import { useState, useLayoutEffect, useCallback } from 'react';

const STORAGE_KEY = 'qw_onboarded';

const STEPS = [
  {
    title: 'Upload your data',
    body: 'Drag a CSV or Excel file here, or tap a sample dataset to load instantly.'
  },
  {
    title: 'Ask in plain English',
    body: 'Type a question in plain English — the AI generates a query and runs it for you instantly.'
  },
  {
    title: 'See the chart',
    body: 'Explore auto-selected charts, SQL, and insights. Export when you are ready.'
  }
];

function selectorForStep(step, fileData) {
  if (step === 1) return '[data-tour="upload"]';
  if (step === 2) return fileData ? '[data-tour="query"]' : '[data-tour="upload"]';
  return fileData ? '[data-tour="chart"]' : '[data-tour="upload"]';
}

export default function OnboardingTour({ fileData }) {
  const [active, setActive] = useState(null);
  const [rect, setRect] = useState(null);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch { /* private mode */ }
    setActive(null);
  }, []);

  useLayoutEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }
    setActive(1);
  }, []);

  useLayoutEffect(() => {
    if (active == null) return;

    const update = () => {
      const sel = selectorForStep(active, fileData);
      const el = document.querySelector(sel);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height
      });
    };

    update();
    const ro = new ResizeObserver(update);
    const observed = document.querySelector(selectorForStep(active, fileData));
    if (observed) ro.observe(observed);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [active, fileData]);

  if (active == null) return null;

  const step = STEPS[active - 1];
  const canNext = active === 1 ? !!fileData : true;

  const next = () => {
    if (active === 1 && !fileData) return;
    if (active < 3) setActive(active + 1);
    else finish();
  };

  const tooltipLeft = rect
    ? Math.min(
      Math.max(16, rect.left + rect.width / 2 - 140),
      (typeof window !== 'undefined' ? window.innerWidth : 400) - 296
    )
    : 16;
  const tooltipTop = rect ? rect.bottom + 12 : 120;

  const shade = 'rgba(0,0,0,0.45)';
  const pad = 6;

  return (
    <>
      {rect ? (
        <>
          <div
            className="fixed left-0 right-0 z-[100]"
            style={{ top: 0, height: Math.max(0, rect.top - pad), background: shade, pointerEvents: 'auto' }}
            aria-hidden
          />
          <div
            className="fixed left-0 z-[100]"
            style={{
              top: rect.top - pad,
              width: Math.max(0, rect.left - pad),
              height: rect.height + pad * 2,
              background: shade,
              pointerEvents: 'auto'
            }}
            aria-hidden
          />
          <div
            className="fixed z-[100]"
            style={{
              top: rect.top - pad,
              left: rect.left + rect.width + pad,
              right: 0,
              height: rect.height + pad * 2,
              background: shade,
              pointerEvents: 'auto'
            }}
            aria-hidden
          />
          <div
            className="fixed left-0 right-0 z-[100]"
            style={{
              top: rect.top + rect.height + pad,
              bottom: 0,
              background: shade,
              pointerEvents: 'auto'
            }}
            aria-hidden
          />
        </>
      ) : (
        <div
          className="fixed inset-0 z-[100]"
          style={{ background: shade, pointerEvents: 'auto' }}
          aria-hidden
        />
      )}
      {rect && (
        <div
          className="fixed z-[101] pointer-events-none rounded-xl"
          style={{
            left: rect.left - 4,
            top: rect.top - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            border: '2px solid var(--accent)',
            boxShadow: '0 0 0 4px var(--accent-glow)',
            borderRadius: '14px'
          }}
        />
      )}
      <div
        className="fixed z-[102] w-[280px] max-w-[calc(100vw-32px)] rounded-xl p-4 shadow-xl pointer-events-auto"
        style={{
          left: tooltipLeft,
          top: Math.min(tooltipTop, (typeof window !== 'undefined' ? window.innerHeight : 600) - 220),
          background: 'var(--bg-card)',
          border: '1px solid var(--border)'
        }}
      >
        <div className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>
          Step {active} of 3
        </div>
        <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
        <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{step.body}</p>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={finish}
            className="text-xs px-2 py-1.5 rounded-lg"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Skip
          </button>
          <div className="flex gap-2">
            {active > 1 && (
              <button
                type="button"
                onClick={() => setActive((s) => s - 1)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              className="text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-40"
              style={{
                background: canNext ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: '#fff'
              }}
            >
              {active === 3 ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
        {active === 1 && !fileData && (
          <p className="text-[10px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
            Load a file to continue to the next step.
          </p>
        )}
      </div>
    </>
  );
}
