import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HrKarkunsPermissionAssignmentsQuery,
  HrKarkunsPermissionAssignmentsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const HR_PERMISSION_ASSIGNMENTS: TypedDocumentNode<HrKarkunsPermissionAssignmentsQuery, HrKarkunsPermissionAssignmentsQueryVariables> = gql`
  query hrKarkunsPermissionAssignments {
    hrKarkunsPermissionAssignments {
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

export default HR_PERMISSION_ASSIGNMENTS;
