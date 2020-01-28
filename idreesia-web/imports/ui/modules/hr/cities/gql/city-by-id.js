import gql from 'graphql-tag';

const CITY_BY_ID = gql`
  query cityById($_id: String!) {
    cityById(_id: $_id) {
      _id
      name
      country
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default CITY_BY_ID;
