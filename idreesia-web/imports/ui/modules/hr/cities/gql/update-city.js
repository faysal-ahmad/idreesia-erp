import gql from 'graphql-tag';

const UPDATE_CITY = gql`
  mutation updateCity($_id: String!, $name: String!, $country: String) {
    updateCity(_id: $_id, name: $name, country: $country) {
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

export default UPDATE_CITY;
