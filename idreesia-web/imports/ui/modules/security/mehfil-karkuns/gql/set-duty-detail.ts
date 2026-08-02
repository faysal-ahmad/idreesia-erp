import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetDutyDetailMutation,
  SetDutyDetailMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const SET_DUTY_DETAIL: TypedDocumentNode<
  SetDutyDetailMutation,
  SetDutyDetailMutationVariables
> = gql`
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
