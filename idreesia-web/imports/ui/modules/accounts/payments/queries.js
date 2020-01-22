import gql from 'graphql-tag';

const pagedPayments = gql`
  query pagedPayments($queryString: String) {
    pagedPayments(queryString: $queryString) {
      totalResults
      data {
        _id
        name
        fatherName
        cnicNumber
        paymentDate
        paymentAmount
        paymentNumber
        description
        isDeleted
        history {
          _id
          name
          fatherName
          cnicNumber
          paymentDate
          paymentAmount
          description
          isDeleted
          version
          createdAt
          createdBy
          updatedAt
          updatedBy
        }
      }
    }
  }
`;

const createPayment = gql`
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

const paymentById = gql`
  query paymentById($_id: String!) {
    paymentById(_id: $_id) {
      _id
      name
      fatherName
      cnicNumber
      contactNumber
      paymentNumber
      paymentAmount
      paymentType
      paymentDate
      description
      isDeleted
      createdAt
      createdBy
      updatedAt
      updatedBy
      history {
        _id
        name
        fatherName
        cnicNumber
        paymentDate
        paymentAmount
        description
        isDeleted
        version
        createdAt
        createdBy
        updatedAt
        updatedBy
      }
    }
  }
`;

const updatePayment = gql`
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
const removePayment = gql`
  mutation removePayment($_id: String!) {
    removePayment(_id: $_id)
  }
`;

export {
  pagedPayments,
  updatePayment,
  createPayment,
  paymentById,
  removePayment,
};
