import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetupSecurityMehfilDutyByIdQuery,
  SetupSecurityMehfilDutyByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SETUP_SECURITY_MEHFIL_DUTY_BY_ID: TypedDocumentNode<
  SetupSecurityMehfilDutyByIdQuery,
  SetupSecurityMehfilDutyByIdQueryVariables
> = gql`
  query setupSecurityMehfilDutyById($id: String!) {
    securityMehfilDutyById(id: $id) {
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

export default SETUP_SECURITY_MEHFIL_DUTY_BY_ID;
