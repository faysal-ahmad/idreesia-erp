import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityEventLangarLocationByIdQuery,
  SecurityEventLangarLocationByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_EVENT_LANGAR_LOCATION_BY_ID: TypedDocumentNode<
  SecurityEventLangarLocationByIdQuery,
  SecurityEventLangarLocationByIdQueryVariables
> = gql`
  query securityEventLangarLocationById($id: String!) {
    securityEventLangarLocationById(id: $id) {
      _id
      name
      urduName
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default SECURITY_EVENT_LANGAR_LOCATION_BY_ID;
