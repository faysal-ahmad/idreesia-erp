import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ApproveAllSalariesMutation,
  ApproveAllSalariesMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const APPROVE_ALL_SALARIES: TypedDocumentNode<
  ApproveAllSalariesMutation,
  ApproveAllSalariesMutationVariables
> = gql`
  mutation approveAllSalaries($month: String!) {
    approveAllSalaries(month: $month)
  }
`;

export default APPROVE_ALL_SALARIES;
