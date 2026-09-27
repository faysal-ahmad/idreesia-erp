import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileSecurityVisitorByIdQuery,
  MobileSecurityVisitorByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

/** Everything the visitor detail screen (visitor-detail-screen.tsx) shows. */
export const MOBILE_SECURITY_VISITOR_BY_ID: TypedDocumentNode<
  MobileSecurityVisitorByIdQuery,
  MobileSecurityVisitorByIdQueryVariables
> = gql`
  query mobileSecurityVisitorById($_id: String!) {
    securityVisitorById(_id: $_id) {
      _id
      sharedData {
        name
        parentName
        cnicNumber
        birthDate
        ehadDate
        referenceName
        contactNumber1
        contactNumber2
        currentAddress
        permanentAddress
        educationalQualification
        meansOfEarning
        imageId
        imageThumbnailId
        tags {
          _id
          name
          color
          textColor
        }
      }
      visitorData {
        city
        country
        criminalRecord
        otherNotes
      }
      deletedAt
    }
  }
`;
