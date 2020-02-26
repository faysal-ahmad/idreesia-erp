import gql from 'graphql-tag';

const USER_BY_ID = gql`
  query userById($_id: String!) {
    userById(_id: $_id) {
      _id
      username
      email
      displayName
      locked
      instances
      permissions
      karkun {
        _id
        name
      }
    }
  }
`;

export default USER_BY_ID;
