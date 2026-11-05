import { Permissions } from 'meteor/idreesia-common/constants';
import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';

/**
 * Whether the logged-in user may reply to inbox conversations. Only decides
 * what the UI offers - the server enforces the same permission on the
 * mutation.
 */
const useCanReply = () => {
  const { user } = useLoggedInUser();
  if (!user) return false;
  if (user.username === 'erp-admin') return true;
  return (user.permissions ?? []).includes(
    Permissions.COMMUNICATIONS_INBOX_REPLY_TO_MESSAGES
  );
};

export default useCanReply;
