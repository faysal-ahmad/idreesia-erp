import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveSecurityMehfilLangarLocationMutation,
  RemoveSecurityMehfilLangarLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_SECURITY_MEHFIL_LANGAR_LOCATION: TypedDocumentNode<
  RemoveSecurityMehfilLangarLocationMutation,
  RemoveSecurityMehfilLangarLocationMutationVariables
> = gql`
  mutation removeSecurityMehfilLangarLocation($_id: String!) {
    removeSecurityMehfilLangarLocation(_id: $_id)
  }
`;

export default REMOVE_SECURITY_MEHFIL_LANGAR_LOCATION;
