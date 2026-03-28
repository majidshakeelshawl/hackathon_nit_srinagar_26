const STORAGE_KEY = 'qw_theme';

export function getThemeMode() {
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
}

export function setThemeMode(mode) {
  if (mode === 'light' || mode === 'dark' || mode === 'system') {
    localStorage.setItem(STORAGE_KEY, mode);
  }
  applyTheme();
}

export function applyTheme() {
  const mode = getThemeMode();
  let effective;
  if (mode === 'light') effective = 'light';
  else if (mode === 'dark') effective = 'dark';
  else {
    effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', effective);
}

export function cycleThemeMode() {
  const order = ['system', 'light', 'dark'];
  const cur = getThemeMode();
  const i = order.indexOf(cur);
  const next = order[(i + 1) % order.length];
  setThemeMode(next);
  return next;
}

export function initTheme() {
  applyTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemeMode() === 'system') applyTheme();
  });
}
