import gql from 'graphql-tag';

export const CREATE_WAZAIF_PRINTING_ORDER = gql`
  mutation createWazaifPrintingOrder(
    $vendorId: String!
    $orderDate: String
    $orderedBy: String!
    $deliveryDate: String
    $receivedBy: String
    $items: [WazeefaWithQuantityInput]
    $status: String
    $notes: String
  ) {
    createWazaifPrintingOrder(
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
