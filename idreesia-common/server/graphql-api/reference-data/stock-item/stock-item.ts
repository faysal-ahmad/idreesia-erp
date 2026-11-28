import gql from 'graphql-tag';

// Stock items are owned by Stores. Purchasing's petty cash vouchers can put a
// purchased item into a store's stock, so its form picks the item here. Stores
// itself uses pagedStockItems. Keep this type free of levels, people and audit
// fields.
export default gql`
type ReferenceStockItemType {
  _id: String
  name: String
  unitOfMeasurement: String
  physicalStoreId: String
}

extend type Query {
  # Consumers: Purchasing petty cash vouchers.
  referenceStockItems(physicalStoreId: String!, name: String): [ReferenceStockItemType]
    @checkPermissions(permissions: [PURCHASING_MANAGE_PETTY_CASH_VOUCHERS])
}
`;
