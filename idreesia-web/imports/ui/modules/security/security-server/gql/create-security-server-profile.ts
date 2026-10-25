import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateSecurityServerProfileMutation,
  CreateSecurityServerProfileMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_SECURITY_SERVER_PROFILE: TypedDocumentNode<
  CreateSecurityServerProfileMutation,
  CreateSecurityServerProfileMutationVariables
> = gql`
  mutation createSecurityServerProfile($name: String!, $isTest: Boolean!) {
    createSecurityServerProfile(name: $name, isTest: $isTest) {
      _id
    }
  }
`;

export default CREATE_SECURITY_SERVER_PROFILE;
