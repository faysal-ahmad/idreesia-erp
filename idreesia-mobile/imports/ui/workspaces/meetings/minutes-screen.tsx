import React, { useEffect, useState } from 'react';
import { Button, TextArea, Toast } from 'antd-mobile';
import { EditSOutline } from 'antd-mobile-icons';
import { useMutation } from '@apollo/client/react';

import { getErrorMessage } from '../../auth/accounts';
import { PageEmpty } from '../../layout';
import { formatDateTime } from './format';
import { MOBILE_MEETING_SET_MINUTES } from './gql';
import { MeetingPartPage, useMeetingPart } from './meeting-part';

/** A meeting's minutes: coordinators edit them, everyone else reads them. */
export const MinutesScreen = () => {
  const part = useMeetingPart();
  const { committeeId, meetingId, meeting, canManage, canChange } = part;
  const canEdit = canManage && canChange;
  const [text, setText] = useState(meeting?.minutes ?? '');
  const [setMinutes, { loading: saving }] = useMutation(MOBILE_MEETING_SET_MINUTES);

  useEffect(() => {
    setText(meeting?.minutes ?? '');
  }, [meeting?.minutes]);

  const changed = text.trim() !== (meeting?.minutes ?? '');

  const save = async () => {
    try {
      await setMinutes({ variables: { committeeId, meetingId, text: text.trim() || null } });
      Toast.show({ icon: 'success', content: 'Minutes saved.' });
    } catch (saveError) {
      Toast.show({ icon: 'fail', content: getErrorMessage(saveError, 'Could not save the minutes.') });
    }
  };

  return (
    <MeetingPartPage
      part={part}
      title="Minutes"
      footer={
        canEdit ? (
          <Button block color="primary" disabled={!changed} loading={saving} size="large" onClick={save}>
            Save minutes
          </Button>
        ) : undefined
      }
    >
      {current => {
        const updated = current.minutesUpdatedAt ? (
          <p className="meeting-hint">
            Last updated {formatDateTime(current.minutesUpdatedAt)}
            {current.minutesUpdatedByName ? ` by ${current.minutesUpdatedByName}` : ''}
          </p>
        ) : null;

        if (canEdit) {
          return (
            <>
              <div className="meeting-card">
                <TextArea
                  autoSize={{ minRows: 12 }}
                  maxLength={500000}
                  placeholder="Record what was discussed and decided"
                  value={text}
                  onChange={setText}
                />
              </div>
              {updated}
            </>
          );
        }
        return current.minutes ? (
          <>
            <div className="meeting-card meeting-pre-wrap">{current.minutes}</div>
            {updated}
          </>
        ) : (
          <PageEmpty icon={<EditSOutline />} title="No minutes have been recorded" />
        );
      }}
    </MeetingPartPage>
  );
};
