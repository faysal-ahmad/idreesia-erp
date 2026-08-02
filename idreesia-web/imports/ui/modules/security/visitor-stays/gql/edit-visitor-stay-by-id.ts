import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  EditVisitorStayByIdQuery,
  EditVisitorStayByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const EDIT_VISITOR_STAY_BY_ID: TypedDocumentNode<
  EditVisitorStayByIdQuery,
  EditVisitorStayByIdQueryVariables
> = gql`
  query editVisitorStayById($_id: String!) {
    visitorStayById(_id: $_id) {
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

export default EDIT_VISITOR_STAY_BY_ID;
