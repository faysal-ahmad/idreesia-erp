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
        contactNumber1
        contactNumber2
        imageId
      }
      visitorData {
        city
        country
      }
    }
  }
`;

export default SECURITY_VISITOR_BY_CNIC;
