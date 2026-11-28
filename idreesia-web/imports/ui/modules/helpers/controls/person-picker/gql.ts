import gql from 'graphql-tag';

/**
 * The fields every person picker shows. Each picker query selects
 * `totalResults` and `data { ...PickerPersonFields }`.
 */
export const PICKER_PERSON_FIELDS = gql`
  fragment PickerPersonFields on PickerPersonType {
    _id
    name
    parentName
    cnicNumber
    contactNumber1
    imageUrl
    imageThumbnailUrl
  }
`;
