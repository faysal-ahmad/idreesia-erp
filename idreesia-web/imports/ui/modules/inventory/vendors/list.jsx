import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, Icon, Popconfirm, Table, Tooltip, message } from "antd";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

import { WithDynamicBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithVendorsByPhysicalStore,
} from "/imports/ui/modules/inventory/common/composers";

const ActionsStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
};

const IconStyle = {
  cursor: "pointer",
  fontSize: 20,
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    vendorsLoading: PropTypes.bool,
    vendorsByPhysicalStoreId: PropTypes.array,
    removeVendor: PropTypes.func,
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Link
          to={`${paths.vendorsEditFormPath(
            this.props.physicalStoreId,
            record._id
          )}`}
        >
          {text}
        </Link>
      ),
    },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      key: "contactNumber",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Actions",
      key: "action",
      render: (text, record) => {
        const { usageCount } = record;

        if (usageCount === 0) {
          return (
            <div style={ActionsStyle}>
              <Popconfirm
                title="Are you sure you want to delete this vendor?"
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
    history.push(paths.vendorsNewFormPath(physicalStoreId));
  };

  handleDeleteClicked = vendor => {
    const { removeVendor } = this.props;
    removeVendor({
      variables: {
        _id: vendor._id,
      },
    })
      .then(() => {
        message.success("Vendor has been deleted.", 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { vendorsLoading, vendorsByPhysicalStoreId } = this.props;
    if (vendorsLoading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={vendorsByPhysicalStoreId}
        columns={this.columns}
        bordered
        title={() => (
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
            New Vendor
          </Button>
        )}
      />
    );
  }
}

const formMutationRemove = gql`
  mutation removeVendor($_id: String!) {
    removeVendor(_id: $_id)
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithVendorsByPhysicalStore(),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Setup, Vendors, List`;
    }
    return `Inventory, Setup, Vendors, List`;
  }),
  graphql(formMutationRemove, {
    name: "removeVendor",
    options: {
      refetchQueries: ["vendorsByPhysicalStoreId"],
    },
  })
)(List);
