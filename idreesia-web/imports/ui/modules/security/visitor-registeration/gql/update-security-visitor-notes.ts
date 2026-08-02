import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateSecurityVisitorNotesMutation,
  UpdateSecurityVisitorNotesMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_SECURITY_VISITOR_NOTES: TypedDocumentNode<
  UpdateSecurityVisitorNotesMutation,
  UpdateSecurityVisitorNotesMutationVariables
> = gql`
  mutation updateSecurityVisitorNotes(
    $_id: String!
    $criminalRecord: String
    $otherNotes: String
  ) {
    updateSecurityVisitorNotes(
      _id: $_id
      criminalRecord: $criminalRecord
      otherNotes: $otherNotes
    ) {
      _id
      criminalRecord
      otherNotes
    }
  }
`;

export default UPDATE_SECURITY_VISITOR_NOTES;
