import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveSecurityEventLangarLocationMutation,
  RemoveSecurityEventLangarLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_SECURITY_EVENT_LANGAR_LOCATION: TypedDocumentNode<
  RemoveSecurityEventLangarLocationMutation,
  RemoveSecurityEventLangarLocationMutationVariables
> = gql`
  mutation removeSecurityEventLangarLocation($_id: String!) {
    removeSecurityEventLangarLocation(_id: $_id)
  }
`;

export default REMOVE_SECURITY_EVENT_LANGAR_LOCATION;
