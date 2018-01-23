import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Menu, Icon } from 'antd';

import { GlobalActionsCreator } from '/imports/ui/action-creators';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

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
        setActiveSubModuleName(SubModuleNames.stockItems);
        history.push(paths.stockItemsPath);
        break;

      case 'issuance-forms':
        setActiveSubModuleName(SubModuleNames.issuanceForms);
        const issuanceFormsListPath = paths.issuanceFormsListPath.replace(':pageId', '1');
        history.push(issuanceFormsListPath);
        break;

      case 'receival-forms':
        setActiveSubModuleName(SubModuleNames.receivalForms);
        history.push(paths.receivalFormsListPath);
        break;

      case 'adjustment-forms':
        setActiveSubModuleName(SubModuleNames.adjustmentForms);
        history.push(paths.adjustmentFormsListPath);
        break;

      case 'purchase-order-forms':
        setActiveSubModuleName(SubModuleNames.purchaseOrderForms);
        history.push(paths.purchaseOrderFormsListPath);
        break;

      case 'item-types':
        setActiveSubModuleName(SubModuleNames.itemTypes);
        history.push(paths.itemTypesPath);
        break;

      case 'item-categories':
        setActiveSubModuleName(SubModuleNames.itemCategories);
        history.push(paths.itemCategoriesPath);
        break;

      case 'physical-stores':
        setActiveSubModuleName(SubModuleNames.physicalStores);
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
          <Menu.Item key="adjustment-forms">Adjsutment Forms</Menu.Item>
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
