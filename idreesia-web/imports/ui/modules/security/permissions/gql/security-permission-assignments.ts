import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityPermissionAssignmentsQuery,
  SecurityPermissionAssignmentsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_PERMISSION_ASSIGNMENTS: TypedDocumentNode<SecurityPermissionAssignmentsQuery, SecurityPermissionAssignmentsQueryVariables> = gql`
  query securityPermissionAssignments {
    securityPermissionAssignments {
      featureKey
      featureName
      permissions {
        key
        name
        description
        users {
          userId
          personId
          username
          displayName
        }
        groups {
          groupId
          name
        }
      }
    }
  }
`;

export default SECURITY_PERMISSION_ASSIGNMENTS;
