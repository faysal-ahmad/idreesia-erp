import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AllSecurityEventLangarLocationsQuery,
  AllSecurityEventLangarLocationsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_SECURITY_EVENT_LANGAR_LOCATIONS: TypedDocumentNode<
  AllSecurityEventLangarLocationsQuery,
  AllSecurityEventLangarLocationsQueryVariables
> = gql`
  query allSecurityEventLangarLocations {
    allSecurityEventLangarLocations {
      _id
      name
      urduName
      overallUsedCount
    }
  }
`;

export default ALL_SECURITY_EVENT_LANGAR_LOCATIONS;
