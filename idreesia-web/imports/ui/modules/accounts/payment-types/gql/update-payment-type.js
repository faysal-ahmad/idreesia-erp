import gql from 'graphql-tag';

const UPDATE_PAYMENT_TYPE = gql`
  mutation updatePaymentType(
    $_id: String!
    $name: String!
    $description: String
  ) {
    updatePaymentType(_id: $_id, name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default UPDATE_PAYMENT_TYPE;
