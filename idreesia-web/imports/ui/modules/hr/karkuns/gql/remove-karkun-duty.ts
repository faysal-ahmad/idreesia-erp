import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveKarkunDutyMutation,
  RemoveKarkunDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_KARKUN_DUTY: TypedDocumentNode<
  RemoveKarkunDutyMutation,
  RemoveKarkunDutyMutationVariables
> = gql`
  mutation removeKarkunDuty($_id: String!) {
    removeKarkunDuty(_id: $_id)
  }
`;

export default REMOVE_KARKUN_DUTY;
