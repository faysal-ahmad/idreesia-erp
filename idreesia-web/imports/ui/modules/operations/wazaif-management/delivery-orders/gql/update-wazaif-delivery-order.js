import gql from 'graphql-tag';

export const UPDATE_WAZAIF_DELIVERY_ORDER = gql`
  mutation updateWazaifDeliveryOrder(
    $_id: String!
    $cityId: String!
    $cityMehfilId: String
    $requestedDate: String!
    $requestedBy: String!
    $deliveryDate: String
    $deliveredTo: String
    $items: [WazeefaWithQuantityInput]
    $status: String
    $notes: String
  ) {
    updateWazaifDeliveryOrder(
      _id: $_id
      cityId: $cityId
      cityMehfilId: $cityMehfilId
      requestedDate: $requestedDate
      requestedBy: $requestedBy
      deliveryDate: $deliveryDate
      deliveredTo: $deliveredTo
      items: $items
      status: $status
      notes: $notes
    ) {
      _id
      cityId
      cityMehfilId
      requestedDate
      requestedBy
      deliveryDate
      deliveredTo
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
