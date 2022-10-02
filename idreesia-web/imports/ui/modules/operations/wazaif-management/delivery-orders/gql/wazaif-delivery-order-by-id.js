import gql from 'graphql-tag';

export const WAZAIF_DELIVERY_ORDER_BY_ID = gql`
  query wazaifDeliveryOrderById($_id: String!) {
    wazaifDeliveryOrderById(_id: $_id) {
      _id
      cityId
      cityMehfilId
      requestedDate
      requestedBy
      deliveryDate
      deliveredTo
      status
      notes
      refCity {
        _id
        name
      }
      refCityMehfil {
        _id
        name
      }
      refRequestedBy {
        _id
        sharedData {
          name
        }
      }
      refDeliveredTo {
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
