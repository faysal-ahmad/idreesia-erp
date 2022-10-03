import gql from 'graphql-tag';

export const ALL_WAZAIF_VENDORS = gql`
  query allWazaifVendors {
    allWazaifVendors {
      _id
      name
      contactPerson
      contactNumber
      address
      notes
      usageCount
    }
  }
`;
