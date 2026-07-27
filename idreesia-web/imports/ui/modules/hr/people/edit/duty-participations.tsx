/* eslint "no-script-url": "off" */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
  message,
} from 'antd';

import {
  useAllMSDuties,
  useAllDutyShifts,
  useAllDutyLocations,
} from '/imports/ui/modules/hr/common/composers';

import DutyForm from './duty-form';
import {
  KARKUN_DUTIES_BY_KARKUN_ID,
  CREATE_KARKUN_DUTY,
  UPDATE_KARKUN_DUTY,
  REMOVE_KARKUN_DUTY,
} from '../gql';

const AntDeleteOutlined = DeleteOutlined as any;
const AntEditOutlined = EditOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const AntButton = Button as any;
const AntDivider = Divider as any;
const AntForm = Form as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntModal = Modal as any;
const AntPopconfirm = Popconfirm as any;
const DutyEditForm = DutyForm as any;
type AnyRecord = Record<string, any>;
interface MatchLike { params: { karkunId: string; }; }
interface QueryData { karkunDutiesByKarkunId?: AnyRecord[] | null; }
interface Props { match: MatchLike; karkunId?: string | null; }
interface DutyValues { dutyIdShiftId?: string[]; locationId?: string; role?: string; weekDays?: string[]; }

const DutyParticipation = (props: Props) => {
  const { match, karkunId } = props;
  const [showNewForm, setShowNewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [defaultValues, setDefaultValues] = useState<AnyRecord>({});
  const [newDutyForm] = AntForm.useForm();
  const [editDutyForm] = AntForm.useForm();
  const { data } = useQuery(KARKUN_DUTIES_BY_KARKUN_ID as any, {
    variables: { karkunId: match.params.karkunId },
  });
  const [createKarkunDuty] = useMutation(CREATE_KARKUN_DUTY as any, {
    refetchQueries: ['karkunDutiesByKarkunId'],
  });
  const [updateKarkunDuty] = useMutation(UPDATE_KARKUN_DUTY as any, {
    refetchQueries: ['karkunDutiesByKarkunId'],
  });
  const [removeKarkunDuty] = useMutation(REMOVE_KARKUN_DUTY as any, {
    refetchQueries: [
      'pagedHrKarkuns',
      'karkunDutiesByKarkunId',
      'allMSDuties',
    ],
  });
  const { allMSDuties } = useAllMSDuties();
  const { allDutyShifts } = useAllDutyShifts();
  const { allDutyLocations } = useAllDutyLocations();
  const { karkunDutiesByKarkunId } = (data ?? {}) as QueryData;

  const handleNewClicked = () => {
    setShowNewForm(true);
  };

  const handleEditClicked = (record: AnyRecord) => {
    setShowEditForm(true);
    setDefaultValues(record);
  };

  const handleDeleteClicked = (record: AnyRecord) => {
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
      setShowNewForm(false);
      createKarkunDuty({
        variables: {
          karkunId,
          dutyId: dutyIdShiftId?.[0],
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
    editDutyForm.validateFields().then(({ dutyIdShiftId, locationId, role, weekDays }: DutyValues) => {
      setShowEditForm(false);
      updateKarkunDuty({
        variables: {
          _id,
          karkunId,
          dutyId: dutyIdShiftId?.[0],
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
      render: (text: string, record: AnyRecord) => {
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
      render: (textArray: string[] | undefined) => (textArray ? textArray.join() : null),
    },
    {
      key: 'action',
      render: (_text: unknown, record: AnyRecord) => (
        <span>
          <AntTooltip title="Edit">
            <AntEditOutlined
              className="list-actions-icon"
              onClick={() => {
                handleEditClicked(record);
              }}
            />
          </AntTooltip>
          <AntDivider type="vertical" />
          <AntPopconfirm
            title="Are you sure you want to delete this duty?"
            onConfirm={() => {
              handleDeleteClicked(record);
            }}
            okText="Yes"
            cancelText="No"
          >
            <AntTooltip title="Delete">
              <AntDeleteOutlined className="list-actions-icon" />
            </AntTooltip>
          </AntPopconfirm>
        </span>
      ),
    },
  ];

  return (
    <>
      <AntTable
        rowKey="_id"
        dataSource={karkunDutiesByKarkunId ?? []}
        columns={columns as any}
        bordered
        title={() => (
          <AntButton
            type="primary"
            icon={<AntPlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Duty
          </AntButton>
        )}
      />

      <AntModal
        open={showNewForm}
        title="Add Duty"
        okText="Save"
        width={600}
        destroyOnClose
        onOk={handleNewDutyFormSaved}
        onCancel={handleNewDutyFormCancelled}
      >
        <DutyEditForm
          form={newDutyForm}
          defaultValues={defaultValues}
          allMSDuties={allMSDuties}
          allDutyShifts={allDutyShifts}
          allDutyLocations={allDutyLocations}
        />
      </AntModal>

      <AntModal
        open={showEditForm}
        title="Edit Duty"
        okText="Save"
        width={600}
        destroyOnClose
        onOk={handleEditDutyFormSaved}
        onCancel={handleEditDutyFormCancelled}
      >
        <DutyEditForm
          form={editDutyForm}
          defaultValues={defaultValues}
          allMSDuties={allMSDuties}
          allDutyShifts={allDutyShifts}
          allDutyLocations={allDutyLocations}
        />
      </AntModal>
    </>
  );
};

DutyParticipation.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  karkunId: PropTypes.string,
};

export default DutyParticipation;
