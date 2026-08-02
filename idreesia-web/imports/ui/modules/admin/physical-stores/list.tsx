import React from 'react';
import { Link } from 'react-router-dom';
import { type History } from 'history';
import { Button, Table } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { useAllPhysicalStores } from 'meteor/idreesia-common/hooks/admin';
import type { AdminAllPhysicalStoresQuery } from 'meteor/idreesia-common/types/client-operations';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

const RouterLink = Link as any;

type PhysicalStoreRow = NonNullable<
  NonNullable<AdminAllPhysicalStoresQuery['allPhysicalStores']>[number]
> & { _id: string };

interface Props {
  history: History;
}

const List = ({ history }: Props) => {
  useBreadcrumbs(['Admin', 'Setup', 'Physical Stores', 'List']);
  const { allPhysicalStores } = useAllPhysicalStores();

  const physicalStores: PhysicalStoreRow[] = (allPhysicalStores ?? []).filter(
    (store): store is PhysicalStoreRow => store != null && store._id != null
  );

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: PhysicalStoreRow) => (
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
    <Table
      rowKey="_id"
      dataSource={physicalStores}
      columns={columns as any}
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

export default List;
