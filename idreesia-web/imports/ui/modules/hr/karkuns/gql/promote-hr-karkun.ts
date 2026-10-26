import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PromoteHrKarkunMutation,
  PromoteHrKarkunMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PROMOTE_HR_KARKUN: TypedDocumentNode<
  PromoteHrKarkunMutation,
  PromoteHrKarkunMutationVariables
> = gql`
  mutation promoteHrKarkun($_id: String!) {
    promoteHrKarkun(_id: $_id) {
      _id
      isKarkun
    }
  }
`;

export default PROMOTE_HR_KARKUN;
