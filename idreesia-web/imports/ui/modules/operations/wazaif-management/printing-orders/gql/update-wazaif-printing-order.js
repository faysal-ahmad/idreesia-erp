import gql from 'graphql-tag';

export const UPDATE_WAZAIF_PRINTING_ORDER = gql`
  mutation updateWazaifPrintingOrder(
    $_id: String!
    $vendorId: String!
    $orderDate: String
    $orderedBy: String!
    $deliveryDate: String
    $receivedBy: String
    $items: [WazeefaWithQuantityInput]
    $status: String
    $notes: String
  ) {
    updateWazaifPrintingOrder(
      _id: $_id
      vendorId: $vendorId
      orderDate: $orderDate
      orderedBy: $orderedBy
      deliveryDate: $deliveryDate
      receivedBy: $receivedBy
      items: $items
      status: $status
      notes: $notes
    ) {
      _id
      vendorId
      orderDate
      orderedBy
      deliveryDate
      receivedBy
      items {
        wazeefaId
        formattedName
        packets
        wazaifCount
      }
      status
      notes
    }
  }
`;
