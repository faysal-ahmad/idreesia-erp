import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileAllPeopleTagsQuery,
  MobileAllPeopleTagsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_ALL_PEOPLE_TAGS: TypedDocumentNode<
  MobileAllPeopleTagsQuery,
  MobileAllPeopleTagsQueryVariables
> = gql`
  query mobileAllPeopleTags {
    allPeopleTags {
      _id
      name
    }
  }
`;
