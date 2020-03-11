import gql from 'graphql-tag';

const PAGED_WAZAIF = gql`
  query pagedWazaif($filter: WazaifFilter) {
    pagedWazaif(filter: $filter) {
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

export default PAGED_WAZAIF;
