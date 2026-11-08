import React, { type ReactNode, useState } from 'react';
import { ActionSheet, Dialog, List, Selector, Tag, TextArea } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';
import {
  CalendarOutline,
  CheckCircleOutline,
  FileOutline,
  HistogramOutline,
  MoreOutline,
  TeamOutline,
  UnorderedListOutline,
  EditSOutline,
} from 'antd-mobile-icons';
import { useApolloClient, useMutation } from '@apollo/client/react';

import { Page, PageEmpty, PageError, PageLoading, showError, showSuccess } from '../../layout';
import { useHistory, useParams } from '../../router';
import { type MeetingPart, WorkspacesPaths } from '../paths';
import { formatDateTime, formatMeetingTimeLines, meetingStatus } from './format';
import {
  MOBILE_CANCEL_MEETING,
  MOBILE_DELETE_MEETING,
  MOBILE_MEETING_RESPOND,
  MOBILE_REOPEN_MEETING,
} from './gql';
import { useMeeting, useMeetingsInfo } from './use-meeting';

const RSVP_CHOICES = ['accepted', 'declined', 'tentative'];
const ATTENDING_LABELS: Record<string, string> = { accepted: 'Yes', declined: 'No', tentative: 'Maybe' };

interface Props {
  meetingId: string;
}

/**
 * Workspace → Meetings → one meeting: when and where, the user's response,
 * and rows that open its agenda, participants, minutes, attachments, action
 * items and activity. Coordinators manage it from the "more" menu.
 */
