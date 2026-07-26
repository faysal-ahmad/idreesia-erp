import gql from 'graphql-tag';

const CREATE_USER_GROUP = gql`
  mutation createUserGroup(
    $name: String!
    $moduleName: String!
    $description: String
  ) {
    createUserGroup(
      name: $name
      moduleName: $moduleName
      description: $description
    ) {
      _id
      name
      moduleName
      description
    }
  }
`;

export default CREATE_USER_GROUP;
