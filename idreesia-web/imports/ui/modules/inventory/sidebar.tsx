import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { withQuery } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import {
  AppstoreOutlined,
  BookOutlined,
  DatabaseOutlined,
  EnvironmentOutlined,
  FolderOpenOutlined,
  FormOutlined,
  LaptopOutlined,
  PieChartOutlined,
  ShopOutlined,
  TagsOutlined,
} from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const IconStyle = {
  fontSize: '20px',
};

const AntMenu = Menu as any;
const Icons = {
  AppstoreOutlined: AppstoreOutlined as any,
  BookOutlined: BookOutlined as any,
  DatabaseOutlined: DatabaseOutlined as any,
  EnvironmentOutlined: EnvironmentOutlined as any,
  FolderOpenOutlined: FolderOpenOutlined as any,
  FormOutlined: FormOutlined as any,
  LaptopOutlined: LaptopOutlined as any,
  PieChartOutlined: PieChartOutlined as any,
  ShopOutlined: ShopOutlined as any,
  TagsOutlined: TagsOutlined as any,
};

interface PhysicalStore {
  _id: string;
  name: string;
}

interface HistoryLike {
  push(path: string): void;
}

interface SidebarProps {
  history: HistoryLike;
  activeModuleName?: string;
  activeSubModuleName?: string;
  setActiveSubModuleName(subModuleName: string): void;
  loading?: boolean;
  allAccessiblePhysicalStores?: PhysicalStore[];
}

type PathBuilder = (physicalStoreId?: string) => string;
type KeyPrefixHandler = [string, string, PathBuilder];

const KeyPrefixHandlers: KeyPrefixHandler[] = [
  ['stock-items', SubModuleNames.stockItems, paths.stockItemsPath],
  [
    'status-dashboard',
    SubModuleNames.statusDashboard,
    paths.statusDashboardPath,
  ],
  ['issuance-forms', SubModuleNames.issuanceForms, paths.issuanceFormsPath],
  ['purchase-forms', SubModuleNames.purchaseForms, paths.purchaseFormsPath],
  [
    'stock-adjustments',
    SubModuleNames.stockAdjustments,
    paths.stockAdjustmentsPath,
  ],
  ['issuance-report', SubModuleNames.issuanceReport, paths.issuanceReportPath],
  [
    'purchasing-report',
    SubModuleNames.purchasingReport,
    paths.purchasingReportPath,
  ],
  ['vendors', SubModuleNames.vendors, paths.vendorsPath],
  ['item-categories', SubModuleNames.itemCategories, paths.itemCategoriesPath],
  ['locations', SubModuleNames.locations, paths.locationsPath],
];

class Sidebar extends Component<SidebarProps> {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
    loading: PropTypes.bool,
    allAccessiblePhysicalStores: PropTypes.array,
  };

  handleMenuItemSelected = ({ key }: { key: string }) => {
    const { history, setActiveSubModuleName } = this.props;

    const handler = KeyPrefixHandlers.find(([prefix]) =>
      key.startsWith(`${prefix}-`)
    );
    if (!handler) return;

    const [prefix, subModuleName, getPath] = handler;
    const physicalStoreId = key.slice(prefix.length + 1);
    setActiveSubModuleName(subModuleName);
    history.push(getPath(physicalStoreId));
  };

  render() {
    const { loading, allAccessiblePhysicalStores = [] } = this.props;
    if (loading) return null;

    const menuItems = allAccessiblePhysicalStores.map((physicalStore: PhysicalStore) => ({
      key: physicalStore._id,
      icon: <Icons.AppstoreOutlined style={IconStyle} />,
      label: physicalStore.name,
      children: [
        {
          key: `stock-items-${physicalStore._id}`,
          icon: <Icons.DatabaseOutlined style={IconStyle} />,
          label: 'Stock Items',
        },
        {
          key: `status-dashboard-${physicalStore._id}`,
          icon: <Icons.PieChartOutlined style={IconStyle} />,
          label: 'Status Dashboard',
        },
        {
          key: `forms-${physicalStore._id}`,
          icon: <Icons.FolderOpenOutlined style={IconStyle} />,
          label: 'Data Entry',
          children: [
            {
              key: `issuance-forms-${physicalStore._id}`,
              icon: <Icons.FormOutlined style={IconStyle} />,
              label: 'Issuance Forms',
            },
            {
              key: `purchase-forms-${physicalStore._id}`,
              icon: <Icons.FormOutlined style={IconStyle} />,
              label: 'Purchase Forms',
            },
            {
              key: `stock-adjustments-${physicalStore._id}`,
              icon: <Icons.FormOutlined style={IconStyle} />,
              label: 'Stock Adjustments',
            },
          ],
        },
        {
          key: `reports-${physicalStore._id}`,
          icon: <Icons.FolderOpenOutlined style={IconStyle} />,
          label: 'Reports',
          children: [
            {
              key: `issuance-report-${physicalStore._id}`,
              icon: <Icons.BookOutlined style={IconStyle} />,
              label: 'Issuance Report',
            },
            {
              key: `purchasing-report-${physicalStore._id}`,
              icon: <Icons.BookOutlined style={IconStyle} />,
              label: 'Purchase Report',
            },
          ],
        },
        {
          key: `setup-${physicalStore._id}`,
          icon: <Icons.LaptopOutlined style={IconStyle} />,
          label: 'Setup',
          children: [
            {
              key: `vendors-${physicalStore._id}`,
              icon: <Icons.ShopOutlined style={IconStyle} />,
              label: 'Vendors',
            },
            {
              key: `item-categories-${physicalStore._id}`,
              icon: <Icons.TagsOutlined style={IconStyle} />,
              label: 'Item Categories',
            },
            {
              key: `locations-${physicalStore._id}`,
              icon: <Icons.EnvironmentOutlined style={IconStyle} />,
              label: 'Locations',
            },
          ],
        },
      ],
    }));

    return (
      <AntMenu
        mode="inline"
        style={{ height: '100%', borderRight: 0 }}
        onClick={this.handleMenuItemSelected}
        items={menuItems}
      />
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
  withQuery(listQuery, {
    props: ({ data }: { data: Record<string, unknown> }) => ({ ...data }),
  })
)(Sidebar as any);
export default SidebarContainer;
