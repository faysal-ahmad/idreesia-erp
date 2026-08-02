import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteHrKarkunMutation,
  DeleteHrKarkunMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_HR_KARKUN: TypedDocumentNode<
  DeleteHrKarkunMutation,
  DeleteHrKarkunMutationVariables
> = gql`
  mutation deleteHrKarkun($_id: String!) {
    deleteHrKarkun(_id: $_id)
  }
`;

export default DELETE_HR_KARKUN;
