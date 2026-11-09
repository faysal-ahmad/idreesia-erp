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

// Sampled from the Eastern Breeze emblem (public/images/eb-logo-emblem.png):
// its dark teal-green outline. The emblem's lighter sage (#6eb48c) and aqua
// (#82c8dc) are too pale for white text, so they only inform the tints below.
const brandTeal = '#2d7a5f';

export const palette = {
  // Brand
  primary: brandTeal,
  primaryDark: '#1f5a46', // pressed states, dark accents
  primaryLight: '#e5f2ec', // tinted backgrounds, selected rows
  onPrimary: '#ffffff', // text and icons on primary

  // Status
  success: brandTeal,
  warning: '#c77700',
  danger: '#d93026',

  // Feature accents: the background of a feature's icon tile (white icon on
  // top), so each feature is recognisable at a glance, e.g. in a workspace's
  // list of features. Mid-tone, so a white icon reads on all of them.
  featureBlue: '#3b82f6',
  featurePurple: '#8b5cf6',
  featureGreen: '#34a853',
  featureOrange: '#e07a2f',
  featureRed: '#e0483e',
  featureTeal: '#14a3a8',
  featureIndigo: '#5b6cdb',
  featurePink: '#d9569b',

  // Neutrals (slightly teal-tinted greys to sit well next to the brand)
  text: '#1a2624',
  textSecondary: '#52645f',
  textWeak: '#879a95', // placeholders, hints, inactive icons
  textDisabled: '#c0cdc9',
  border: '#dae6e2',
  background: '#f1f6f5', // page background
  surface: '#ffffff', // cards, lists, form panels
  surfaceMuted: '#eaf2f0', // fills inside surfaces
} as const;

export const shape = {
  radiusSmall: '4px',
  radiusMedium: '8px',
  radiusLarge: '12px',
  elevation: '0 6px 20px rgba(20, 70, 56, 0.16)', // raised elements
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
