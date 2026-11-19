import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AllOrgLocationsQuery,
  AllOrgLocationsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_ORG_LOCATIONS: TypedDocumentNode<
  AllOrgLocationsQuery,
  AllOrgLocationsQueryVariables
> = gql`
  query allOrgLocations {
    allOrgLocations {
      _id
      name
      type
      parentId
      allParentIds
      observerKarkunIds
      committees {
        _id
        name
      }
    }
  }
`;

export default ALL_ORG_LOCATIONS;
