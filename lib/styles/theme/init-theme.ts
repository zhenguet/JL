const DEFAULT_THEME: 'dark' | 'light' = 'dark'

export const initThemeScript = `
  (function() {
    try {
      const savedTheme = localStorage.getItem('theme');
      const theme = savedTheme === 'dark' || savedTheme === 'light' 
        ? savedTheme 
        : '${DEFAULT_THEME}';
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', '${DEFAULT_THEME}');
    }
  })();
`
