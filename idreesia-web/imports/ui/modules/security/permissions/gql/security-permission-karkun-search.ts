import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityPermissionKarkunSearchQuery,
  SecurityPermissionKarkunSearchQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_PERMISSION_KARKUN_SEARCH: TypedDocumentNode<
  SecurityPermissionKarkunSearchQuery,
  SecurityPermissionKarkunSearchQueryVariables
> = gql`
  query securityPermissionKarkunSearch(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    securityPermissionKarkunSearch(
      name: $name
      cnicNumber: $cnicNumber
      phoneNumber: $phoneNumber
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        name
        parentName
        cnicNumber
        contactNumber1
        imageUrl
        imageThumbnailUrl
      }
    }
  }
`;

export default SECURITY_PERMISSION_KARKUN_SEARCH;
