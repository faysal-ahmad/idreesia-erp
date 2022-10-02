import gql from 'graphql-tag';

export const PAGED_WAZAIF_DELIVERY_ORDERS = gql`
  query pagedWazaifDeliveryOrders($queryString: String) {
    pagedWazaifDeliveryOrders(queryString: $queryString) {
      totalResults
      data {
        _id
        cityId
        cityMehfilId
        requestedDate
        requestedBy
        deliveryDate
        deliveredTo
        status
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
      }
    }
  }
`;
