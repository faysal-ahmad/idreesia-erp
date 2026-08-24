import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetSecurityPersonImageMutation,
  SetSecurityPersonImageMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_SECURITY_PERSON_IMAGE: TypedDocumentNode<
  SetSecurityPersonImageMutation,
  SetSecurityPersonImageMutationVariables
> = gql`
  mutation setSecurityPersonImage($_id: String!, $imageId: String!) {
    setSecurityPersonImage(_id: $_id, imageId: $imageId) {
      _id
      sharedData {
        imageId
      }
    }
  }
`;

export default SET_SECURITY_PERSON_IMAGE;
