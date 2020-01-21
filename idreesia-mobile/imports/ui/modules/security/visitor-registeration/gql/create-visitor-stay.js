import gql from 'graphql-tag';

const CREATE_VISITOR_STAY = gql`
  mutation createVisitorStay(
    $visitorId: String!
    $numOfDays: Float!
    $stayReason: String
    $stayAllowedBy: String
    $dutyId: String
    $shiftId: String
    $teamName: String
  ) {
    createVisitorStay(
      visitorId: $visitorId
      numOfDays: $numOfDays
      stayReason: $stayReason
      stayAllowedBy: $stayAllowedBy
      dutyId: $dutyId
      shiftId: $shiftId
      teamName: $teamName
    ) {
      _id
      visitorId
      fromDate
      toDate
      stayReason
      stayAllowedBy
      dutyId
      shiftId
      teamName
    }
  }
`;

export default CREATE_VISITOR_STAY;
