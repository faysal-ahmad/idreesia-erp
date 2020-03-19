import gql from 'graphql-tag';

const CREATE_PAYMENT = gql`
  mutation createPayment(
    $paymentNumber: Int!
    $name: String!
    $fatherName: String!
    $cnicNumber: String!
    $contactNumber: String
    $paymentTypeId: String!
    $paymentAmount: Float!
    $paymentDate: String!
    $description: String
  ) {
    createPayment(
      paymentNumber: $paymentNumber
      name: $name
      fatherName: $fatherName
      cnicNumber: $cnicNumber
      contactNumber: $contactNumber
      paymentTypeId: $paymentTypeId
      paymentAmount: $paymentAmount
      paymentDate: $paymentDate
      description: $description
    ) {
      _id
      paymentNumber
      name
      fatherName
      cnicNumber
      contactNumber
      paymentTypeId
      paymentAmount
      paymentDate
      description
    }
  }
`;

export default CREATE_PAYMENT;
