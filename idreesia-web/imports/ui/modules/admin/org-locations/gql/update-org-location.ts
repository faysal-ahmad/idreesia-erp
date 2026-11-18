import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateOrgLocationMutation,
  UpdateOrgLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_ORG_LOCATION: TypedDocumentNode<
  UpdateOrgLocationMutation,
  UpdateOrgLocationMutationVariables
> = gql`
  mutation updateOrgLocation(
    $_id: String!
    $name: String!
    $parentId: String
    $mehfilDetails: OrgLocationMehfilDetailsInput
  ) {
    updateOrgLocation(
      _id: $_id
      name: $name
      parentId: $parentId
      mehfilDetails: $mehfilDetails
    ) {
      _id
      name
    }
  }
`;

export default UPDATE_ORG_LOCATION;
