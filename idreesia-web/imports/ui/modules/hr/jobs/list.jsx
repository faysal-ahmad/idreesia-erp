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

const List = ({ history }) => {
  const { allJobs, allJobsLoading } = useAllJobs();
  const [removeJob] = useMutation(removeJobMutation, {
    refetchQueries: ['allJobs'],
  });

  const handleNewClicked = () => {
    history.push(paths.jobsNewFormPath);
  };

  const handleDeleteClicked = record => {
    removeJob({
      variables: {
        _id: record._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.jobsEditFormPath(record._id)}`}>{text}</Link>
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
      render: (text, record) => {
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

  return (
    <Table
      rowKey="_id"
      dataSource={allJobs}
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

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Jobs', 'List'])(List);
