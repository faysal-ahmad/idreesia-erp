import gql from 'graphql-tag';

export const PAGED_OUTSTATION_KARKUNS = gql`
  query pagedOutstationKarkuns($filter: KarkunFilter) {
    pagedOutstationKarkuns(filter: $filter) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        imageId
        duties {
          _id
          dutyId
          shiftId
          dutyName
        }
        city {
          _id
          name
          country
        }
        cityMehfil {
          _id
          name
        }
      }
    }
  }
`;
