import gql from 'graphql-tag';

const MEHFIL_KARKUNS_BY_MEHFIL_ID = gql`
  query mehfilKarkunsByMehfilId($mehfilId: String!, $dutyName: String) {
    mehfilKarkunsByMehfilId(mehfilId: $mehfilId, dutyName: $dutyName) {
      _id
      mehfilId
      karkunId
      dutyName
      dutyDetail
      dutyCardBarcodeId
      karkun {
        _id
        name
        imageId
        cnicNumber
        contactNumber1
        city {
          _id
          name
        }
      }
    }
  }
`;

export default MEHFIL_KARKUNS_BY_MEHFIL_ID;
