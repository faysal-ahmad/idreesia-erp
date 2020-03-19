import gql from 'graphql-tag';

const NEXT_PAYMENT_NUMBER = gql`
  query nextPaymentNumber {
    nextPaymentNumber
  }
`;

export default NEXT_PAYMENT_NUMBER;
