import gql from 'graphql-tag';

const PAGED_OPERATIONS_WAZAIF = gql`
  query pagedOperationsWazaif($filter: WazaifFilter) {
    pagedOperationsWazaif(filter: $filter) {
      totalResults
      data {
        _id
        name
        revisionNumber
        revisionDate
        imageIds
        images {
          _id
          name
        }
      }
    }
  }
`;

export default PAGED_OPERATIONS_WAZAIF;
