import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { CheckOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import {
  ATTENDANCE_LABELS,
  formatDateTime,
  hasStarted,
  ROLE_LABELS,
  RSVP_LABELS,
  RsvpTag,
} from './format';
import type {
  AttendanceEntry,
  AttendanceStatus,
  MeetingParticipant,
  ParticipantRole,
  RsvpStatus,
} from './types';
import type { PanelProps } from './panel-props';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

type AttendanceEdits = Record<
  string,
  { status: AttendanceStatus | null; note: string | null }
>;

const attendanceOf = (participants: MeetingParticipant[]): AttendanceEdits =>
  Object.fromEntries(
    participants.map(p => [
      p.participantId,
      { status: p.attendanceStatus, note: p.attendanceNote },
    ])
  );

/** Who is invited, their responses and (once it starts) attendance. */
const ParticipantsPanel = ({
  provider,
  meeting,
  info,
  members,
  onMeetingChange,
}: PanelProps) => {
  const canManage = info.canManage;
  const isScheduled = meeting.status === 'scheduled';
  const canMarkAttendance =
    canManage && meeting.status !== 'cancelled' && hasStarted(meeting.startsAt);

  const [editingList, setEditingList] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savingList, setSavingList] = useState(false);
  const [attendance, setAttendance] = useState<AttendanceEdits>(() =>
    attendanceOf(meeting.participants)
  );
  const [savingAttendance, setSavingAttendance] = useState(false);

  useEffect(() => {
    setAttendance(attendanceOf(meeting.participants));
  }, [meeting.participants]);

  const attendanceChanged = useMemo(
    () =>
      meeting.participants.some(p => {
        const edit = attendance[p.participantId];
        return (
          edit &&
          ((edit.status ?? null) !== p.attendanceStatus ||
            (edit.note || null) !== p.attendanceNote)
        );
      }),
    [attendance, meeting.participants]
  );

  const counts = useMemo(() => {
    const result: Record<RsvpStatus, number> = {
      accepted: 0,
      tentative: 0,
      declined: 0,
      pending: 0,
    };
    meeting.participants.forEach(p => {
      result[p.rsvpStatus] += 1;
    });
    return result;
  }, [meeting.participants]);

  const change = async (action: () => Promise<typeof meeting>, success: string) => {
    try {
      onMeetingChange(await action());
      message.success(success, 2);
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const saveAttendance = async () => {
    const entries: AttendanceEntry[] = meeting.participants
      .filter(p => {
        const edit = attendance[p.participantId];
        return (
          edit &&
          ((edit.status ?? null) !== p.attendanceStatus ||
            (edit.note || null) !== p.attendanceNote)
        );
      })
      .map(p => ({
        participantId: p.participantId,
        status: attendance[p.participantId].status,
        note: attendance[p.participantId].note || null,
      }));
    setSavingAttendance(true);
    await change(
      () => provider.markAttendance(meeting._id, entries),
      'Attendance saved'
    );
    setSavingAttendance(false);
  };

  const columns = [
    {
      title: 'Name',
      key: 'name',
      ellipsis: true,
      render: (_: unknown, p: MeetingParticipant) => (
        <Space size={8}>
          <span>{p.name ?? p.participantId}</span>
          {p.isMe ? <Tag color="blue">You</Tag> : null}
        </Space>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      width: 150,
      render: (_: unknown, p: MeetingParticipant) =>
        canManage && isScheduled ? (
          <Select<ParticipantRole>
            size="small"
            value={p.role}
            style={{ width: 120 }}
            onChange={role =>
              change(
                () =>
                  provider.setParticipantRole(meeting._id, p.participantId, role),
                'Role changed'
              )
            }
            options={Object.entries(ROLE_LABELS).map(([value, label]) => ({
              value: value as ParticipantRole,
              label,
            }))}
          />
        ) : (
          ROLE_LABELS[p.role]
        ),
    },
    {
      title: 'Response',
      key: 'rsvp',
      width: 170,
      render: (_: unknown, p: MeetingParticipant) => (
        <Tooltip
          title={
            p.rsvpComment || p.rsvpRespondedAt
              ? [p.rsvpComment, formatDateTime(p.rsvpRespondedAt)]
                  .filter(Boolean)
                  .join(' · ')
              : undefined
          }
        >
          <span>
            <RsvpTag status={p.rsvpStatus} />
            {p.rsvpComment ? (
              <Typography.Text type="secondary">…</Typography.Text>
            ) : null}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Attendance',
      key: 'attendance',
      width: canMarkAttendance ? 360 : 220,
      render: (_: unknown, p: MeetingParticipant) => {
        if (!canMarkAttendance) {
          return p.attendanceStatus ? (
            <Tooltip
              title={[
                p.attendanceNote,
                p.attendanceMarkedByName &&
                  `Recorded by ${p.attendanceMarkedByName}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            >
              <span>{ATTENDANCE_LABELS[p.attendanceStatus]}</span>
            </Tooltip>
          ) : (
            <Typography.Text type="secondary">Not recorded</Typography.Text>
          );
        }
        const edit = attendance[p.participantId] ?? { status: null, note: null };
        return (
          <Space size={8}>
            <Select<AttendanceStatus>
              size="small"
              allowClear
              placeholder="Not recorded"
              value={edit.status ?? undefined}
              style={{ width: 130 }}
              onChange={status =>
                setAttendance(current => ({
                  ...current,
                  [p.participantId]: { ...edit, status: status ?? null },
                }))
              }
              options={Object.entries(ATTENDANCE_LABELS).map(
                ([value, label]) => ({
                  value: value as AttendanceStatus,
                  label,
                })
              )}
            />
            <Input
              size="small"
              placeholder="Note"
              value={edit.note ?? ''}
              maxLength={500}
              style={{ width: 190 }}
              onChange={event =>
                setAttendance(current => ({
                  ...current,
                  [p.participantId]: { ...edit, note: event.target.value },
                }))
              }
            />
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div className="list-table-header">
        <Space size={12}>
          {canManage && isScheduled ? (
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedIds(meeting.participants.map(p => p.participantId));
                setEditingList(true);
              }}
            >
              Edit Participants
            </Button>
          ) : null}
          {canMarkAttendance ? (
            <>
              <Button
                icon={<CheckOutlined />}
                onClick={() =>
                  setAttendance(current =>
                    Object.fromEntries(
                      meeting.participants.map(p => [
                        p.participantId,
                        {
                          status:
                            current[p.participantId]?.status ?? 'present',
                          note: current[p.participantId]?.note ?? null,
                        },
                      ])
                    )
                  )
                }
              >
                Mark Others Present
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                disabled={!attendanceChanged}
                loading={savingAttendance}
                onClick={saveAttendance}
              >
                Save Attendance
              </Button>
            </>
          ) : null}
        </Space>
        <div className="list-table-header-utilities">
          <Space size={12} wrap>
            {(Object.keys(counts) as RsvpStatus[]).map(status => (
              <Typography.Text key={status} type="secondary">
                {RSVP_LABELS[status]}: {counts[status]}
              </Typography.Text>
            ))}
          </Space>
        </div>
      </div>
      {canManage && meeting.status === 'scheduled' && !hasStarted(meeting.startsAt) ? (
        <Typography.Paragraph type="secondary">
          Attendance can be recorded once the meeting starts.
        </Typography.Paragraph>
      ) : null}
      <div className="list-container">
        <Table
          className="list-table"
          size="middle"
          bordered
          tableLayout="fixed"
          rowKey="participantId"
          dataSource={meeting.participants}
          columns={columns}
          pagination={false}
          locale={{ emptyText: 'No one is invited yet' }}
        />
      </div>

      <Modal
        open={editingList}
        title="Edit Participants"
        okText="Save"
        confirmLoading={savingList}
        onCancel={() => setEditingList(false)}
        onOk={async () => {
          setSavingList(true);
          const saved = await change(
            () => provider.setParticipants(meeting._id, selectedIds),
            'Participants saved'
          );
          setSavingList(false);
          if (saved) setEditingList(false);
        }}
        destroyOnHidden
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space size={8}>
            <Button
              size="small"
              onClick={() => setSelectedIds(members.map(m => m.participantId))}
            >
              All members
            </Button>
            <Button size="small" onClick={() => setSelectedIds([])}>
              None
            </Button>
          </Space>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            optionFilterProp="label"
            placeholder="Choose who to invite"
            value={selectedIds}
            onChange={setSelectedIds}
            options={members.map(member => ({
              value: member.participantId,
              label: member.name ?? member.participantId,
            }))}
          />
          <Typography.Text type="secondary">
            New participants are invited with no response yet. Removing someone
            discards their response.
          </Typography.Text>
        </Space>
      </Modal>
    </>
  );
};

export default ParticipantsPanel;
