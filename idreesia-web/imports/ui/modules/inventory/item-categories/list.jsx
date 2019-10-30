import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  Button,
  Icon,
  Table,
  Tooltip,
  Popconfirm,
  message,
} from '/imports/ui/controls';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithItemCategoriesByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    removeItemCategory: PropTypes.func,

    itemCategoriesLoading: PropTypes.bool,
    itemCategoriesByPhysicalStoreId: PropTypes.array,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link
          to={`${paths.itemCategoriesEditFormPath(
            this.props.physicalStoreId,
            record._id
          )}`}
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Stock Items Count',
      dataIndex: 'stockItemCount',
      key: 'stockItemCount',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text, record) => {
        const { stockItemCount } = record;

        if (stockItemCount === 0) {
          return (
            <div className="list-actions-column">
              <Popconfirm
                title="Are you sure you want to delete this item category?"
                onConfirm={() => {
                  this.handleDeleteClicked(record);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Tooltip title="Delete">
                  <Icon type="delete" className="list-actions-icon" />
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
    history.push(paths.itemCategoriesNewFormPath(physicalStoreId));
  };

  handleDeleteClicked = itemCategory => {
    const { physicalStoreId, removeItemCategory } = this.props;
    removeItemCategory({
      variables: {
        _id: itemCategory._id,
        physicalStoreId,
      },
    })
      .then(() => {
        message.success('Item category has been deleted.', 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const {
      itemCategoriesLoading,
      itemCategoriesByPhysicalStoreId,
    } = this.props;
    if (itemCategoriesLoading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={itemCategoriesByPhysicalStoreId}
        columns={this.columns}
        bordered
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Item Category
          </Button>
        )}
      />
    );
  }
}

const formMutationRemove = gql`
  mutation removeItemCategory($_id: String!, $physicalStoreId: String!) {
    removeItemCategory(_id: $_id, physicalStoreId: $physicalStoreId)
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithItemCategoriesByPhysicalStore(),
  graphql(formMutationRemove, {
    name: 'removeItemCategory',
    options: {
      refetchQueries: ['itemCategoriesByPhysicalStoreId'],
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Setup, Item Categories, List`;
    }
    return `Inventory, Setup, Item Categories, List`;
  })
)(List);
