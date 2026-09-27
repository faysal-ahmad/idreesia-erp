import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileCurrentUserQuery,
  MobileCurrentUserQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_CURRENT_USER: TypedDocumentNode<
  MobileCurrentUserQuery,
  MobileCurrentUserQueryVariables
> = gql`
  query mobileCurrentUser {
    currentUser {
      _id
      username
      displayName
      email
      permissions
      instances
      karkun {
        _id
        sharedData {
          name
          imageId
        }
      }
    }
  }
`;
