import gql from 'graphql-tag';

const PAGED_PAYMENTS_FOR_IMDAD_REQUEST = gql`
  query pagedPaymentsForImdadRequest(
    $imdadRequestId: String!
    $filter: PaymentFilter
  ) {
    pagedPaymentsForImdadRequest(
      imdadRequestId: $imdadRequestId
      filter: $filter
    ) {
      totalResults
      data {
        _id
        paymentNumber
        paymentDate
        paymentAmount
        paymentType {
          _id
          name
        }
      }
    }
  }
`;

export default PAGED_PAYMENTS_FOR_IMDAD_REQUEST;
