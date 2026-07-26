import gql from 'graphql-tag';

export const SET_DUTY_DETAIL = gql`
  mutation setDutyDetail($ids: [String]!, $dutyDetail: String!) {
    setDutyDetail(ids: $ids, dutyDetail: $dutyDetail) {
      _id
      mehfilId
      karkunId
      dutyId
      dutyDetail
      dutyCardBarcodeId
    }
  }
`;
