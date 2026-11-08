import {
  MeetingsAction,
  MeetingsEntityType,
} from 'meteor/idreesia-common/constants/meetings';
import type { MeetingDocument } from 'meteor/idreesia-common/server/collections/meetings';

import { logActivity } from './activity';
import {
  EDITABLE_STATUSES,
  MAX_MINUTES_LENGTH,
  normalizeText,
  requireMeeting,
  requireUserId,
  writeMeeting,
} from './internal';

/**
 * Replaces the meeting's minutes. The text is stored as given (plain text
 * or markdown - the module doesn't interpret it); empty or null clears it.
 */
export async function setMinutes(
  meetingId: string,
  text: string | null,
  userId: string
): Promise<MeetingDocument> {
  requireUserId(userId);
  const minutesText = normalizeText(text, 'Minutes', MAX_MINUTES_LENGTH);
  const meeting = await requireMeeting(meetingId);

  const updated = await writeMeeting(
    meeting,
    userId,
    minutesText
      ? {
          $set: {
            minutes: {
              text: minutesText,
              updatedAt: new Date(),
              updatedBy: userId,
            },
          },
        }
      : { $unset: { minutes: 1 } },
    { allowed: EDITABLE_STATUSES, checkRevision: false }
  );
  await logActivity({
    workspaceId: meeting.workspaceId,
    meetingId,
    entityType: MeetingsEntityType.MEETING,
    entityId: meetingId,
    action: MeetingsAction.MINUTES_UPDATED,
    userId,
    details: { cleared: !minutesText, length: minutesText?.length ?? 0 },
  });
  return updated;
}
