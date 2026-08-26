import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetSecurityVisitorImageMutation,
  SetSecurityVisitorImageMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_SECURITY_VISITOR_IMAGE: TypedDocumentNode<
  SetSecurityVisitorImageMutation,
  SetSecurityVisitorImageMutationVariables
> = gql`
  mutation setSecurityVisitorImage($_id: String!, $imageId: String!) {
    setSecurityVisitorImage(_id: $_id, imageId: $imageId) {
      _id
      sharedData {
        imageId
      }
    }
  }
`;

export default SET_SECURITY_VISITOR_IMAGE;
