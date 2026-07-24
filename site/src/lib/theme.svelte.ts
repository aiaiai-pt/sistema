const THEMES = ["aiaiai", "branded-example", "bespoke-example", "ubp"] as const;
type Theme = (typeof THEMES)[number];

const SCHEME_CAPABLE = ["ubp"] as const;
type SchemeCapableTheme = (typeof SCHEME_CAPABLE)[number];

const THEME_LABELS: Record<Theme, string> = {
  aiaiai: "aiaiai (Default)",
  "branded-example": "Branded (Tier 1 — Valongo)",
  "bespoke-example": "Bespoke (Tier 2 — Sprout)",
  ubp: "UBP (Tier 2 — Urban Intelligence)",
};

type Scheme = "light" | "dark";

let current = $state<Theme>("aiaiai");
let currentScheme = $state<Scheme>("light");

export function getTheme() {
  return current;
}

export function getThemes() {
  return THEMES;
}

export function getThemeLabel(theme: Theme) {
  return THEME_LABELS[theme];
}

export function getScheme() {
  return currentScheme;
}

export function isSchemeCapable(theme: Theme): theme is SchemeCapableTheme {
  return (SCHEME_CAPABLE as readonly string[]).includes(theme);
}

export function setTheme(theme: Theme) {
  current = theme;
  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = `theme=${theme};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
  // When switching away from a scheme-capable theme, clear the scheme attribute
  // so the generic default (light) is active.
  if (!isSchemeCapable(theme)) {
    document.documentElement.removeAttribute("data-scheme");
    document.cookie = "scheme=;path=/;max-age=0;samesite=lax";
    currentScheme = "light";
  } else {
    // Restore persisted scheme for scheme-capable themes
    const match = document.cookie.match(/(?:^|;\s*)scheme=([^;]+)/);
    const saved = match?.[1] as Scheme | undefined;
    setScheme(saved === "dark" ? "dark" : "light");
  }
}

export function setScheme(scheme: Scheme) {
  currentScheme = scheme;
  if (scheme === "dark") {
    document.documentElement.setAttribute("data-scheme", "dark");
  } else {
    document.documentElement.removeAttribute("data-scheme");
  }
  document.cookie = `scheme=${scheme};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

export function initTheme() {
  // In a prerendered/static site, the server hook doesn't run on navigation.
  // Read theme from cookie directly so selection persists across page loads.
  const themeMatch = document.cookie.match(/(?:^|;\s*)theme=([^;]+)/);
  const cookieTheme = themeMatch?.[1];
  if (cookieTheme && THEMES.includes(cookieTheme as Theme)) {
    current = cookieTheme as Theme;
    document.documentElement.setAttribute("data-theme", cookieTheme);
  } else {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr && THEMES.includes(attr as Theme)) {
      current = attr as Theme;
    }
  }

  // Restore scheme for scheme-capable themes
  if (isSchemeCapable(current)) {
    const schemeMatch = document.cookie.match(/(?:^|;\s*)scheme=([^;]+)/);
    const cookieScheme = schemeMatch?.[1] as Scheme | undefined;
    const scheme = cookieScheme === "dark" ? "dark" : "light";
    currentScheme = scheme;
    if (scheme === "dark") {
      document.documentElement.setAttribute("data-scheme", "dark");
    }
  }
}
