import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  VisitorStayCardByIdQuery,
  VisitorStayCardByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const VISITOR_STAY_CARD_BY_ID: TypedDocumentNode<
  VisitorStayCardByIdQuery,
  VisitorStayCardByIdQueryVariables
> = gql`
  query visitorStayCardById($_id: String!) {
    visitorStayById(_id: $_id) {
      _id
      fromDate
      toDate
      stayReason
      stayAllowedBy
      dutyName
      shiftName
    }
  }
`;

export default VISITOR_STAY_CARD_BY_ID;
