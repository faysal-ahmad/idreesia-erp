import gql from 'graphql-tag';

const REMOVE_PAYMENT = gql`
  mutation removePayment($_id: String!) {
    removePayment(_id: $_id)
  }
`;

export default REMOVE_PAYMENT;
