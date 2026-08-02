import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setBreadcrumbs as setBreadcrumbsAction } from 'meteor/idreesia-common/action-creators';

/**
 * Like `useBreadcrumbs`, but re-dispatches whenever the breadcrumbs change
 * (e.g. after an async physical-store name loads). Mirrors
 * `WithDynamicBreadcrumbs`'s mount + update behavior.
 */
const useDynamicBreadcrumbs = (breadcrumbs: unknown[]) => {
  const dispatch = useDispatch();
  const serialized = breadcrumbs.map(String).join('\0');

  useEffect(() => {
    dispatch(setBreadcrumbsAction(breadcrumbs));
  }, [dispatch, serialized]);
};

export default useDynamicBreadcrumbs;
