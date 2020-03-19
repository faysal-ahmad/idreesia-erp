import gql from 'graphql-tag';

const PAYMENT_TYPE_BY_ID = gql`
  query paymentTypeById($_id: String!) {
    paymentTypeById(_id: $_id) {
      _id
      name
      description
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default PAYMENT_TYPE_BY_ID;
