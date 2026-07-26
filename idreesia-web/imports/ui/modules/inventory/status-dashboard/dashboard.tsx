import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { withQuery } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Badge, Descriptions, Spin } from 'antd';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';

const AntBadge = Badge as any;
const AntDescriptions = Descriptions as any;
const AntDescriptionsItem = Descriptions.Item as any;
const AntSpin = Spin as any;

interface InventoryStatistics {
  itemsWithImages: number;
  itemsWithoutImages: number;
  itemsWithPositiveStockLevel: number;
  itemsWithLessThanMinStockLevel: number;
  itemsWithNegativeStockLevel: number;
  itemsVerifiedLessThanThreeMonthsAgo: number;
  itemsVerifiedThreeToSixMonthsAgo: number;
  itemsVerifiedMoreThanSixMonthsAgo: number;
}

interface DashboardProps {
  loading?: boolean;
  physicalStoreId?: string;
  inventoryStatistics?: InventoryStatistics;
}

const emptyStatistics: InventoryStatistics = {
  itemsWithImages: 0,
  itemsWithoutImages: 0,
  itemsWithPositiveStockLevel: 0,
  itemsWithLessThanMinStockLevel: 0,
  itemsWithNegativeStockLevel: 0,
  itemsVerifiedLessThanThreeMonthsAgo: 0,
  itemsVerifiedThreeToSixMonthsAgo: 0,
  itemsVerifiedMoreThanSixMonthsAgo: 0,
};

const Dashboard = (props: DashboardProps) => {
  const { loading, inventoryStatistics } = props;
  if (loading) {
    return <AntSpin size="large" />;
  }
  const statistics = inventoryStatistics ?? emptyStatistics;

  return (
    <>
      <AntDescriptions title="Stock Items" bordered>
        <AntDescriptionsItem label="Items Count">
          <AntBadge
            showZero
            overflowCount={9999}
            style={{
              backgroundColor: '#fff',
              color: '#000',
              fontWeight: 'bold',
            }}
            count={
              statistics.itemsWithImages +
              statistics.itemsWithoutImages
            }
          />
        </AntDescriptionsItem>
        <AntDescriptionsItem label="With Images">
          <AntBadge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'green' }}
            count={statistics.itemsWithImages}
          />
        </AntDescriptionsItem>
        <AntDescriptionsItem label="Without Images">
          <AntBadge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'red' }}
            count={statistics.itemsWithoutImages}
          />
        </AntDescriptionsItem>
      </AntDescriptions>
      <div style={{ height: '20px' }} />
      <AntDescriptions title="Stock Levels" bordered>
        <AntDescriptionsItem label="Positive">
          <AntBadge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'green' }}
            count={statistics.itemsWithPositiveStockLevel}
          />
        </AntDescriptionsItem>
        <AntDescriptionsItem label="Less than minimum">
          <AntBadge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'orange' }}
            count={statistics.itemsWithLessThanMinStockLevel}
          />
        </AntDescriptionsItem>
        <AntDescriptionsItem label="Negative">
          <AntBadge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'red' }}
            count={statistics.itemsWithNegativeStockLevel}
          />
        </AntDescriptionsItem>
      </AntDescriptions>
      <div style={{ height: '20px' }} />
      <AntDescriptions title="Stock Level Verified" bordered>
        <AntDescriptionsItem label="Less than 3 months ago">
          <AntBadge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'green' }}
            count={statistics.itemsVerifiedLessThanThreeMonthsAgo}
          />
        </AntDescriptionsItem>
        <AntDescriptionsItem label="Between 3 to 6 months ago">
          <AntBadge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'orange' }}
            count={statistics.itemsVerifiedThreeToSixMonthsAgo}
          />
        </AntDescriptionsItem>
        <AntDescriptionsItem label="More than 6 months ago">
          <AntBadge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'red' }}
            count={statistics.itemsVerifiedMoreThanSixMonthsAgo}
          />
        </AntDescriptionsItem>
      </AntDescriptions>
    </>
  );
};

Dashboard.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  physicalStoreId: PropTypes.string,
  loading: PropTypes.bool,
  inventoryStatistics: PropTypes.object,
};

const query = gql`
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

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  withQuery(query, {
    props: ({ data }: { data: Record<string, unknown> }) => ({ ...data }),
    options: ({ physicalStoreId }: DashboardProps) => ({
      variables: { physicalStoreId },
    }),
  }),
  WithDynamicBreadcrumbs(({ physicalStore }: { physicalStore?: { name: string } }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Status Dashboard`;
    }
    return `Inventory, Status Dashboard`;
  })
)(Dashboard as any);
