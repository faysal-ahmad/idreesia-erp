import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setBreadcrumbs as setBreadcrumbsAction } from 'meteor/idreesia-common/action-creators';

const useBreadcrumbs = (breadcrumbs: unknown[]) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setBreadcrumbsAction(breadcrumbs));
  }, []);
};

export default useBreadcrumbs;
