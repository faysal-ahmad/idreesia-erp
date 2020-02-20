import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu, Icon } from '/imports/ui/controls';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

class Sidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
    loading: PropTypes.bool,
    allAccessiblePhysicalStores: PropTypes.array,
  };

  handleMenuItemSelected = ({ item, key }) => {
    const { history, setActiveSubModuleName } = this.props;
    const physicalStoreId = item.props['parent-key'];

    if (key.startsWith('stock-items')) {
      setActiveSubModuleName(SubModuleNames.stockItems);
      history.push(paths.stockItemsPath(physicalStoreId));
    } else if (key.startsWith('status-dashboard')) {
      setActiveSubModuleName(SubModuleNames.statusDashboard);
      history.push(paths.statusDashboardPath(physicalStoreId));
    } else if (key.startsWith('issuance-forms')) {
      setActiveSubModuleName(SubModuleNames.issuanceForms);
      history.push(paths.issuanceFormsPath(physicalStoreId));
    } else if (key.startsWith('purchase-forms')) {
      setActiveSubModuleName(SubModuleNames.purchaseForms);
      history.push(paths.purchaseFormsPath(physicalStoreId));
    } else if (key.startsWith('stock-adjustments')) {
      setActiveSubModuleName(SubModuleNames.stockAdjustments);
      history.push(paths.stockAdjustmentsPath(physicalStoreId));
    } else if (key.startsWith('issuance-report')) {
      setActiveSubModuleName(SubModuleNames.issuanceReport);
      history.push(paths.issuanceReportPath(physicalStoreId));
    } else if (key.startsWith('purchasing-report')) {
      setActiveSubModuleName(SubModuleNames.purchasingReport);
      history.push(paths.purchasingReportPath(physicalStoreId));
    } else if (key.startsWith('vendors')) {
      setActiveSubModuleName(SubModuleNames.vendors);
      history.push(paths.vendorsPath(physicalStoreId));
    } else if (key.startsWith('item-categories')) {
      setActiveSubModuleName(SubModuleNames.itemCategories);
      history.push(paths.itemCategoriesPath(physicalStoreId));
    } else if (key.startsWith('locations')) {
      setActiveSubModuleName(SubModuleNames.locations);
      history.push(paths.locationsPath(physicalStoreId));
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
            <span>
              <Icon type="reconciliation" />
              Stock Items
            </span>
          </Menu.Item>
          <Menu.Item
            parent-key={physicalStore._id}
            key={`status-dashboard-${physicalStore._id}`}
          >
            <span>
              <Icon type="pie-chart" />
              Status Dashboard
            </span>
          </Menu.Item>
          <Menu.SubMenu
            key={`forms-${physicalStore._id}`}
            title={
              <span>
                <Icon type="form" />
                Data Entry
              </span>
            }
          >
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
            <Menu.Item
              parent-key={physicalStore._id}
              key={`stock-adjustments-${physicalStore._id}`}
            >
              Stock Adjustments
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu
            key={`reports-${physicalStore._id}`}
            title={
              <span>
                <Icon type="book" />
                Reports
              </span>
            }
          >
            <Menu.Item
              parent-key={physicalStore._id}
              key={`issuance-report-${physicalStore._id}`}
            >
              Issuance Report
            </Menu.Item>
            <Menu.Item
              parent-key={physicalStore._id}
              key={`purchasing-report-${physicalStore._id}`}
            >
              Purchase Report
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu
            key={`setup-${physicalStore._id}`}
            title={
              <span>
                <Icon type="laptop" />
                Setup
              </span>
            }
          >
            <Menu.Item
              parent-key={physicalStore._id}
              key={`vendors-${physicalStore._id}`}
            >
              Vendors
            </Menu.Item>
            <Menu.Item
              parent-key={physicalStore._id}
              key={`item-categories-${physicalStore._id}`}
            >
              Item Categories
            </Menu.Item>
            <Menu.Item
              parent-key={physicalStore._id}
              key={`locations-${physicalStore._id}`}
            >
              Locations
            </Menu.Item>
          </Menu.SubMenu>
        </Menu.SubMenu>
      );
    });

    return (
      <Menu
        mode="inline"
        style={{ height: '100%', borderRight: 0 }}
        onClick={this.handleMenuItemSelected}
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

const SidebarContainer = flowRight(
  WithActiveModule(),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  })
)(Sidebar);
export default SidebarContainer;
