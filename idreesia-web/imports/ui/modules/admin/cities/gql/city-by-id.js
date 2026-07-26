import gql from 'graphql-tag';

const CITY_BY_ID = gql`
  query cityById($_id: String!) {
    cityById(_id: $_id) {
      _id
      name
      peripheryOf
      country
      region
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default CITY_BY_ID;
