// Mirrors the `@theme inline` color tokens defined in src/app/globals.css.
// Tailwind v4 keeps theme colors in CSS (not a JS config), so there's no
// built-in way to read them as plain JS values — anywhere a color is needed
// as a real string (inline styles, canvas/interpolation math like the
// showcase's scroll-driven background blend, etc.) should import from here
// instead of re-typing the hex literal, so the brand palette has exactly one
// source of truth on the JS side. Keep this in sync with globals.css if the
// palette ever changes.
export const THEME_COLORS = {
  cream: "#FFF3D7",
  creamDark: "#F2E4C4",
  green: "#24451F",
  red: "#9B1E15",
  orange: "#B44800",
  dark: "#1A0D04",
  pink: "#B81862",
  yellow: "#F8B532",
} as const;
