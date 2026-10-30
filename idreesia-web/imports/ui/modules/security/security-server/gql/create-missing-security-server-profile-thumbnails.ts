import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateMissingSecurityServerProfileThumbnailsMutation,
  CreateMissingSecurityServerProfileThumbnailsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_MISSING_SECURITY_SERVER_PROFILE_THUMBNAILS: TypedDocumentNode<
  CreateMissingSecurityServerProfileThumbnailsMutation,
  CreateMissingSecurityServerProfileThumbnailsMutationVariables
> = gql`
  mutation createMissingSecurityServerProfileThumbnails {
    createMissingSecurityServerProfileThumbnails
  }
`;

export default CREATE_MISSING_SECURITY_SERVER_PROFILE_THUMBNAILS;
