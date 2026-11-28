import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityEventMutation,
  UpdateSecurityEventMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_EVENT: TypedDocumentNode<
  UpdateSecurityEventMutation,
  UpdateSecurityEventMutationVariables
> = gql`
  mutation updateSecurityEvent($_id: String!, $name: String!, $eventDate: String!) {
    updateSecurityEvent(_id: $_id, name: $name, eventDate: $eventDate) {
      _id
      name
      eventDate
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_SECURITY_EVENT;
