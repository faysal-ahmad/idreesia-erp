import gql from 'graphql-tag';

export default gql`
extend type Query {
  # People to name on a store form (who purchased, received, issued, ...).
  # predefinedFilterName lists the people used on the store's forms before.
  pagedStoreKarkuns(
    name: String
    cnicNumber: String
    phoneNumber: String
    predefinedFilterName: String
    predefinedFilterStoreId: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
    @checkPermissions(
      anyStorePermissions: [
        IN_VIEW_ISSUANCE_FORMS, IN_MANAGE_ISSUANCE_FORMS,
        IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS,
        IN_VIEW_STOCK_ADJUSTMENTS, IN_MANAGE_STOCK_ADJUSTMENTS,
        IN_MANAGE_REQUISITIONS, IN_MANAGE_RECEIPTS
      ]
    )
}
`;
