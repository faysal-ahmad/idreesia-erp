import { useEffect, useState } from 'react';

import { useAuthState } from './use-auth-state';

// DDP statuses that mean the server can't be reached right now. 'connecting'
// is not one of them: it is the normal state while the app starts up.
const UNREACHABLE_STATUSES = new Set(['waiting', 'failed', 'offline']);

const readNavigatorOnline = () => typeof navigator === 'undefined' || navigator.onLine !== false;

/**
 * Whether the app can reach the server. False when the device reports no
 * network, or the connection to the server has dropped or failed. Use it to
 * switch off actions that need the server (anything that writes, or fetches
 * a file that isn't saved on the device).
 */
export const useOnlineStatus = (): boolean => {
  const { status } = useAuthState();
  const [deviceOnline, setDeviceOnline] = useState(readNavigatorOnline);

  useEffect(() => {
    const update = () => setDeviceOnline(readNavigatorOnline());
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return deviceOnline && !(status && UNREACHABLE_STATUSES.has(status));
};
