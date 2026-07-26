// @ts-nocheck
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Table, Tooltip, message } from 'antd';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

const listQuery = gql`
  query allMSDuties {
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

const removeDutyMutation = gql`
  mutation removeDuty($_id: String!) {
    removeDuty(_id: $_id)
  }
`;

const List = ({ history }) => {
  const { data } = useQuery(listQuery);
  const [removeDuty] = useMutation(removeDutyMutation, {
    refetchQueries: ['allMSDuties'],
  });
  const { allMSDuties } = data || {};

  const handleNewClicked = () => {
    history.push(paths.msDutiesNewFormPath);
  };

  const handleDeleteClicked = record => {
    removeDuty({
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
      width: 200,
      render: (text, record) => (
        <Link to={`${paths.msDutiesEditFormPath(record._id)}`}>{text}</Link>
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
      render: (text, record) => {
        if (!record.shifts || record.shifts.length === 0) return null;
        const shiftNames = record.shifts.map(shift => shift.name);
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
      render: (text, record) => {
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

List.propTypes = {
  history: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Duties & Shifts', 'List'])(List);
