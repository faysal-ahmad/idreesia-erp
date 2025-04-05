import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
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

const List = ({ history }) => {
  const dispatch = useDispatch();
  const { physicalStoreId } = useParams();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [removeVendor] = useMutation(REMOVE_VENDOR, {
    refetchQueries: [{ 
      query: VENDORS_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      }
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
  }, [physicalStoreId]);

  const handleNewClicked = () => {
    history.push(paths.vendorsNewFormPath(physicalStoreId));
  };

  const handleDeleteClicked = vendor => {
    removeVendor({
      variables: {
        _id: vendor._id,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Vendor has been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link
          to={`${paths.vendorsEditFormPath(
            physicalStoreId,
            record._id
          )}`}
        >
          {text}
        </Link>
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
      render: (text, record) => {
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
    variables: { physicalStoreId }
  });
  
  if (loading) return null;
  const { vendorsByPhysicalStoreId } = data;

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
              onClick={() => { refetch() }}
            />
          </div>
        </div>
      )}
    />
  );
}

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
