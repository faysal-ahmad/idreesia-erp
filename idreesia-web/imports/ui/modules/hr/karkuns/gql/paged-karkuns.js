import gql from 'graphql-tag';

const PAGED_KARKUNS = gql`
  query pagedKarkuns($queryString: String) {
    pagedKarkuns(queryString: $queryString) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        imageId
        job {
          _id
          name
        }
        duties {
          _id
          dutyId
          shiftId
          dutyName
          shiftName
          role
        }
      }
    }
  }
`;

export default PAGED_KARKUNS;
