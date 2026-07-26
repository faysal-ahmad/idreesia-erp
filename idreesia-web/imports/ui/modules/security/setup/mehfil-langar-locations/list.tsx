// @ts-nocheck
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

const listQuery = gql`
  query allSecurityMehfilLangarLocations {
    allSecurityMehfilLangarLocations {
      _id
      name
      urduName
      overallUsedCount
    }
  }
`;

const removeSecurityMehfilLangarLocationMutation = gql`
  mutation removeSecurityMehfilLangarLocation($_id: String!) {
    removeSecurityMehfilLangarLocation(_id: $_id)
  }
`;

const List = ({ history }) => {
  const { data = {} } = useQuery(listQuery);
  const { allSecurityMehfilLangarLocations } = data;
  const [removeSecurityMehfilLangarLocation] = useMutation(
    removeSecurityMehfilLangarLocationMutation,
    {
      refetchQueries: ['allSecurityMehfilLangarLocations'],
    }
  );

  const handleNewClicked = () => {
    history.push(paths.mehfilLangarLocationsNewFormPath);
  };

  const handleDeleteClicked = record => {
    removeSecurityMehfilLangarLocation({
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
        <Link to={`${paths.mehfilLangarLocationsPath}/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: 'Urdu Name',
      dataIndex: 'urduName',
      key: 'urduName',
    },
    {
      key: 'action',
      render: (text, record) => {
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

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfil Langar Locations', 'List'])(List);
