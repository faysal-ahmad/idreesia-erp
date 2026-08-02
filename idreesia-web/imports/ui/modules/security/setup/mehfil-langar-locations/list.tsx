import React from 'react';
import { Link } from 'react-router-dom';

const RouterLink = Link as any;
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { type History } from 'history';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { AllSecurityMehfilLangarLocationsQuery } from 'meteor/idreesia-common/types/client-operations';
import { Button, Table, Tooltip, message } from 'antd';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import {
  ALL_SECURITY_MEHFIL_LANGAR_LOCATIONS,
  REMOVE_SECURITY_MEHFIL_LANGAR_LOCATION,
} from './gql';

type LangarLocationRow = NonNullable<
  NonNullable<AllSecurityMehfilLangarLocationsQuery['allSecurityMehfilLangarLocations']>[number]
>;

interface ListProps {
  history: History;
}

const List = ({ history }: ListProps) => {
  useBreadcrumbs(['Security', 'Mehfil Langar Locations', 'List']);
  const { data } = useQuery(ALL_SECURITY_MEHFIL_LANGAR_LOCATIONS);
  const allSecurityMehfilLangarLocations = (data?.allSecurityMehfilLangarLocations ?? []).filter(
    (row): row is LangarLocationRow => row != null && row._id != null
  );
  const [removeSecurityMehfilLangarLocation] = useMutation(REMOVE_SECURITY_MEHFIL_LANGAR_LOCATION, {
    refetchQueries: ['allSecurityMehfilLangarLocations'],
  });

  const handleNewClicked = () => {
    history.push(paths.mehfilLangarLocationsNewFormPath);
  };

  const handleDeleteClicked = (record: LangarLocationRow) => {
    removeSecurityMehfilLangarLocation({
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
      render: (text: string, record: LangarLocationRow) => (
        <RouterLink to={`${paths.mehfilLangarLocationsPath}/${record._id}`}>{text}</RouterLink>
      ),
    },
    {
      title: 'Urdu Name',
      dataIndex: 'urduName',
      key: 'urduName',
    },
    {
      key: 'action',
      render: (_text: unknown, record: LangarLocationRow) => {
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
      dataSource={allSecurityMehfilLangarLocations}
      columns={columns}
      pagination={{ defaultPageSize: 20 }}
      bordered
      title={() => (
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Langar Location
        </Button>
      )}
    />
  );
};

export default List;
