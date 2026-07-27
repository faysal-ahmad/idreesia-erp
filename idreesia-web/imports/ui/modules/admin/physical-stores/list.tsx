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
  query adminAllPhysicalStores {
    allPhysicalStores {
      _id
      name
      address
    }
  }
`;

const RouterLink = Link as any;
const AntButton = Button as any;
const AntTable = Table as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
interface HistoryLike { push(path: string): void; }
interface PhysicalStore { _id: string; name?: string; address?: string; }
interface QueryData { allPhysicalStores?: PhysicalStore[] | null; }
interface Props { history: HistoryLike; }

const List = ({ history }: Props) => {
  const { data } = useQuery(listQuery as any);
  const { allPhysicalStores } = (data ?? {}) as QueryData;

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: PhysicalStore) => (
        <RouterLink to={`${paths.physicalStoresPath}/${record._id}`}>{text}</RouterLink>
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
    <AntTable
      rowKey="_id"
      dataSource={allPhysicalStores ?? []}
      columns={columns as any}
      bordered
      title={() => (
        <AntButton
          type="primary"
          icon={<AntPlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New Physical Store
        </AntButton>
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Admin', 'Setup', 'Physical Stores', 'List'])(List as any);
