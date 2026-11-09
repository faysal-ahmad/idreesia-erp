import { useNavigateBack } from '../../layout';
import { useHistory } from '../../router';
import { useDiscussionContext } from './discussion-context';
import type { DiscussionMessage } from './discussion-types';

/**
 * Opening a message from search, pinned or starred: a thread-only reply opens
 * its thread; anything else goes back to the main list, which scrolls to it
 * and highlights it.
 */
export const useOpenMessage = () => {
  const history = useHistory();
  const { scope, requestFocus } = useDiscussionContext();
  const backToMain = useNavigateBack(scope.paths.main);

  return (message: DiscussionMessage) => {
    if (message.threadId && !message.showInMainList) {
      history.push(scope.paths.thread(message.threadId));
      return;
    }
    requestFocus(message._id);
    backToMain();
  };
};
