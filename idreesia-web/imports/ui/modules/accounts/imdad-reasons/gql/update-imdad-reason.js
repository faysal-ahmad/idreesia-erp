import gql from 'graphql-tag';

const UPDATE_IMDAD_REASON = gql`
  mutation updateImdadReason(
    $_id: String!
    $name: String!
    $description: String
  ) {
    updateImdadReason(_id: $_id, name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default UPDATE_IMDAD_REASON;
