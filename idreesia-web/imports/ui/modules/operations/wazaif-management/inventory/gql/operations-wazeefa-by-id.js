import gql from 'graphql-tag';

export const OPERATIONS_WAZEEFA_BY_ID = gql`
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
      wazeefaDetail {
        packetCount
        subCartonCount
        cartonCount
      }
      currentStockLevel
      stockReconciledOn
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
