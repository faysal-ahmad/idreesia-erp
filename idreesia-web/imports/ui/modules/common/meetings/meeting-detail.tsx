import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Descriptions,
  Empty,
  Flex,
  Input,
  Modal,
  Popconfirm,
  Segmented,
  Space,
  Spin,
  Tabs,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  RollbackOutlined,
  StopOutlined,
} from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import ActionItemsPanel from './action-items-panel';
import ActivityPanel from './activity-panel';
import AgendaPanel from './agenda-panel';
import AttachmentsPanel from './attachments-panel';
import {
  formatDateTime,
  formatMeetingTime,
  MeetingStatusTag,
  RSVP_LABELS,
} from './format';
import MeetingFormModal from './meeting-form-modal';
import MinutesPanel from './minutes-panel';
import type { PanelProps } from './panel-props';
import ParticipantsPanel from './participants-panel';
import type {
  Meeting,
  MeetingMember,
  MeetingsDataProvider,
  MeetingsInfo,
  RsvpStatus,
} from './types';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

type TabKey =
  | 'agenda'
  | 'participants'
  | 'minutes'
  | 'attachments'
  | 'action-items'
  | 'activity';

const TAB_KEYS: TabKey[] = [
  'agenda',
  'participants',
  'minutes',
  'attachments',
  'action-items',
  'activity',
];
const TAB_PARAM = 'tab';

const RSVP_CHOICES: RsvpStatus[] = ['accepted', 'tentative', 'declined'];

interface Props {
  provider: MeetingsDataProvider;
  meetingId: string;
  /** Back to the list. */
  onBack: () => void;
}

