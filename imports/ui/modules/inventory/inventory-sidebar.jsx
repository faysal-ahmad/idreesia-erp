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
    setActiveSubModuleName: PropTypes.func,
  };

  handleMenuItemSelected = ({ key }) => {
    const { history, setActiveSubModuleName } = this.props;

    switch (key) {
      case 'stock-items':
        setActiveSubModuleName(SubModuleNames.stockItems);
        history.push(paths.stockItemsPath);
        break;

      case 'issuance-forms':
        setActiveSubModuleName(SubModuleNames.issuanceForms);
        history.push(paths.issuanceFormsPath);
        break;

      case 'return-forms':
        setActiveSubModuleName(SubModuleNames.returnForms);
        history.push(paths.returnFormsPath);
        break;

      case 'purchase-forms':
        setActiveSubModuleName(SubModuleNames.purchaseForms);
        history.push(paths.purchaseFormsPath);
        break;

      case 'item-types':
        setActiveSubModuleName(SubModuleNames.itemTypes);
        history.push(paths.itemTypesPath);
        break;

      case 'item-categories':
        setActiveSubModuleName(SubModuleNames.itemCategories);
        history.push(paths.itemCategoriesPath);
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
          <Menu.Item key="return-forms">Return Forms</Menu.Item>
          <Menu.Item key="purchase-forms">Purchase Forms</Menu.Item>
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
        </SubMenu>
      </Menu>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  setActiveSubModuleName: subModuleName => {
    dispatch(GlobalActionsCreator.setActiveSubModuleName(subModuleName));
  },
});

const InventorySidebarContainer = connect(null, mapDispatchToProps)(InventorySidebar);
export default InventorySidebarContainer;
