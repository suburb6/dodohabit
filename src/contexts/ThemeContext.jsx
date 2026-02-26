import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);
const FIXED_THEME = 'brand';

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark', 'brand-theme');
        root.classList.add('brand-theme');
    }, []);

    const toggleTheme = () => undefined;

    return (
        <ThemeContext.Provider value={{ theme: FIXED_THEME, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
