export const THEME_STORAGE_KEY = 'theme';
export const LIGHT_THEME = 'light';
export const DARK_THEME = 'dark';

export function getStoredTheme() {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === DARK_THEME || storedTheme === LIGHT_THEME ? storedTheme : null;
}

export function getSystemTheme() {
  if (typeof window === 'undefined') {
    return LIGHT_THEME;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK_THEME : LIGHT_THEME;
}

export function getPreferredTheme() {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') {
    return;
  }

  const isDarkTheme = theme === DARK_THEME;
  document.documentElement.classList.toggle(DARK_THEME, isDarkTheme);
  document.documentElement.style.colorScheme = isDarkTheme ? DARK_THEME : LIGHT_THEME;
}

export function initializeTheme() {
  const theme = getPreferredTheme();
  applyTheme(theme);
  return theme;
}
