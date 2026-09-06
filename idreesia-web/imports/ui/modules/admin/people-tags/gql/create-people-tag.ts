import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePeopleTagMutation,
  CreatePeopleTagMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_PEOPLE_TAG: TypedDocumentNode<
  CreatePeopleTagMutation,
  CreatePeopleTagMutationVariables
> = gql`
  mutation createPeopleTag(
    $name: String!
    $color: String!
    $textColor: String!
    $moduleNames: [String]!
  ) {
    createPeopleTag(
      name: $name
      color: $color
      textColor: $textColor
      moduleNames: $moduleNames
    ) {
      _id
      name
      color
      textColor
      moduleNames
    }
  }
`;

export default CREATE_PEOPLE_TAG;
