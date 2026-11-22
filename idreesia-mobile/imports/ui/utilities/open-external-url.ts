// Opens a link outside the app's own WebView (for example a location in the
// phone's maps). In the Cordova apps `window.open` does nothing on its own,
// so this goes through cordova-plugin-inappbrowser's `_system` target, which
// hands the link to the OS; the browser build opens a new tab.

interface InAppBrowserWindow {
  cordova?: {
    InAppBrowser?: { open(url: string, target: string, options?: string): unknown };
  };
}

export const openExternalUrl = (url: string) => {
  const { cordova } = window as unknown as InAppBrowserWindow;
  if (cordova?.InAppBrowser) {
    cordova.InAppBrowser.open(url, '_system');
    return;
  }
  window.open(url, '_blank');
};
