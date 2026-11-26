import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateSecurityEventMutation,
  CreateSecurityEventMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_SECURITY_EVENT: TypedDocumentNode<
  CreateSecurityEventMutation,
  CreateSecurityEventMutationVariables
> = gql`
  mutation createSecurityEvent($name: String!, $eventDate: String!) {
    createSecurityEvent(name: $name, eventDate: $eventDate) {
      _id
      name
      eventDate
    }
  }
`;

export default CREATE_SECURITY_EVENT;
