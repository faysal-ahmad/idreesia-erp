import gql from 'graphql-tag';

export default gql`
extend type Query {
  # Karkuns of the Purchasing city, to name who requested or received goods.
  pagedPurchasingKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(
      permissions: [PURCHASING_MANAGE_REQUISITIONS, PURCHASING_MANAGE_RECEIPTS]
    )
}
`;
