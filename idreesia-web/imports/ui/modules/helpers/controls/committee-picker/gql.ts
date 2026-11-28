import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  ReferenceCommitteesByLocationQuery,
  ReferenceCommitteesByLocationQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REFERENCE_COMMITTEES_BY_LOCATION: TypedDocumentNode<
  ReferenceCommitteesByLocationQuery,
  ReferenceCommitteesByLocationQueryVariables
> = gql`
  query referenceCommitteesByLocation($locationId: String!) {
    referenceCommitteesByLocation(locationId: $locationId) {
      _id
      name
      color
      memberCount
    }
  }
`;
