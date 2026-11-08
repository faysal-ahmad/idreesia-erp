import { useNavigateBack } from '../../layout';
import { useHistory } from '../../router';
import { WorkspacesPaths } from '../paths';
import { useDiscussionContext } from './discussion-context';
import type { DiscussionMessage } from './discussion-types';

/**
 * Opening a message from search, pinned or starred: a thread-only reply opens
 * its thread; anything else goes back to the main list, which scrolls to it
 * and highlights it.
 */
export const useOpenMessage = () => {
  const history = useHistory();
  const { committeeId, requestFocus } = useDiscussionContext();
  const backToMain = useNavigateBack(WorkspacesPaths.committeeDiscussions(committeeId));

  return (message: DiscussionMessage) => {
    if (message.threadId && !message.showInMainList) {
      history.push(WorkspacesPaths.committeeDiscussionThread(committeeId, message.threadId));
      return;
    }
    requestFocus(message._id);
    backToMain();
  };
};
