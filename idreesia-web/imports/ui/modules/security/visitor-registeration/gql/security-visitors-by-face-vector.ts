import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityVisitorsByFaceVectorQuery,
  SecurityVisitorsByFaceVectorQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

// Selects exactly what the result card renders, plus `score` - not displayed, but it carries the
// ordering and is the number to look at when tuning the match threshold.
const SECURITY_VISITORS_BY_FACE_VECTOR: TypedDocumentNode<
  SecurityVisitorsByFaceVectorQuery,
  SecurityVisitorsByFaceVectorQueryVariables
> = gql`
  query securityVisitorsByFaceVector($vector: [Float!]!, $limit: Int) {
    securityVisitorsByFaceVector(vector: $vector, limit: $limit) {
      score
      person {
        _id
        sharedData {
          name
          parentName
          cnicNumber
          imageId
        }
        visitorData {
          city
        }
      }
    }
  }
`;

export default SECURITY_VISITORS_BY_FACE_VECTOR;
