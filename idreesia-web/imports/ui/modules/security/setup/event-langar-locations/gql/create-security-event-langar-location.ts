import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateSecurityEventLangarLocationMutation,
  CreateSecurityEventLangarLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_SECURITY_EVENT_LANGAR_LOCATION: TypedDocumentNode<
  CreateSecurityEventLangarLocationMutation,
  CreateSecurityEventLangarLocationMutationVariables
> = gql`
  mutation createSecurityEventLangarLocation($name: String!, $urduName: String!) {
    createSecurityEventLangarLocation(name: $name, urduName: $urduName) {
      _id
      name
      urduName
    }
  }
`;

export default CREATE_SECURITY_EVENT_LANGAR_LOCATION;
