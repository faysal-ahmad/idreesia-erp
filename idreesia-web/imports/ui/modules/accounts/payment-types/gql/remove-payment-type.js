import gql from 'graphql-tag';

const REMOVE_PAYMENT_TYPE = gql`
  mutation removePaymentType($_id: String!) {
    removePaymentType(_id: $_id)
  }
`;

export default REMOVE_PAYMENT_TYPE;
