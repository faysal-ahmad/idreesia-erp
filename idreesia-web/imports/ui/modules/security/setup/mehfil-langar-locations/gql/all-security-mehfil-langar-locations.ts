import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AllSecurityMehfilLangarLocationsQuery,
  AllSecurityMehfilLangarLocationsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_SECURITY_MEHFIL_LANGAR_LOCATIONS: TypedDocumentNode<
  AllSecurityMehfilLangarLocationsQuery,
  AllSecurityMehfilLangarLocationsQueryVariables
> = gql`
  query allSecurityMehfilLangarLocations {
    allSecurityMehfilLangarLocations {
      _id
      name
      urduName
      overallUsedCount
    }
  }
`;

export default ALL_SECURITY_MEHFIL_LANGAR_LOCATIONS;
