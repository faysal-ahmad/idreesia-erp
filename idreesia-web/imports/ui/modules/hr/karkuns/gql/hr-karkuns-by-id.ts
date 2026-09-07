import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HrKarkunsByIdQuery,
  HrKarkunsByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const HR_KARKUNS_BY_ID: TypedDocumentNode<
  HrKarkunsByIdQuery,
  HrKarkunsByIdQueryVariables
> = gql`
  query hrKarkunsById($_ids: String!) {
    hrKarkunsById(_ids: $_ids) {
      _id
      sharedData {
        name
        parentName
        cnicNumber
        imageId
        contactNumber1
        contactNumber2
        image {
          _id
          data
        }
        imageThumbnail {
          _id
          data
        }
      }
      karkunData {
        duties {
          _id
          dutyName
          shiftName
          locationName
        }
      }
      employeeData {
        job {
          _id
          name
        }
      }
    }
  }
`;

export default HR_KARKUNS_BY_ID;
