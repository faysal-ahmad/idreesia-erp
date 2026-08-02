import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddMehfilKarkunMutation,
  AddMehfilKarkunMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const ADD_MEHFIL_KARKUN: TypedDocumentNode<
  AddMehfilKarkunMutation,
  AddMehfilKarkunMutationVariables
> = gql`
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