export const MeetingScreen = ({ meetingId }: Props) => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const client = useApolloClient();
  const { canManage } = useMeetingsInfo(committeeId);
  const { meeting, participants, agenda, loading, error, refetch } = useMeeting(committeeId, meetingId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [respond] = useMutation(MOBILE_MEETING_RESPOND);
  const [cancel] = useMutation(MOBILE_CANCEL_MEETING);
  const [reopen] = useMutation(MOBILE_REOPEN_MEETING);
  const [remove] = useMutation(MOBILE_DELETE_MEETING);

  const listPath = WorkspacesPaths.committeeMeetings(committeeId);
  const page = (title: string, children: ReactNode, right?: ReactNode) => (
    <Page backTo={listPath} right={right} title={title} onRefresh={refetch}>
      {children}
    </Page>
  );

  if (loading) return page('Meeting', <PageLoading />);
  if (error) return page('Meeting', <PageError error={error} onRetry={refetch} />);
  if (!meeting) {
    return page(
      'Meeting',
      <PageEmpty
        description="This meeting may have been deleted."
        icon={<CalendarOutline />}
        title="Meeting not found"
      />,
    );
  }

  const status = meetingStatus(meeting.status, meeting.startsAt, meeting.endsAt);
  const isScheduled = meeting.status === 'scheduled';
  const me = participants.find(participant => participant.isMe);
  const openPart = (part: MeetingPart) =>
    history.push(WorkspacesPaths.committeeMeetingPart(committeeId, meetingId, part));
  const refreshList = () => client.refetchQueries({ include: ['mobileWorkspaceMeetings'] });

  const run = async (action: () => Promise<unknown>, success: string, failure: string) => {
    setBusy(true);
    try {
      await action();
      showSuccess(success);
      refreshList();
    } catch (actionError) {
      showError(actionError, failure);
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = async () => {
    let reason = '';
    const confirmed = await Dialog.confirm({
      title: 'Cancel this meeting?',
      content: (
        <TextArea
          autoSize={{ minRows: 2, maxRows: 4 }}
          maxLength={10000}
          placeholder="Reason (optional)"
          onChange={value => {
            reason = value;
          }}
        />
      ),
      confirmText: <span className="meeting-danger-text">Cancel meeting</span>,
      cancelText: 'Keep it',
    });
    if (!confirmed) return;
    run(
      () => cancel({ variables: { committeeId, meetingId, reason: reason.trim() || null } }),
      'Meeting cancelled.',
      'Could not cancel the meeting.',
    );
  };

  const confirmDelete = async () => {
    const confirmed = await Dialog.confirm({
      content: 'Delete this meeting? Its agenda, minutes, attachments and action items are removed permanently.',
      confirmText: <span className="meeting-danger-text">Delete</span>,
      cancelText: 'Cancel',
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await remove({ variables: { committeeId, meetingId } });
      showSuccess('Meeting deleted.');
      await refreshList();
      history.replace(listPath);
    } catch (deleteError) {
      showError(deleteError, 'Could not delete the meeting.');
      setBusy(false);
    }
  };

  const actions: Action[] = [
    ...(meeting.status !== 'cancelled'
      ? [{ key: 'edit', text: 'Edit details', onClick: () => openPart('edit') }]
      : []),
    ...(isScheduled
      ? [{ key: 'cancel', text: 'Cancel meeting', onClick: confirmCancel }]
      : [
          {
            key: 'reopen',
            text: 'Reopen',
            onClick: () =>
              run(() => reopen({ variables: { committeeId, meetingId } }), 'Meeting reopened.', 'Could not reopen the meeting.'),
          },
        ]),
    { key: 'delete', text: 'Delete meeting', danger: true, onClick: confirmDelete },
  ];

  const organizers = participants
    .filter(participant => participant.role === 'organizer')
    .map(participant => participant.name ?? participant.participantId);
  const accepted = participants.filter(participant => participant.rsvpStatus === 'accepted').length;
  const agendaMinutes = agenda.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);

  const fields: Array<{ label?: string; value: ReactNode }> = [
    {
      value: formatMeetingTimeLines(meeting.startsAt, meeting.endsAt).map(line => (
        <div key={line}>{line}</div>
      )),
    },
    ...(meeting.location ? [{ label: 'Location', value: meeting.location }] : []),
    ...(meeting.onlineUrl
      ? [
          {
            label: 'Online',
            value: (
              <a href={meeting.onlineUrl} rel="noopener noreferrer" target="_blank">
                {meeting.onlineUrl}
              </a>
            ),
          },
        ]
      : []),
    ...(organizers.length ? [{ label: 'Organizers', value: organizers.join(', ') }] : []),
    ...(meeting.description ? [{ label: 'Description', value: meeting.description }] : []),
  ];

  return page(
    meeting.title ?? 'Meeting',
    <>
      <section className="meeting-summary">
        <h2 className="meeting-summary-title">{meeting.title}</h2>
        <Tag className="meeting-summary-status" color={status.color} fill="outline">
          {status.label}
        </Tag>
        {meeting.status === 'cancelled' && (
          <p className="meeting-summary-note">
            Cancelled{meeting.cancelledByName ? ` by ${meeting.cancelledByName}` : ''} on{' '}
            {formatDateTime(meeting.cancelledAt)}
            {meeting.cancellationReason ? `: ${meeting.cancellationReason}` : ''}
          </p>
        )}
      </section>

      <dl className="meeting-fields">
        {fields.map(field => (
          <div key={field.label ?? 'when'} className="meeting-field">
            {field.label ? <dt>{field.label}</dt> : null}
            <dd className={field.label ? undefined : 'meeting-field-full'}>{field.value}</dd>
          </div>
        ))}
      </dl>

      {me && isScheduled && (
        <section className="meeting-rsvp">
          <h3 className="meeting-section-title">Attending</h3>
          <Selector
            columns={3}
            disabled={busy}
            options={RSVP_CHOICES.map(choice => ({ value: choice, label: ATTENDING_LABELS[choice] }))}
            value={me.rsvpStatus && me.rsvpStatus !== 'pending' ? [me.rsvpStatus] : []}
            onChange={([choice]) => {
              if (!choice || choice === me.rsvpStatus) return;
              run(
                () => respond({ variables: { committeeId, meetingId, status: choice } }),
                `Response saved: ${ATTENDING_LABELS[choice]}.`,
                'Could not save your response.',
              );
            }}
          />
        </section>
      )}

      <List mode="card">
        <List.Item
          description={agendaMinutes ? `Planned: ${agendaMinutes} min` : undefined}
          extra={agenda.length || undefined}
          prefix={<span className="list-icon"><UnorderedListOutline /></span>}
          onClick={() => openPart('agenda')}
        >
          Agenda
        </List.Item>
        <List.Item
          description={participants.length ? `${accepted} accepted` : undefined}
          extra={participants.length || undefined}
          prefix={<span className="list-icon"><TeamOutline /></span>}
          onClick={() => openPart('participants')}
        >
          Participants
        </List.Item>
        <List.Item
          description={meeting.minutes ? `Updated ${formatDateTime(meeting.minutesUpdatedAt)}` : 'Not recorded yet'}
          prefix={<span className="list-icon"><EditSOutline /></span>}
          onClick={() => openPart('minutes')}
        >
          Minutes
        </List.Item>
        <List.Item
          extra={meeting.attachmentCount || undefined}
          prefix={<span className="list-icon"><FileOutline /></span>}
          onClick={() => openPart('attachments')}
        >
          Attachments
        </List.Item>
        <List.Item
          description={meeting.openActionItemCount ? `${meeting.openActionItemCount} open` : undefined}
          prefix={<span className="list-icon"><CheckCircleOutline /></span>}
          onClick={() => openPart('action-items')}
        >
          Action items
        </List.Item>
        <List.Item
          prefix={<span className="list-icon"><HistogramOutline /></span>}
          onClick={() => openPart('activity')}
        >
          Activity
        </List.Item>
      </List>

      <ActionSheet
        actions={actions}
        cancelText="Close"
        closeOnAction
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>,
    canManage ? (
      <div className="page-nav-actions">
        <MoreOutline aria-label="More" className="page-nav-action" onClick={() => setMenuOpen(true)} />
      </div>
    ) : undefined,
  );
};
