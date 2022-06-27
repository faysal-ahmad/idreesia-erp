import gql from 'graphql-tag';

const MEHFIL_KARKUNS_BY_MEHFIL_ID = gql`
  query mehfilKarkunsByMehfilId($mehfilId: String!, $dutyId: String) {
    mehfilKarkunsByMehfilId(mehfilId: $mehfilId, dutyId: $dutyId) {
      _id
      mehfilId
      karkunId
      dutyId
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
