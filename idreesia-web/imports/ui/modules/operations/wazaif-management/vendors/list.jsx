import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { DeleteOutlined, PlusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import {
  Button,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from 'antd';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';

import {
  ALL_WAZAIF_VENDORS,
  REMOVE_WAZAIF_VENDOR,
} from './gql';

const List = ({ history }) => {
  const dispatch = useDispatch();
  const [removeWazaifVendor] = useMutation(REMOVE_WAZAIF_VENDOR);
  const { data, loading, refetch } = useQuery(ALL_WAZAIF_VENDORS);

  useEffect(() => {
    dispatch(setBreadcrumbs(['Operations', 'Wazaif Management', 'Setup', 'Vendors']));
  }, []);

  if (loading) return null;
  const { allWazaifVendors } = data; 

  const handleNewClicked = () => {
    history.push(paths.wazaifVendorsNewFormPath);
  };

  const handleDeleteClicked = vendor => {
    removeWazaifVendor({
      variables: {
        _id: vendor._id,
      },
    })
      .then(() => {
        message.success('Vendor has been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link
          to={`${paths.wazaifVendorsEditFormPath(
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

  return (
    <Table
      rowKey="_id"
      dataSource={allWazaifVendors}
      columns={columns}
      bordered
      title={() => (
        <div className="list-table-header">
          <div>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={handleNewClicked}
            >
              New Vendor
            </Button>
          </div>
          <div>
            <Button
              size="large"
              type="secondary"
              icon={<SyncOutlined />}
              onClick={() => {
                refetch();
              }}
            >
              Reload
            </Button>
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