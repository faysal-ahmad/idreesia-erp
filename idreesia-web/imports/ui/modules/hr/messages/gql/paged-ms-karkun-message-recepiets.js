import gql from 'graphql-tag';

const PAGED_MS_KARKUN_MESSAGE_RECEPIENTS = gql`
  query pagedMSKarkunMessageRecepients($filter: MessageKarkunFilter!) {
    pagedMSKarkunMessageRecepients(filter: $filter) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        lastTarteebDate
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
