import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  OrgLocationByIdQuery,
  OrgLocationByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ORG_LOCATION_BY_ID: TypedDocumentNode<
  OrgLocationByIdQuery,
  OrgLocationByIdQueryVariables
> = gql`
  query orgLocationById($_id: String!) {
    orgLocationById(_id: $_id) {
      _id
      name
      type
      parentId
      allParentIds
      observerKarkunIds
      mehfilDetails {
        address
        mehfilStartYear
        timingDetails
        lcdAvailability
        tabAvailability
        otherMehfilDetails
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default ORG_LOCATION_BY_ID;
