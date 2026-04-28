import { useEffect, useMemo, useState } from 'react';
import {
  applyTheme,
  DARK_THEME,
  getPreferredTheme,
  LIGHT_THEME,
  THEME_STORAGE_KEY,
} from '../utils/theme';
import { ThemeContext } from '../context/theme-context';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => getPreferredTheme());

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      if (event.newValue === DARK_THEME || event.newValue === LIGHT_THEME) {
        setTheme(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDarkTheme: theme === DARK_THEME,
      setTheme,
      toggleTheme: () => {
        setTheme((currentTheme) => (currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME));
      },
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
