import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveDutyShiftMutation,
  RemoveDutyShiftMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_DUTY_SHIFT: TypedDocumentNode<
  RemoveDutyShiftMutation,
  RemoveDutyShiftMutationVariables
> = gql`
  mutation removeDutyShift($_id: String!) {
    removeDutyShift(_id: $_id)
  }
`;

export default REMOVE_DUTY_SHIFT;
