import React, { useEffect, useMemo, useState } from 'react';
import ThemeContext from './theme-context';

const THEME_STORAGE_KEY = 'groupify-theme';
const COLOR_MODE_STORAGE_KEY = 'groupify-color-mode';
const CONTRAST_STORAGE_KEY = 'groupify-contrast';
const MOTION_STORAGE_KEY = 'groupify-motion';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialColorMode() {
  if (typeof window === 'undefined') return 'default';

  const savedColorMode = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);
  return savedColorMode === 'accessible' ? 'accessible' : 'default';
}

function getInitialHighContrast() {
  if (typeof window === 'undefined') return false;

  const savedContrast = window.localStorage.getItem(CONTRAST_STORAGE_KEY);
  if (savedContrast === 'high') return true;
  if (savedContrast === 'standard') return false;

  return window.matchMedia?.('(prefers-contrast: more)')?.matches ?? false;
}

function getInitialReducedMotion() {
  if (typeof window === 'undefined') return false;

  const savedMotion = window.localStorage.getItem(MOTION_STORAGE_KEY);
  if (savedMotion === 'reduced') return true;
  if (savedMotion === 'normal') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [colorMode, setColorMode] = useState(getInitialColorMode);
  const [highContrast, setHighContrast] = useState(getInitialHighContrast);
  const [reducedMotion, setReducedMotion] = useState(getInitialReducedMotion);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.colorMode = colorMode;
    document.documentElement.dataset.contrast = highContrast ? 'high' : 'standard';
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'normal';
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, colorMode);
    window.localStorage.setItem(CONTRAST_STORAGE_KEY, highContrast ? 'high' : 'standard');
    window.localStorage.setItem(MOTION_STORAGE_KEY, reducedMotion ? 'reduced' : 'normal');
  }, [theme, colorMode, highContrast, reducedMotion]);

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme: () => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark')),
    colorMode,
    setColorMode,
    highContrast,
    setHighContrast,
    toggleHighContrast: () => setHighContrast((currentValue) => !currentValue),
    reducedMotion,
    setReducedMotion,
    toggleReducedMotion: () => setReducedMotion((currentValue) => !currentValue),
  }), [theme, colorMode, highContrast, reducedMotion]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
