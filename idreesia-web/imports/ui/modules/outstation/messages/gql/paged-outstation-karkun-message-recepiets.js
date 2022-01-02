import gql from 'graphql-tag';

const PAGED_OUTSTATION_KARKUN_MESSAGE_RECEPIENTS = gql`
  query pagedOutstationKarkunMessageRecepients(
    $recepientFilter: MessageRecepientFilter!
  ) {
    pagedOutstationKarkunMessageRecepients(recepientFilter: $recepientFilter) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        lastTarteebDate
        imageId
        duties {
          _id
          dutyId
          shiftId
          dutyName
          shiftName
          role
        }
        city {
          _id
          name
          country
        }
        cityMehfil {
          _id
          name
        }
      }
    }
  }
`;

export default PAGED_OUTSTATION_KARKUN_MESSAGE_RECEPIENTS;
