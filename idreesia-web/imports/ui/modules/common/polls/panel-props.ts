import type { Poll, PollMember, PollsDataProvider, PollsInfo } from './types';

/** What every tab of the poll page gets. */
export interface PanelProps {
  provider: PollsDataProvider;
  poll: Poll;
  info: PollsInfo;
  members: PollMember[];
  /** Call with the updated poll after a change. */
  onPollChange: (poll: Poll) => void;
}
