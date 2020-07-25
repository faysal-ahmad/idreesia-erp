import gql from 'graphql-tag';

const CREATE_IMDAD_REASON = gql`
  mutation createImdadReason($name: String!, $description: String) {
    createImdadReason(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default CREATE_IMDAD_REASON;
