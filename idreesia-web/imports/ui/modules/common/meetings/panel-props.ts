import type {
  Meeting,
  MeetingMember,
  MeetingsDataProvider,
  MeetingsInfo,
} from './types';

/** What every tab of the meeting page gets. */
export interface PanelProps {
  provider: MeetingsDataProvider;
  meeting: Meeting;
  info: MeetingsInfo;
  members: MeetingMember[];
  /** Call with the updated meeting after a change. */
  onMeetingChange: (meeting: Meeting) => void;
}
