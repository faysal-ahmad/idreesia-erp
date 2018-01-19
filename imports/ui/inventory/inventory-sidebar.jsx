import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Menu, Icon } from 'antd';

import { InventorySubModuleNames, InventorySubModulePaths as paths } from '../constants';
import { GlobalActionsCreator } from '../action-creators';

const { SubMenu } = Menu;

class InventorySidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func
  };

  handleMenuItemSelected = ({ item, key, selectedKeys }) => {
    const { history, setActiveSubModuleName } = this.props;

    switch (key) {
      case 'stock-items':
        setActiveSubModuleName(InventorySubModuleNames.stockItems);
        history.push(paths.stockItemsPath);
        break;

      case 'issuance-forms':
        setActiveSubModuleName(InventorySubModuleNames.issuanceForms);
        const issuanceFormsListPath = paths.issuanceFormsListPath.replace(':pageId', '1');
        history.push(issuanceFormsListPath);
        break;

      case 'receival-forms':
        setActiveSubModuleName(InventorySubModuleNames.receivalForms);
        history.push(paths.receivalFormsListPath);
        break;

      case 'disposal-forms':
        setActiveSubModuleName(InventorySubModuleNames.disposalForms);
        history.push(paths.disposalFormsListPath);
        break;

      case 'lost-item-forms':
        setActiveSubModuleName(InventorySubModuleNames.lostItemForms);
        history.push(paths.lostItemFormsListPath);
        break;

      case 'purchase-order-forms':
        setActiveSubModuleName(InventorySubModuleNames.purchaseOrderForms);
        history.push(paths.purchaseOrderFormsListPath);
        break;

      case 'item-types':
        setActiveSubModuleName(InventorySubModuleNames.itemTypes);
        history.push(paths.itemTypesPath);
        break;

      case 'item-categories':
        setActiveSubModuleName(InventorySubModuleNames.itemCategories);
        history.push(paths.itemCategoriesPath);
        break;

      case 'physical-stores':
        setActiveSubModuleName(InventorySubModuleNames.physicalStores);
        history.push(paths.physicalStoresPath);
        break;

      default:
        break;
    }
  };

  render() {
    return (
      <Menu
        mode="inline"
        defaultSelectedKeys={['home']}
        style={{ height: '100%', borderRight: 0 }}
        onSelect={this.handleMenuItemSelected}
      >
        <Menu.Item key="stock-items">Stock Items</Menu.Item>
        <SubMenu
          key="forms"
          title={
            <span>
              <Icon type="file-text" />Forms
            </span>
          }
        >
          <Menu.Item key="issuance-forms">Issuance Forms</Menu.Item>
          <Menu.Item key="receival-forms">Receival Forms</Menu.Item>
          <Menu.Item key="disposal-forms">Disposal Forms</Menu.Item>
          <Menu.Item key="lost-item-forms">Lost Item Forms</Menu.Item>
          <Menu.Item key="purchase-order-forms">Purchase Order Forms</Menu.Item>
        </SubMenu>
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
          <Menu.Item key="physical-stores">Physical Stores</Menu.Item>
        </SubMenu>
      </Menu>
    );
  }
}

const mapStateToProps = state => {
  return {
    activeModuleName: state.activeModuleName
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setActiveSubModuleName: subModuleName => {
      dispatch(GlobalActionsCreator.setActiveSubModuleName(subModuleName));
    }
  };
};

const InventorySidebarContainer = connect(null, mapDispatchToProps)(InventorySidebar);
export default InventorySidebarContainer;
