import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HrPermissionKarkunSearchQuery,
  HrPermissionKarkunSearchQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const HR_PERMISSION_KARKUN_SEARCH: TypedDocumentNode<
  HrPermissionKarkunSearchQuery,
  HrPermissionKarkunSearchQueryVariables
> = gql`
  query hrPermissionKarkunSearch(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    hrPermissionKarkunSearch(
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

export default HR_PERMISSION_KARKUN_SEARCH;
