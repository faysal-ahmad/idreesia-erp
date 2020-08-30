import gql from 'graphql-tag';

export const SHARED_RESIDENCE_BY_ID = gql`
  query sharedResidenceById($_id: String!) {
    sharedResidenceById(_id: $_id) {
      _id
      name
      address
      createdAt
      createdBy
      updatedAt
      updatedBy
      attachments {
        _id
        name
        description
        mimeType
      }
      residents {
        _id
        isOwner
        roomNumber
        fromDate
        toDate
        resident {
          _id
          name
          imageId
        }
      }
    }
  }
`;
