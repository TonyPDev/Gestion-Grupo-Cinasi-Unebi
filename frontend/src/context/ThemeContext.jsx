import React, { createContext, useState, useEffect, useContext } from "react";

// 1. Crear el contexto
export const ThemeContext = createContext();

// 2. Crear el proveedor del tema
export const ThemeProvider = ({ children }) => {
  // 3. Estado para gestionar el tema, inicializado desde localStorage o preferencia del sistema
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    const userPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return savedTheme || (userPrefersDark ? "dark" : "light");
  });

  // 4. Efecto para aplicar la clase 'dark' o 'light' al elemento <html>
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Guardar el tema en localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 5. Proveer el estado del tema y la función para cambiarlo a los componentes hijos
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 6. Hook personalizado para usar el contexto del tema fácilmente
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
