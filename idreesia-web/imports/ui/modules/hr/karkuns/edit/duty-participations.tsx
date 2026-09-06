/* eslint "no-script-url": "off" */
import React, { useState } from 'react';
import { type match } from 'react-router';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Divider,
  Form,
  Table,
  Tooltip,
  Modal,
  Popconfirm,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  useAllMSDuties,
  useAllDutyShifts,
  useAllDutyLocations,
} from '/imports/ui/modules/hr/common/hooks';
import type { KarkunDutiesByKarkunIdQuery } from 'meteor/idreesia-common/types/client-operations';

import DutyForm from './duty-form';
import {
  KARKUN_DUTIES_BY_KARKUN_ID,
  CREATE_KARKUN_DUTY,
  UPDATE_KARKUN_DUTY,
  REMOVE_KARKUN_DUTY,
} from '../gql';

type KarkunDuty = NonNullable<NonNullable<KarkunDutiesByKarkunIdQuery['karkunDutiesByKarkunId']>[number]>;
interface Props { match: match<{ karkunId: string }>; karkunId: string; }
interface DutyValues { dutyIdShiftId?: string[]; locationId?: string; role?: string; weekDays?: string[]; }

const DutyParticipation = (props: Props) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [defaultValues, setDefaultValues] = useState<Partial<KarkunDuty>>({});
  const [newDutyForm] = Form.useForm();
  const [editDutyForm] = Form.useForm();
  const { karkunId } = props;
  const { data } = useQuery(KARKUN_DUTIES_BY_KARKUN_ID, {
    variables: { karkunId: props.match.params.karkunId },
  });
  const [createKarkunDuty] = useMutation(CREATE_KARKUN_DUTY, {
    refetchQueries: ['karkunDutiesByKarkunId'],
  });
  const [updateKarkunDuty] = useMutation(UPDATE_KARKUN_DUTY, {
    refetchQueries: ['karkunDutiesByKarkunId'],
  });
  const [removeKarkunDuty] = useMutation(REMOVE_KARKUN_DUTY, {
    refetchQueries: [
      'hrKarkunsPagedHrKarkuns',
      'karkunDutiesByKarkunId',
      'composerAllMSDuties',
    ],
  });
  const { allMSDuties } = useAllMSDuties();
  const { allDutyShifts } = useAllDutyShifts();
  const { allDutyLocations } = useAllDutyLocations();

  const handleNewClicked = () => {
    setShowNewForm(true);
  };

  const handleEditClicked = (record: KarkunDuty) => {
    setShowEditForm(true);
    setDefaultValues(record);
  };

  const handleDeleteClicked = (record: KarkunDuty) => {
    if (!record._id) return;
    removeKarkunDuty({
      variables: {
        _id: record._id,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const handleNewDutyFormCancelled = () => {
    setShowNewForm(false);
  };

  const handleEditDutyFormCancelled = () => {
    setShowEditForm(false);
  };

  const handleNewDutyFormSaved = () => {
    newDutyForm.validateFields().then(({ dutyIdShiftId, locationId, role, weekDays }: DutyValues) => {
      const dutyId = dutyIdShiftId?.[0];
      if (!dutyId) return;
      setShowNewForm(false);
      createKarkunDuty({
        variables: {
          karkunId,
          dutyId,
          shiftId: dutyIdShiftId?.[1],
          locationId,
          role,
          daysOfWeek: weekDays,
        },
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
    });
  };

  const handleEditDutyFormSaved = () => {
    const { _id } = defaultValues;
    if (!_id) return;
    editDutyForm.validateFields().then(({ dutyIdShiftId, locationId, role, weekDays }: DutyValues) => {
      const dutyId = dutyIdShiftId?.[0];
      if (!dutyId) return;
      setShowEditForm(false);
      updateKarkunDuty({
        variables: {
          _id,
          karkunId,
          dutyId,
          shiftId: dutyIdShiftId?.[1],
          locationId,
          role,
          daysOfWeek: weekDays,
        },
      })
        .catch((error: Error) => {
          message.error(error.message, 5);
        });
      });
  };

  const columns: any[] = [
    {
      title: 'Duty Name',
      dataIndex: 'dutyName',
      key: 'dutyName',
      render: (text: string, record: KarkunDuty) => {
        if (record.role) {
          return `${text} (${record.role})`;
        }
        return text;
      },
    },
    {
      title: 'Shift Name',
      dataIndex: 'shiftName',
      key: 'shiftName',
    },
    {
      title: 'Location Name',
      dataIndex: 'locationName',
      key: 'locationName',
    },
    {
      title: 'Days of Week',
      dataIndex: 'daysOfWeek',
      key: 'daysOfWeek',
      render: (textArray: Array<string | null> | null | undefined) =>
        textArray ? textArray.filter((day): day is string => day != null).join() : null,
    },
    {
      key: 'action',
      render: (_text: unknown, record: KarkunDuty) => (
        <span>
          <Tooltip title="Edit">
            <EditOutlined
              className="list-actions-icon"
              onClick={() => {
                handleEditClicked(record);
              }}
            />
          </Tooltip>
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure you want to delete this duty?"
            onConfirm={() => {
              handleDeleteClicked(record);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <DeleteOutlined className="list-actions-icon" />
            </Tooltip>
          </Popconfirm>
        </span>
      ),
    },
  ];

  const karkunDutiesByKarkunId = (data?.karkunDutiesByKarkunId ?? []).filter(
    (duty): duty is KarkunDuty => duty != null
  );

  return (
    <>
      <Table
        rowKey="_id"
        dataSource={karkunDutiesByKarkunId}
        columns={columns as any}
        bordered
        title={() => (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Duty
          </Button>
        )}
      />

      <Modal
        open={showNewForm}
        title="Add Duty"
        okText="Save"
        width={600}
        destroyOnHidden
        onOk={handleNewDutyFormSaved}
        onCancel={handleNewDutyFormCancelled}
      >
        <DutyForm
          form={newDutyForm}
          defaultValues={defaultValues}
          allMSDuties={allMSDuties}
          allDutyShifts={allDutyShifts}
          allDutyLocations={allDutyLocations}
        />
      </Modal>

      <Modal
        open={showEditForm}
        title="Edit Duty"
        okText="Save"
        width={600}
        destroyOnHidden
        onOk={handleEditDutyFormSaved}
        onCancel={handleEditDutyFormCancelled}
      >
        <DutyForm
          form={editDutyForm}
          defaultValues={defaultValues}
          allMSDuties={allMSDuties}
          allDutyShifts={allDutyShifts}
          allDutyLocations={allDutyLocations}
        />
      </Modal>
    </>
  );
};

export default DutyParticipation;
