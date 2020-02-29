import gql from 'graphql-tag';

const PAGED_OUTSTATION_MEMBERS = gql`
  query pagedOutstationMembers($filter: VisitorFilter) {
    pagedOutstationMembers(filter: $filter) {
      totalResults
      data {
        _id
        name
        parentName
        cnicNumber
        contactNumber1
        contactNumber2
        city
        country
        ehadDate
        referenceName
        imageId
        karkunId
      }
    }
  }
`;

export default PAGED_OUTSTATION_MEMBERS;
