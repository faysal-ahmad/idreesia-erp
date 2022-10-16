import gql from 'graphql-tag';

export const PAGED_WAZAIF_PRINTING_ORDERS = gql`
  query pagedWazaifPrintingOrders($queryString: String) {
    pagedWazaifPrintingOrders(queryString: $queryString) {
      totalResults
      data {
        _id
        vendorId
        orderDate
        orderedBy
        deliveryDate
        receivedBy
        status
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
      }
    }
  }
`;
