import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HrPermissionAssignmentsQuery,
  HrPermissionAssignmentsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const HR_PERMISSION_ASSIGNMENTS: TypedDocumentNode<HrPermissionAssignmentsQuery, HrPermissionAssignmentsQueryVariables> = gql`
  query hrPermissionAssignments {
    hrPermissionAssignments {
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
