// Follows the phone's text-size setting (iOS Dynamic Type: Settings → Display
// & Brightness → Text Size, and Accessibility → Larger Text).
//
// WebKit sizes the system font `-apple-system-body` from Dynamic Type: 17px at
// iOS's default size. The app's font sizes are in rem (1rem = 17px at the
// default), so setting the root font size scales all text together while the
// default look stays pixel-for-pixel the same. The scale is capped so the
// accessibility sizes (up to ~3x) don't break nav bars, the tab bar or the
// chat composer. Icons and touch targets keep their px sizes.
//
// iOS only for now: Android's WebView doesn't expose the system font scale to
// web content (it would need a native hook), so it stays at the default.

export const BASE_FONT_SIZE_PX = 17;
const MIN_SCALE = 0.85;
const MAX_SCALE = 1.6;

const isIOS = () => {
  const cordova = (window as Window & { cordova?: { platformId?: string } }).cordova;
  if (cordova?.platformId) return cordova.platformId === 'ios';
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
};

/** The Dynamic Type body size in px, or null if this browser has none. */
const readSystemBodySize = (): number | null => {
  const probe = document.createElement('span');
  probe.style.font = '-apple-system-body';
  // An unsupported keyword leaves the font unset; nothing to measure then.
  if (!probe.style.font) return null;
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.textContent = 'x';
  document.body.appendChild(probe);
  const size = parseFloat(getComputedStyle(probe).fontSize);
  probe.remove();
  return Number.isFinite(size) && size > 0 ? size : null;
};

export const applyTextScale = () => {
  const systemSize = isIOS() ? readSystemBodySize() : null;
  const scale = systemSize
    ? Math.min(MAX_SCALE, Math.max(MIN_SCALE, systemSize / BASE_FONT_SIZE_PX))
    : 1;
  document.documentElement.style.fontSize = `${(BASE_FONT_SIZE_PX * scale).toFixed(2)}px`;
};

/**
 * Applies the text scale now and again whenever the app returns to the
 * foreground - the user changes the setting in the Settings app.
 */
export const watchTextScale = () => {
  applyTextScale();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) applyTextScale();
  });
};
