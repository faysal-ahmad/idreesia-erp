import gql from 'graphql-tag';

const UPDATE_PAYMENT = gql`
  mutation updatePayment(
    $_id: String!
    $name: String
    $fatherName: String
    $cnicNumber: String
    $contactNumber: String
    $paymentAmount: Float
    $paymentType: String
    $paymentDate: String
    $description: String
  ) {
    updatePayment(
      _id: $_id
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
      paymentAmount
      paymentType
      paymentDate
      description
    }
  }
`;

export default UPDATE_PAYMENT;
