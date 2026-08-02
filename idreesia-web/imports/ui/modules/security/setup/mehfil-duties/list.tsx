import React from 'react';
import { Link } from 'react-router-dom';

const RouterLink = Link as any;
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { type History } from 'history';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { SetupAllSecurityMehfilDutiesQuery } from 'meteor/idreesia-common/types/client-operations';
import { Button, Table, Tooltip, message } from 'antd';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import {
  SETUP_ALL_SECURITY_MEHFIL_DUTIES,
  REMOVE_SECURITY_MEHFIL_DUTY,
} from './gql';

type MehfilDutyRow = NonNullable<
  NonNullable<SetupAllSecurityMehfilDutiesQuery['allSecurityMehfilDuties']>[number]
>;

interface ListProps {
  history: History;
}

const List = ({ history }: ListProps) => {
  useBreadcrumbs(['Security', 'Mehfil Duties', 'List']);
  const { data } = useQuery(SETUP_ALL_SECURITY_MEHFIL_DUTIES);
  const allSecurityMehfilDuties = (data?.allSecurityMehfilDuties ?? []).filter(
    (row): row is MehfilDutyRow => row != null && row._id != null
  );
  const [removeSecurityMehfilDuty] = useMutation(REMOVE_SECURITY_MEHFIL_DUTY, {
    refetchQueries: ['setupAllSecurityMehfilDuties'],
  });

  const handleNewClicked = () => {
    history.push(paths.mehfilDutiesNewFormPath);
  };

  const handleDeleteClicked = (record: MehfilDutyRow) => {
    removeSecurityMehfilDuty({
      variables: {
        _id: record._id!,
      },
    }).catch((error: Error) => {
      message.error(error.message, 5);
    });
  };

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MehfilDutyRow) => (
        <RouterLink to={`${paths.mehfilDutiesPath}/${record._id}`}>{text}</RouterLink>
      ),
    },
    {
      title: 'Urdu Name',
      dataIndex: 'urduName',
      key: 'urduName',
    },
    {
      key: 'action',
      render: (_text: unknown, record: MehfilDutyRow) => {
        if (record.overallUsedCount === 0) {
          return (
            <Tooltip title="Delete">
              <DeleteOutlined
                className="list-actions-icon"
                onClick={() => {
                  handleDeleteClicked(record);
                }}
              />
            </Tooltip>
          );
        }
        return null;
      },
    },
  ];

  return (
    <Table
      rowKey="_id"
      dataSource={allSecurityMehfilDuties}
      columns={columns}
      pagination={{ defaultPageSize: 20 }}
      bordered
      title={() => (
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Mehfil Duty
        </Button>
      )}
    />
  );
};

export default List;
