import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Badge, Descriptions, Spin } from 'antd';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';

const Dashboard = props => {
  const { loading, inventoryStatistics } = props;
  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <>
      <Descriptions title="Stock Items" bordered>
        <Descriptions.Item label="Items Count">
          <Badge
            showZero
            overflowCount={9999}
            style={{
              backgroundColor: '#fff',
              color: '#000',
              fontWeight: 'bold',
            }}
            count={inventoryStatistics.itemsWithImages + inventoryStatistics.itemsWithoutImages}
          />
        </Descriptions.Item>
        <Descriptions.Item label="With Images">
          <Badge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'green' }}
            count={inventoryStatistics.itemsWithImages}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Without Images">
          <Badge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'red' }}
            count={inventoryStatistics.itemsWithoutImages}
          />
        </Descriptions.Item>
      </Descriptions>
      <div style={{ height: '20px' }} />
      <Descriptions title="Stock Levels" bordered>
        <Descriptions.Item label="Positive">
          <Badge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'green' }}
            count={inventoryStatistics.itemsWithPositiveStockLevel}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Less than minimum">
          <Badge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'orange' }}
            count={inventoryStatistics.itemsWithLessThanMinStockLevel}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Negative">
          <Badge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'red' }}
            count={inventoryStatistics.itemsWithNegativeStockLevel}
          />
        </Descriptions.Item>
      </Descriptions>
      <div style={{ height: '20px' }} />
      <Descriptions title="Stock Level Verified" bordered>
        <Descriptions.Item label="Less than 3 months ago">
          <Badge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'green' }}
            count={inventoryStatistics.itemsVerifiedLessThanThreeMonthsAgo}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Between 3 to 6 months ago">
          <Badge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'orange' }}
            count={inventoryStatistics.itemsVerifiedThreeToSixMonthsAgo}
          />
        </Descriptions.Item>
        <Descriptions.Item label="More than 6 months ago">
          <Badge
            showZero
            overflowCount={9999}
            style={{ backgroundColor: 'red' }}
            count={inventoryStatistics.itemsVerifiedMoreThanSixMonthsAgo}
          />
        </Descriptions.Item>
      </Descriptions>
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
  graphql(query, {
    props: ({ data }) => ({ ...data }),
    options: ({ physicalStoreId }) => ({
      variables: { physicalStoreId },
    }),
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Status Dashboard`;
    }
    return `Inventory, Status Dashboard`;
  })
)(Dashboard);
