import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityPersonByCnicQuery,
  SecurityPersonByCnicQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_PERSON_BY_CNIC: TypedDocumentNode<
  SecurityPersonByCnicQuery,
  SecurityPersonByCnicQueryVariables
> = gql`
  query securityPersonByCnic($cnicNumbers: [String]!) {
    securityPersonByCnic(cnicNumbers: $cnicNumbers) {
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

export default SECURITY_PERSON_BY_CNIC;
