import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type { DuplicateCnicsQuery } from 'meteor/idreesia-common/types/client-operations';

const DUPLICATE_CNICS: TypedDocumentNode<DuplicateCnicsQuery> = gql`
  query duplicateCnics {
    duplicateCnics {
      value
      count
      people {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        imageId
        imageThumbnailId
        updatedAt
      }
    }
  }
`;

export default DUPLICATE_CNICS;
