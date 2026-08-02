import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateVisitorStayMutation,
  CreateVisitorStayMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_VISITOR_STAY: TypedDocumentNode<
  CreateVisitorStayMutation,
  CreateVisitorStayMutationVariables
> = gql`
  mutation createVisitorStay(
    $visitorId: String!
    $numOfDays: Float!
    $stayReason: String
    $stayAllowedBy: String
    $dutyId: String
    $shiftId: String
  ) {
    createVisitorStay(
      visitorId: $visitorId
      numOfDays: $numOfDays
      stayReason: $stayReason
      stayAllowedBy: $stayAllowedBy
      dutyId: $dutyId
      shiftId: $shiftId
    ) {
      _id
      visitorId
      fromDate
      toDate
      stayReason
      stayAllowedBy
      dutyId
      shiftId
    }
  }
`;

export default CREATE_VISITOR_STAY;
