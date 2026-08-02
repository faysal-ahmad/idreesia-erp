import React from 'react';
import { Link } from 'react-router-dom';

const RouterLink = Link as any;
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { type History } from 'history';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type {
  ListAllDutyLocationsQuery,
  ListAllDutyLocationsQueryVariables,
  RemoveDutyLocationMutation,
  RemoveDutyLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { Button, Table, Tooltip, message } from 'antd';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

const LIST_ALL_DUTY_LOCATIONS: TypedDocumentNode<
  ListAllDutyLocationsQuery,
  ListAllDutyLocationsQueryVariables
> = gql`
  query listAllDutyLocations {
    allDutyLocations {
      _id
      name
      usedCount
    }
  }
`;

const REMOVE_DUTY_LOCATION: TypedDocumentNode<
  RemoveDutyLocationMutation,
  RemoveDutyLocationMutationVariables
> = gql`
  mutation removeDutyLocation($_id: String!) {
    removeDutyLocation(_id: $_id)
  }
`;

interface ListProps {
  history: History;
}

type DutyLocationRow = NonNullable<
  NonNullable<ListAllDutyLocationsQuery['allDutyLocations']>[number]
> & { _id: string; name: string };

const List = ({ history }: ListProps) => {
  useBreadcrumbs(['HR', 'Duty Locations', 'List']);
  const { data } = useQuery(LIST_ALL_DUTY_LOCATIONS);
  const [removeDutyLocation] = useMutation(REMOVE_DUTY_LOCATION, {
    refetchQueries: ['allDutyLocations'],
  });

  const handleNewClicked = () => {
    history.push(paths.dutyLocationsNewFormPath);
  };

  const handleDeleteClicked = (record: DutyLocationRow) => {
    removeDutyLocation({
      variables: {
        _id: record._id,
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
      render: (text: string, record: DutyLocationRow) => (
        <RouterLink to={`${paths.dutyLocationsPath}/${record._id}`}>{text}</RouterLink>
      ),
    },
    {
      key: 'action',
      render: (_text: unknown, record: DutyLocationRow) => {
        if (record.usedCount === 0) {
          return (
            <Tooltip key="delete" title="Delete">
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

  const allDutyLocations = (data?.allDutyLocations ?? []).filter(
    (row): row is DutyLocationRow =>
      row != null && row._id != null && row.name != null
  );

  return (
    <Table
      rowKey="_id"
      dataSource={allDutyLocations}
      columns={columns}
      pagination={{ defaultPageSize: 20 }}
      bordered
      title={() => (
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Duty Location
        </Button>
      )}
    />
  );
};

export default List;
