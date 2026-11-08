import React, { useEffect, useState } from 'react';
import { Button, Empty, Input, Space, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import { formatDateTime } from './format';
import type { PanelProps } from './panel-props';

/** The meeting's minutes: editable by managers, read-only for others. */
const MinutesPanel = ({
  provider,
  meeting,
  info,
  onMeetingChange,
}: PanelProps) => {
  const canEdit = info.canManage && meeting.status !== 'cancelled';
  const [text, setText] = useState(meeting.minutes ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(meeting.minutes ?? '');
  }, [meeting.minutes]);

  const changed = text.trim() !== (meeting.minutes ?? '');
  const updated = meeting.minutesUpdatedAt ? (
    <Typography.Text type="secondary">
      Last updated {formatDateTime(meeting.minutesUpdatedAt)}
      {meeting.minutesUpdatedByName ? ` by ${meeting.minutesUpdatedByName}` : ''}
    </Typography.Text>
  ) : null;

  if (!canEdit) {
    return meeting.minutes ? (
      <div className="meeting-minutes">
        <div className="meeting-minutes-text">{meeting.minutes}</div>
        {updated}
      </div>
    ) : (
      <Empty description="No minutes have been recorded" />
    );
  }

  return (
    <div className="meeting-minutes">
      <Input.TextArea
        value={text}
        onChange={event => setText(event.target.value)}
        autoSize={{ minRows: 12, maxRows: 30 }}
        maxLength={500000}
        placeholder="Record what was discussed and decided"
      />
      <div className="meeting-minutes-footer">
        {updated ?? <span />}
        <Space size={8}>
          <Button
            disabled={!changed}
            onClick={() => setText(meeting.minutes ?? '')}
          >
            Discard Changes
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            disabled={!changed}
            loading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                onMeetingChange(
                  await provider.setMinutes(meeting._id, text.trim() || null)
                );
                message.success('Minutes saved', 2);
              } catch (error) {
                message.error(
                  error instanceof Error ? error.message : String(error)
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            Save Minutes
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default MinutesPanel;
