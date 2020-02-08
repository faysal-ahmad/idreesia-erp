import gql from 'graphql-tag';

const PORTAL_KARKUNS_BY_VISITOR = gql`
  query portalKarkunsByVisitor(
    $portalId: String!
    $visitorName: String!
    $visitorCnic: String
    $visitorPhone: String
  ) {
    portalKarkunsByVisitor(
      portalId: $portalId
      visitorName: $visitorName
      visitorCnic: $visitorCnic
      visitorPhone: $visitorPhone
    ) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        imageId
      }
    }
  }
`;

export default PORTAL_KARKUNS_BY_VISITOR;
