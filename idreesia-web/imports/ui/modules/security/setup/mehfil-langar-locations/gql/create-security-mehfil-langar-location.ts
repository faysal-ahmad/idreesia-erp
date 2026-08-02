import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateSecurityMehfilLangarLocationMutation,
  CreateSecurityMehfilLangarLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_SECURITY_MEHFIL_LANGAR_LOCATION: TypedDocumentNode<
  CreateSecurityMehfilLangarLocationMutation,
  CreateSecurityMehfilLangarLocationMutationVariables
> = gql`
  mutation createSecurityMehfilLangarLocation($name: String!, $urduName: String!) {
    createSecurityMehfilLangarLocation(name: $name, urduName: $urduName) {
      _id
      name
      urduName
    }
  }
`;

export default CREATE_SECURITY_MEHFIL_LANGAR_LOCATION;
