import gql from 'graphql-tag';

const ADD_MEHFIL_KARKUN = gql`
  mutation addMehfilKarkun(
    $mehfilId: String!
    $karkunId: String!
    $dutyId: String!
  ) {
    addMehfilKarkun(mehfilId: $mehfilId, karkunId: $karkunId, dutyId: $dutyId) {
      _id
      mehfilId
      karkunId
      dutyId
      dutyDetail
      dutyCardBarcodeId
    }
  }
`;

export default ADD_MEHFIL_KARKUN;
