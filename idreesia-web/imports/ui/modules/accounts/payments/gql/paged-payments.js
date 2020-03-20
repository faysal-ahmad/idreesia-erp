import gql from 'graphql-tag';

const PAGED_PAYMENTS = gql`
  query pagedPayments($filter: PaymentFilter) {
    pagedPayments(filter: $filter) {
      totalResults
      data {
        _id
        paymentNumber
        name
        fatherName
        cnicNumber
        paymentDate
        paymentAmount
        description
        paymentType {
          _id
          name
        }
      }
    }
  }
`;

export default PAGED_PAYMENTS;
