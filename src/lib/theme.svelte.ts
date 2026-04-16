import { browser } from '$app/environment';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme';

function readStored(): ThemeMode {
  if (!browser) return 'system';
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'light' || v === 'dark' ? v : 'system';
}

function systemPrefersDark(): boolean {
  return browser && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveDark(mode: ThemeMode): boolean {
  return mode === 'dark' || (mode === 'system' && systemPrefersDark());
}

function createTheme() {
  let mode = $state<ThemeMode>(readStored());
  let isDark = $state<boolean>(browser ? resolveDark(mode) : false);

  function apply() {
    if (!browser) return;
    const dark = resolveDark(mode);
    document.documentElement.classList.toggle('dark', dark);
    isDark = dark;
  }

  if (browser) {
    apply();
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', () => {
      if (mode === 'system') apply();
    });
  }

  return {
    get mode() {
      return mode;
    },
    get isDark() {
      return isDark;
    },
    set(next: ThemeMode) {
      mode = next;
      if (browser) {
        if (next === 'system') localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, next);
        apply();
      }
    },
    cycle() {
      const order: ThemeMode[] = ['system', 'light', 'dark'];
      const next = order[(order.indexOf(mode) + 1) % order.length];
      mode = next;
      if (browser) {
        if (next === 'system') localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, next);
        apply();
      }
    }
  };
}

export const theme = createTheme();
