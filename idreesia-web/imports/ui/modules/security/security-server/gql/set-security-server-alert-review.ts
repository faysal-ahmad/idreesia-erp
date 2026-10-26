import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetSecurityServerAlertReviewMutation,
  SetSecurityServerAlertReviewMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_SECURITY_SERVER_ALERT_REVIEW: TypedDocumentNode<
  SetSecurityServerAlertReviewMutation,
  SetSecurityServerAlertReviewMutationVariables
> = gql`
  mutation setSecurityServerAlertReview($_id: String!, $review: String) {
    setSecurityServerAlertReview(_id: $_id, review: $review) {
      _id
      review
      reviewedAt
      updatedAt
      updatedBy
    }
  }
`;

export default SET_SECURITY_SERVER_ALERT_REVIEW;
