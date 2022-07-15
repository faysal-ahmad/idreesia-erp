import gql from 'graphql-tag';

export const SET_OPERATIONS_WAZEEFA_DETAILS = gql`
  mutation setOperationsWazeefaDetails(
    $_id: String!
    $packetCount: Int
    $subCartonCount: Int
    $cartonCount: Int
  ) {
    setOperationsWazeefaDetails(
      _id: $_id
      packetCount: $packetCount
      subCartonCount: $subCartonCount
      cartonCount: $cartonCount
    ) {
      _id
      name
      revisionNumber
      revisionDate
      wazeefaDetail {
        packetCount
        subCartonCount
        cartonCount
      }
    }
  }
`;
