import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type { DuplicatePhoneNumbersQuery } from 'meteor/idreesia-common/types/client-operations';

const DUPLICATE_PHONE_NUMBERS: TypedDocumentNode<DuplicatePhoneNumbersQuery> = gql`
  query duplicatePhoneNumbers {
    duplicatePhoneNumbers {
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

export default DUPLICATE_PHONE_NUMBERS;
