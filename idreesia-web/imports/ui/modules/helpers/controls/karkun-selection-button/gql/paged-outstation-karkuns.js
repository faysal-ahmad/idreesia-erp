import gql from 'graphql-tag';

const PAGED_OUTSTATION_KARKUNS = gql`
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

export default PAGED_OUTSTATION_KARKUNS;
