import gql from 'graphql-tag';

const PAGED_PEOPLE = gql`
  query pagedPeople($filter: PersonFilter) {
    pagedPeople(filter: $filter) {
      totalResults
      data {
        _id
        isVisitor
        isKarkun
        isEmployee
        sharedData {
          name
          cnicNumber
          contactNumber1
          contactNumber2
          imageId
          image {
            _id
            name
            description
            mimeType
            data
          }
        }
        visitorData {
          city
          country
        }
        karkunData {
          city {
            _id
            name
            country
          }
        }
      }
    }
  }
`;

export default PAGED_PEOPLE;
