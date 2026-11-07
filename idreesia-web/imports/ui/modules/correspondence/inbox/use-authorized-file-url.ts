import { useEffect, useState } from 'react';
import { Accounts } from 'meteor/accounts-base';

/**
 * Media for inbox messages is served by the ERP proxy, which needs the Meteor
 * login token in the Authorization header. <img>/<audio>/<video> tags can't
 * send headers, so the file is fetched here and handed back as an object URL.
 */
const useAuthorizedFileUrl = (url?: string | null) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return undefined;

    let cancelled = false;
    let createdUrl: string | null = null;
    setLoading(true);
    setError(false);

    fetch(url, {
      headers: { authorization: (Accounts as any)._storedLoginToken() ?? '' },
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      })
      .then(blob => {
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
      setObjectUrl(null);
    };
  }, [url]);

  return { objectUrl, loading, error };
};

export default useAuthorizedFileUrl;
