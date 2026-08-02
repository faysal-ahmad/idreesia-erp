import React, { type CSSProperties } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { Badge, Descriptions, Spin } from 'antd';
import type {
  InventoryStatisticsQuery,
  InventoryStatisticsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  usePhysicalStore,
} from '/imports/ui/modules/inventory/common/hooks';

interface RouteParams {
  physicalStoreId: string;
}

type InventoryStatistics = NonNullable<
  InventoryStatisticsQuery['inventoryStatistics']
>;

const countBadgeStyle: CSSProperties = {
  backgroundColor: '#fff',
  color: '#000',
  fontWeight: 'bold',
};

const greenBadgeStyle: CSSProperties = { backgroundColor: 'green' };
const redBadgeStyle: CSSProperties = { backgroundColor: 'red' };
const orangeBadgeStyle: CSSProperties = { backgroundColor: 'orange' };

const emptyStatistics: InventoryStatistics = {
  physicalStoreId: null,
  itemsWithImages: 0,
  itemsWithoutImages: 0,
  itemsWithPositiveStockLevel: 0,
  itemsWithLessThanMinStockLevel: 0,
  itemsWithNegativeStockLevel: 0,
  itemsVerifiedLessThanThreeMonthsAgo: 0,
  itemsVerifiedThreeToSixMonthsAgo: 0,
  itemsVerifiedMoreThanSixMonthsAgo: 0,
};

const INVENTORY_STATISTICS: TypedDocumentNode<
  InventoryStatisticsQuery,
  InventoryStatisticsQueryVariables
> = gql`
  query inventoryStatistics($physicalStoreId: String!) {
    inventoryStatistics(physicalStoreId: $physicalStoreId) {
      physicalStoreId
      itemsWithImages
      itemsWithoutImages
      itemsWithPositiveStockLevel
      itemsWithLessThanMinStockLevel
      itemsWithNegativeStockLevel
      itemsVerifiedLessThanThreeMonthsAgo
      itemsVerifiedThreeToSixMonthsAgo
      itemsVerifiedMoreThanSixMonthsAgo
    }
  }
`;

const Dashboard = () => {
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { data, loading } = useQuery(INVENTORY_STATISTICS, {
    variables: { physicalStoreId },
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name, 'Status Dashboard']
      : ['Inventory', 'Status Dashboard']
  );

  if (loading) {
    return <Spin size="large" />;
  }

  const statistics = data?.inventoryStatistics ?? emptyStatistics;
  const itemsCount =
    (statistics.itemsWithImages ?? 0) + (statistics.itemsWithoutImages ?? 0);

  return (
    <>
      <Descriptions title="Stock Items" bordered>
        <Descriptions.Item label="Items Count">
          <Badge
            showZero
            overflowCount={9999}
            style={countBadgeStyle}
            count={itemsCount}
          />
        </Descriptions.Item>
        <Descriptions.Item label="With Images">
          <Badge
            showZero
            overflowCount={9999}
            style={greenBadgeStyle}
            count={statistics.itemsWithImages ?? 0}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Without Images">
          <Badge
            showZero
            overflowCount={9999}
            style={redBadgeStyle}
            count={statistics.itemsWithoutImages ?? 0}
          />
        </Descriptions.Item>
      </Descriptions>
      <div style={{ height: '20px' }} />
      <Descriptions title="Stock Levels" bordered>
        <Descriptions.Item label="Positive">
          <Badge
            showZero
            overflowCount={9999}
            style={greenBadgeStyle}
            count={statistics.itemsWithPositiveStockLevel ?? 0}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Less than minimum">
          <Badge
            showZero
            overflowCount={9999}
            style={orangeBadgeStyle}
            count={statistics.itemsWithLessThanMinStockLevel ?? 0}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Negative">
          <Badge
            showZero
            overflowCount={9999}
            style={redBadgeStyle}
            count={statistics.itemsWithNegativeStockLevel ?? 0}
          />
        </Descriptions.Item>
      </Descriptions>
      <div style={{ height: '20px' }} />
      <Descriptions title="Stock Level Verified" bordered>
        <Descriptions.Item label="Less than 3 months ago">
          <Badge
            showZero
            overflowCount={9999}
            style={greenBadgeStyle}
            count={statistics.itemsVerifiedLessThanThreeMonthsAgo ?? 0}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Between 3 to 6 months ago">
          <Badge
            showZero
            overflowCount={9999}
            style={orangeBadgeStyle}
            count={statistics.itemsVerifiedThreeToSixMonthsAgo ?? 0}
          />
        </Descriptions.Item>
        <Descriptions.Item label="More than 6 months ago">
          <Badge
            showZero
            overflowCount={9999}
            style={redBadgeStyle}
            count={statistics.itemsVerifiedMoreThanSixMonthsAgo ?? 0}
          />
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

export default Dashboard;
