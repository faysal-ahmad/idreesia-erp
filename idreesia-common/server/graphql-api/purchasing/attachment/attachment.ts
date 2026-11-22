import gql from 'graphql-tag';

export default gql`
type PurchasingAttachment {
  _id: String
  ownerType: String
  ownerId: String
  name: String
  fileName: String
  mimeType: String
  size: Int

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PurchasingAttachmentUpload {
  uploadId: String
  # PUT the file here with the Content-Type below.
  url: String
  contentType: String
}

type PurchasingAttachmentDownload {
  url: String
  fileName: String
  mimeType: String
}

extend type Query {
  # ownerType is requisition, quote, order, receipt, invoice or payment. The
  # permission of that kind of document is checked in the resolver.
  purchasingAttachments(ownerType: String!, ownerId: String!): [PurchasingAttachment]
    @checkPermissions(permissions: [PURCHASING_VIEW_REQUISITIONS, PURCHASING_MANAGE_REQUISITIONS, PURCHASING_APPROVE_REQUISITIONS, PURCHASING_VIEW_ORDERS, PURCHASING_MANAGE_ORDERS, PURCHASING_APPROVE_ORDERS, PURCHASING_VIEW_RECEIPTS, PURCHASING_MANAGE_RECEIPTS, PURCHASING_VIEW_INVOICES, PURCHASING_MANAGE_INVOICES, PURCHASING_VIEW_PAYMENTS, PURCHASING_MANAGE_PAYMENTS])

  purchasingAttachmentDownload(_id: String!, inline: Boolean): PurchasingAttachmentDownload
    @checkPermissions(permissions: [PURCHASING_VIEW_REQUISITIONS, PURCHASING_MANAGE_REQUISITIONS, PURCHASING_APPROVE_REQUISITIONS, PURCHASING_VIEW_ORDERS, PURCHASING_MANAGE_ORDERS, PURCHASING_APPROVE_ORDERS, PURCHASING_VIEW_RECEIPTS, PURCHASING_MANAGE_RECEIPTS, PURCHASING_VIEW_INVOICES, PURCHASING_MANAGE_INVOICES, PURCHASING_VIEW_PAYMENTS, PURCHASING_MANAGE_PAYMENTS])
}

extend type Mutation {
  # Step 1 of an upload: get a URL, PUT the file to it, then complete.
  createPurchasingAttachmentUpload(
    ownerType: String!
    ownerId: String!
    fileName: String!
    mimeType: String!
    size: Int!
    name: String
  ): PurchasingAttachmentUpload
    @checkPermissions(permissions: [PURCHASING_MANAGE_REQUISITIONS, PURCHASING_MANAGE_ORDERS, PURCHASING_MANAGE_RECEIPTS, PURCHASING_MANAGE_INVOICES, PURCHASING_MANAGE_PAYMENTS])

  completePurchasingAttachmentUpload(uploadId: String!): PurchasingAttachment
    @checkPermissions(permissions: [PURCHASING_MANAGE_REQUISITIONS, PURCHASING_MANAGE_ORDERS, PURCHASING_MANAGE_RECEIPTS, PURCHASING_MANAGE_INVOICES, PURCHASING_MANAGE_PAYMENTS])

  abortPurchasingAttachmentUpload(uploadId: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_REQUISITIONS, PURCHASING_MANAGE_ORDERS, PURCHASING_MANAGE_RECEIPTS, PURCHASING_MANAGE_INVOICES, PURCHASING_MANAGE_PAYMENTS])

  deletePurchasingAttachment(_id: String!): Boolean
    @checkPermissions(permissions: [PURCHASING_MANAGE_REQUISITIONS, PURCHASING_MANAGE_ORDERS, PURCHASING_MANAGE_RECEIPTS, PURCHASING_MANAGE_INVOICES, PURCHASING_MANAGE_PAYMENTS])
}
`;
