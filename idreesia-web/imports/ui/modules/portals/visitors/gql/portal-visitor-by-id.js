import gql from 'graphql-tag';

const PORTAL_VISITOR_BY_ID = gql`
  query portalVisitorById($portalId: String!, $_id: String!) {
    portalVisitorById(portalId: $portalId, _id: $_id) {
      _id
      name
      parentName
      cnicNumber
      ehadDate
      referenceName
      contactNumber1
      contactNumber2
      address
      city
      country
      imageId
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default PORTAL_VISITOR_BY_ID;
