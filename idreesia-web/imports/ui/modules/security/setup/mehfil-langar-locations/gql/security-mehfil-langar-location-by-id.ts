import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityMehfilLangarLocationByIdQuery,
  SecurityMehfilLangarLocationByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_MEHFIL_LANGAR_LOCATION_BY_ID: TypedDocumentNode<
  SecurityMehfilLangarLocationByIdQuery,
  SecurityMehfilLangarLocationByIdQueryVariables
> = gql`
  query securityMehfilLangarLocationById($id: String!) {
    securityMehfilLangarLocationById(id: $id) {
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

export default SECURITY_MEHFIL_LANGAR_LOCATION_BY_ID;
