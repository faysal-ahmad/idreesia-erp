import gql from 'graphql-tag';

const CREATE_PAYMENT = gql`
  mutation createPayment(
    $name: String!
    $fatherName: String!
    $cnicNumber: String!
    $contactNumber: String
    $paymentType: String!
    $paymentAmount: Float!
    $paymentDate: String!
    $description: String
  ) {
    createPayment(
      name: $name
      fatherName: $fatherName
      cnicNumber: $cnicNumber
      contactNumber: $contactNumber
      paymentType: $paymentType
      paymentAmount: $paymentAmount
      paymentDate: $paymentDate
      description: $description
    ) {
      _id
      name
      fatherName
      cnicNumber
      contactNumber
      paymentType
      paymentAmount
      paymentNumber
      paymentDate
      description
    }
  }
`;

export default CREATE_PAYMENT;
