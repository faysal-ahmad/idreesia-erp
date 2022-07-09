import gql from 'graphql-tag';

export const MEHFIL_KARKUNS_BY_IDS = gql`
  query mehfilKarkunsByIds($ids: String!) {
    mehfilKarkunsByIds(ids: $ids) {
      _id
      mehfilId
      karkunId
      dutyId
      dutyDetail
      dutyCardBarcodeId
      duty {
        _id
        name
        urduName
      }
      karkun {
        _id
        isKarkun
        sharedData {
          name
          cnicNumber
          contactNumber1
          contactNumber2
          image {
            _id
            data
          }
        }
        visitorData {
          city
          country
        }
        karkunData {
          city {
            _id
            name
            country
          }
        }
      }
    }
  }
`;
