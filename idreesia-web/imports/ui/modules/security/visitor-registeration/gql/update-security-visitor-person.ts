import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityVisitorPersonMutation,
  UpdateSecurityVisitorPersonMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_VISITOR_PERSON: TypedDocumentNode<
  UpdateSecurityVisitorPersonMutation,
  UpdateSecurityVisitorPersonMutationVariables
> = gql`
  mutation updateSecurityVisitorPerson(
    $_id: String!
    $sharedData: PersonSharedDataInput!
    $visitorData: PersonVisitorDataInput
  ) {
    updateSecurityVisitorPerson(
      _id: $_id
      sharedData: $sharedData
      visitorData: $visitorData
    ) {
      _id
    }
  }
`;

export default UPDATE_SECURITY_VISITOR_PERSON;
