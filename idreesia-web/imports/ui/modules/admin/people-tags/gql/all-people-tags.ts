import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AllPeopleTagsQuery,
  AllPeopleTagsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_PEOPLE_TAGS: TypedDocumentNode<
  AllPeopleTagsQuery,
  AllPeopleTagsQueryVariables
> = gql`
  query allPeopleTags {
    allPeopleTags {
      _id
      name
      color
      textColor
      moduleNames
    }
  }
`;

export default ALL_PEOPLE_TAGS;
