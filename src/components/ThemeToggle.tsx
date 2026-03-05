"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "dc-theme";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="theme-toggle-glyph" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5V5" />
      <path d="M12 19v2.5" />
      <path d="M21.5 12H19" />
      <path d="M5 12H2.5" />
      <path d="M18.7 5.3l-1.8 1.8" />
      <path d="M7.1 16.9l-1.8 1.8" />
      <path d="M18.7 18.7l-1.8-1.8" />
      <path d="M7.1 7.1L5.3 5.3" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="theme-toggle-glyph" aria-hidden="true">
      <path d="M20 14.2A8.2 8.2 0 1 1 9.8 4 6.8 6.8 0 0 0 20 14.2z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme());

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
      className="theme-toggle"
      title={isDark ? "Light mode" : "Dark mode"}
      suppressHydrationWarning
    >
      <span className="theme-toggle-icon">{isDark ? <SunIcon /> : <MoonIcon />}</span>
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
