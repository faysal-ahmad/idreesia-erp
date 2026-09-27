import gql from 'graphql-tag';

/** Everything a visitor row (visitor-list-item.tsx) shows. */
export const MOBILE_VISITOR_LIST_FIELDS = gql`
  fragment MobileVisitorListFields on PersonType {
    _id
    isKarkun
    sharedData {
      name
      parentName
      cnicNumber
      contactNumber1
      imageId
      imageThumbnailId
      tags {
        _id
        name
        color
        textColor
      }
    }
    visitorData {
      city
      country
      criminalRecord
      otherNotes
    }
  }
`;
