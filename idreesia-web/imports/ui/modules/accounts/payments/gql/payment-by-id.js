import gql from 'graphql-tag';

const PAYMENT_BY_ID = gql`
  query paymentById($_id: String!) {
    paymentById(_id: $_id) {
      _id
      name
      fatherName
      cnicNumber
      contactNumber
      paymentNumber
      paymentAmount
      paymentTypeId
      paymentDate
      description
      isDeleted
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default PAYMENT_BY_ID;
