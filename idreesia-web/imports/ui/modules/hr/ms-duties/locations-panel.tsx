import React from 'react';
import { useMutation } from '@apollo/client/react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { REMOVE_DUTY_LOCATION } from './gql';

export interface DutyLocationRow {
  _id: string;
  dutyId?: string | null;
  name: string;
  canDelete?: boolean | null;
}

interface Props {
  locations: DutyLocationRow[];
  onAdd: () => void;
  onEdit: (location: DutyLocationRow) => void;
}

const DutyLocationsPanel = ({ locations, onAdd, onEdit }: Props) => {
  const [removeDutyLocation] = useMutation(REMOVE_DUTY_LOCATION, {
    refetchQueries: [
      'listAllMSDuties',
      'composerAllMSDuties',
      'composerAllDutyLocations',
      'dutyLocationsByDutyId',
    ],
  });

  const handleRemove = (locationId: string) => {
    removeDutyLocation({ variables: { _id: locationId } }).catch(
      (error: Error) => {
        message.error(error.message, 5);
      }
    );
  };

  const columns = [
    {
      title: 'Location Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: DutyLocationRow) => (
        <Button
          type="link"
          style={{ padding: 0, height: 'auto' }}
          onClick={() => onEdit(record)}
        >
          {text}
        </Button>
      ),
    },
    {
      key: 'action',
      width: 72,
      render: (_text: unknown, record: DutyLocationRow) => {
        if (!record.canDelete) return null;

        return (
          <div className="list-actions-column">
            <Popconfirm
              title="Are you sure you want to delete this location?"
              onConfirm={() => handleRemove(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <DeleteOutlined className="list-actions-icon" />
              </Tooltip>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="duty-expanded-header">
        <div className="duty-expanded-title">Locations</div>
        <Button size="small" icon={<PlusOutlined />} onClick={onAdd}>
          Add Location
        </Button>
      </div>
      <Table
        rowKey="_id"
        dataSource={locations}
        columns={columns}
        size="small"
        bordered
        pagination={false}
        locale={{ emptyText: 'No locations added yet' }}
      />
    </div>
  );
};

export default DutyLocationsPanel;
