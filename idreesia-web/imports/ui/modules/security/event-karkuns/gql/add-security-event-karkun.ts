import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddSecurityEventKarkunMutation,
  AddSecurityEventKarkunMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const ADD_SECURITY_EVENT_KARKUN: TypedDocumentNode<
  AddSecurityEventKarkunMutation,
  AddSecurityEventKarkunMutationVariables
> = gql`
  mutation addSecurityEventKarkun(
    $eventId: String!
    $karkunId: String!
    $dutyId: String!
  ) {
    addSecurityEventKarkun(eventId: $eventId, karkunId: $karkunId, dutyId: $dutyId) {
      _id
      eventId
      karkunId
      dutyId
      dutyDetail
      dutyCardBarcodeId
    }
  }
`;
