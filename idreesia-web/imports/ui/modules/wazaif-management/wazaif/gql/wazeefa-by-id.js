import gql from 'graphql-tag';

const WAZEEFA_BY_ID = gql`
  query wazeefaById($_id: String!) {
    wazeefaById(_id: $_id) {
      _id
      name
      revisionNumber
      revisionDate
      imageIds
      images {
        _id
        name
        mimeType
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default WAZEEFA_BY_ID;
