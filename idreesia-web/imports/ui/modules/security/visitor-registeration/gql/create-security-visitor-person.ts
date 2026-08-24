import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateSecurityVisitorPersonMutation,
  CreateSecurityVisitorPersonMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_SECURITY_VISITOR_PERSON: TypedDocumentNode<
  CreateSecurityVisitorPersonMutation,
  CreateSecurityVisitorPersonMutationVariables
> = gql`
  mutation createSecurityVisitorPerson(
    $sharedData: PersonSharedDataInput!
    $visitorData: PersonVisitorDataInput
  ) {
    createSecurityVisitorPerson(
      sharedData: $sharedData
      visitorData: $visitorData
    ) {
      _id
    }
  }
`;

export default CREATE_SECURITY_VISITOR_PERSON;
