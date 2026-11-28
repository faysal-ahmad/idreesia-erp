import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetupSecurityEventDutyByIdQuery,
  SetupSecurityEventDutyByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SETUP_SECURITY_EVENT_DUTY_BY_ID: TypedDocumentNode<
  SetupSecurityEventDutyByIdQuery,
  SetupSecurityEventDutyByIdQueryVariables
> = gql`
  query setupSecurityEventDutyById($id: String!) {
    securityEventDutyById(id: $id) {
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

export default SETUP_SECURITY_EVENT_DUTY_BY_ID;
