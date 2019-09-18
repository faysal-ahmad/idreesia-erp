import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Icon, Popconfirm, Table, Tooltip, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { WithDynamicBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithLocationsByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';

const ActionsStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const IconStyle = {
  cursor: 'pointer',
  fontSize: 20,
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
    removeLocation: PropTypes.func,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link
          to={`${paths.locationsEditFormPath(
            this.props.physicalStoreId,
            record._id
          )}`}
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Parent Location',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (text, record) => (
        <Link
          to={`${paths.itemCategoriesEditFormPath(
            this.props.physicalStoreId,
            record.parentId
          )}`}
        >
          {record.refParent ? record.refParent.name : ''}
        </Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text, record) => {
        const { isInUse } = record;

        if (!isInUse) {
          return (
            <div style={ActionsStyle}>
              <Popconfirm
                title="Are you sure you want to delete this location?"
                onConfirm={() => {
                  this.handleDeleteClicked(record);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete">
                  <Icon type="delete" style={IconStyle} />
                </Tooltip>
              </Popconfirm>
            </div>
          );
        }

        return null;
      },
    },
  ];

  handleNewClicked = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.locationsNewFormPath(physicalStoreId));
  };

  handleDeleteClicked = location => {
    const { removeLocation } = this.props;
    removeLocation({
      variables: {
        _id: location._id,
      },
    })
      .then(() => {
        message.success('Location has been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { locationsLoading, locationsByPhysicalStoreId } = this.props;
    if (locationsLoading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={locationsByPhysicalStoreId}
        columns={this.columns}
        bordered
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Location
          </Button>
        )}
      />
    );
  }
}

const formMutationRemove = gql`
  mutation removeLocation($_id: String!) {
    removeLocation(_id: $_id)
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithLocationsByPhysicalStore(),
  graphql(formMutationRemove, {
    name: 'removeLocation',
    options: {
      refetchQueries: ['locationsByPhysicalStoreId'],
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Setup, Locations, List`;
    }
    return `Inventory, Setup, Locations, List`;
  })
)(List);
