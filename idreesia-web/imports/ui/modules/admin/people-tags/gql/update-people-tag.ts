import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdatePeopleTagMutation,
  UpdatePeopleTagMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_PEOPLE_TAG: TypedDocumentNode<
  UpdatePeopleTagMutation,
  UpdatePeopleTagMutationVariables
> = gql`
  mutation updatePeopleTag(
    $_id: String!
    $name: String!
    $color: String!
    $textColor: String!
    $moduleNames: [String]!
  ) {
    updatePeopleTag(
      _id: $_id
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

export default UPDATE_PEOPLE_TAG;
