import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HelperAdminKarkunLocationsQuery,
  HelperAdminKarkunLocationsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADMIN_KARKUN_LOCATIONS: TypedDocumentNode<
  HelperAdminKarkunLocationsQuery,
  HelperAdminKarkunLocationsQueryVariables
> = gql`
  query helperAdminKarkunLocations {
    adminKarkunLocations {
      _id
      name
      type
      parentId
    }
  }
`;

export default ADMIN_KARKUN_LOCATIONS;
