import gql from 'graphql-tag';

const PAGED_OUTSTATION_KARKUN_MESSAGE_RECEPIENTS_BY_RESULT = gql`
  query pagedOutstationKarkunMessageRecepientsByResult(
    $recepientsByResultFilter: MessageRecepientByResultFilter!
  ) {
    pagedOutstationKarkunMessageRecepientsByResult(
      recepientsByResultFilter: $recepientsByResultFilter
    ) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        imageId
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

export default PAGED_OUTSTATION_KARKUN_MESSAGE_RECEPIENTS_BY_RESULT;
