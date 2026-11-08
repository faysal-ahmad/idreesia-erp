import React, { useState } from 'react';
import { ActionSheet, Button, List, Tag } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';
import { EditSOutline, TeamOutline } from 'antd-mobile-icons';
import { useMutation } from '@apollo/client/react';

import { PageEmpty, showError, showSuccess } from '../../layout';
import { ATTENDANCE_LABELS, hasStarted, ROLE_LABELS, RSVP_COLORS, RSVP_LABELS } from './format';
import {
  MOBILE_MEETING_MARK_ATTENDANCE,
  MOBILE_MEETING_SET_PARTICIPANT_ROLE,
  MOBILE_MEETING_SET_PARTICIPANTS,
} from './gql';
import { MeetingPartPage, useMeetingPart } from './meeting-part';
import { MemberPickerPopup } from './member-picker-popup';
import type { Participant } from './use-meeting';

type Row = Participant & { participantId: string };

/** Who is invited, their responses, and (once it starts) attendance. */
export const ParticipantsScreen = () => {
  const part = useMeetingPart();
  const { committeeId, meetingId, meeting, participants, members, canManage, canChange } = part;
  const isScheduled = meeting?.status === 'scheduled';
  const canMarkAttendance = canManage && canChange && hasStarted(meeting?.startsAt);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);

  const [setParticipants, { loading: savingList }] = useMutation(MOBILE_MEETING_SET_PARTICIPANTS);
  const [setRole] = useMutation(MOBILE_MEETING_SET_PARTICIPANT_ROLE);
  const [markAttendance, { loading: marking }] = useMutation(MOBILE_MEETING_MARK_ATTENDANCE);

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    try {
      await action();
      showSuccess(success);
      return true;
    } catch (actionError) {
      showError(actionError, failure);
      return false;
    }
  };

  const mark = (entries: Array<{ participantId: string; status: string | null }>, success: string) =>
    run(
      () =>
        markAttendance({
          variables: {
            committeeId,
            meetingId,
            entries: entries.map(entry => ({ ...entry, note: null })),
          },
        }),
      success,
      'Could not save attendance.',
    );

  const unrecorded = participants.filter(p => !p.attendanceStatus);
  const counts = ['accepted', 'tentative', 'declined', 'pending'].map(
    status => `${RSVP_LABELS[status]}: ${participants.filter(p => p.rsvpStatus === status).length}`,
  );

  const actions: Action[] = selected
    ? [
        ...(canManage && isScheduled
          ? Object.entries(ROLE_LABELS)
              .filter(([role]) => role !== selected.role)
              .map(([role, label]) => ({
                key: `role-${role}`,
                text: `Make ${label.toLowerCase()}`,
                onClick: () =>
                  run(
                    () => setRole({ variables: { committeeId, meetingId, participantId: selected.participantId, role } }),
                    'Role changed.',
                    'Could not change the role.',
                  ),
              }))
          : []),
        ...(canMarkAttendance
          ? [
              ...Object.entries(ATTENDANCE_LABELS).map(([status, label]) => ({
                key: `attendance-${status}`,
                text: label,
                description: status === selected.attendanceStatus ? 'Recorded' : undefined,
                onClick: () =>
                  mark([{ participantId: selected.participantId, status }], 'Attendance saved.'),
              })),
              ...(selected.attendanceStatus
                ? [
                    {
                      key: 'attendance-clear',
                      text: 'Clear attendance',
                      onClick: () =>
                        mark([{ participantId: selected.participantId, status: null }], 'Attendance cleared.'),
                    },
                  ]
                : []),
            ]
          : []),
      ]
    : [];
  const canTap = canManage && (isScheduled || canMarkAttendance);

  return (
    <MeetingPartPage
      part={part}
      title="Participants"
      right={
        canManage && isScheduled ? (
          <div className="page-nav-actions">
            <EditSOutline aria-label="Edit participants" className="page-nav-action" onClick={() => setPickerOpen(true)} />
          </div>
        ) : undefined
      }
      footer={
        canMarkAttendance && unrecorded.length > 0 ? (
          <Button
            block
            color="primary"
            loading={marking}
            size="large"
            onClick={() => {
              mark(
                unrecorded.map(p => ({ participantId: p.participantId, status: 'present' })),
                'Attendance saved.',
              );
            }}
          >
            Mark {unrecorded.length === participants.length ? 'everyone' : 'others'} present
          </Button>
        ) : undefined
      }
    >
      {() => (
        <>
          {participants.length === 0 ? (
            <PageEmpty
              description={canManage && isScheduled ? 'Tap the pencil to invite members.' : undefined}
              icon={<TeamOutline />}
              title="No one is invited yet"
            />
          ) : (
            <>
              <p className="paged-list-count">{counts.join(' · ')}</p>
              {canManage && isScheduled && !hasStarted(meeting?.startsAt) && (
                <p className="meeting-hint">Attendance can be recorded once the meeting starts.</p>
              )}
              <List mode="card">
                {participants.map(participant => (
                  <List.Item
                    key={participant.participantId}
                    clickable={canTap}
                    description={
                      <>
                        <span>{ROLE_LABELS[participant.role ?? 'required']}</span>
                        {participant.rsvpComment && <span> · {participant.rsvpComment}</span>}
                      </>
                    }
                    extra={
                      <div className="meetings-list-tags">
                        <Tag color={RSVP_COLORS[participant.rsvpStatus ?? 'pending']} fill="outline">
                          {RSVP_LABELS[participant.rsvpStatus ?? 'pending']}
                        </Tag>
                        {participant.attendanceStatus && (
                          <Tag color="primary">{ATTENDANCE_LABELS[participant.attendanceStatus]}</Tag>
                        )}
                      </div>
                    }
                    onClick={canTap ? () => setSelected(participant) : undefined}
                  >
                    {participant.name ?? participant.participantId}
                    {participant.isMe && <span className="meeting-muted"> (you)</span>}
                  </List.Item>
                ))}
              </List>
            </>
          )}

          <ActionSheet
            actions={actions}
            cancelText="Close"
            closeOnAction
            extra={selected?.name ?? undefined}
            visible={!!selected}
            onClose={() => setSelected(null)}
          />

          <MemberPickerPopup
            confirmLoading={savingList}
            confirmText="Save participants"
            members={members}
            note="New participants are invited with no response yet. Removing someone discards their response."
            selectedIds={participants.map(p => p.participantId)}
            title="Participants"
            visible={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onConfirm={async ids => {
              const saved = await run(
                () => setParticipants({ variables: { committeeId, meetingId, participantIds: ids } }),
                'Participants saved.',
                'Could not save the participants.',
              );
              if (saved) setPickerOpen(false);
            }}
          />
        </>
      )}
    </MeetingPartPage>
  );
};
