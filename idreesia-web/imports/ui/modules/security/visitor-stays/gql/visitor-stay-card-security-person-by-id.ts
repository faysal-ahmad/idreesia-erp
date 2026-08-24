import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  VisitorStayCardSecurityPersonByIdQuery,
  VisitorStayCardSecurityPersonByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const VISITOR_STAY_CARD_SECURITY_PERSON_BY_ID: TypedDocumentNode<
  VisitorStayCardSecurityPersonByIdQuery,
  VisitorStayCardSecurityPersonByIdQueryVariables
> = gql`
  query visitorStayCardSecurityPersonById($_id: String!) {
    securityPersonById(_id: $_id) {
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

export default VISITOR_STAY_CARD_SECURITY_PERSON_BY_ID;
