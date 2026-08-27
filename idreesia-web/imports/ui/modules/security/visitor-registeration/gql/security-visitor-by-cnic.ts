import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityVisitorByCnicQuery,
  SecurityVisitorByCnicQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_VISITOR_BY_CNIC: TypedDocumentNode<
  SecurityVisitorByCnicQuery,
  SecurityVisitorByCnicQueryVariables
> = gql`
  query securityVisitorByCnic($cnicNumbers: [String]!) {
    securityVisitorByCnic(cnicNumbers: $cnicNumbers) {
      _id
      sharedData {
        name
        parentName
        cnicNumber
        ehadDate
        birthDate
        referenceName
        contactNumber1
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
`;

export default SECURITY_VISITOR_BY_CNIC;
