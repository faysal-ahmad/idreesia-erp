import gql from 'graphql-tag';

const PAGED_MS_KARKUN_MESSAGE_RECEPIENTS_BY_RESULT = gql`
  query pagedMSKarkunMessageRecepientsByResult(
    $recepientsByResultFilter: MessageRecepientByResultFilter!
  ) {
    pagedMSKarkunMessageRecepientsByResult(
      recepientsByResultFilter: $recepientsByResultFilter
    ) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        imageId
        job {
          _id
          name
        }
        duties {
          _id
          dutyId
          shiftId
          dutyName
          shiftName
          role
        }
      }
    }
  }
`;

export default PAGED_MS_KARKUN_MESSAGE_RECEPIENTS_BY_RESULT;
