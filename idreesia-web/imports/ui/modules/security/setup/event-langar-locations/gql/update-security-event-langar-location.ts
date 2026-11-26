import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityEventLangarLocationMutation,
  UpdateSecurityEventLangarLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_EVENT_LANGAR_LOCATION: TypedDocumentNode<
  UpdateSecurityEventLangarLocationMutation,
  UpdateSecurityEventLangarLocationMutationVariables
> = gql`
  mutation updateSecurityEventLangarLocation($id: String!, $name: String!, $urduName: String!) {
    updateSecurityEventLangarLocation(id: $id, name: $name, urduName: $urduName) {
      _id
      name
      urduName
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_SECURITY_EVENT_LANGAR_LOCATION;
