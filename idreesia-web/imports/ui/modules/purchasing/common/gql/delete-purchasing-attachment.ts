import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeletePurchasingAttachmentMutation,
  DeletePurchasingAttachmentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_PURCHASING_ATTACHMENT: TypedDocumentNode<
  DeletePurchasingAttachmentMutation,
  DeletePurchasingAttachmentMutationVariables
> = gql`
  mutation deletePurchasingAttachment($_id: String!) {
    deletePurchasingAttachment(_id: $_id)
  }
`;

export default DELETE_PURCHASING_ATTACHMENT;
