import React, { type CSSProperties } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { type History } from 'history';
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

import { useActiveModule } from 'meteor/idreesia-common/hooks/common';
import type {
  AllAccessiblePhysicalStoresQuery,
  AllAccessiblePhysicalStoresQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const IconStyle: CSSProperties = {
  fontSize: '20px',
};

const ALL_ACCESSIBLE_PHYSICAL_STORES: TypedDocumentNode<
  AllAccessiblePhysicalStoresQuery,
  AllAccessiblePhysicalStoresQueryVariables
> = gql`
  query allAccessiblePhysicalStores {
    allAccessiblePhysicalStores {
      _id
      name
    }
  }
`;

interface SidebarProps {
  history: History;
}

type PhysicalStore = NonNullable<
  NonNullable<AllAccessiblePhysicalStoresQuery['allAccessiblePhysicalStores']>[number]
>;

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

const Sidebar = ({ history }: SidebarProps) => {
  const { setActiveSubModuleName } = useActiveModule();
  const { data, loading } = useQuery(ALL_ACCESSIBLE_PHYSICAL_STORES);

  const handleMenuItemSelected = ({ key }: { key: string }) => {
    const handler = KeyPrefixHandlers.find(([prefix]) =>
      key.startsWith(`${prefix}-`)
    );
    if (!handler) return;

    const [prefix, subModuleName, getPath] = handler;
    const physicalStoreId = key.slice(prefix.length + 1);
    setActiveSubModuleName(subModuleName);
    history.push(getPath(physicalStoreId));
  };

  if (loading) return null;

  const allAccessiblePhysicalStores = (data?.allAccessiblePhysicalStores ?? []).filter(
    (row): row is PhysicalStore => row != null && row._id != null
  );

  const menuItems = allAccessiblePhysicalStores.map((physicalStore) => ({
    key: physicalStore._id!,
    icon: <AppstoreOutlined style={IconStyle} />,
    label: physicalStore.name,
    children: [
      {
        key: `stock-items-${physicalStore._id}`,
        icon: <DatabaseOutlined style={IconStyle} />,
        label: 'Stock Items',
      },
      {
        key: `status-dashboard-${physicalStore._id}`,
        icon: <PieChartOutlined style={IconStyle} />,
        label: 'Status Dashboard',
      },
      {
        key: `forms-${physicalStore._id}`,
        icon: <FolderOpenOutlined style={IconStyle} />,
        label: 'Data Entry',
        children: [
          {
            key: `issuance-forms-${physicalStore._id}`,
            icon: <FormOutlined style={IconStyle} />,
            label: 'Issuance Forms',
          },
          {
            key: `purchase-forms-${physicalStore._id}`,
            icon: <FormOutlined style={IconStyle} />,
            label: 'Purchase Forms',
          },
          {
            key: `stock-adjustments-${physicalStore._id}`,
            icon: <FormOutlined style={IconStyle} />,
            label: 'Stock Adjustments',
          },
        ],
      },
      {
        key: `reports-${physicalStore._id}`,
        icon: <FolderOpenOutlined style={IconStyle} />,
        label: 'Reports',
        children: [
          {
            key: `issuance-report-${physicalStore._id}`,
            icon: <BookOutlined style={IconStyle} />,
            label: 'Issuance Report',
          },
          {
            key: `purchasing-report-${physicalStore._id}`,
            icon: <BookOutlined style={IconStyle} />,
            label: 'Purchase Report',
          },
        ],
      },
      {
        key: `setup-${physicalStore._id}`,
        icon: <LaptopOutlined style={IconStyle} />,
        label: 'Setup',
        children: [
          {
            key: `vendors-${physicalStore._id}`,
            icon: <ShopOutlined style={IconStyle} />,
            label: 'Vendors',
          },
          {
            key: `item-categories-${physicalStore._id}`,
            icon: <TagsOutlined style={IconStyle} />,
            label: 'Item Categories',
          },
          {
            key: `locations-${physicalStore._id}`,
            icon: <EnvironmentOutlined style={IconStyle} />,
            label: 'Locations',
          },
        ],
      },
    ],
  }));

  return (
    <Menu
      mode="inline"
      style={{ height: '100%', borderRight: 0 }}
      onClick={handleMenuItemSelected}
      items={menuItems}
    />
  );
};

export default Sidebar;
