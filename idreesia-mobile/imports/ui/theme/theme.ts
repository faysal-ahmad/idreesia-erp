/**
 * The mobile app's single source of truth for colours and shape.
 *
 * applyTheme() (called once from client/main.tsx) publishes these as CSS
 * variables on <html>:
 *   - `--app-*` for the app's own CSS, e.g. `color: var(--app-color-primary)`
 *   - `--adm-*` so every antd-mobile component follows the same theme
 *
 * Pages should never hard-code a colour. In CSS use the `--app-*` variables;
 * in code, import `theme` from here. To add a colour, add it to `palette`,
 * and it becomes available as a CSS variable automatically.
 */

// Sampled from the Idreesia flag (public/images/idreesia-logo.png).
const brandGreen = '#16803e';

export const palette = {
  // Brand
  primary: brandGreen,
  primaryDark: '#0f5f2d', // pressed states, dark accents
  primaryLight: '#e7f3eb', // tinted backgrounds, selected rows
  onPrimary: '#ffffff', // text and icons on primary

  // Status
  success: brandGreen,
  warning: '#c77700',
  danger: '#d93026',

  // Neutrals (slightly green-tinted greys to sit well next to the brand)
  text: '#1b2620',
  textSecondary: '#56655c',
  textWeak: '#8a988f', // placeholders, hints, inactive icons
  textDisabled: '#c3ccc6',
  border: '#dfe7e2',
  background: '#f3f6f4', // page background
  surface: '#ffffff', // cards, lists, form panels
  surfaceMuted: '#eef2ef', // fills inside surfaces
} as const;

export const shape = {
  radiusSmall: '4px',
  radiusMedium: '8px',
  radiusLarge: '12px',
  elevation: '0 6px 20px rgba(15, 60, 32, 0.16)', // raised elements
} as const;

export const fontFamily =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

export const theme = { palette, shape, fontFamily } as const;

export type PaletteColor = keyof typeof palette;

const toKebab = (value: string) => value.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);

// antd-mobile's own variables (node_modules/antd-mobile/es/global/theme-default.css)
// mapped onto the palette.
const antdMobileVariables: Record<string, string> = {
  '--adm-color-primary': palette.primary,
  '--adm-color-success': palette.success,
  '--adm-color-warning': palette.warning,
  '--adm-color-danger': palette.danger,
  '--adm-color-text': palette.text,
  '--adm-color-text-secondary': palette.textSecondary,
  '--adm-color-weak': palette.textWeak,
  '--adm-color-light': palette.textDisabled,
  '--adm-color-border': palette.border,
  '--adm-color-background': palette.surface,
  '--adm-color-box': palette.surfaceMuted,
  '--adm-color-wathet': palette.primaryLight,
  '--adm-color-text-light-solid': palette.onPrimary,
  '--adm-radius-s': shape.radiusSmall,
  '--adm-radius-m': shape.radiusMedium,
  '--adm-radius-l': shape.radiusLarge,
  '--adm-font-family': fontFamily,
};

export const applyTheme = (root: HTMLElement = document.documentElement) => {
  Object.entries(palette).forEach(([name, value]) => {
    root.style.setProperty(`--app-color-${toKebab(name)}`, value);
  });
  Object.entries(shape).forEach(([name, value]) => {
    root.style.setProperty(`--app-${toKebab(name)}`, value);
  });
  root.style.setProperty('--app-font-family', fontFamily);
  Object.entries(antdMobileVariables).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });

  // Browser/OS chrome (Android status bar, mobile browser toolbar).
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', palette.primary);
};
