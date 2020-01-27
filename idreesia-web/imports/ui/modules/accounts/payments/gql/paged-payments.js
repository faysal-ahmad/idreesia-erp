import gql from 'graphql-tag';

const PAGED_PAYMENTS = gql`
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

export default PAGED_PAYMENTS;
