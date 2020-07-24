import gql from 'graphql-tag';

export const CREATE_RESIDENT = gql`
  mutation createResident(
    $sharedResidenceId: String!
    $residentId: String!
    $isOwner: Boolean!
    $roomNumber: Int
    $fromDate: String
    $toDate: String
  ) {
    createResident(
      sharedResidenceId: $sharedResidenceId
      residentId: $residentId
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
