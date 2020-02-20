import gql from 'graphql-tag';

const UPDATE_SECURITY_VISITOR_NOTES = gql`
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
