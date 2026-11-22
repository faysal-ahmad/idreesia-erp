import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  MyMehfilKarkunsLocationsQuery,
  MyMehfilKarkunsLocationsQueryVariables,
  PagedMehfilKarkunsQuery,
  PagedMehfilKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MY_MEHFIL_KARKUNS_LOCATIONS: TypedDocumentNode<
  MyMehfilKarkunsLocationsQuery,
  MyMehfilKarkunsLocationsQueryVariables
> = gql`
  query myMehfilKarkunsLocations {
    myMehfilKarkunsLocations {
      locationId
      name
      type
      parentId
      hasWorkspace
      permissions
    }
  }
`;

export const PAGED_MEHFIL_KARKUNS: TypedDocumentNode<
  PagedMehfilKarkunsQuery,
  PagedMehfilKarkunsQueryVariables
> = gql`
  query pagedMehfilKarkuns(
    $locationId: String!
    $name: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedMehfilKarkuns(
      locationId: $locationId
      name: $name
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
        contactNumber2
        imageUrl
        imageThumbnailUrl
      }
    }
  }
`;
