import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileUpdateLoginTimeMutation,
  MobileUpdateLoginTimeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_UPDATE_LOGIN_TIME: TypedDocumentNode<
  MobileUpdateLoginTimeMutation,
  MobileUpdateLoginTimeMutationVariables
> = gql`
  mutation mobileUpdateLoginTime {
    updateLoginTime
  }
`;
