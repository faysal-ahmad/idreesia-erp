import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Menu, Icon } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { GlobalActionsCreator } from "/imports/ui/action-creators";
import SubModuleNames from "./submodule-names";
import { default as paths } from "./submodule-paths";

const { SubMenu } = Menu;

class InventorySidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    setActiveSubModuleName: PropTypes.func,

    loading: PropTypes.bool,
    allAccessiblePhysicalStores: PropTypes.array,
  };

  handleMenuItemSelected = ({ item, key }) => {
    const { history, setActiveSubModuleName } = this.props;
    const physicalStoreId = item.props["parent-key"];

    if (key.startsWith("stock-items")) {
      setActiveSubModuleName(SubModuleNames.stockItems);
      history.push(paths.stockItemsPath(physicalStoreId));
    } else if (key.startsWith("issuance-forms")) {
      setActiveSubModuleName(SubModuleNames.issuanceForms);
      history.push(paths.issuanceFormsPath(physicalStoreId));
    } else if (key.startsWith("purchase-forms")) {
      setActiveSubModuleName(SubModuleNames.purchaseForms);
      history.push(paths.purchaseFormsPath(physicalStoreId));
    } else if (key === "item-types") {
      setActiveSubModuleName(SubModuleNames.itemTypes);
      history.push(paths.itemTypesPath);
    } else if (key === "item-categories") {
      setActiveSubModuleName(SubModuleNames.itemCategories);
      history.push(paths.itemCategoriesPath);
    }
  };

  render() {
    const { loading, allAccessiblePhysicalStores } = this.props;
    if (loading) return null;

    const subMenus = [];

    allAccessiblePhysicalStores.forEach(physicalStore => {
      subMenus.push(
        <Menu.SubMenu
          key={physicalStore._id}
          title={
            <span>
              <Icon type="appstore" />
              {physicalStore.name}
            </span>
          }
        >
          <Menu.Item
            parent-key={physicalStore._id}
            key={`stock-items-${physicalStore._id}`}
          >
            Stock Items
          </Menu.Item>
          <Menu.Item
            parent-key={physicalStore._id}
            key={`issuance-forms-${physicalStore._id}`}
          >
            Issuance Forms
          </Menu.Item>
          <Menu.Item
            parent-key={physicalStore._id}
            key={`purchase-forms-${physicalStore._id}`}
          >
            Purchase Forms
          </Menu.Item>
        </Menu.SubMenu>
      );
    });

    subMenus.push(
      <SubMenu
        key="setup"
        title={
          <span>
            <Icon type="laptop" />Setup
          </span>
        }
      >
        <Menu.Item key="item-types">Item Types</Menu.Item>
        <Menu.Item key="item-categories">Item Categories</Menu.Item>
      </SubMenu>
    );

    return (
      <Menu
        mode="inline"
        defaultSelectedKeys={["home"]}
        style={{ height: "100%", borderRight: 0 }}
        onSelect={this.handleMenuItemSelected}
      >
        {subMenus}
      </Menu>
    );
  }
}

const listQuery = gql`
  query allAccessiblePhysicalStores {
    allAccessiblePhysicalStores {
      _id
      name
    }
  }
`;

const mapDispatchToProps = dispatch => ({
  setActiveSubModuleName: subModuleName => {
    dispatch(GlobalActionsCreator.setActiveSubModuleName(subModuleName));
  },
});

const InventorySidebarContainer = compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  connect(null, mapDispatchToProps)
)(InventorySidebar);
export default InventorySidebarContainer;
