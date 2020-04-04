import gql from 'graphql-tag';

const ACCOUNTS_IMDAD_REQUEST_BY_ID = gql`
  query accountsImdadRequestById($_id: String!) {
    accountsImdadRequestById(_id: $_id) {
      _id
      visitorId
      requestDate
      status
      notes
      visitor {
        _id
        name
      }
      attachments {
        _id
        name
        description
        mimeType
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default ACCOUNTS_IMDAD_REQUEST_BY_ID;
