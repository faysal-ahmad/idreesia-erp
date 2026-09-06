import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  VerificationVisitorStayByIdQuery,
  VerificationVisitorStayByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const VERIFICATION_VISITOR_STAY_BY_ID: TypedDocumentNode<
  VerificationVisitorStayByIdQuery,
  VerificationVisitorStayByIdQueryVariables
> = gql`
  query verificationVisitorStayById($_id: String!) {
    visitorStayById(_id: $_id) {
      _id
      visitorId
      fromDate
      toDate
      numOfDays
      stayReason
      stayAllowedBy
      dutyName
      shiftName
      cancelledDate
      isValid
      refVisitor {
        _id
        sharedData {
          name
          parentName
          referenceName
          cnicNumber
          contactNumber1
          contactNumber2
          imageId
        }
        visitorData {
          city
          country
          criminalRecord
          otherNotes
        }
      }
    }
  }
`;

export default VERIFICATION_VISITOR_STAY_BY_ID;
