import gql from 'graphql-tag';

const UPDATE_PORTAL_VISITOR = gql`
  mutation updatePortalVisitor(
    $portalId: String!
    $_id: String!
    $name: String!
    $parentName: String!
    $cnicNumber: String!
    $ehadDate: String!
    $referenceName: String!
    $contactNumber1: String
    $contactNumber2: String
    $address: String
    $city: String
    $country: String
  ) {
    updatePortalVisitor(
      portalId: $portalId
      _id: $_id
      name: $name
      parentName: $parentName
      cnicNumber: $cnicNumber
      ehadDate: $ehadDate
      referenceName: $referenceName
      contactNumber1: $contactNumber1
      contactNumber2: $contactNumber2
      address: $address
      city: $city
      country: $country
    ) {
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
    }
  }
`;

export default UPDATE_PORTAL_VISITOR;
