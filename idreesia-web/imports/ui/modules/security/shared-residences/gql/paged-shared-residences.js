import gql from 'graphql-tag';

export const PAGED_SHARED_RESIDENCES = gql`
  query pagedSharedResidences($queryString: String) {
    pagedSharedResidences(queryString: $queryString) {
      totalResults
      data {
        _id
        name
        address
        residentsCount
        residents {
          _id
          isOwner
          roomNumber
          fromDate
          toDate
          resident {
            _id
            name
            imageId
          }
        }
      }
    }
  }
`;
