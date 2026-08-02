import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateVisitorStayMutation,
  UpdateVisitorStayMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_VISITOR_STAY: TypedDocumentNode<
  UpdateVisitorStayMutation,
  UpdateVisitorStayMutationVariables
> = gql`
  mutation updateVisitorStay(
    $_id: String!
    $fromDate: String!
    $toDate: String!
    $stayReason: String
    $stayAllowedBy: String
    $dutyId: String
    $shiftId: String
  ) {
    updateVisitorStay(
      _id: $_id
      fromDate: $fromDate
      toDate: $toDate
      stayReason: $stayReason
      stayAllowedBy: $stayAllowedBy
      dutyId: $dutyId
      shiftId: $shiftId
    ) {
      _id
      visitorId
      fromDate
      toDate
      numOfDays
      stayReason
      stayAllowedBy
      dutyId
      shiftId
    }
  }
`;

export default UPDATE_VISITOR_STAY;
