import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  VisitorStayCardSecurityVisitorByIdQuery,
  VisitorStayCardSecurityVisitorByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const VISITOR_STAY_CARD_SECURITY_VISITOR_BY_ID: TypedDocumentNode<
  VisitorStayCardSecurityVisitorByIdQuery,
  VisitorStayCardSecurityVisitorByIdQueryVariables
> = gql`
  query visitorStayCardSecurityVisitorById($_id: String!) {
    securityVisitorById(_id: $_id) {
      _id
      sharedData {
        name
        parentName
        cnicNumber
        referenceName
        contactNumber1
        image {
          _id
          data
        }
      }
      visitorData {
        city
        country
        criminalRecord
      }
    }
  }
`;

export default VISITOR_STAY_CARD_SECURITY_VISITOR_BY_ID;
