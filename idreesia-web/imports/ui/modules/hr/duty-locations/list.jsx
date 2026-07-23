import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

const listQuery = gql`
  query allDutyLocations {
    allDutyLocations {
      _id
      name
      usedCount
    }
  }
`;

const removeDutyLocationMutation = gql`
  mutation removeDutyLocation($_id: String!) {
    removeDutyLocation(_id: $_id)
  }
`;

const List = ({ history }) => {
  const { data } = useQuery(listQuery);
  const [removeDutyLocation] = useMutation(removeDutyLocationMutation, {
    refetchQueries: ['allDutyLocations'],
  });
  const { allDutyLocations } = data || {};

  const handleNewClicked = () => {
    history.push(paths.dutyLocationsNewFormPath);
  };

  const handleDeleteClicked = record => {
    removeDutyLocation({
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
        <Link to={`${paths.dutyLocationsPath}/${record._id}`}>{text}</Link>
      ),
    },
    {
      key: 'action',
      render: (text, record) => {
        if (record.usedCount === 0) {
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

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Duty Locations', 'List'])(List);
