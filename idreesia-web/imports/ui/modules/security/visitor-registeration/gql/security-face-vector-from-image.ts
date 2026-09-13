import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityFaceVectorFromImageQuery,
  SecurityFaceVectorFromImageQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_FACE_VECTOR_FROM_IMAGE: TypedDocumentNode<
  SecurityFaceVectorFromImageQuery,
  SecurityFaceVectorFromImageQueryVariables
> = gql`
  query securityFaceVectorFromImage($imageData: String!) {
    securityFaceVectorFromImage(imageData: $imageData) {
      status
      vector
    }
  }
`;

export default SECURITY_FACE_VECTOR_FROM_IMAGE;
