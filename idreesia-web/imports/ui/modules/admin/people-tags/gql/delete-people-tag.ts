import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeletePeopleTagMutation,
  DeletePeopleTagMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_PEOPLE_TAG: TypedDocumentNode<
  DeletePeopleTagMutation,
  DeletePeopleTagMutationVariables
> = gql`
  mutation deletePeopleTag($_id: String!) {
    deletePeopleTag(_id: $_id)
  }
`;

export default DELETE_PEOPLE_TAG;
