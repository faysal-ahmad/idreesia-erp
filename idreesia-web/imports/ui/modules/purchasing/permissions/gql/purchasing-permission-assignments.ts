import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingPermissionAssignmentsQuery,
  PurchasingPermissionAssignmentsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_PERMISSION_ASSIGNMENTS: TypedDocumentNode<PurchasingPermissionAssignmentsQuery, PurchasingPermissionAssignmentsQueryVariables> = gql`
  query purchasingPermissionAssignments {
    purchasingPermissionAssignments {
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
        committees {
          committeeId
          name
          locationName
        }
      }
    }
  }
`;

export default PURCHASING_PERMISSION_ASSIGNMENTS;
