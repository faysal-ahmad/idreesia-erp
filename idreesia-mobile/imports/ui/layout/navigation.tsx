import { useEffect } from 'react';

import { useHistory } from '../router';

// How many in-app pushes are on the history stack above the entry the app was
// opened on. Back arrows use it to decide between history.goBack() (keeps the
// stack in step with Android's hardware back button) and jumping to the
// parent route (when the page was opened directly, e.g. after a reload).
let inAppDepth = 0;

/** Mount once inside the router. */
export const NavigationTracker = () => {
  const history = useHistory();
  useEffect(
    () =>
      history.listen((_location, action) => {
        if (action === 'PUSH') inAppDepth += 1;
        else if (action === 'POP') inAppDepth = Math.max(0, inAppDepth - 1);
      }),
    [history]
  );
  return null;
};

/** Returns a handler that goes back to `parentPath`. */
export const useNavigateBack = (parentPath: string) => {
  const history = useHistory();
  return () => {
    if (inAppDepth > 0) history.goBack();
    else history.replace(parentPath);
  };
};
