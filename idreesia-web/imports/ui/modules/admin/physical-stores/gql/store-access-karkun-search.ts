import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  StoreAccessKarkunSearchQuery,
  StoreAccessKarkunSearchQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const STORE_ACCESS_KARKUN_SEARCH: TypedDocumentNode<
  StoreAccessKarkunSearchQuery,
  StoreAccessKarkunSearchQueryVariables
> = gql`
  query storeAccessKarkunSearch(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    storeAccessKarkunSearch(
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

export default STORE_ACCESS_KARKUN_SEARCH;
