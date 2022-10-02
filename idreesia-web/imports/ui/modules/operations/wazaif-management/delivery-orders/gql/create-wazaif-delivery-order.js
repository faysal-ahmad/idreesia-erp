import gql from 'graphql-tag';

export const CREATE_WAZAIF_DELIVERY_ORDER = gql`
  mutation createWazaifDeliveryOrder(
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
    createWazaifDeliveryOrder(
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
