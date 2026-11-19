import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateOrgLocationMutation,
  CreateOrgLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_ORG_LOCATION: TypedDocumentNode<
  CreateOrgLocationMutation,
  CreateOrgLocationMutationVariables
> = gql`
  mutation createOrgLocation(
    $name: String!
    $type: String!
    $parentId: String
    $mehfilDetails: OrgLocationMehfilDetailsInput
  ) {
    createOrgLocation(
      name: $name
      type: $type
      parentId: $parentId
      mehfilDetails: $mehfilDetails
    ) {
      _id
      name
    }
  }
`;

export default CREATE_ORG_LOCATION;
