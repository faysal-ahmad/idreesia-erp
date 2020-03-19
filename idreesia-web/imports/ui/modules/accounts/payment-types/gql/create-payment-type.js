import gql from 'graphql-tag';

const CREATE_PAYMENT_TYPE = gql`
  mutation createPaymentType($name: String!, $description: String) {
    createPaymentType(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default CREATE_PAYMENT_TYPE;
