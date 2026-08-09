import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { type History } from 'history';
import {
  Button,
  Popconfirm,
  Table,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  DeleteOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type { VendorsByPhysicalStoreIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import { usePhysicalStore } from '/imports/ui/modules/stores/common/hooks';

import {
  REMOVE_VENDOR,
  VENDORS_BY_PHYSICAL_STORE_ID,
} from './gql';

const RouterLink = Link as any;

interface ListProps {
  history: History;
}

type VendorRow = NonNullable<
  NonNullable<VendorsByPhysicalStoreIdQuery['vendorsByPhysicalStoreId']>[number]
>;

const List = ({ history }: ListProps) => {
  const { physicalStoreId } = useParams<{ physicalStoreId: string }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId!);

  useDynamicBreadcrumbs(
    physicalStore
      ? [ModuleNames.stores, physicalStore.name ?? '', 'Setup', 'Vendors', 'List']
      : [ModuleNames.stores, 'Setup', 'Vendors', 'List']
  );

  const [removeVendor] = useMutation(REMOVE_VENDOR, {
    refetchQueries: [{
      query: VENDORS_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      },
    }],
  });

  const handleNewClicked = () => {
    history.push(paths.vendorsNewFormPath(physicalStoreId!));
  };

  const handleDeleteClicked = (vendor: VendorRow) => {
    removeVendor({
      variables: {
        _id: vendor._id!,
        physicalStoreId: physicalStoreId!,
      },
    })
      .then(() => {
        message.success('Vendor has been deleted.', 5);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: VendorRow) => (
        <RouterLink
          to={`${paths.vendorsEditFormPath(
            physicalStoreId!,
            record._id!
          )}`}
        >
          {text}
        </RouterLink>
      ),
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_text: unknown, record: VendorRow) => {
        const { usageCount } = record;

        if (usageCount === 0) {
          return (
            <div className="list-actions-column">
              <Popconfirm
                title="Are you sure you want to delete this vendor?"
                onConfirm={() => {
                  handleDeleteClicked(record);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete">
                  <DeleteOutlined className="list-actions-icon" />
                </Tooltip>
              </Popconfirm>
            </div>
          );
        }

        return null;
      },
    },
  ];

  const { data, loading, refetch } = useQuery(VENDORS_BY_PHYSICAL_STORE_ID, {
    variables: { physicalStoreId: physicalStoreId! },
  });

  if (loading) return null;

  const vendorsByPhysicalStoreId = (data?.vendorsByPhysicalStoreId ?? []).filter(
    (row): row is VendorRow => row != null
  );

  return (
    <Table
      rowKey="_id"
      dataSource={vendorsByPhysicalStoreId}
      columns={columns}
      bordered
      title={() => (
        <div className="list-table-header">
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Vendor
          </Button>
          <div className="list-table-header-section">
            <Button
              size="large"
              icon={<SyncOutlined />}
              onClick={() => { refetch(); }}
            />
          </div>
        </div>
      )}
    />
  );
};

export default List;
