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
  ListAllMsDutiesQuery,
  ListAllMsDutiesQueryVariables,
  RemoveDutyMutation,
  RemoveDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { Button, Table, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

const LIST_ALL_MS_DUTIES: TypedDocumentNode<
  ListAllMsDutiesQuery,
  ListAllMsDutiesQueryVariables
> = gql`
  query listAllMSDuties {
    allMSDuties {
      _id
      name
      description
      canDelete
      shifts {
        _id
        name
      }
    }
  }
`;

const REMOVE_DUTY: TypedDocumentNode<
  RemoveDutyMutation,
  RemoveDutyMutationVariables
> = gql`
  mutation removeDuty($_id: String!) {
    removeDuty(_id: $_id)
  }
`;

interface ListProps {
  history: History;
}

type DutyRow = NonNullable<
  NonNullable<ListAllMsDutiesQuery['allMSDuties']>[number]
> & { _id: string; name: string };

const List = ({ history }: ListProps) => {
  useBreadcrumbs(['HR', 'Duties & Shifts', 'List']);
  const { data } = useQuery(LIST_ALL_MS_DUTIES);
  const [removeDuty] = useMutation(REMOVE_DUTY, {
    refetchQueries: ['allMSDuties'],
  });

  const handleNewClicked = () => {
    history.push(paths.msDutiesNewFormPath);
  };

  const handleDeleteClicked = (record: DutyRow) => {
    removeDuty({
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
      width: 200,
      render: (text: string, record: DutyRow) => (
        <RouterLink to={`${paths.msDutiesEditFormPath(record._id)}`}>{text}</RouterLink>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: 'Shifts',
      dataIndex: 'shifts',
      key: 'shifts',
      render: (_text: unknown, record: DutyRow) => {
        if (!record.shifts || record.shifts.length === 0) return null;
        const shiftNames = record.shifts
          .filter(shift => shift?.name)
          .map(shift => shift!.name);
        return shiftNames.join(', ');
      },
    },
    {
      title: 'Karkuns',
      dataIndex: 'usedCount',
      key: 'usedCount',
    },
    {
      key: 'action',
      render: (_text: unknown, record: DutyRow) => {
        if (record.canDelete) {
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

  const allMSDuties = (data?.allMSDuties ?? []).filter(
    (row): row is DutyRow => row != null && row._id != null && row.name != null
  );

  return (
    <Table
      rowKey="_id"
      dataSource={allMSDuties}
      columns={columns}
      pagination={{ defaultPageSize: 20 }}
      bordered
      size="small"
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
  );
};

export default List;
