import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import { Button, Table } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

const listQuery = gql`
  query allPhysicalStores {
    allPhysicalStores {
      _id
      name
      address
    }
  }
`;

const List = ({ history }) => {
  const { data } = useQuery(listQuery);
  const { allPhysicalStores } = data || {};

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.physicalStoresPath}/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
  ];

  const handleNewClicked = () => {
    history.push(paths.physicalStoresNewFormPath);
  };

  return (
    <Table
      rowKey="_id"
      dataSource={allPhysicalStores}
      columns={columns}
      bordered
      title={() => (
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Physical Store
        </Button>
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Admin', 'Setup', 'Physical Stores', 'List'])(List);
