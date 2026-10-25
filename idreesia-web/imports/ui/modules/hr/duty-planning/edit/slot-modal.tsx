import React, { useEffect, useState } from 'react';
import { Form, Modal, Select } from 'antd';

interface TeamOption {
  _id: string;
  name: string;
  color?: string | null;
}

interface SlotModalProps {
  open: boolean;
  shiftName: string;
  teams: TeamOption[];
  teamId?: string | null;
  confirmLoading: boolean;
  onCancel: () => void;
  onSave: (teamId: string | null) => void;
}

const SlotModal = ({
  open,
  shiftName,
  teams,
  teamId,
  confirmLoading,
  onCancel,
  onSave,
}: SlotModalProps) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    setSelectedTeamId(teamId ?? undefined);
  }, [open, teamId]);

  return (
    <Modal
      title={shiftName}
      open={open}
      width={480}
      okText="Save"
      confirmLoading={confirmLoading}
      onOk={() => onSave(selectedTeamId ?? null)}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form className="duty-roster-team-form" layout="vertical">
        <Form.Item label="Team">
          <Select
            allowClear
            placeholder="Select a team"
            value={selectedTeamId}
            onChange={value => setSelectedTeamId(value)}
            options={teams.map(team => ({
              value: team._id,
              label: team.name,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SlotModal;
