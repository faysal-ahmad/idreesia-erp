import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client/react';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Button, Table, Tooltip, message } from 'antd';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { useAllJobs } from '/imports/ui/modules/hr/common/composers';

const removeJobMutation = gql`
  mutation removeJob($_id: String!) {
    removeJob(_id: $_id)
  }
`;

const RouterLink = Link as any;
const AntButton = Button as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
interface HistoryLike { push(path: string): void; }
interface ListProps { history: HistoryLike; }
interface ListRecord { _id: string; name: string; description?: string; usedCount?: number; }
interface ListData { allJobs?: ListRecord[]; }

const List = ({ history }: ListProps) => {
  const { allJobs, allJobsLoading } = useAllJobs();
  const [removeJob] = useMutation(removeJobMutation as any, {
    refetchQueries: ['allJobs'],
  });

  const handleNewClicked = () => {
    history.push(paths.jobsNewFormPath);
  };

  const handleDeleteClicked = (record: ListRecord) => {
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
      render: (text: string, record: ListRecord) => (
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
      render: (_text: unknown, record: ListRecord) => {
        if (record.usedCount === 0) {
          return (
            <AntTooltip key="delete" title="Delete">
              <AntDeleteOutlined
                className="list-actions-icon"
                onClick={() => {
                  handleDeleteClicked(record);
                }}
              />
            </AntTooltip>
          );
        }

        return null;
      },
    },
  ];

  if (allJobsLoading) return null;

  return (
    <AntTable
      rowKey="_id"
      dataSource={allJobs}
      columns={columns}
      bordered
      pagination={{ defaultPageSize: 20 }}
      title={() => (
        <AntButton
          type="primary"
          icon={<AntPlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Job
        </AntButton>
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Jobs', 'List'])(List as any);
