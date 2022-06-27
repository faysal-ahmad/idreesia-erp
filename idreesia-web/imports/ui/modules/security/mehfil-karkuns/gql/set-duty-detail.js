import gql from 'graphql-tag';

const SET_DUTY_DETAIL = gql`
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

export default SET_DUTY_DETAIL;
