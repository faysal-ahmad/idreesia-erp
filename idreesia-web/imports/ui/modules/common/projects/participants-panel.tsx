import React, { useState } from 'react';
import { Button, Modal, Popconfirm, Select, Space, Table } from 'antd';
import { UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';

import { ProjectsError } from './types';
import type {
  Project,
  ProjectMember,
  ProjectParticipant,
  ProjectsDataProvider,
} from './types';

const showError = (error: unknown) =>
  message.error(error instanceof Error ? error.message : String(error));

interface Props {
  provider: ProjectsDataProvider;
  project: Project;
  members: ProjectMember[];
  onProjectChange: (project: Project) => void;
}

/**
 * The project's participants. They can use the project's private chat; a task
 * can only be assigned to a participant. Managers can add and remove them.
 */
const ParticipantsPanel = ({
  provider,
  project,
  members,
  onProjectChange,
}: Props) => {
  const [adding, setAdding] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const current = new Set(project.participants.map(p => p.personId));
  const addable = members.filter(member => !current.has(member.personId));
  const canChange =
    project.canManage &&
    project.status !== 'completed' &&
    project.status !== 'cancelled';

  const add = async () => {
    setBusy(true);
    try {
      onProjectChange(await provider.addParticipants(project._id, adding));
      setAdding([]);
      message.success('Participants added', 2);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (participant: ProjectParticipant) => {
    try {
      onProjectChange(
        await provider.removeParticipant(project._id, participant.personId)
      );
      message.success('Participant removed', 2);
    } catch (error) {
      // They still have open tasks: offer to unassign them.
      if (
        error instanceof ProjectsError &&
        error.code === 'CONFLICT' &&
        /open tasks/i.test(error.message)
      ) {
        Modal.confirm({
          title: `${participant.name ?? 'This person'} has open tasks`,
          content:
            'Remove them and unassign their open tasks in this project?',
          okText: 'Remove and Unassign',
          okButtonProps: { danger: true },
          onOk: async () => {
            try {
              onProjectChange(
                await provider.removeParticipant(
                  project._id,
                  participant.personId,
                  true
                )
              );
              message.success('Participant removed', 2);
            } catch (retryError) {
              showError(retryError);
            }
          },
        });
        return;
      }
      showError(error);
    }
  };

  return (
    <div className="project-participants">
      {canChange && addable.length ? (
        <Space size={8} className="project-participants-add">
          <Select
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="Add participants"
            style={{ minWidth: 320 }}
            value={adding}
            onChange={setAdding}
            options={addable.map(member => ({
              value: member.personId,
              label: member.name ?? member.personId,
            }))}
          />
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            disabled={!adding.length}
            loading={busy}
            onClick={add}
          >
            Add
          </Button>
        </Space>
      ) : null}
      <div className="list-container">
        <Table
          className="list-table"
          size="middle"
          bordered
          tableLayout="fixed"
          rowKey="personId"
          dataSource={project.participants}
          pagination={false}
          columns={[
            {
              title: 'Name',
              key: 'name',
              render: (_: unknown, participant: ProjectParticipant) => (
                <Space size={8}>
                  {participant.name ?? participant.personId}
                </Space>
              ),
            },
            {
              title: '',
              key: 'actions',
              width: 80,
              render: (_: unknown, participant: ProjectParticipant) =>
                canChange ? (
                  <Popconfirm
                    title="Remove this participant?"
                    description="They lose access to the project chat."
                    okText="Remove"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => remove(participant)}
                  >
                    <Button type="text" danger icon={<UserDeleteOutlined />} />
                  </Popconfirm>
                ) : null,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default ParticipantsPanel;
