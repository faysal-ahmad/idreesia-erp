import gql from 'graphql-tag';

export const WAZAIF_PRINTING_ORDER_BY_ID = gql`
  query wazaifPrintingOrderById($_id: String!) {
    wazaifPrintingOrderById(_id: $_id) {
      _id
      vendorId
      orderDate
      orderedBy
      deliveryDate
      receivedBy
      status
      notes
      refVendor {
        _id
        name
      }
      refOrderedBy {
        _id
        sharedData {
          name
        }
      }
      refReceivedBy {
        _id
        sharedData {
          name
        }
      }
      items {
        wazeefaId
        formattedName
        packets
        wazaifCount
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
