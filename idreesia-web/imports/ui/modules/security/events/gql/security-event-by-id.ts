import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityEventByIdQuery,
  SecurityEventByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_EVENT_BY_ID: TypedDocumentNode<
  SecurityEventByIdQuery,
  SecurityEventByIdQueryVariables
> = gql`
  query securityEventById($_id: String!) {
    securityEventById(_id: $_id) {
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

export default SECURITY_EVENT_BY_ID;
