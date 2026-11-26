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
  mutation promoteHrKarkun(
    $_id: String!
    $cityLocationId: String!
    $mehfilLocationId: String
  ) {
    promoteHrKarkun(
      _id: $_id
      cityLocationId: $cityLocationId
      mehfilLocationId: $mehfilLocationId
    ) {
      _id
      isKarkun
    }
  }
`;

export default PROMOTE_HR_KARKUN;
