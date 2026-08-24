import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityPersonVisitorDataMutation,
  UpdateSecurityPersonVisitorDataMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_PERSON_VISITOR_DATA: TypedDocumentNode<
  UpdateSecurityPersonVisitorDataMutation,
  UpdateSecurityPersonVisitorDataMutationVariables
> = gql`
  mutation updateSecurityPersonVisitorData(
    $_id: String!
    $criminalRecord: String
    $otherNotes: String
  ) {
    updateSecurityPersonVisitorData(
      _id: $_id
      criminalRecord: $criminalRecord
      otherNotes: $otherNotes
    ) {
      _id
    }
  }
`;

export default UPDATE_SECURITY_PERSON_VISITOR_DATA;
