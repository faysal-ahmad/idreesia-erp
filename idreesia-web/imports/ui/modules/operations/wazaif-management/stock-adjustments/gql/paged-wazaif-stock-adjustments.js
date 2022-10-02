import gql from 'graphql-tag';

export const PAGED_WAZAIF_STOCK_ADJUSTMENTS = gql`
  query pagedWazaifStockAdjustments($queryString: String) {
    pagedWazaifStockAdjustments(queryString: $queryString) {
      totalResults
      data {
        _id
        wazeefaId
        adjustmentDate
        adjustedBy
        quantity
        adjustmentReason
        approvedOn
        refWazeefa {
          _id
          name
          imageIds
          images {
            _id
            name
          }
        }
        refAdjustedBy {
          _id
          sharedData {
            name
          }
        }
      }
    }
  }
`;
