import gql from 'graphql-tag';

const ADD_MEHFIL_KARKUN = gql`
  mutation addMehfilKarkun(
    $mehfilId: String!
    $karkunId: String!
    $dutyName: String!
  ) {
    addMehfilKarkun(
      mehfilId: $mehfilId
      karkunId: $karkunId
      dutyName: $dutyName
    ) {
      _id
      mehfilId
      karkunId
      dutyName
      dutyDetail
      dutyCardBarcodeId
    }
  }
`;

export default ADD_MEHFIL_KARKUN;
