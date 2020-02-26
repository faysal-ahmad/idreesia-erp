import gql from 'graphql-tag';

const PAGED_MS_KARKUNS = gql`
  query pagedKarkuns($filter: KarkunFilter) {
    pagedKarkuns(filter: $filter) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        lastTarteebDate
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

export default PAGED_MS_KARKUNS;
