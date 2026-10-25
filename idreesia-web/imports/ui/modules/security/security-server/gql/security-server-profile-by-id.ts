import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityServerProfileByIdQuery,
  SecurityServerProfileByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_SERVER_PROFILE_BY_ID: TypedDocumentNode<
  SecurityServerProfileByIdQuery,
  SecurityServerProfileByIdQueryVariables
> = gql`
  query securityServerProfileById($_id: String!) {
    securityServerProfileById(_id: $_id) {
      _id
      externalId
      name
      isTest
      alertsCount
      externalCreatedAt
      externalUpdatedAt
      deletedAt
      images {
        externalId
        imageUrl
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default SECURITY_SERVER_PROFILE_BY_ID;
