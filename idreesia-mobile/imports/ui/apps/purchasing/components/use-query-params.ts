import { useLocation } from '../../../router';

/** The query string of the current route, e.g. "?status=draft" from a Home tab link. */
export const useQueryParams = () => {
  const { search } = useLocation();
  return new URLSearchParams(search);
};