/** One meeting: its details, and tabs for everything attached to it. */
const MeetingDetail = ({ provider, meetingId, onBack }: Props) => {
  const history = useHistory();
  const location = useLocation();
  const tabParam = new URLSearchParams(location.search).get(TAB_PARAM);
  const activeTab: TabKey = TAB_KEYS.includes(tabParam as TabKey)
    ? (tabParam as TabKey)
    : 'agenda';

  const [info, setInfo] = useState<MeetingsInfo | null>(null);
  const [members, setMembers] = useState<MeetingMember[]>([]);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedInfo, loadedMeeting, loadedMembers] = await Promise.all([
        provider.getInfo(),
        provider.loadMeeting(meetingId),
        provider.loadMembers(),
      ]);
      setInfo(loadedInfo);
      setMeeting(loadedMeeting);
      setMembers(loadedMembers);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [provider, meetingId]);

  useEffect(() => {
    load();
  }, [load]);

  const setTab = (key: string) => {
    const params = new URLSearchParams(location.search);
    if (key === 'agenda') params.delete(TAB_PARAM);
    else params.set(TAB_PARAM, key);
    const search = params.toString();
    history.replace({
      pathname: location.pathname,
      search: search ? `?${search}` : '',
      state: location.state,
    });
  };

  const run = async (action: () => Promise<Meeting>, success: string) => {
    setBusy(true);
    try {
      setMeeting(await action());
      message.success(success, 2);
      return true;
    } catch (error) {
      showError(error);
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (loading && !meeting) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Spin />
      </Flex>
    );
  }
  if (!meeting || !info) {
    return (
      <Flex vertical align="center" gap={12} style={{ padding: 24 }}>
        <Empty description={loadError ?? 'Meeting not found'} />
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          Back to Meetings
        </Button>
      </Flex>
    );
  }

  const { canManage } = info;
  const isScheduled = meeting.status === 'scheduled';
  const me = meeting.participants.find(p => p.isMe);
  const panelProps: PanelProps = {
    provider,
    meeting,
    info,
    members,
    onMeetingChange: setMeeting,
  };

  const actions = canManage ? (
    <Space size={8} wrap>
      {meeting.status !== 'cancelled' ? (
        <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
          Edit
        </Button>
      ) : null}
      {isScheduled ? (
        <Button
          icon={<StopOutlined />}
          onClick={() => {
            setCancelReason('');
            setCancelling(true);
          }}
        >
          Cancel Meeting
        </Button>
      ) : (
        <Popconfirm
          title="Reopen this meeting?"
          description="It goes back to scheduled."
          okText="Reopen"
          onConfirm={() =>
            run(() => provider.reopenMeeting(meeting._id), 'Meeting reopened')
          }
        >
          <Button icon={<RollbackOutlined />} loading={busy}>
            Reopen
          </Button>
        </Popconfirm>
      )}
      <Popconfirm
        title="Delete this meeting?"
        description="Its agenda, minutes, attachments and action items are removed permanently."
        okText="Delete"
        okButtonProps={{ danger: true }}
        onConfirm={async () => {
          try {
            await provider.deleteMeeting(meeting._id);
            message.success('Meeting deleted', 2);
            onBack();
          } catch (error) {
            showError(error);
          }
        }}
      >
        <Button danger icon={<DeleteOutlined />}>
          Delete
        </Button>
      </Popconfirm>
    </Space>
  ) : null;

  const rsvp =
    me && isScheduled ? (
      <Space size={8}>
        <Typography.Text type="secondary">Your response:</Typography.Text>
        <Segmented<RsvpStatus>
          value={me.rsvpStatus === 'pending' ? undefined : me.rsvpStatus}
          disabled={busy}
          onChange={status =>
            run(
              () => provider.respond(meeting._id, status),
              `Response saved: ${RSVP_LABELS[status]}`
            )
          }
          options={RSVP_CHOICES.map(status => ({
            value: status,
            label: RSVP_LABELS[status],
          }))}
        />
      </Space>
    ) : null;

  const organizers = meeting.participants
    .filter(p => p.role === 'organizer')
    .map(p => p.name ?? p.participantId);

  const tabLabel = (label: string, count?: number) =>
    count ? (
      <Space size={6}>
        {label}
        <Badge count={count} color="#98a2b3" size="small" />
      </Space>
    ) : (
      label
    );

  return (
    <div className="meeting-detail">
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        className="meeting-detail-back"
      >
        Meetings
      </Button>
      <div className="meeting-detail-header">
        <Space size={12} align="center" wrap>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {meeting.title}
          </Typography.Title>
          <MeetingStatusTag
            status={meeting.status}
            startsAt={meeting.startsAt}
            endsAt={meeting.endsAt}
          />
        </Space>
        {actions}
      </div>

      {meeting.status === 'cancelled' ? (
        <Alert
          type="warning"
          showIcon
          className="meeting-detail-alert"
          message={`Cancelled${meeting.cancelledByName ? ` by ${meeting.cancelledByName}` : ''} on ${formatDateTime(meeting.cancelledAt)}`}
          description={meeting.cancellationReason ?? undefined}
        />
      ) : null}

      <Descriptions
        className="meeting-detail-info"
        size="small"
        bordered
        column={{ xs: 1, md: 2 }}
        items={[
          {
            key: 'when',
            label: 'When',
            children: formatMeetingTime(meeting.startsAt, meeting.endsAt),
          },
          {
            key: 'location',
            label: 'Location',
            children: meeting.location ?? '—',
          },
          {
            key: 'online',
            label: 'Online',
            children: meeting.onlineUrl ? (
              <Typography.Link
                href={meeting.onlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                ellipsis
              >
                {meeting.onlineUrl}
              </Typography.Link>
            ) : (
              '—'
            ),
          },
          {
            key: 'organizers',
            label: 'Organizers',
            children: organizers.length ? organizers.join(', ') : '—',
          },
          ...(meeting.description
            ? [
                {
                  key: 'description',
                  label: 'Description',
                  span: 2,
                  children: (
                    <span className="meeting-pre-wrap">
                      {meeting.description}
                    </span>
                  ),
                },
              ]
            : []),
        ]}
      />
      {rsvp ? <div className="meeting-detail-rsvp">{rsvp}</div> : null}

      <Tabs
        activeKey={activeTab}
        onChange={setTab}
        destroyOnHidden
        items={[
          {
            key: 'agenda',
            label: tabLabel('Agenda', meeting.agenda.length),
            children: <AgendaPanel {...panelProps} />,
          },
          {
            key: 'participants',
            label: tabLabel('Participants', meeting.participants.length),
            children: <ParticipantsPanel {...panelProps} />,
          },
          {
            key: 'minutes',
            label: 'Minutes',
            children: <MinutesPanel {...panelProps} />,
          },
          {
            key: 'attachments',
            label: tabLabel('Attachments', meeting.attachmentCount),
            children: <AttachmentsPanel {...panelProps} />,
          },
          {
            key: 'action-items',
            label: tabLabel('Action Items', meeting.openActionItemCount),
            children: <ActionItemsPanel {...panelProps} />,
          },
          {
            key: 'activity',
            label: 'Activity',
            children: <ActivityPanel {...panelProps} />,
          },
        ]}
      />

      <MeetingFormModal
        open={editing}
        meeting={meeting}
        onCancel={() => setEditing(false)}
        onSubmit={async details => {
          if (await run(() => provider.updateMeeting(meeting._id, details), 'Meeting saved')) {
            setEditing(false);
          }
        }}
      />
      <Modal
        open={cancelling}
        title="Cancel Meeting"
        okText="Cancel Meeting"
        okButtonProps={{ danger: true }}
        cancelText="Keep It"
        confirmLoading={busy}
        onCancel={() => setCancelling(false)}
        onOk={async () => {
          if (
            await run(
              () =>
                provider.cancelMeeting(
                  meeting._id,
                  cancelReason.trim() || undefined
                ),
              'Meeting cancelled'
            )
          ) {
            setCancelling(false);
          }
        }}
        destroyOnHidden
      >
        <Typography.Paragraph>
          Participants will see it as cancelled. You can reopen it later.
        </Typography.Paragraph>
        <Input.TextArea
          rows={3}
          maxLength={10000}
          placeholder="Reason (optional)"
          value={cancelReason}
          onChange={event => setCancelReason(event.target.value)}
        />
      </Modal>
    </div>
  );
};

export default MeetingDetail;
