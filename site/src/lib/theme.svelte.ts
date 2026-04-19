const THEMES = ["aiaiai", "branded-example", "bespoke-example", "ubp"] as const;
type Theme = (typeof THEMES)[number];

const THEME_LABELS: Record<Theme, string> = {
  aiaiai: "aiaiai (Default)",
  "branded-example": "Branded (Tier 1)",
  "bespoke-example": "Bespoke (Tier 2)",
  ubp: "UBP (Bespoke · Dark)",
};

let current = $state<Theme>("aiaiai");

export function getTheme() {
  return current;
}

export function getThemes() {
  return THEMES;
}

export function getThemeLabel(theme: Theme) {
  return THEME_LABELS[theme];
}

export function setTheme(theme: Theme) {
  current = theme;
  document.documentElement.setAttribute("data-theme", theme);
  document.cookie = `theme=${theme};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

export function initTheme() {
  // In a prerendered/static site, the server hook doesn't run on navigation.
  // Read theme from cookie directly so selection persists across page loads.
  const match = document.cookie.match(/(?:^|;\s*)theme=([^;]+)/);
  const cookieTheme = match?.[1];
  if (cookieTheme && THEMES.includes(cookieTheme as Theme)) {
    current = cookieTheme as Theme;
    document.documentElement.setAttribute("data-theme", cookieTheme);
  } else {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr && THEMES.includes(attr as Theme)) {
      current = attr as Theme;
    }
  }
}
