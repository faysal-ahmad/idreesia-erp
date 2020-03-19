import gql from 'graphql-tag';

const ALL_PAYMENT_TYPES = gql`
  query allPaymentTypes {
    allPaymentTypes {
      _id
      name
      description
      usedCount
    }
  }
`;

export default ALL_PAYMENT_TYPES;
