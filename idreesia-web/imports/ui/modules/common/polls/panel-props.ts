import type { Poll, PollsDataProvider, PollsInfo } from './types';

/** What every tab of the poll page gets. */
export interface PanelProps {
  provider: PollsDataProvider;
  poll: Poll;
  info: PollsInfo;
  /** Call with the updated poll after a change. */
  onPollChange: (poll: Poll) => void;
}
