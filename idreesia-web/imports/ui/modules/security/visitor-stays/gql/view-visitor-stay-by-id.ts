import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ViewVisitorStayByIdQuery,
  ViewVisitorStayByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const VIEW_VISITOR_STAY_BY_ID: TypedDocumentNode<
  ViewVisitorStayByIdQuery,
  ViewVisitorStayByIdQueryVariables
> = gql`
  query viewVisitorStayById($_id: String!) {
    visitorStayById(_id: $_id) {
      _id
      visitorId
      fromDate
      toDate
      numOfDays
      stayReason
      stayAllowedBy
      dutyShiftName
    }
  }
`;

export default VIEW_VISITOR_STAY_BY_ID;
