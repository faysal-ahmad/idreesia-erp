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
  ShopOutlined,
  TagsOutlined,
} from '@ant-design/icons';

import { Permissions } from 'meteor/idreesia-common/constants';
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
      permissions
    }
  }
`;

// Which store permissions open each part of a store's menu: the same ones the
// server requires for the pages behind it.
const ISSUANCE = [
  Permissions.IN_VIEW_ISSUANCE_FORMS,
  Permissions.IN_MANAGE_ISSUANCE_FORMS,
  Permissions.IN_APPROVE_ISSUANCE_FORMS,
];
const PURCHASE = [
  Permissions.IN_VIEW_PURCHASE_FORMS,
  Permissions.IN_MANAGE_PURCHASE_FORMS,
  Permissions.IN_APPROVE_PURCHASE_FORMS,
];
const ADJUSTMENTS = [
  Permissions.IN_VIEW_STOCK_ADJUSTMENTS,
  Permissions.IN_MANAGE_STOCK_ADJUSTMENTS,
  Permissions.IN_APPROVE_STOCK_ADJUSTMENTS,
];
const STOCK_ITEMS = [
  Permissions.IN_MANAGE_STOCK_ITEMS,
  ...ISSUANCE,
  ...PURCHASE,
  ...ADJUSTMENTS,
];
const SETUP = [Permissions.IN_MANAGE_SETUP_DATA];

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

  const menuItems = allAccessiblePhysicalStores.map((physicalStore) => {
    // What the caller may do on this store (it differs from store to store).
    const held = physicalStore.permissions ?? [];
    const can = (permissions: string[]) =>
      permissions.some((permission) => held.includes(permission));

    // Each group of the menu, with only the entries the caller may open; a
    // group with none left is left out.
    const group = (
      key: string,
      icon: React.ReactNode,
      label: string,
      children: Array<{ show: boolean; key: string; icon: React.ReactNode; label: string }>
    ) => {
      const shown = children
        .filter((child) => child.show)
        .map(({ show, ...child }) => child);
      return shown.length > 0 ? [{ key, icon, label, children: shown }] : [];
    };

    return {
      key: physicalStore._id!,
      icon: <AppstoreOutlined style={IconStyle} />,
      label: physicalStore.name,
      children: [
        ...(can(STOCK_ITEMS)
          ? [
              {
                key: `stock-items-${physicalStore._id}`,
                icon: <DatabaseOutlined style={IconStyle} />,
                label: 'Stock Items',
              },
            ]
          : []),
        ...group(
          `forms-${physicalStore._id}`,
          <FolderOpenOutlined style={IconStyle} />,
          'Data Entry',
          [
            {
              show: can(ISSUANCE),
              key: `issuance-forms-${physicalStore._id}`,
              icon: <FormOutlined style={IconStyle} />,
              label: 'Issuance Forms',
            },
            {
              show: can(PURCHASE),
              key: `purchase-forms-${physicalStore._id}`,
              icon: <FormOutlined style={IconStyle} />,
              label: 'Purchase Forms',
            },
            {
              show: can(ADJUSTMENTS),
              key: `stock-adjustments-${physicalStore._id}`,
              icon: <FormOutlined style={IconStyle} />,
              label: 'Stock Adjustments',
            },
          ]
        ),
        ...group(
          `reports-${physicalStore._id}`,
          <FolderOpenOutlined style={IconStyle} />,
          'Reports',
          [
            {
              show: can(ISSUANCE),
              key: `issuance-report-${physicalStore._id}`,
              icon: <BookOutlined style={IconStyle} />,
              label: 'Issuance Report',
            },
            {
              show: can(PURCHASE),
              key: `purchasing-report-${physicalStore._id}`,
              icon: <BookOutlined style={IconStyle} />,
              label: 'Purchase Report',
            },
          ]
        ),
        ...group(
          `setup-${physicalStore._id}`,
          <LaptopOutlined style={IconStyle} />,
          'Setup',
          [
            {
              show: can(SETUP),
              key: `vendors-${physicalStore._id}`,
              icon: <ShopOutlined style={IconStyle} />,
              label: 'Vendors',
            },
            {
              show: can(SETUP),
              key: `item-categories-${physicalStore._id}`,
              icon: <TagsOutlined style={IconStyle} />,
              label: 'Item Categories',
            },
            {
              show: can(SETUP),
              key: `locations-${physicalStore._id}`,
              icon: <EnvironmentOutlined style={IconStyle} />,
              label: 'Locations',
            },
          ]
        ),
      ],
    };
  });

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
