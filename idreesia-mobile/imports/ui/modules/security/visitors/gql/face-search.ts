import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileSecurityFaceVectorFromImageQuery,
  MobileSecurityFaceVectorFromImageQueryVariables,
  MobileSecurityVisitorsByFaceVectorQuery,
  MobileSecurityVisitorsByFaceVectorQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import { MOBILE_VISITOR_LIST_FIELDS } from './visitor-list-fields';

// Face search is two steps, as on the web: embed the photo (which reports
// whether it's usable, so the user can retake), then match the vector. The
// server discards the photo after embedding it.

export const MOBILE_SECURITY_FACE_VECTOR_FROM_IMAGE: TypedDocumentNode<
  MobileSecurityFaceVectorFromImageQuery,
  MobileSecurityFaceVectorFromImageQueryVariables
> = gql`
  query mobileSecurityFaceVectorFromImage($imageData: String!) {
    securityFaceVectorFromImage(imageData: $imageData) {
      status
      vector
    }
  }
`;

export const MOBILE_SECURITY_VISITORS_BY_FACE_VECTOR: TypedDocumentNode<
  MobileSecurityVisitorsByFaceVectorQuery,
  MobileSecurityVisitorsByFaceVectorQueryVariables
> = gql`
  query mobileSecurityVisitorsByFaceVector($vector: [Float!]!, $limit: Int) {
    securityVisitorsByFaceVector(vector: $vector, limit: $limit) {
      score
      person {
        ...MobileVisitorListFields
      }
    }
  }
  ${MOBILE_VISITOR_LIST_FIELDS}
`;
