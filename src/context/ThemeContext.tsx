import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'cyberpunk' | 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  isCyberpunk: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode | boolean) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'cyberpunk',
  isDark: true,
  isCyberpunk: true,
  toggleTheme: () => {},
  setTheme: () => {},
  cycleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('jee_physics_theme_v2');
      if (saved === 'cyberpunk' || saved === 'dark' || saved === 'light') {
        return saved;
      }
      const legacy = localStorage.getItem('jee_physics_theme');
      if (legacy === 'cyberpunk') return 'cyberpunk';
      if (legacy === 'light') return 'light';
    } catch {}
    // Default directly to Cyberpunk Synapse theme!
    return 'cyberpunk';
  });

  const isDark = theme === 'cyberpunk' || theme === 'dark';
  const isCyberpunk = theme === 'cyberpunk';

  useEffect(() => {
    const root = document.documentElement;
    
    // Clean all theme classes
    root.classList.remove('light', 'dark', 'cyberpunk', 'theme-cyberpunk');

    if (theme === 'cyberpunk') {
      root.classList.add('dark', 'cyberpunk', 'theme-cyberpunk');
      root.setAttribute('data-theme', 'cyberpunk');
      root.style.colorScheme = 'dark';
    } else if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }

    try {
      localStorage.setItem('jee_physics_theme_v2', theme);
      localStorage.setItem('jee_physics_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'cyberpunk') return 'dark';
      if (prev === 'dark') return 'light';
      return 'cyberpunk';
    });
  };

  const cycleTheme = () => toggleTheme();

  const setTheme = (val: ThemeMode | boolean) => {
    if (typeof val === 'boolean') {
      setThemeState(val ? 'cyberpunk' : 'light');
    } else {
      setThemeState(val);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, isCyberpunk, toggleTheme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

