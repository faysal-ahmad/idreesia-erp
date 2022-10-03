import gql from 'graphql-tag';

export const WAZAIF_VENDOR_BY_ID = gql`
  query wazaifVendorById($_id: String!) {
    wazaifVendorById(_id: $_id) {
      _id
      name
      contactPerson
      contactNumber
      address
      notes
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
