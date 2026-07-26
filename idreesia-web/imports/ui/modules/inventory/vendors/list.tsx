import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Button,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from 'antd';
import {
  DeleteOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import {
  REMOVE_VENDOR,
  VENDORS_BY_PHYSICAL_STORE_ID,
} from './gql';

const AntButton = Button as any;
const AntPopconfirm = Popconfirm as any;
const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntDeleteOutlined = DeleteOutlined as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const AntSyncOutlined = SyncOutlined as any;
const RouterLink = Link as any;

interface RouteParams {
  physicalStoreId: string;
}

interface HistoryLike {
  push(path: string): void;
}

interface ListProps {
  history: HistoryLike;
}

interface Vendor {
  _id: string;
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  address?: string;
  usageCount?: number;
}

interface VendorsData {
  vendorsByPhysicalStoreId: Vendor[];
}

const List = ({ history }: ListProps) => {
  const dispatch = useDispatch();
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [removeVendor] = useMutation(REMOVE_VENDOR as any, {
    refetchQueries: [{
      query: VENDORS_BY_PHYSICAL_STORE_ID as any,
      variables: {
        physicalStoreId,
      },
    }],
  });
  
  useEffect(() => {
    if (physicalStore) {
      dispatch(
        setBreadcrumbs(['Inventory', physicalStore.name, 'Setup', 'Vendors', 'List'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Setup', 'Vendors', 'List']));
    }
  }, [dispatch, physicalStore]);

  const handleNewClicked = () => {
    history.push(paths.vendorsNewFormPath(physicalStoreId));
  };

  const handleDeleteClicked = (vendor: Vendor) => {
    removeVendor({
      variables: {
        _id: vendor._id,
        physicalStoreId,
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
      render: (text: string, record: Vendor) => (
        <RouterLink
          to={`${paths.vendorsEditFormPath(
            physicalStoreId,
            record._id
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
      render: (_text: unknown, record: Vendor) => {
        const { usageCount } = record;

        if (usageCount === 0) {
          return (
            <div className="list-actions-column">
              <AntPopconfirm
                title="Are you sure you want to delete this vendor?"
                onConfirm={() => {
                  handleDeleteClicked(record);
                }}
                okText="Yes"
                cancelText="No"
              >
                <AntTooltip title="Delete">
                  <AntDeleteOutlined className="list-actions-icon" />
                </AntTooltip>
              </AntPopconfirm>
            </div>
          );
        }

        return null;
      },
    },
  ];

  const { data, loading, refetch } = useQuery(
    VENDORS_BY_PHYSICAL_STORE_ID as any,
    {
      variables: { physicalStoreId },
    }
  );
  
  if (loading) return null;
  const { vendorsByPhysicalStoreId } = (data as VendorsData) ?? {
    vendorsByPhysicalStoreId: [],
  };

  return (
    <AntTable
      rowKey="_id"
      dataSource={vendorsByPhysicalStoreId}
      columns={columns}
      bordered
      title={() => (
        <div className="list-table-header">
          <AntButton
            type="primary"
            icon={<AntPlusCircleOutlined />}
            onClick={handleNewClicked}
          >
            New Vendor
          </AntButton>
          <div className="list-table-header-section">
            <AntButton
              size="large"
              icon={<AntSyncOutlined />}
              onClick={() => { refetch(); }}
            />
          </div>
        </div>
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
