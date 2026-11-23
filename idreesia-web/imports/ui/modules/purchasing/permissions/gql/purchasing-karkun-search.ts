import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingKarkunSearchQuery,
  PurchasingKarkunSearchQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_KARKUN_SEARCH: TypedDocumentNode<
  PurchasingKarkunSearchQuery,
  PurchasingKarkunSearchQueryVariables
> = gql`
  query purchasingKarkunSearch(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    purchasingKarkunSearch(
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

export default PURCHASING_KARKUN_SEARCH;
