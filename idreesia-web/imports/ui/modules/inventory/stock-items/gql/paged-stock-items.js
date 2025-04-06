import gql from 'graphql-tag';

export const PAGED_STOCK_ITEMS = gql`
  query pagedStockItems($physicalStoreId: String!, $queryString: String) {
    pagedStockItems(
      physicalStoreId: $physicalStoreId
      queryString: $queryString
    ) {
      totalResults
      data {
        _id
        name
        formattedName
        company
        details
        imageId
        categoryName
        unitOfMeasurement
        minStockLevel
        currentStockLevel
        totalStockLevel
        verifiedOn
        purchaseFormsCount
        issuanceFormsCount
        stockAdjustmentsCount
      }
    }
  }
`;
