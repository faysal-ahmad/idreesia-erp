import gql from 'graphql-tag';

const PAGED_MS_KARKUN_MESSAGE_RECEPIENTS = gql`
  query pagedMSKarkunMessageRecepients(
    $recepientFilter: MessageRecepientFilter!
  ) {
    pagedMSKarkunMessageRecepients(recepientFilter: $recepientFilter) {
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

export default PAGED_MS_KARKUN_MESSAGE_RECEPIENTS;
