import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityMehfilLangarLocationMutation,
  UpdateSecurityMehfilLangarLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_MEHFIL_LANGAR_LOCATION: TypedDocumentNode<
  UpdateSecurityMehfilLangarLocationMutation,
  UpdateSecurityMehfilLangarLocationMutationVariables
> = gql`
  mutation updateSecurityMehfilLangarLocation($id: String!, $name: String!, $urduName: String!) {
    updateSecurityMehfilLangarLocation(id: $id, name: $name, urduName: $urduName) {
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

export default UPDATE_SECURITY_MEHFIL_LANGAR_LOCATION;
