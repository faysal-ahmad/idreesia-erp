import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AllSecurityEventsQuery,
  AllSecurityEventsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_SECURITY_EVENTS: TypedDocumentNode<
  AllSecurityEventsQuery,
  AllSecurityEventsQueryVariables
> = gql`
  query allSecurityEvents {
    allSecurityEvents {
      _id
      name
      eventDate
      karkunCount
    }
  }
`;

export default ALL_SECURITY_EVENTS;
