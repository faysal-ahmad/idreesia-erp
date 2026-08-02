import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CancelVisitorStayMutation,
  CancelVisitorStayMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CANCEL_VISITOR_STAY: TypedDocumentNode<
  CancelVisitorStayMutation,
  CancelVisitorStayMutationVariables
> = gql`
  mutation cancelVisitorStay($_id: String!) {
    cancelVisitorStay(_id: $_id) {
      _id
      visitorId
      fromDate
      toDate
      numOfDays
      stayReason
      cancelledDate
    }
  }
`;

export default CANCEL_VISITOR_STAY;
