import gql from 'graphql-tag';

const OPERATIONS_WAZEEFA_BY_ID = gql`
  query operationsWazeefaById($_id: String!) {
    operationsWazeefaById(_id: $_id) {
      _id
      name
      revisionNumber
      revisionDate
      imageIds
      images {
        _id
        name
        mimeType
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default OPERATIONS_WAZEEFA_BY_ID;
