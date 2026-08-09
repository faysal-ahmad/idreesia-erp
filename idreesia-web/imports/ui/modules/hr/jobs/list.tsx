import React from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { type History } from 'history';
import { Link } from 'react-router-dom';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type {
  RemoveJobMutation,
  RemoveJobMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const RouterLink = Link as any;
import { Button, Table, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { useAllJobs } from '/imports/ui/modules/hr/common/hooks';

const REMOVE_JOB: TypedDocumentNode<
  RemoveJobMutation,
  RemoveJobMutationVariables
> = gql`
  mutation removeJob($_id: String!) {
    removeJob(_id: $_id)
  }
`;

interface ListProps {
  history: History;
}

type JobRow = {
  _id: string;
  name: string;
  description?: string | null;
  usedCount?: number | null;
};

const List = ({ history }: ListProps) => {
  useBreadcrumbs(['HR', 'Jobs', 'List']);
  const { allJobs, allJobsLoading } = useAllJobs();
  const [removeJob] = useMutation(REMOVE_JOB, {
    refetchQueries: ['allJobs'],
  });

  const handleNewClicked = () => {
    history.push(paths.jobsNewFormPath);
  };

  const handleDeleteClicked = (record: JobRow) => {
    removeJob({
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
      render: (text: string, record: JobRow) => (
        <RouterLink to={`${paths.jobsEditFormPath(record._id)}`}>{text}</RouterLink>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Employees',
      dataIndex: 'usedCount',
      key: 'usedCount',
    },
    {
      key: 'action',
      render: (_text: unknown, record: JobRow) => {
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

  if (allJobsLoading) return null;

  const dataSource = (allJobs ?? []).filter(row => row != null && row._id != null && row.name != null) as JobRow[];

  return (
    <Table
      rowKey="_id"
      dataSource={dataSource}
      columns={columns}
      bordered
      pagination={{ defaultPageSize: 20 }}
      title={() => (
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Job
        </Button>
      )}
    />
  );
};

export default List;
