import gql from 'graphql-tag';

export const UPDATE_RESIDENT = gql`
  mutation updateResident(
    $_id: String!
    $isOwner: Boolean!
    $roomNumber: Int
    $fromDate: String
    $toDate: String
  ) {
    updateResident(
      _id: $_id
      isOwner: $isOwner
      roomNumber: $roomNumber
      fromDate: $fromDate
      toDate: $toDate
    ) {
      _id
      sharedResidenceId
      residentId
      isOwner
      roomNumber
      fromDate
      toDate
      resident {
        _id
        name
        imageId
      }
    }
  }
`;
