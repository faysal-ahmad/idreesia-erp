import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  CalendarOutlined,
  CrownFilled,
  CrownOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Drawer,
  Form,
  Modal,
  Popconfirm,
  Row,
  Table,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';

import {
  PersonName,
  type KarkunSelectionItem,
} from '/imports/ui/modules/helpers/controls';

import { DAYS_OF_WEEK } from './dates';
import {
  WORKSPACE_DA_ADD_DUTY_MEMBER,
  WORKSPACE_DA_REMOVE_DUTY_MEMBER,
  WORKSPACE_DA_UPDATE_DUTY_MEMBER,
} from './gql';
import type { Duty } from './hooks';
import KarkunPicker from './karkun-picker';

type Member = NonNullable<NonNullable<Duty['members']>[number]>;

const daysOf = (member: Member) =>
  (member.daysOfWeek ?? []).filter((day): day is string => day != null);

// "Every day", or the days in week order.
const formatDays = (member: Member) => {
  const days = daysOf(member);
  if (days.length === 0) return 'Every day';
  return DAYS_OF_WEEK.filter(day => days.includes(day.value))
    .map(day => day.value)
    .join(', ');
};

interface Props {
  locationId: string;
  duty: Duty;
  canManage: boolean;
  onChanged: () => void;
}

// The roster of a duty, shown under its row: who is on it and on which days
// of the week. Roster changes apply from tomorrow.
const DutyMembersPanel = ({ locationId, duty, canManage, onChanged }: Props) => {
  const [daysForm] = Form.useForm<{ daysOfWeek: string[] }>();
  const [adding, setAdding] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Member | null>(null);
  const [savingDays, setSavingDays] = useState(false);

  const [addMember] = useMutation(WORKSPACE_DA_ADD_DUTY_MEMBER);
  const [updateMember] = useMutation(WORKSPACE_DA_UPDATE_DUTY_MEMBER);
  const [removeMember] = useMutation(WORKSPACE_DA_REMOVE_DUTY_MEMBER);

  const dutyId = duty._id;
  const members = (duty.members ?? []).filter(
    (member): member is Member => member != null
  );

  const reportError = (error: Error) => {
    message.error(error.message, 5);
  };

  const handleAdd = (karkun: KarkunSelectionItem) => {
    setAddingId(karkun._id);
    addMember({ variables: { locationId, dutyId, karkunId: karkun._id } })
      .then(() => {
        message.success(
          `${karkun.name} added. Set their days if they are not on duty every day.`,
          4
        );
        onChanged();
      })
      .catch(reportError)
      .finally(() => setAddingId(null));
  };

  const handleRemove = (karkunId: string) => {
    removeMember({ variables: { locationId, dutyId, karkunId } })
      .then(() => {
        message.success('Member removed', 2);
        onChanged();
      })
      .catch(reportError);
  };

  const handleToggleCoordinator = (member: Member) => {
    updateMember({
      variables: {
        locationId,
        dutyId,
        karkunId: member.karkunId,
        isCoordinator: !member.isCoordinator,
        daysOfWeek: daysOf(member),
      },
    })
      .then(() => onChanged())
      .catch(reportError);
  };

  const openDays = (member: Member) => {
    daysForm.setFieldsValue({ daysOfWeek: daysOf(member) });
    setEditing(member);
  };

  const handleSaveDays = async () => {
    if (!editing) return;
    const { daysOfWeek } = await daysForm.validateFields();
    setSavingDays(true);
    try {
      await updateMember({
        variables: {
          locationId,
          dutyId,
          karkunId: editing.karkunId,
          isCoordinator: !!editing.isCoordinator,
          daysOfWeek,
        },
      });
      message.success('Days updated', 2);
      setEditing(null);
      onChanged();
    } catch (error) {
      reportError(error as Error);
    } finally {
      setSavingDays(false);
    }
  };

  const columns: any[] = [
    {
      title: 'Name',
      key: 'name',
      render: (_text: unknown, member: Member) => (
        <PersonName
          person={{
            _id: member.karkunId,
            name: member.karkun?.sharedData?.name,
            imageUrl: member.karkun?.sharedData?.imageUrl,
            imageThumbnailUrl: member.karkun?.sharedData?.imageThumbnailUrl,
          }}
        />
      ),
    },
    {
      title: 'Days on duty',
      key: 'days',
      render: (_text: unknown, member: Member) => formatDays(member),
    },
    {
      title: 'Contact Number',
      key: 'contactNumber',
      render: (_text: unknown, member: Member) => {
        const shared = member.karkun?.sharedData;
        return (
          <>
            {shared?.contactNumber1 ? <Row>{shared.contactNumber1}</Row> : null}
            {shared?.contactNumber2 ? <Row>{shared.contactNumber2}</Row> : null}
          </>
        );
      },
    },
    {
      key: 'action',
      width: 110,
      render: (_text: unknown, member: Member) => {
        if (!canManage) {
          return member.isCoordinator ? (
            <CrownFilled className="list-actions-icon" title="Coordinator" />
          ) : null;
        }
        return (
          <div className="list-actions-column">
            <Tooltip title="Days on duty">
              <CalendarOutlined
                className="list-actions-icon"
                onClick={() => openDays(member)}
              />
            </Tooltip>
            <Tooltip
              title={
                member.isCoordinator ? 'Remove as Coordinator' : 'Make Coordinator'
              }
            >
              {member.isCoordinator ? (
                <CrownFilled
                  className="list-actions-icon"
                  onClick={() => handleToggleCoordinator(member)}
                />
              ) : (
                <CrownOutlined
                  className="list-actions-icon"
                  onClick={() => handleToggleCoordinator(member)}
                />
              )}
            </Tooltip>
            <Popconfirm
              title="Remove this person from the duty?"
              onConfirm={() => handleRemove(member.karkunId)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Remove">
                <UserDeleteOutlined className="list-actions-icon" />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {canManage ? (
        <div style={{ marginBottom: 8 }}>
          <Button
            type="primary"
            size="small"
            icon={<UserAddOutlined />}
            onClick={() => setAdding(true)}
          >
            Add Member
          </Button>
          <span className="da-note" style={{ marginLeft: 12 }}>
            Roster changes apply from tomorrow; days up to today keep the roster
            they had.
          </span>
        </div>
      ) : null}
      <Table
        rowKey="karkunId"
        dataSource={members}
        columns={columns}
        size="small"
        bordered
        pagination={false}
        locale={{ emptyText: 'No members added yet' }}
      />

      <Drawer
        title={`Add Member – ${duty.name}`}
        width={900}
        open={adding}
        onClose={() => setAdding(false)}
        destroyOnHidden
      >
        <KarkunPicker
          locationId={locationId}
          selectedIds={members.map(member => member.karkunId)}
          selectedLabel="Member"
          addingId={addingId}
          onAdd={handleAdd}
        />
      </Drawer>

      <Modal
        title={
          editing
            ? `Days on duty for ${editing.karkun?.sharedData?.name ?? ''}`
            : 'Days on duty'
        }
        open={editing != null}
        okText="Save"
        confirmLoading={savingDays}
        onOk={handleSaveDays}
        onCancel={() => setEditing(null)}
        destroyOnHidden
        forceRender
      >
        {/* The global form width (600px) is wider than the modal. */}
        <Form form={daysForm} layout="vertical" style={{ width: '100%' }}>
          <Form.Item
            name="daysOfWeek"
            label="Days"
            extra="Leave all unchecked for every day."
          >
            <Checkbox.Group
              options={DAYS_OF_WEEK.map(day => ({
                value: day.value,
                label: day.label,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DutyMembersPanel;
