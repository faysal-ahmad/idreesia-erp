import gql from 'graphql-tag';

export const PAGED_OPERATIONS_WAZAIF = gql`
  query pagedOperationsWazaif($filter: WazaifFilter) {
    pagedOperationsWazaif(filter: $filter) {
      totalResults
      data {
        _id
        name
        revisionNumber
        revisionDate
        currentStockLevel
        stockReconciledOn
        imageIds
        images {
          _id
          name
        }
      }
    }
  }
`;
