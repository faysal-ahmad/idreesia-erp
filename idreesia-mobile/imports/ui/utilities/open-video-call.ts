// Opens a video call link (Jitsi) outside the app's own WebView.
//
// - iOS app: the in-app browser (cordova-plugin-inappbrowser), so the user
//   stays in the app and closes it with "Done". Its WKWebView can use the
//   camera and microphone.
// - Android app: the system browser. The plugin's Android WebView does not
//   grant camera/microphone access to web pages, so a call there would have
//   no audio or video.
// - Browser build: a new tab.

interface InAppBrowserWindow {
  cordova?: {
    platformId?: string;
    InAppBrowser?: { open(url: string, target: string, options?: string): unknown };
  };
}

const IN_APP_BROWSER_OPTIONS = 'location=no,toolbarposition=top,closebuttoncaption=Done,hidenavigationbuttons=yes,hideurlbar=yes';

export interface VideoCallOptions {
  displayName?: string | null;
  /** What the user chose on the screen before joining. */
  audioMuted: boolean;
  videoMuted: boolean;
}

// Jitsi reads settings from the link's fragment; values are JSON. The server's
// link starts muted; the user's choices come after it, and a later setting wins.
const withCallSettings = (url: string, { displayName, audioMuted, videoMuted }: VideoCallOptions) => {
  const settings = [`config.startWithAudioMuted=${audioMuted}`, `config.startWithVideoMuted=${videoMuted}`];
  if (displayName) settings.push(`userInfo.displayName=${encodeURIComponent(JSON.stringify(displayName))}`);
  return `${url}${url.includes('#') ? '&' : '#'}${settings.join('&')}`;
};

export const openVideoCall = (link: string, options: VideoCallOptions) => {
  const url = withCallSettings(link, options);
  const { cordova } = window as unknown as InAppBrowserWindow;

  if (cordova?.platformId === 'ios' && cordova.InAppBrowser) {
    cordova.InAppBrowser.open(url, '_blank', IN_APP_BROWSER_OPTIONS);
    return;
  }
  window.open(url, cordova?.platformId ? '_system' : '_blank');
};
