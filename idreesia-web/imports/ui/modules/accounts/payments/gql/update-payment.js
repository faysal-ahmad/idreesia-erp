import gql from 'graphql-tag';

const UPDATE_PAYMENT = gql`
  mutation updatePayment(
    $_id: String!
    $name: String
    $fatherName: String
    $cnicNumber: String
    $contactNumber: String
    $paymentAmount: Float
    $paymentTypeId: String
    $paymentDate: String
    $description: String
  ) {
    updatePayment(
      _id: $_id
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
      name
      fatherName
      cnicNumber
      contactNumber
      paymentAmount
      paymentTypeId
      paymentDate
      description
    }
  }
`;

export default UPDATE_PAYMENT;
