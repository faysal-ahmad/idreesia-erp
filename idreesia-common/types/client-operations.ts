/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './graphql';

export type AuditLogFilter = {
  entityId?: string | null | undefined;
  operationBy?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
};

export type CityFilter = {
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  peripheryOf?: string | null | undefined;
  region?: string | null | undefined;
};

export type DaGeoLocationInput = {
  accuracy?: number | null | undefined;
  latitude: number;
  longitude: number;
};

export type InboxConversationFilter = {
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  searchText?: string | null | undefined;
};

export type ItemWithQuantityAndPriceInput = {
  isInflow?: boolean | null | undefined;
  price?: number | null | undefined;
  quantity?: number | null | undefined;
  stockItemId?: string | null | undefined;
};

export type ItemWithQuantityInput = {
  isInflow?: boolean | null | undefined;
  quantity?: number | null | undefined;
  stockItemId?: string | null | undefined;
};

export type JobLogsFilterType = {
  event?: string | null | undefined;
  jobName?: string | null | undefined;
  level?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
};

export type KarkunFilter = {
  attendance?: string | null | undefined;
  bloodGroup?: string | null | undefined;
  cityLocationId?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  dutyId?: string | null | undefined;
  dutyShiftId?: string | null | undefined;
  ehadKarkun?: string | null | undefined;
  isEmployee?: boolean | null | undefined;
  isKarkun?: boolean | null | undefined;
  isVisitor?: boolean | null | undefined;
  jobId?: string | null | undefined;
  lastTarteeb?: string | null | undefined;
  mehfilLocationId?: string | null | undefined;
  name?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  predefinedFilterName?: string | null | undefined;
  predefinedFilterStoreId?: string | null | undefined;
  region?: string | null | undefined;
  updatedBetween?: string | null | undefined;
  userAccount?: string | null | undefined;
};

export type OrgLocationMehfilDetailsInput = {
  address?: string | null | undefined;
  attendanceGeofenceMeters?: number | null | undefined;
  latitude?: number | null | undefined;
  lcdAvailability?: boolean | null | undefined;
  longitude?: number | null | undefined;
  mehfilStartYear?: string | null | undefined;
  otherMehfilDetails?: string | null | undefined;
  tabAvailability?: boolean | null | undefined;
  timingDetails?: string | null | undefined;
};

export type PersonFilter = {
  additionalInfo?: string | null | undefined;
  city?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  dataSource?: string | null | undefined;
  ehadDate?: string | null | undefined;
  ehadDuration?: string | null | undefined;
  name?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  tagId?: string | null | undefined;
  updatedBetween?: string | null | undefined;
};

export type PurchasingAuditLogFilter = {
  entityId?: string | null | undefined;
  entityTypes?: Array<string | null | undefined> | null | undefined;
  fromDate?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  toDate?: string | null | undefined;
};

export type PurchasingPaymentAllocationInput = {
  amount: number;
  invoiceId: string;
};

export type PurchasingPricedLineInput = {
  _id?: string | null | undefined;
  catalogItemId?: string | null | undefined;
  description?: string | null | undefined;
  orderLineId?: string | null | undefined;
  quantity: number;
  taxRate?: number | null | undefined;
  unit?: string | null | undefined;
  unitPrice: number;
};

export type PurchasingReceiptLineInput = {
  orderLineId: string;
  receivedQuantity: number;
  rejectedQuantity?: number | null | undefined;
  remarks?: string | null | undefined;
};

export type PurchasingRequisitionLineInput = {
  _id?: string | null | undefined;
  catalogItemId?: string | null | undefined;
  description?: string | null | undefined;
  estimatedUnitPrice?: number | null | undefined;
  quantity: number;
  unit?: string | null | undefined;
};

export type ScheduledJobsFilterType = {
  name?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  status?: string | null | undefined;
};

export type SecurityLogFilter = {
  dataSource?: string | null | undefined;
  endTime?: string | null | undefined;
  operationType?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  startTime?: string | null | undefined;
  userId?: string | null | undefined;
};

export type SecurityServerAlertFilter = {
  channelId?: string | null | undefined;
  endDate?: string | null | undefined;
  includeTest?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  profileId?: string | null | undefined;
  review?: string | null | undefined;
  startDate?: string | null | undefined;
};

export type SecurityServerChannelConnectionInput = {
  host: string;
  password?: string | null | undefined;
  path?: string | null | undefined;
  port?: number | null | undefined;
  username?: string | null | undefined;
};

export type SecurityServerProfileFilter = {
  includeDeleted?: string | null | undefined;
  includeTest?: string | null | undefined;
  name?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
};

export type UserFilter = {
  moduleAccess?: string | null | undefined;
  name?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  serviceAccounts?: string | null | undefined;
  showActive?: string | null | undefined;
  showInactive?: string | null | undefined;
  showLocked?: string | null | undefined;
  showUnlocked?: string | null | undefined;
};

export type VisitorFilter = {
  additionalInfo?: string | null | undefined;
  city?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  dataSource?: string | null | undefined;
  ehadDate?: string | null | undefined;
  ehadDuration?: string | null | undefined;
  name?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  tagId?: string | null | undefined;
  updatedBetween?: string | null | undefined;
};

export type WorkspaceMeetingActionItemInput = {
  agendaItemId?: string | null | undefined;
  assigneeId?: string | null | undefined;
  description?: string | null | undefined;
  dueDate?: string | null | undefined;
  title: string;
};

export type WorkspaceMeetingAgendaItemInput = {
  description?: string | null | undefined;
  durationMinutes?: number | null | undefined;
  presenterId?: string | null | undefined;
  title: string;
};

export type WorkspaceMeetingAttendanceInput = {
  note?: string | null | undefined;
  participantId: string;
  status?: string | null | undefined;
};

export type WorkspaceMeetingInput = {
  description?: string | null | undefined;
  endsAt: string;
  location?: string | null | undefined;
  startsAt: string;
  title: string;
  videoCall?: boolean | null | undefined;
};

export type WorkspacePollAnswerInput = {
  optionIds?: Array<string | null | undefined> | null | undefined;
  questionId: string;
};

export type WorkspacePollInput = {
  anonymous?: boolean | null | undefined;
  closesAt: string;
  description?: string | null | undefined;
  questions?: Array<WorkspacePollQuestionInput | null | undefined> | null | undefined;
  title: string;
};

export type WorkspacePollOptionInput = {
  _id?: string | null | undefined;
  text: string;
};

export type WorkspacePollQuestionInput = {
  _id?: string | null | undefined;
  description?: string | null | undefined;
  maxChoices?: number | null | undefined;
  minChoices?: number | null | undefined;
  options: Array<WorkspacePollOptionInput | null | undefined>;
  required?: boolean | null | undefined;
  text: string;
  type?: string | null | undefined;
};

export type WorkspaceProjectInput = {
  description?: string | null | undefined;
  objective?: string | null | undefined;
  participantIds?: Array<string | null | undefined> | null | undefined;
  startDate?: string | null | undefined;
  tags?: Array<string | null | undefined> | null | undefined;
  targetDate?: string | null | undefined;
  title: string;
};

export type WorkspaceTaskInput = {
  assigneeId?: string | null | undefined;
  description?: string | null | undefined;
  dueDate?: string | null | undefined;
  priority?: string | null | undefined;
  projectId?: string | null | undefined;
  tags?: Array<string | null | undefined> | null | undefined;
  title: string;
};

export type CommonAllCitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type CommonAllCitiesQuery = { allCities: Array<{ _id: string | null, name: string | null, peripheryOf: string | null, country: string | null } | null> | null };

export type CommonAllCityMehfilLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type CommonAllCityMehfilLocationsQuery = { referenceCityMehfilLocations: Array<{ _id: string | null, name: string | null, type: string | null, parentId: string | null } | null> | null };

export type CommonAllCityMehfilsQueryVariables = Exact<{ [key: string]: never; }>;


export type CommonAllCityMehfilsQuery = { allCityMehfils: Array<{ _id: string | null, cityId: string | null, name: string | null, address: string | null } | null> | null };

export type CommonCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CommonCurrentUserQuery = { currentUser: { _id: string | null, username: string | null, displayName: string | null, isSuperAdmin: boolean | null, permissions: Array<string | null> | null, instances: Array<string | null> | null, karkun: { _id: string | null, sharedData: { name: string | null, imageUrl: string | null } | null } | null } | null };

export type ReferenceDutyShiftsQueryVariables = Exact<{ [key: string]: never; }>;


export type ReferenceDutyShiftsQuery = { referenceDutyShifts: Array<{ _id: string | null, dutyId: string | null, name: string | null } | null> | null };

export type ReferenceMsDutiesQueryVariables = Exact<{ [key: string]: never; }>;


export type ReferenceMsDutiesQuery = { referenceMsDuties: Array<{ _id: string | null, name: string | null } | null> | null };

export type ReferencePhysicalStoresQueryVariables = Exact<{ [key: string]: never; }>;


export type ReferencePhysicalStoresQuery = { referencePhysicalStores: Array<{ _id: string | null, name: string | null, address: string | null } | null> | null };

export type SecurityDistinctCitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type SecurityDistinctCitiesQuery = { distinctCities: Array<string | null> | null };

export type SecurityDistinctCountriesQueryVariables = Exact<{ [key: string]: never; }>;


export type SecurityDistinctCountriesQuery = { distinctCountries: Array<string | null> | null };

export type SecurityDistinctStayAllowedByQueryVariables = Exact<{ [key: string]: never; }>;


export type SecurityDistinctStayAllowedByQuery = { distinctStayAllowedBy: Array<string | null> | null };

export type MobilePurchasingAttachmentsQueryVariables = Exact<{
  ownerType: string;
  ownerId: string;
}>;


export type MobilePurchasingAttachmentsQuery = { purchasingAttachments: Array<{ _id: string | null, name: string | null, fileName: string | null, mimeType: string | null, size: number | null, createdAt: string | null } | null> | null };

export type MobilePurchasingAttachmentDownloadQueryVariables = Exact<{
  _id: string;
  inline?: boolean | null | undefined;
}>;


export type MobilePurchasingAttachmentDownloadQuery = { purchasingAttachmentDownload: { url: string | null, fileName: string | null, mimeType: string | null } | null };

export type MobilePurchasingCreateAttachmentUploadMutationVariables = Exact<{
  ownerType: string;
  ownerId: string;
  fileName: string;
  mimeType: string;
  size: number;
  name?: string | null | undefined;
}>;


export type MobilePurchasingCreateAttachmentUploadMutation = { createPurchasingAttachmentUpload: { uploadId: string | null, url: string | null, contentType: string | null } | null };

export type MobilePurchasingCompleteAttachmentUploadMutationVariables = Exact<{
  uploadId: string;
}>;


export type MobilePurchasingCompleteAttachmentUploadMutation = { completePurchasingAttachmentUpload: { _id: string | null } | null };

export type MobilePurchasingAbortAttachmentUploadMutationVariables = Exact<{
  uploadId: string;
}>;


export type MobilePurchasingAbortAttachmentUploadMutation = { abortPurchasingAttachmentUpload: boolean | null };

export type MobilePurchasingDeleteAttachmentMutationVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingDeleteAttachmentMutation = { deletePurchasingAttachment: boolean | null };

export type MobilePurchasingDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type MobilePurchasingDashboardQuery = { purchasingDashboard: { requisitionsAwaitingApproval: number | null, ordersAwaitingApproval: number | null, openOrders: number | null, overdueInvoices: number | null, totalPayable: number | null, overdueAmount: number | null } | null };

export type MobilePurchasingPayablesAgingQueryVariables = Exact<{ [key: string]: never; }>;


export type MobilePurchasingPayablesAgingQuery = { purchasingPayablesAging: Array<{ vendorId: string | null, current: number | null, days1To30: number | null, days31To60: number | null, days61Plus: number | null, total: number | null, vendor: { _id: string | null, name: string | null } | null } | null> | null };

export type MobilePurchasingPagedInvoicesQueryVariables = Exact<{
  search?: string | null | undefined;
  status?: string | null | undefined;
  overdue?: boolean | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobilePurchasingPagedInvoicesQuery = { pagedPurchasingInvoices: { totalResults: number | null, data: Array<{ _id: string | null, number: string | null, vendorInvoiceNo: string | null, status: string | null, isDisputed: boolean | null, invoiceDate: string | null, dueDate: string | null, total: number | null, balance: number | null, vendor: { _id: string | null, name: string | null } | null } | null> | null } | null };

export type MobilePurchasingInvoiceByIdQueryVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingInvoiceByIdQuery = { purchasingInvoiceById: { _id: string | null, number: string | null, vendorInvoiceNo: string | null, status: string | null, isDisputed: boolean | null, invoiceDate: string | null, dueDate: string | null, notes: string | null, subtotal: number | null, taxTotal: number | null, total: number | null, paidAmount: number | null, balance: number | null, vendor: { _id: string | null, name: string | null } | null, order: { _id: string | null, number: string | null } | null, lines: Array<{ _id: string | null, description: string | null, unit: string | null, quantity: number | null, unitPrice: number | null, taxRate: number | null } | null> | null } | null };

export type MobilePurchasingPagedOrdersQueryVariables = Exact<{
  search?: string | null | undefined;
  status?: string | null | undefined;
  statuses?: Array<string | null | undefined> | string | null | undefined;
  vendorId?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobilePurchasingPagedOrdersQuery = { pagedPurchasingOrders: { totalResults: number | null, data: Array<{ _id: string | null, number: string | null, status: string | null, orderDate: string | null, expectedDeliveryDate: string | null, total: number | null, vendor: { _id: string | null, name: string | null } | null } | null> | null } | null };

export type MobilePurchasingOrderByIdQueryVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingOrderByIdQuery = { purchasingOrderById: { _id: string | null, number: string | null, status: string | null, version: number | null, orderDate: string | null, expectedDeliveryDate: string | null, deliveryAddress: string | null, paymentTermsDays: number | null, notes: string | null, rejectionReason: string | null, subtotal: number | null, taxTotal: number | null, discount: number | null, shipping: number | null, total: number | null, vendor: { _id: string | null, name: string | null, phone: string | null } | null, lines: Array<{ _id: string | null, description: string | null, unit: string | null, quantity: number | null, unitPrice: number | null, taxRate: number | null, receivedQuantity: number | null, invoicedQuantity: number | null } | null> | null } | null };

export type MobilePurchasingApproveOrderMutationVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingApproveOrderMutation = { approvePurchasingOrder: { _id: string | null, status: string | null } | null };

export type MobilePurchasingReturnOrderToDraftMutationVariables = Exact<{
  _id: string;
  reason: string;
}>;


export type MobilePurchasingReturnOrderToDraftMutation = { rejectPurchasingOrder: { _id: string | null, status: string | null } | null };

export type MobilePurchasingPagedPaymentsQueryVariables = Exact<{
  search?: string | null | undefined;
  status?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobilePurchasingPagedPaymentsQuery = { pagedPurchasingPayments: { totalResults: number | null, data: Array<{ _id: string | null, number: string | null, status: string | null, paymentDate: string | null, method: string | null, amount: number | null, vendor: { _id: string | null, name: string | null } | null } | null> | null } | null };

export type MobilePurchasingPaymentByIdQueryVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingPaymentByIdQuery = { purchasingPaymentById: { _id: string | null, number: string | null, status: string | null, paymentDate: string | null, method: string | null, reference: string | null, notes: string | null, amount: number | null, voidReason: string | null, vendor: { _id: string | null, name: string | null } | null, allocations: Array<{ invoiceId: string | null, amount: number | null, invoice: { _id: string | null, number: string | null, vendorInvoiceNo: string | null } | null } | null> | null } | null };

export type MobilePurchasingPagedReceiptsQueryVariables = Exact<{
  search?: string | null | undefined;
  status?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobilePurchasingPagedReceiptsQuery = { pagedPurchasingReceipts: { totalResults: number | null, data: Array<{ _id: string | null, number: string | null, status: string | null, receivedDate: string | null, deliveryNoteNo: string | null, vendor: { _id: string | null, name: string | null } | null, order: { _id: string | null, number: string | null } | null } | null> | null } | null };

export type MobilePurchasingReceiptByIdQueryVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingReceiptByIdQuery = { purchasingReceiptById: { _id: string | null, number: string | null, status: string | null, receivedDate: string | null, deliveryNoteNo: string | null, notes: string | null, voidReason: string | null, vendor: { _id: string | null, name: string | null } | null, order: { _id: string | null, number: string | null } | null, receivedByPerson: { _id: string | null, sharedData: { name: string | null } | null } | null, lines: Array<{ _id: string | null, description: string | null, unit: string | null, receivedQuantity: number | null, rejectedQuantity: number | null, remarks: string | null } | null> | null } | null };

export type MobilePurchasingPostReceiptMutationVariables = Exact<{
  orderId: string;
  receivedDate: string;
  receivedBy?: string | null | undefined;
  deliveryNoteNo?: string | null | undefined;
  notes?: string | null | undefined;
  lines: Array<Types.PurchasingReceiptLineInput> | Types.PurchasingReceiptLineInput;
}>;


export type MobilePurchasingPostReceiptMutation = { postPurchasingReceipt: { _id: string | null, number: string | null } | null };

export type MobilePurchasingRequisitionFieldsFragment = { _id: string | null, number: string | null, title: string | null, purpose: string | null, neededBy: string | null, estimatedTotal: number | null, status: string | null, version: number | null, rejectionReason: string | null, requestedBy: string | null, requestedByPerson: { _id: string | null, sharedData: { name: string | null } | null } | null, lines: Array<{ _id: string | null, catalogItemId: string | null, description: string | null, unit: string | null, quantity: number | null, estimatedUnitPrice: number | null } | null> | null };

export type MobilePurchasingPagedRequisitionsQueryVariables = Exact<{
  search?: string | null | undefined;
  status?: string | null | undefined;
  requestedBy?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobilePurchasingPagedRequisitionsQuery = { pagedPurchasingRequisitions: { totalResults: number | null, data: Array<{ _id: string | null, number: string | null, title: string | null, status: string | null, neededBy: string | null, estimatedTotal: number | null, requestedByPerson: { _id: string | null, sharedData: { name: string | null } | null } | null } | null> | null } | null };

export type MobilePurchasingRequisitionByIdQueryVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingRequisitionByIdQuery = { purchasingRequisitionById: { _id: string | null, number: string | null, title: string | null, purpose: string | null, neededBy: string | null, estimatedTotal: number | null, status: string | null, version: number | null, rejectionReason: string | null, requestedBy: string | null, requestedByPerson: { _id: string | null, sharedData: { name: string | null } | null } | null, lines: Array<{ _id: string | null, catalogItemId: string | null, description: string | null, unit: string | null, quantity: number | null, estimatedUnitPrice: number | null } | null> | null } | null };

export type MobilePurchasingCreateRequisitionMutationVariables = Exact<{
  title: string;
  purpose?: string | null | undefined;
  requestedBy?: string | null | undefined;
  neededBy?: string | null | undefined;
  lines: Array<Types.PurchasingRequisitionLineInput> | Types.PurchasingRequisitionLineInput;
}>;


export type MobilePurchasingCreateRequisitionMutation = { createPurchasingRequisition: { _id: string | null } | null };

export type MobilePurchasingUpdateRequisitionMutationVariables = Exact<{
  _id: string;
  version: number;
  title: string;
  purpose?: string | null | undefined;
  requestedBy?: string | null | undefined;
  neededBy?: string | null | undefined;
  lines: Array<Types.PurchasingRequisitionLineInput> | Types.PurchasingRequisitionLineInput;
}>;


export type MobilePurchasingUpdateRequisitionMutation = { updatePurchasingRequisition: { _id: string | null } | null };

export type MobilePurchasingSubmitRequisitionMutationVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingSubmitRequisitionMutation = { submitPurchasingRequisition: { _id: string | null, status: string | null } | null };

export type MobilePurchasingReopenRequisitionMutationVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingReopenRequisitionMutation = { reopenPurchasingRequisition: { _id: string | null, status: string | null } | null };

export type MobilePurchasingCancelRequisitionMutationVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingCancelRequisitionMutation = { cancelPurchasingRequisition: { _id: string | null, status: string | null } | null };

export type MobilePurchasingApprovePurchasingRequisitionMutationVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingApprovePurchasingRequisitionMutation = { approvePurchasingRequisition: { _id: string | null, status: string | null } | null };

export type MobilePurchasingRejectRequisitionMutationVariables = Exact<{
  _id: string;
  reason: string;
}>;


export type MobilePurchasingRejectRequisitionMutation = { rejectPurchasingRequisition: { _id: string | null, status: string | null } | null };

export type MobilePurchasingPagedVendorsQueryVariables = Exact<{
  search?: string | null | undefined;
  isActive?: boolean | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobilePurchasingPagedVendorsQuery = { pagedPurchasingVendors: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, contactPerson: string | null, phone: string | null, isActive: boolean | null } | null> | null } | null };

export type MobilePurchasingVendorByIdQueryVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingVendorByIdQuery = { purchasingVendorById: { _id: string | null, name: string | null, contactPerson: string | null, phone: string | null, email: string | null, address: string | null, paymentTermsDays: number | null, notes: string | null, isActive: boolean | null } | null };

export type MobilePurchasingPagedCatalogItemsQueryVariables = Exact<{
  search?: string | null | undefined;
  isActive?: boolean | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobilePurchasingPagedCatalogItemsQuery = { pagedPurchasingCatalogItems: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, unit: string | null, category: string | null, company: string | null, imageUrl: string | null, isActive: boolean | null } | null> | null } | null };

export type MobilePurchasingCatalogItemByIdQueryVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingCatalogItemByIdQuery = { purchasingCatalogItemById: { _id: string | null, name: string | null, unit: string | null, category: string | null, company: string | null, description: string | null, imageUrl: string | null, defaultUnitPrice: number | null, lastUnitPrice: number | null, isActive: boolean | null } | null };

export type MobilePurchasingSetCatalogItemImageMutationVariables = Exact<{
  _id: string;
  imageData: string;
}>;


export type MobilePurchasingSetCatalogItemImageMutation = { setPurchasingCatalogItemImage: { _id: string | null, imageUrl: string | null } | null };

export type MobilePurchasingRemoveCatalogItemImageMutationVariables = Exact<{
  _id: string;
}>;


export type MobilePurchasingRemoveCatalogItemImageMutation = { removePurchasingCatalogItemImage: { _id: string | null, imageUrl: string | null } | null };

export type MobilePagedVisitorStaysQueryVariables = Exact<{
  queryString: string;
}>;


export type MobilePagedVisitorStaysQuery = { pagedVisitorStays: { totalResults: number | null, data: Array<{ _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, cancelledDate: string | null, refVisitor: { _id: string | null, sharedData: { name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null, visitorData: { city: string | null, country: string | null } | null } | null } | null> | null } | null };

export type MobileSecurityFaceVectorFromImageQueryVariables = Exact<{
  imageData: string;
}>;


export type MobileSecurityFaceVectorFromImageQuery = { securityFaceVectorFromImage: { status: string | null, vector: Array<number> | null } | null };

export type MobileSecurityVisitorsByFaceVectorQueryVariables = Exact<{
  vector: Array<number> | number;
  limit?: number | null | undefined;
}>;


export type MobileSecurityVisitorsByFaceVectorQuery = { securityVisitorsByFaceVector: Array<{ score: number | null, person: { _id: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, tags: Array<{ _id: string | null, name: string | null, color: string | null, textColor: string | null } | null> | null } | null, visitorData: { city: string | null, country: string | null } | null } | null } | null> | null };

export type MobilePagedSecurityVisitorsQueryVariables = Exact<{
  filter?: Types.VisitorFilter | null | undefined;
}>;


export type MobilePagedSecurityVisitorsQuery = { pagedSecurityVisitors: { totalResults: number | null, data: Array<{ _id: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, tags: Array<{ _id: string | null, name: string | null, color: string | null, textColor: string | null } | null> | null } | null, visitorData: { city: string | null, country: string | null } | null } | null> | null } | null };

export type MobileSecurityVisitorByIdQueryVariables = Exact<{
  _id: string;
}>;


export type MobileSecurityVisitorByIdQuery = { securityVisitorById: { _id: string | null, deletedAt: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, birthDate: string | null, ehadDate: string | null, referenceName: string | null, contactNumber1: string | null, contactNumber2: string | null, currentAddress: string | null, permanentAddress: string | null, educationalQualification: string | null, meansOfEarning: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, tags: Array<{ _id: string | null, name: string | null, color: string | null, textColor: string | null } | null> | null } | null, visitorData: { city: string | null, country: string | null, criminalRecord: string | null, otherNotes: string | null } | null } | null };

export type MobileVisitorListFieldsFragment = { _id: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, tags: Array<{ _id: string | null, name: string | null, color: string | null, textColor: string | null } | null> | null } | null, visitorData: { city: string | null, country: string | null } | null };

export type MobileVisitorStaysByVisitorIdQueryVariables = Exact<{
  visitorId: string;
}>;


export type MobileVisitorStaysByVisitorIdQuery = { pagedVisitorStaysByVisitorId: { totalResults: number | null, data: Array<{ _id: string | null, fromDate: string | null, numOfDays: number | null, cancelledDate: string | null } | null> | null } | null };

export type MobileCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type MobileCurrentUserQuery = { currentUser: { _id: string | null, username: string | null, displayName: string | null, email: string | null, twoFactorEnabled: boolean | null, permissions: Array<string | null> | null, instances: Array<string | null> | null, karkun: { _id: string | null, sharedData: { name: string | null, imageUrl: string | null } | null } | null } | null };

export type MobileRegisterUserMutationVariables = Exact<{
  displayName: string;
  email: string;
}>;


export type MobileRegisterUserMutation = { registerUser: number | null };

export type MobileMyTrustedDevicesQueryVariables = Exact<{ [key: string]: never; }>;


export type MobileMyTrustedDevicesQuery = { myTrustedDevices: Array<{ _id: string | null, name: string | null, createdAt: string | null, lastUsedAt: string | null } | null> | null };

export type MobileEnrollTrustedDeviceMutationVariables = Exact<{
  pin: string;
  name?: string | null | undefined;
  code?: string | null | undefined;
  replaceDeviceId?: string | null | undefined;
}>;


export type MobileEnrollTrustedDeviceMutation = { enrollTrustedDevice: { deviceId: string, deviceSecret: string } | null };

export type MobileRemoveTrustedDeviceMutationVariables = Exact<{
  deviceId: string;
}>;


export type MobileRemoveTrustedDeviceMutation = { removeTrustedDevice: boolean | null };

export type MobileStartTwoFactorSetupMutationVariables = Exact<{ [key: string]: never; }>;


export type MobileStartTwoFactorSetupMutation = { startTwoFactorSetup: { qrCodeSvg: string | null, secret: string | null } | null };

export type MobileEnableTwoFactorMutationVariables = Exact<{
  code: string;
}>;


export type MobileEnableTwoFactorMutation = { enableTwoFactor: { _id: string | null, twoFactorEnabled: boolean | null } | null };

export type MobileDisableTwoFactorMutationVariables = Exact<{
  code: string;
}>;


export type MobileDisableTwoFactorMutation = { disableTwoFactor: { _id: string | null, twoFactorEnabled: boolean | null } | null };

export type MobileUpdateLoginTimeMutationVariables = Exact<{ [key: string]: never; }>;


export type MobileUpdateLoginTimeMutation = { updateLoginTime: number | null };

export type MobileWorkspaceReactToDiscussionMessageMutationVariables = Exact<{
  committeeId: string;
  messageId: string;
  emoji: string;
  shouldReact: boolean;
}>;


export type MobileWorkspaceReactToDiscussionMessageMutation = { workspaceReactToDiscussionMessage: boolean };

export type MobileWorkspaceSetDiscussionMessageStarredMutationVariables = Exact<{
  committeeId: string;
  messageId: string;
  starred: boolean;
}>;


export type MobileWorkspaceSetDiscussionMessageStarredMutation = { workspaceSetDiscussionMessageStarred: boolean };

export type MobileWorkspaceSetDiscussionMessagePinnedMutationVariables = Exact<{
  committeeId: string;
  messageId: string;
  pinned: boolean;
}>;


export type MobileWorkspaceSetDiscussionMessagePinnedMutation = { workspaceSetDiscussionMessagePinned: boolean };

export type MobileWorkspaceEditDiscussionMessageMutationVariables = Exact<{
  committeeId: string;
  messageId: string;
  text: string;
}>;


export type MobileWorkspaceEditDiscussionMessageMutation = { workspaceEditDiscussionMessage: boolean };

export type MobileWorkspaceDeleteDiscussionMessageMutationVariables = Exact<{
  committeeId: string;
  messageId: string;
}>;


export type MobileWorkspaceDeleteDiscussionMessageMutation = { workspaceDeleteDiscussionMessage: boolean };

export type MobileWorkspaceJoinDiscussionVideoCallMutationVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceJoinDiscussionVideoCallMutation = { workspaceJoinDiscussionVideoCall: { url: string } | null };

export type MobileWorkspaceDiscussionThreadMessagesQueryVariables = Exact<{
  committeeId: string;
  threadId: string;
}>;


export type MobileWorkspaceDiscussionThreadMessagesQuery = { workspaceDiscussionThreadMessages: Array<{ _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, reactedByMe: boolean | null } | null> | null } | null> | null };

export type MobileWorkspaceDiscussionMembersQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceDiscussionMembersQuery = { workspaceDiscussionMembers: Array<{ username: string | null, name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null> | null };

export type MobileWorkspaceDiscussionPinnedMessagesQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceDiscussionPinnedMessagesQuery = { workspaceDiscussionPinnedMessages: Array<{ _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, reactedByMe: boolean | null } | null> | null } | null> | null };

export type MobileWorkspaceDiscussionStarredMessagesQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceDiscussionStarredMessagesQuery = { workspaceDiscussionStarredMessages: Array<{ _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, reactedByMe: boolean | null } | null> | null } | null> | null };

export type MobileWorkspaceDiscussionSearchMessagesQueryVariables = Exact<{
  committeeId: string;
  searchText: string;
  offset?: number | null | undefined;
}>;


export type MobileWorkspaceDiscussionSearchMessagesQuery = { workspaceDiscussionSearchMessages: { hasMore: boolean | null, messages: Array<{ _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, reactedByMe: boolean | null } | null> | null } | null> | null } | null };

export type MobileDiscussionMessageFieldsFragment = { _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, reactedByMe: boolean | null } | null> | null };

export type MobileWorkspaceDiscussionInfoQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceDiscussionInfoQuery = { workspaceCommitteeById: { _id: string | null, name: string | null } | null, workspaceDiscussionInfo: { canPost: boolean | null, canPin: boolean | null } | null };

export type MobileWorkspaceDiscussionSyncQueryVariables = Exact<{
  committeeId: string;
  since?: string | null | undefined;
}>;


export type MobileWorkspaceDiscussionSyncQuery = { workspaceDiscussionSync: { deletedIds: Array<string | null> | null, syncedAt: string | null, hasOlder: boolean | null, messages: Array<{ _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, reactedByMe: boolean | null } | null> | null } | null> | null } | null };

export type MobileWorkspaceDiscussionOlderMessagesQueryVariables = Exact<{
  committeeId: string;
  before: string;
}>;


export type MobileWorkspaceDiscussionOlderMessagesQuery = { workspaceDiscussionOlderMessages: { hasMore: boolean | null, messages: Array<{ _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, reactedByMe: boolean | null } | null> | null } | null> | null } | null };

export type MobileWorkspaceSendDiscussionMessageMutationVariables = Exact<{
  committeeId: string;
  text: string;
  threadId?: string | null | undefined;
}>;


export type MobileWorkspaceSendDiscussionMessageMutation = { workspaceSendDiscussionMessage: boolean };

export type MobileWorkspaceDiscussionVideoCallInfoQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceDiscussionVideoCallInfoQuery = { workspaceDiscussionVideoCallInfo: { participantCount: number | null } | null };

export type MobileWorkspaceDocumentFolderFieldsFragment = { _id: string | null, name: string | null, parentId: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null };

export type MobileWorkspaceDocumentFieldsFragment = { _id: string | null, name: string | null, folderId: string | null, folderName: string | null, description: string | null, tags: Array<string | null> | null, fileName: string | null, mimeType: string | null, size: number | null, currentVersionNumber: number | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null, lock: { userName: string | null, lockedAt: string | null, expiresAt: string | null, note: string | null, isMine: boolean | null } | null };

export type MobileWorkspaceDocumentsInfoQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceDocumentsInfoQuery = { workspaceDocumentsInfo: { canManage: boolean | null, maxFileSize: number | null } | null };

export type MobileWorkspaceDocumentFolderContentsQueryVariables = Exact<{
  committeeId: string;
  folderId?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobileWorkspaceDocumentFolderContentsQuery = { workspaceDocumentFolderContents: { path: Array<{ _id: string | null, name: string | null, parentId: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null } | null> | null, folders: Array<{ _id: string | null, name: string | null, parentId: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null } | null> | null, documents: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, folderId: string | null, folderName: string | null, description: string | null, tags: Array<string | null> | null, fileName: string | null, mimeType: string | null, size: number | null, currentVersionNumber: number | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null, lock: { userName: string | null, lockedAt: string | null, expiresAt: string | null, note: string | null, isMine: boolean | null } | null } | null> | null } | null } | null };

export type MobileWorkspaceDocumentFoldersQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceDocumentFoldersQuery = { workspaceDocumentFolders: Array<{ _id: string | null, name: string | null, parentId: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null } | null> | null };

export type MobileWorkspaceDocumentSearchQueryVariables = Exact<{
  committeeId: string;
  text: string;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobileWorkspaceDocumentSearchQuery = { workspaceDocumentSearch: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, folderId: string | null, folderName: string | null, description: string | null, tags: Array<string | null> | null, fileName: string | null, mimeType: string | null, size: number | null, currentVersionNumber: number | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null, lock: { userName: string | null, lockedAt: string | null, expiresAt: string | null, note: string | null, isMine: boolean | null } | null } | null> | null } | null };

export type MobileWorkspaceDocumentByIdQueryVariables = Exact<{
  committeeId: string;
  documentId: string;
}>;


export type MobileWorkspaceDocumentByIdQuery = { workspaceDocumentById: { _id: string | null, name: string | null, folderId: string | null, folderName: string | null, description: string | null, tags: Array<string | null> | null, fileName: string | null, mimeType: string | null, size: number | null, currentVersionNumber: number | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null, lock: { userName: string | null, lockedAt: string | null, expiresAt: string | null, note: string | null, isMine: boolean | null } | null } | null };

export type MobileWorkspaceDocumentVersionsQueryVariables = Exact<{
  committeeId: string;
  documentId: string;
}>;


export type MobileWorkspaceDocumentVersionsQuery = { workspaceDocumentVersions: Array<{ _id: string | null, versionNumber: number | null, fileName: string | null, mimeType: string | null, size: number | null, comment: string | null, isCurrent: boolean | null, createdAt: string | null, createdByName: string | null } | null> | null };

export type MobileWorkspaceDocumentActivityQueryVariables = Exact<{
  committeeId: string;
  documentId?: string | null | undefined;
  before?: string | null | undefined;
  limit?: number | null | undefined;
}>;


export type MobileWorkspaceDocumentActivityQuery = { workspaceDocumentActivity: Array<{ _id: string | null, action: string | null, userName: string | null, at: string | null, details: string | null } | null> | null };

export type MobileWorkspaceDocumentTrashQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceDocumentTrashQuery = { workspaceDocumentTrash: { folders: Array<{ _id: string | null, name: string | null, parentId: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null } | null> | null, documents: Array<{ _id: string | null, name: string | null, folderId: string | null, folderName: string | null, description: string | null, tags: Array<string | null> | null, fileName: string | null, mimeType: string | null, size: number | null, currentVersionNumber: number | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null, lock: { userName: string | null, lockedAt: string | null, expiresAt: string | null, note: string | null, isMine: boolean | null } | null } | null> | null } | null };

export type MobileWorkspaceCreateDocumentFolderMutationVariables = Exact<{
  committeeId: string;
  parentId?: string | null | undefined;
  name: string;
}>;


export type MobileWorkspaceCreateDocumentFolderMutation = { workspaceCreateDocumentFolder: boolean | null };

export type MobileWorkspaceRenameDocumentFolderMutationVariables = Exact<{
  committeeId: string;
  folderId: string;
  name: string;
}>;


export type MobileWorkspaceRenameDocumentFolderMutation = { workspaceRenameDocumentFolder: boolean | null };

export type MobileWorkspaceMoveDocumentFolderMutationVariables = Exact<{
  committeeId: string;
  folderId: string;
  parentId?: string | null | undefined;
}>;


export type MobileWorkspaceMoveDocumentFolderMutation = { workspaceMoveDocumentFolder: boolean | null };

export type MobileWorkspaceTrashDocumentFolderMutationVariables = Exact<{
  committeeId: string;
  folderId: string;
}>;


export type MobileWorkspaceTrashDocumentFolderMutation = { workspaceTrashDocumentFolder: boolean | null };

export type MobileWorkspaceCreateDocumentUploadMutationVariables = Exact<{
  committeeId: string;
  folderId?: string | null | undefined;
  documentId?: string | null | undefined;
  fileName: string;
  mimeType?: string | null | undefined;
  size: number;
  comment?: string | null | undefined;
}>;


export type MobileWorkspaceCreateDocumentUploadMutation = { workspaceCreateDocumentUpload: { uploadId: string | null, url: string | null, contentType: string | null } | null };

export type MobileWorkspaceCompleteDocumentUploadMutationVariables = Exact<{
  committeeId: string;
  uploadId: string;
}>;


export type MobileWorkspaceCompleteDocumentUploadMutation = { workspaceCompleteDocumentUpload: { _id: string | null, name: string | null, folderId: string | null, folderName: string | null, description: string | null, tags: Array<string | null> | null, fileName: string | null, mimeType: string | null, size: number | null, currentVersionNumber: number | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null, lock: { userName: string | null, lockedAt: string | null, expiresAt: string | null, note: string | null, isMine: boolean | null } | null } | null };

export type MobileWorkspaceAbortDocumentUploadMutationVariables = Exact<{
  committeeId: string;
  uploadId: string;
}>;


export type MobileWorkspaceAbortDocumentUploadMutation = { workspaceAbortDocumentUpload: boolean | null };

export type MobileWorkspaceUpdateDocumentMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
  name: string;
  description?: string | null | undefined;
  tags?: Array<string | null | undefined> | string | null | undefined;
}>;


export type MobileWorkspaceUpdateDocumentMutation = { workspaceUpdateDocument: boolean | null };

export type MobileWorkspaceMoveDocumentMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
  folderId?: string | null | undefined;
}>;


export type MobileWorkspaceMoveDocumentMutation = { workspaceMoveDocument: boolean | null };

export type MobileWorkspaceTrashDocumentMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
}>;


export type MobileWorkspaceTrashDocumentMutation = { workspaceTrashDocument: boolean | null };

export type MobileWorkspaceDocumentDownloadUrlMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
  versionId?: string | null | undefined;
  inline?: boolean | null | undefined;
}>;


export type MobileWorkspaceDocumentDownloadUrlMutation = { workspaceDocumentDownloadUrl: { url: string | null, fileName: string | null } | null };

export type MobileWorkspaceRestoreDocumentVersionMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
  versionId: string;
}>;


export type MobileWorkspaceRestoreDocumentVersionMutation = { workspaceRestoreDocumentVersion: boolean | null };

export type MobileWorkspaceDeleteDocumentVersionMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
  versionId: string;
}>;


export type MobileWorkspaceDeleteDocumentVersionMutation = { workspaceDeleteDocumentVersion: boolean | null };

export type MobileWorkspaceCheckOutDocumentMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
  durationMinutes: number;
  note?: string | null | undefined;
}>;


export type MobileWorkspaceCheckOutDocumentMutation = { workspaceCheckOutDocument: boolean | null };

export type MobileWorkspaceCheckInDocumentMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
}>;


export type MobileWorkspaceCheckInDocumentMutation = { workspaceCheckInDocument: boolean | null };

export type MobileWorkspaceForceUnlockDocumentMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
}>;


export type MobileWorkspaceForceUnlockDocumentMutation = { workspaceForceUnlockDocument: boolean | null };

export type MobileWorkspaceRestoreDocumentTrashItemMutationVariables = Exact<{
  committeeId: string;
  itemId: string;
  newName?: string | null | undefined;
  toRoot?: boolean | null | undefined;
}>;


export type MobileWorkspaceRestoreDocumentTrashItemMutation = { workspaceRestoreDocumentTrashItem: boolean | null };

export type MobileWorkspacePurgeDocumentTrashItemMutationVariables = Exact<{
  committeeId: string;
  itemId: string;
}>;


export type MobileWorkspacePurgeDocumentTrashItemMutation = { workspacePurgeDocumentTrashItem: boolean | null };

export type MobileWorkspaceEmptyDocumentTrashMutationVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceEmptyDocumentTrashMutation = { workspaceEmptyDocumentTrash: number | null };

export type MobileCommitteeDocumentNotificationsQueryVariables = Exact<{
  committeeId: string;
  limit: number;
  offset?: number | null | undefined;
}>;


export type MobileCommitteeDocumentNotificationsQuery = { myNotifications: Array<{ _id: string | null, entityId: string | null, eventType: string | null, eventDetails: string | null, createdAt: string | null, isRead: boolean | null } | null> | null };

export type MobileDaAccessQueryVariables = Exact<{
  locationId: string;
}>;


export type MobileDaAccessQuery = { workspaceDaAccess: { locationId: string, permissions: Array<string> } | null };

export type MobileDaMyDutiesQueryVariables = Exact<{
  date: string;
}>;


export type MobileDaMyDutiesQuery = { myDuties: Array<{ locationId: string, locationName: string, dutyId: string, dutyName: string, date: string, attendance: string | null, attendanceSource: string | null, canMarkOwnAttendance: boolean } | null> };

export type MobileDaDutiesQueryVariables = Exact<{
  locationId: string;
}>;


export type MobileDaDutiesQuery = { workspaceDaDuties: Array<{ _id: string, mehfilDutyId: string | null, name: string, description: string | null, isActive: boolean, members: Array<{ karkunId: string, isCoordinator: boolean | null, daysOfWeek: Array<string | null> | null, karkun: { _id: string | null, sharedData: { name: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null } | null } | null> } | null> | null };

export type MobileDaMehfilDutiesQueryVariables = Exact<{
  locationId: string;
}>;


export type MobileDaMehfilDutiesQuery = { workspaceDaMehfilDuties: Array<{ _id: string, name: string, description: string | null } | null> | null };

export type MobileDaPlanDaysQueryVariables = Exact<{
  locationId: string;
  dutyId: string;
  startDate: string;
}>;


export type MobileDaPlanDaysQuery = { workspaceDaPlanDays: { startDate: string, days: Array<{ date: string, dayOfWeek: string, locked: boolean, addedKarkunIds: Array<string | null>, absentKarkunIds: Array<string | null>, karkuns: Array<{ karkunId: string, name: string | null, off: boolean, addedForDay: boolean, imageUrl: string | null, imageThumbnailUrl: string | null, contactNumber1: string | null, contactNumber2: string | null, attendance: string | null } | null> } | null> } | null };

export type MobileDaAttendanceSheetQueryVariables = Exact<{
  locationId: string;
  month: string;
  dutyId?: string | null | undefined;
}>;


export type MobileDaAttendanceSheetQuery = { workspaceDaAttendanceSheet: Array<{ _id: string, karkunId: string, name: string | null, dutyId: string, dutyName: string | null, daysOnDuty: number, presentCount: number, lateCount: number, absentCount: number, unmarkedCount: number, percentage: number } | null> | null };

export type MobileDaKarkunSearchQueryVariables = Exact<{
  locationId: string;
  name?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type MobileDaKarkunSearchQuery = { workspaceDaKarkunSearch: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, parentName: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null> | null } | null };

export type MobileDaAddDutiesMutationVariables = Exact<{
  locationId: string;
  mehfilDutyIds: Array<string> | string;
}>;


export type MobileDaAddDutiesMutation = { workspaceDaAddDuties: Array<{ _id: string } | null> | null };

export type MobileDaUpdateDutyMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
  isActive?: boolean | null | undefined;
}>;


export type MobileDaUpdateDutyMutation = { workspaceDaUpdateDuty: { _id: string } | null };

export type MobileDaRemoveDutyMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
}>;


export type MobileDaRemoveDutyMutation = { workspaceDaRemoveDuty: boolean | null };

export type MobileDaAddDutyMemberMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
  karkunId: string;
}>;


export type MobileDaAddDutyMemberMutation = { workspaceDaAddDutyMember: { _id: string } | null };

export type MobileDaUpdateDutyMemberMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
  karkunId: string;
  isCoordinator?: boolean | null | undefined;
  daysOfWeek?: Array<string | null | undefined> | string | null | undefined;
}>;


export type MobileDaUpdateDutyMemberMutation = { workspaceDaUpdateDutyMember: { _id: string } | null };

export type MobileDaRemoveDutyMemberMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
  karkunId: string;
}>;


export type MobileDaRemoveDutyMemberMutation = { workspaceDaRemoveDutyMember: { _id: string } | null };

export type MobileDaSetDayOverrideMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
  date: string;
  addedKarkunIds?: Array<string | null | undefined> | string | null | undefined;
  absentKarkunIds?: Array<string | null | undefined> | string | null | undefined;
}>;


export type MobileDaSetDayOverrideMutation = { workspaceDaSetDayOverride: boolean | null };

export type MobileDaSetAttendanceMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
  date: string;
  karkunId: string;
  status?: string | null | undefined;
  geo?: Types.DaGeoLocationInput | null | undefined;
}>;


export type MobileDaSetAttendanceMutation = { workspaceDaSetAttendance: boolean | null };

export type MobileMyCommitteesQueryVariables = Exact<{ [key: string]: never; }>;


export type MobileMyCommitteesQuery = { myCommittees: Array<{ _id: string | null, name: string | null, description: string | null, features: Array<string | null> | null, locationId: string | null } | null> | null };

export type MobileMyCommitteeLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MobileMyCommitteeLocationsQuery = { myCommitteeLocations: Array<{ _id: string | null, name: string | null, type: string | null, parentId: string | null } | null> | null };

export type MobileMyDutiesAttendanceLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MobileMyDutiesAttendanceLocationsQuery = { myDutiesAttendanceLocations: Array<{ locationId: string, name: string, type: string, parentId: string | null, hasWorkspace: boolean } | null> };

export type MobileMyMehfilDetailsLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MobileMyMehfilDetailsLocationsQuery = { myMehfilDetailsLocations: Array<{ locationId: string, name: string, type: string, parentId: string | null, hasWorkspace: boolean } | null> };

export type MobileMyMehfilPermissionsLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MobileMyMehfilPermissionsLocationsQuery = { myMehfilPermissionsLocations: Array<{ locationId: string, name: string, type: string, parentId: string | null, hasWorkspace: boolean } | null> };

export type MobileMyNotificationCountsQueryVariables = Exact<{ [key: string]: never; }>;


export type MobileMyNotificationCountsQuery = { myNotificationCounts: Array<{ committeeId: string | null, module: string | null, unreadCount: number | null } | null> | null };

export type MobileWorkspaceCreateMeetingMutationVariables = Exact<{
  committeeId: string;
  input: Types.WorkspaceMeetingInput;
  participantIds?: Array<string | null | undefined> | string | null | undefined;
}>;


export type MobileWorkspaceCreateMeetingMutation = { workspaceCreateMeeting: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceUpdateMeetingMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  input: Types.WorkspaceMeetingInput;
}>;


export type MobileWorkspaceUpdateMeetingMutation = { workspaceUpdateMeeting: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceCancelMeetingMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  reason?: string | null | undefined;
}>;


export type MobileWorkspaceCancelMeetingMutation = { workspaceCancelMeeting: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceCompleteMeetingMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type MobileWorkspaceCompleteMeetingMutation = { workspaceCompleteMeeting: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceReopenMeetingMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type MobileWorkspaceReopenMeetingMutation = { workspaceReopenMeeting: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceDeleteMeetingMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type MobileWorkspaceDeleteMeetingMutation = { workspaceDeleteMeeting: boolean | null };

export type MobileWorkspaceSetMeetingParticipantsMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  participantIds: Array<string | null | undefined> | string;
}>;


export type MobileWorkspaceSetMeetingParticipantsMutation = { workspaceSetMeetingParticipants: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceSetMeetingParticipantRoleMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  participantId: string;
  role: string;
}>;


export type MobileWorkspaceSetMeetingParticipantRoleMutation = { workspaceSetMeetingParticipantRole: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceRespondToMeetingMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  status: string;
}>;


export type MobileWorkspaceRespondToMeetingMutation = { workspaceRespondToMeeting: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceMarkMeetingAttendanceMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  entries: Array<Types.WorkspaceMeetingAttendanceInput | null | undefined> | Types.WorkspaceMeetingAttendanceInput;
}>;


export type MobileWorkspaceMarkMeetingAttendanceMutation = { workspaceMarkMeetingAttendance: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceAddMeetingAgendaItemMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  input: Types.WorkspaceMeetingAgendaItemInput;
}>;


export type MobileWorkspaceAddMeetingAgendaItemMutation = { workspaceAddMeetingAgendaItem: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceUpdateMeetingAgendaItemMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  agendaItemId: string;
  input: Types.WorkspaceMeetingAgendaItemInput;
}>;


export type MobileWorkspaceUpdateMeetingAgendaItemMutation = { workspaceUpdateMeetingAgendaItem: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceRemoveMeetingAgendaItemMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  agendaItemId: string;
}>;


export type MobileWorkspaceRemoveMeetingAgendaItemMutation = { workspaceRemoveMeetingAgendaItem: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceReorderMeetingAgendaMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  agendaItemIds: Array<string | null | undefined> | string;
}>;


export type MobileWorkspaceReorderMeetingAgendaMutation = { workspaceReorderMeetingAgenda: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceSetMeetingMinutesMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  text?: string | null | undefined;
}>;


export type MobileWorkspaceSetMeetingMinutesMutation = { workspaceSetMeetingMinutes: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceCreateMeetingAttachmentUploadMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  fileName: string;
  mimeType?: string | null | undefined;
  size: number;
}>;


export type MobileWorkspaceCreateMeetingAttachmentUploadMutation = { workspaceCreateMeetingAttachmentUpload: { uploadId: string | null, url: string | null, contentType: string | null } | null };

export type MobileWorkspaceCompleteMeetingAttachmentUploadMutationVariables = Exact<{
  committeeId: string;
  uploadId: string;
}>;


export type MobileWorkspaceCompleteMeetingAttachmentUploadMutation = { workspaceCompleteMeetingAttachmentUpload: { _id: string | null } | null };

export type MobileWorkspaceAbortMeetingAttachmentUploadMutationVariables = Exact<{
  committeeId: string;
  uploadId: string;
}>;


export type MobileWorkspaceAbortMeetingAttachmentUploadMutation = { workspaceAbortMeetingAttachmentUpload: boolean | null };

export type MobileWorkspaceMeetingAttachmentDownloadUrlMutationVariables = Exact<{
  committeeId: string;
  attachmentId: string;
  inline?: boolean | null | undefined;
}>;


export type MobileWorkspaceMeetingAttachmentDownloadUrlMutation = { workspaceMeetingAttachmentDownloadUrl: { url: string | null, fileName: string | null } | null };

export type MobileWorkspaceDeleteMeetingAttachmentMutationVariables = Exact<{
  committeeId: string;
  attachmentId: string;
}>;


export type MobileWorkspaceDeleteMeetingAttachmentMutation = { workspaceDeleteMeetingAttachment: boolean | null };

export type MobileWorkspaceCreateMeetingActionItemMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  input: Types.WorkspaceMeetingActionItemInput;
}>;


export type MobileWorkspaceCreateMeetingActionItemMutation = { workspaceCreateMeetingActionItem: { _id: string | null, meetingId: string | null, meetingTitle: string | null, meetingEndsAt: string | null, agendaItemId: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, completedAt: string | null, completedByName: string | null, canChangeStatus: boolean | null } | null };

export type MobileWorkspaceUpdateMeetingActionItemMutationVariables = Exact<{
  committeeId: string;
  actionItemId: string;
  input: Types.WorkspaceMeetingActionItemInput;
}>;


export type MobileWorkspaceUpdateMeetingActionItemMutation = { workspaceUpdateMeetingActionItem: { _id: string | null, meetingId: string | null, meetingTitle: string | null, meetingEndsAt: string | null, agendaItemId: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, completedAt: string | null, completedByName: string | null, canChangeStatus: boolean | null } | null };

export type MobileWorkspaceSetMeetingActionItemStatusMutationVariables = Exact<{
  committeeId: string;
  actionItemId: string;
  status: string;
}>;


export type MobileWorkspaceSetMeetingActionItemStatusMutation = { workspaceSetMeetingActionItemStatus: { _id: string | null, meetingId: string | null, meetingTitle: string | null, meetingEndsAt: string | null, agendaItemId: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, completedAt: string | null, completedByName: string | null, canChangeStatus: boolean | null } | null };

export type MobileWorkspaceDeleteMeetingActionItemMutationVariables = Exact<{
  committeeId: string;
  actionItemId: string;
}>;


export type MobileWorkspaceDeleteMeetingActionItemMutation = { workspaceDeleteMeetingActionItem: boolean | null };

export type MobileWorkspaceJoinMeetingVideoCallMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type MobileWorkspaceJoinMeetingVideoCallMutation = { workspaceJoinMeetingVideoCall: { url: string } | null };

export type MobileWorkspaceMeetingFieldsFragment = { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null };

export type MobileWorkspaceMeetingActionItemFieldsFragment = { _id: string | null, meetingId: string | null, meetingTitle: string | null, meetingEndsAt: string | null, agendaItemId: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, completedAt: string | null, completedByName: string | null, canChangeStatus: boolean | null };

export type MobileCommitteeMeetingNotificationsQueryVariables = Exact<{
  committeeId: string;
  limit: number;
  offset?: number | null | undefined;
}>;


export type MobileCommitteeMeetingNotificationsQuery = { myNotifications: Array<{ _id: string | null, entityId: string | null, eventType: string | null, eventDetails: string | null, createdAt: string | null, isRead: boolean | null } | null> | null };

export type MobileWorkspaceMeetingsInfoQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceMeetingsInfoQuery = { workspaceMeetingsInfo: { canManage: boolean | null, canJoinVideoCall: boolean | null, myParticipantId: string | null, maxFileSize: number | null } | null };

export type MobileWorkspaceMeetingMembersQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceMeetingMembersQuery = { workspaceMeetingMembers: Array<{ participantId: string | null, name: string | null, isCoordinator: boolean | null } | null> | null };

export type MobileWorkspaceMeetingsQueryVariables = Exact<{
  committeeId: string;
  view?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobileWorkspaceMeetingsQuery = { workspaceMeetings: { totalResults: number | null, data: Array<{ _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null> | null } | null };

export type MobileWorkspaceMeetingByIdQueryVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type MobileWorkspaceMeetingByIdQuery = { workspaceMeetingById: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, updatedAt: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type MobileWorkspaceMeetingAttachmentsQueryVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type MobileWorkspaceMeetingAttachmentsQuery = { workspaceMeetingAttachments: Array<{ _id: string | null, name: string | null, fileName: string | null, mimeType: string | null, size: number | null, createdAt: string | null, createdByName: string | null, canDelete: boolean | null } | null> | null };

export type MobileWorkspaceMeetingActionItemsQueryVariables = Exact<{
  committeeId: string;
  meetingId?: string | null | undefined;
  assigneeId?: string | null | undefined;
  status?: Array<string | null | undefined> | string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobileWorkspaceMeetingActionItemsQuery = { workspaceMeetingActionItems: { totalResults: number | null, data: Array<{ _id: string | null, meetingId: string | null, meetingTitle: string | null, meetingEndsAt: string | null, agendaItemId: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, completedAt: string | null, completedByName: string | null, canChangeStatus: boolean | null } | null> | null } | null };

export type MobileWorkspaceMeetingActivityQueryVariables = Exact<{
  committeeId: string;
  meetingId?: string | null | undefined;
  before?: string | null | undefined;
  limit?: number | null | undefined;
}>;


export type MobileWorkspaceMeetingActivityQuery = { workspaceMeetingActivity: Array<{ _id: string | null, action: string | null, userName: string | null, at: string | null, details: string | null } | null> | null };

export type MobileWorkspaceMeetingVideoCallInfoQueryVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type MobileWorkspaceMeetingVideoCallInfoQuery = { workspaceMeetingVideoCallInfo: { participantCount: number | null } | null };

export type MobileMehfilDetailsQueryVariables = Exact<{
  locationId: string;
}>;


export type MobileMehfilDetailsQuery = { workspaceMehfilDetails: { locationId: string, name: string, permissions: Array<string>, mehfilDetails: { address: string | null, mehfilStartYear: string | null, timingDetails: string | null, lcdAvailability: boolean | null, tabAvailability: boolean | null, otherMehfilDetails: string | null, latitude: number | null, longitude: number | null } | null } | null };

export type MobileUpdateMehfilDetailsMutationVariables = Exact<{
  locationId: string;
  mehfilDetails: Types.OrgLocationMehfilDetailsInput;
}>;


export type MobileUpdateMehfilDetailsMutation = { workspaceUpdateMehfilDetails: { locationId: string, permissions: Array<string>, mehfilDetails: { address: string | null, mehfilStartYear: string | null, timingDetails: string | null, lcdAvailability: boolean | null, tabAvailability: boolean | null, otherMehfilDetails: string | null, latitude: number | null, longitude: number | null } | null } | null };

export type MobileMehfilPermissionsQueryVariables = Exact<{
  locationId: string;
}>;


export type MobileMehfilPermissionsQuery = { workspaceMehfilPermissions: { locationId: string, permissions: Array<string>, groups: Array<{ featureKey: string, featureName: string, permissions: Array<{ key: string, name: string, description: string, users: Array<{ userId: string, personId: string | null, username: string | null, displayName: string | null } | null> } | null> } | null> } | null };

export type MobileMehfilPermissionsKarkunSearchQueryVariables = Exact<{
  locationId: string;
  name?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type MobileMehfilPermissionsKarkunSearchQuery = { workspaceMehfilPermissionsKarkunSearch: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, parentName: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null> | null } | null };

export type MobileAddMehfilPermissionUserMutationVariables = Exact<{
  locationId: string;
  featureKey: string;
  permissionKey: string;
  karkunId: string;
}>;


export type MobileAddMehfilPermissionUserMutation = { workspaceAddMehfilPermissionUser: boolean | null };

export type MobileRemoveMehfilPermissionUserMutationVariables = Exact<{
  locationId: string;
  featureKey: string;
  permissionKey: string;
  userId: string;
}>;


export type MobileRemoveMehfilPermissionUserMutation = { workspaceRemoveMehfilPermissionUser: boolean | null };

export type MobileWorkspaceCommitteeMembersQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceCommitteeMembersQuery = { workspaceCommitteeById: { _id: string | null, name: string | null, canManageMembers: boolean | null, memberCount: number | null, guestCount: number | null, members: Array<{ karkunId: string | null, role: string | null, isCoordinator: boolean | null, name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, contactNumber1: string | null, contactNumber2: string | null } | null> | null } | null };

export type MobileSetCommitteeMemberCoordinatorMutationVariables = Exact<{
  committeeId: string;
  karkunId: string;
  isCoordinator: boolean;
}>;


export type MobileSetCommitteeMemberCoordinatorMutation = { workspaceSetCommitteeMemberCoordinator: boolean | null };

export type MobileCommitteeMemberNotificationsQueryVariables = Exact<{
  committeeId: string;
  limit: number;
  offset?: number | null | undefined;
}>;


export type MobileCommitteeMemberNotificationsQuery = { myNotifications: Array<{ _id: string | null, eventType: string | null, eventDetails: string | null, createdAt: string | null, isRead: boolean | null } | null> | null };

export type MobileMarkNotificationsReadMutationVariables = Exact<{
  ids: Array<string | null | undefined> | string;
}>;


export type MobileMarkNotificationsReadMutation = { markNotificationsRead: boolean };

export type MobileWorkspaceMonitoringAlertsQueryVariables = Exact<{
  committeeId: string;
  date: string;
  includeTest?: boolean | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type MobileWorkspaceMonitoringAlertsQuery = { workspaceMonitoringAlerts: { totalResults: number | null, data: Array<{ _id: string | null, timestamp: string | null, profileName: string | null, profileIsTest: boolean | null, channelName: string | null, similarityScore: number | null, imageUrl: string | null, thumbnailUrl: string | null } | null> | null } | null };

export type MobileWorkspaceMonitoringProfileFieldsFragment = { _id: string | null, name: string | null, isTest: boolean | null, alertsCount: number | null, photos: Array<{ _id: string | null, imageUrl: string | null, thumbnailUrl: string | null } | null> | null };

export type MobileWorkspaceMonitoringProfileByIdQueryVariables = Exact<{
  committeeId: string;
  profileId: string;
}>;


export type MobileWorkspaceMonitoringProfileByIdQuery = { workspaceMonitoringProfileById: { _id: string | null, name: string | null, isTest: boolean | null, alertsCount: number | null, photos: Array<{ _id: string | null, imageUrl: string | null, thumbnailUrl: string | null } | null> | null } | null };

export type UpdateMobileWorkspaceMonitoringProfileMutationVariables = Exact<{
  committeeId: string;
  profileId: string;
  name: string;
  isTest: boolean;
}>;


export type UpdateMobileWorkspaceMonitoringProfileMutation = { updateWorkspaceMonitoringProfile: { _id: string | null, name: string | null, isTest: boolean | null, alertsCount: number | null, photos: Array<{ _id: string | null, imageUrl: string | null, thumbnailUrl: string | null } | null> | null } | null };

export type AddMobileWorkspaceMonitoringProfilePhotoMutationVariables = Exact<{
  committeeId: string;
  profileId: string;
  imageData: string;
}>;


export type AddMobileWorkspaceMonitoringProfilePhotoMutation = { addWorkspaceMonitoringProfilePhoto: { _id: string | null, name: string | null, isTest: boolean | null, alertsCount: number | null, photos: Array<{ _id: string | null, imageUrl: string | null, thumbnailUrl: string | null } | null> | null } | null };

export type RemoveMobileWorkspaceMonitoringProfilePhotoMutationVariables = Exact<{
  committeeId: string;
  profileId: string;
  photoId: string;
}>;


export type RemoveMobileWorkspaceMonitoringProfilePhotoMutation = { removeWorkspaceMonitoringProfilePhoto: { _id: string | null, name: string | null, isTest: boolean | null, alertsCount: number | null, photos: Array<{ _id: string | null, imageUrl: string | null, thumbnailUrl: string | null } | null> | null } | null };

export type MobileWorkspaceMonitoringProfilesQueryVariables = Exact<{
  committeeId: string;
  name?: string | null | undefined;
  includeTest?: boolean | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type MobileWorkspaceMonitoringProfilesQuery = { workspaceMonitoringProfiles: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, isTest: boolean | null, alertsCount: number | null, photos: Array<{ _id: string | null, imageUrl: string | null, thumbnailUrl: string | null } | null> | null } | null> | null } | null };

export type MobileWorkspaceNightStayByIdQueryVariables = Exact<{
  committeeId: string;
  stayId: string;
}>;


export type MobileWorkspaceNightStayByIdQuery = { workspaceNightStayById: { _id: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, visitorName: string | null, visitorImageUrl: string | null, visitorImageThumbnailUrl: string | null, city: string | null, country: string | null, stayHistory: Array<{ _id: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null } | null> | null } | null };

export type MobileWorkspaceNightStaysQueryVariables = Exact<{
  committeeId: string;
  stayDate: string;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type MobileWorkspaceNightStaysQuery = { workspaceNightStays: { totalResults: number | null, data: Array<{ _id: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, visitorName: string | null, visitorImageUrl: string | null, visitorImageThumbnailUrl: string | null, city: string | null, country: string | null } | null> | null } | null };

export type MobileWorkspacePollFieldsFragment = { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null };

export type MobileWorkspacePollsInfoQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspacePollsInfoQuery = { workspacePollsInfo: { canManage: boolean | null, myVoterId: string | null } | null };

export type MobileWorkspacePollsQueryVariables = Exact<{
  committeeId: string;
  view?: string | null | undefined;
  text?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobileWorkspacePollsQuery = { workspacePolls: { totalResults: number | null, data: Array<{ _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null> | null } | null };

export type MobileWorkspacePollByIdQueryVariables = Exact<{
  committeeId: string;
  pollId: string;
}>;


export type MobileWorkspacePollByIdQuery = { workspacePollById: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type MobileWorkspacePollResultsQueryVariables = Exact<{
  committeeId: string;
  pollId: string;
}>;


export type MobileWorkspacePollResultsQuery = { workspacePollResults: { pollId: string | null, status: string | null, anonymous: boolean | null, closedAt: string | null, totalVoters: number | null, questions: Array<{ questionId: string | null, text: string | null, type: string | null, answeredCount: number | null, options: Array<{ optionId: string | null, text: string | null, count: number | null, percentage: number | null, voters: Array<{ voterId: string | null, name: string | null } | null> | null } | null> | null } | null> | null } | null };

export type MobileWorkspacePollActivityQueryVariables = Exact<{
  committeeId: string;
  pollId?: string | null | undefined;
  before?: string | null | undefined;
  limit?: number | null | undefined;
}>;


export type MobileWorkspacePollActivityQuery = { workspacePollActivity: Array<{ _id: string | null, action: string | null, userName: string | null, at: string | null, details: string | null } | null> | null };

export type MobileWorkspaceCreatePollMutationVariables = Exact<{
  committeeId: string;
  input: Types.WorkspacePollInput;
}>;


export type MobileWorkspaceCreatePollMutation = { workspaceCreatePoll: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type MobileWorkspaceUpdatePollMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
  input: Types.WorkspacePollInput;
}>;


export type MobileWorkspaceUpdatePollMutation = { workspaceUpdatePoll: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type MobileWorkspaceOpenPollMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
  closesAt?: string | null | undefined;
}>;


export type MobileWorkspaceOpenPollMutation = { workspaceOpenPoll: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type MobileWorkspaceClosePollMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
}>;


export type MobileWorkspaceClosePollMutation = { workspaceClosePoll: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type MobileWorkspaceReopenPollMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
  closesAt: string;
}>;


export type MobileWorkspaceReopenPollMutation = { workspaceReopenPoll: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type MobileWorkspaceCancelPollMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
  reason?: string | null | undefined;
}>;


export type MobileWorkspaceCancelPollMutation = { workspaceCancelPoll: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type MobileWorkspaceDeletePollMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
}>;


export type MobileWorkspaceDeletePollMutation = { workspaceDeletePoll: boolean | null };

export type MobileWorkspaceCastPollVoteMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
  answers: Array<Types.WorkspacePollAnswerInput | null | undefined> | Types.WorkspacePollAnswerInput;
}>;


export type MobileWorkspaceCastPollVoteMutation = { workspaceCastPollVote: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type MobileWorkspaceWithdrawPollVoteMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
}>;


export type MobileWorkspaceWithdrawPollVoteMutation = { workspaceWithdrawPollVote: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type MobileCommitteePollNotificationsQueryVariables = Exact<{
  committeeId: string;
  limit: number;
  offset?: number | null | undefined;
}>;


export type MobileCommitteePollNotificationsQuery = { myNotifications: Array<{ _id: string | null, entityId: string | null, eventType: string | null, eventDetails: string | null, createdAt: string | null, isRead: boolean | null } | null> | null };

export type MobileWorkspaceProjectFieldsFragment = { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null };

export type MobileWorkspaceTaskFieldsFragment = { _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null };

export type MobileWorkspaceProjectsInfoQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceProjectsInfoQuery = { workspaceProjectsInfo: { canManage: boolean | null, myPersonId: string | null } | null };

export type MobileWorkspaceProjectMembersQueryVariables = Exact<{
  committeeId: string;
}>;


export type MobileWorkspaceProjectMembersQuery = { workspaceProjectMembers: Array<{ personId: string | null, name: string | null, isCoordinator: boolean | null } | null> | null };

export type MobileWorkspaceProjectsQueryVariables = Exact<{
  committeeId: string;
  view?: string | null | undefined;
  text?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobileWorkspaceProjectsQuery = { workspaceProjects: { totalResults: number | null, data: Array<{ _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null> | null } | null };

export type MobileWorkspaceProjectByIdQueryVariables = Exact<{
  committeeId: string;
  projectId: string;
}>;


export type MobileWorkspaceProjectByIdQuery = { workspaceProjectById: { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null };

export type MobileWorkspaceTasksQueryVariables = Exact<{
  committeeId: string;
  view?: string | null | undefined;
  projectId?: string | null | undefined;
  standalone?: boolean | null | undefined;
  assigneeId?: string | null | undefined;
  priority?: string | null | undefined;
  text?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobileWorkspaceTasksQuery = { workspaceTasks: { totalResults: number | null, data: Array<{ _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null } | null> | null } | null };

export type MobileWorkspaceTaskByIdQueryVariables = Exact<{
  committeeId: string;
  taskId: string;
}>;


export type MobileWorkspaceTaskByIdQuery = { workspaceTaskById: { _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null } | null };

export type MobileWorkspaceTaskCommentsQueryVariables = Exact<{
  committeeId: string;
  taskId: string;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type MobileWorkspaceTaskCommentsQuery = { workspaceTaskComments: { totalResults: number | null, data: Array<{ _id: string | null, taskId: string | null, text: string | null, authorName: string | null, isOwn: boolean | null, canDelete: boolean | null, createdAt: string | null } | null> | null } | null };

export type MobileWorkspaceProjectsActivityQueryVariables = Exact<{
  committeeId: string;
  projectId?: string | null | undefined;
  taskId?: string | null | undefined;
  before?: string | null | undefined;
  limit?: number | null | undefined;
}>;


export type MobileWorkspaceProjectsActivityQuery = { workspaceProjectsActivity: Array<{ _id: string | null, action: string | null, entityType: string | null, entityId: string | null, projectId: string | null, taskId: string | null, userName: string | null, at: string | null, details: string | null } | null> | null };

export type MobileWorkspaceCreateProjectMutationVariables = Exact<{
  committeeId: string;
  input: Types.WorkspaceProjectInput;
}>;


export type MobileWorkspaceCreateProjectMutation = { workspaceCreateProject: { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null };

export type MobileWorkspaceUpdateProjectMutationVariables = Exact<{
  committeeId: string;
  projectId: string;
  input: Types.WorkspaceProjectInput;
}>;


export type MobileWorkspaceUpdateProjectMutation = { workspaceUpdateProject: { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null };

export type MobileWorkspaceSetProjectStatusMutationVariables = Exact<{
  committeeId: string;
  projectId: string;
  status: string;
  force?: boolean | null | undefined;
}>;


export type MobileWorkspaceSetProjectStatusMutation = { workspaceSetProjectStatus: { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null };

export type MobileWorkspaceAddProjectParticipantsMutationVariables = Exact<{
  committeeId: string;
  projectId: string;
  personIds: Array<string | null | undefined> | string;
}>;


export type MobileWorkspaceAddProjectParticipantsMutation = { workspaceAddProjectParticipants: { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null };

export type MobileWorkspaceRemoveProjectParticipantMutationVariables = Exact<{
  committeeId: string;
  projectId: string;
  personId: string;
  unassignTasks?: boolean | null | undefined;
}>;


export type MobileWorkspaceRemoveProjectParticipantMutation = { workspaceRemoveProjectParticipant: { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null };

export type MobileWorkspaceDeleteProjectMutationVariables = Exact<{
  committeeId: string;
  projectId: string;
  deleteTasks?: boolean | null | undefined;
}>;


export type MobileWorkspaceDeleteProjectMutation = { workspaceDeleteProject: boolean | null };

export type MobileWorkspaceCreateTaskMutationVariables = Exact<{
  committeeId: string;
  input: Types.WorkspaceTaskInput;
}>;


export type MobileWorkspaceCreateTaskMutation = { workspaceCreateTask: { _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null } | null };

export type MobileWorkspaceUpdateTaskMutationVariables = Exact<{
  committeeId: string;
  taskId: string;
  input: Types.WorkspaceTaskInput;
}>;


export type MobileWorkspaceUpdateTaskMutation = { workspaceUpdateTask: { _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null } | null };

export type MobileWorkspaceDeleteTaskMutationVariables = Exact<{
  committeeId: string;
  taskId: string;
}>;


export type MobileWorkspaceDeleteTaskMutation = { workspaceDeleteTask: boolean | null };

export type MobileWorkspaceSetTaskStatusMutationVariables = Exact<{
  committeeId: string;
  taskId: string;
  status: string;
}>;


export type MobileWorkspaceSetTaskStatusMutation = { workspaceSetTaskStatus: { _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null } | null };

export type MobileWorkspaceSetTaskProgressMutationVariables = Exact<{
  committeeId: string;
  taskId: string;
  progress: number;
}>;


export type MobileWorkspaceSetTaskProgressMutation = { workspaceSetTaskProgress: { _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null } | null };

export type MobileWorkspaceAddTaskCommentMutationVariables = Exact<{
  committeeId: string;
  taskId: string;
  text: string;
}>;


export type MobileWorkspaceAddTaskCommentMutation = { workspaceAddTaskComment: { _id: string | null } | null };

export type MobileWorkspaceDeleteTaskCommentMutationVariables = Exact<{
  committeeId: string;
  commentId: string;
}>;


export type MobileWorkspaceDeleteTaskCommentMutation = { workspaceDeleteTaskComment: boolean | null };

export type MobileCommitteeProjectNotificationsQueryVariables = Exact<{
  committeeId: string;
  limit: number;
  offset?: number | null | undefined;
}>;


export type MobileCommitteeProjectNotificationsQuery = { myNotifications: Array<{ _id: string | null, entityType: string | null, entityId: string | null, eventType: string | null, eventDetails: string | null, createdAt: string | null, isRead: boolean | null } | null> | null };

export type RegisterUserMutationVariables = Exact<{
  displayName: string;
  email: string;
}>;


export type RegisterUserMutation = { registerUser: number | null };

export type TwoFactorStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type TwoFactorStatusQuery = { currentUser: { _id: string | null, twoFactorEnabled: boolean | null } | null };

export type StartTwoFactorSetupMutationVariables = Exact<{ [key: string]: never; }>;


export type StartTwoFactorSetupMutation = { startTwoFactorSetup: { qrCodeSvg: string | null, secret: string | null } | null };

export type EnableTwoFactorMutationVariables = Exact<{
  code: string;
}>;


export type EnableTwoFactorMutation = { enableTwoFactor: { _id: string | null, twoFactorEnabled: boolean | null } | null };

export type DisableTwoFactorMutationVariables = Exact<{
  code: string;
}>;


export type DisableTwoFactorMutation = { disableTwoFactor: { _id: string | null, twoFactorEnabled: boolean | null } | null };

export type UpdateLastActiveTimeMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateLastActiveTimeMutation = { updateLastActiveTime: number | null };

export type UpdateLoginTimeMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateLoginTimeMutation = { updateLoginTime: number | null };

export type CityByIdQueryVariables = Exact<{
  _id: string;
}>;


export type CityByIdQuery = { cityById: { _id: string | null, name: string | null, peripheryOf: string | null, country: string | null, region: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type CityMehfilsByCityIdQueryVariables = Exact<{
  cityId: string;
}>;


export type CityMehfilsByCityIdQuery = { cityMehfilsByCityId: Array<{ _id: string | null, cityId: string | null, name: string | null, address: string | null, karkunCount: number | null, mehfilStartYear: string | null, timingDetails: string | null, lcdAvailability: boolean | null, tabAvailability: boolean | null, otherMehfilDetails: string | null } | null> | null };

export type CreateCityMehfilMutationVariables = Exact<{
  name: string;
  cityId: string;
  address?: string | null | undefined;
  mehfilStartYear?: string | null | undefined;
  timingDetails?: string | null | undefined;
  lcdAvailability?: boolean | null | undefined;
  tabAvailability?: boolean | null | undefined;
  otherMehfilDetails?: string | null | undefined;
}>;


export type CreateCityMehfilMutation = { createCityMehfil: { _id: string | null, name: string | null, cityId: string | null, address: string | null, mehfilStartYear: string | null, timingDetails: string | null, lcdAvailability: boolean | null, tabAvailability: boolean | null, otherMehfilDetails: string | null } | null };

export type CreateCityMutationVariables = Exact<{
  name: string;
  peripheryOf?: string | null | undefined;
  country: string;
  region?: string | null | undefined;
}>;


export type CreateCityMutation = { createCity: { _id: string | null, name: string | null, peripheryOf: string | null, region: string | null, country: string | null } | null };

export type PagedCitiesQueryVariables = Exact<{
  filter?: Types.CityFilter | null | undefined;
}>;


export type PagedCitiesQuery = { pagedCities: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, peripheryOf: string | null, country: string | null, region: string | null, karkunCount: number | null, memberCount: number | null, peripheryOfCity: { _id: string | null, name: string | null } | null, mehfils: Array<{ _id: string | null, name: string | null } | null> | null } | null> | null } | null };

export type RemoveCityMehfilMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveCityMehfilMutation = { removeCityMehfil: number | null };

export type RemoveCityMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveCityMutation = { removeCity: number | null };

export type UpdateCityMehfilMutationVariables = Exact<{
  _id: string;
  name: string;
  cityId: string;
  address?: string | null | undefined;
  mehfilStartYear?: string | null | undefined;
  timingDetails?: string | null | undefined;
  lcdAvailability?: boolean | null | undefined;
  tabAvailability?: boolean | null | undefined;
  otherMehfilDetails?: string | null | undefined;
}>;


export type UpdateCityMehfilMutation = { updateCityMehfil: { _id: string | null, name: string | null, cityId: string | null, address: string | null, mehfilStartYear: string | null, timingDetails: string | null, lcdAvailability: boolean | null, tabAvailability: boolean | null, otherMehfilDetails: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateCityMutationVariables = Exact<{
  _id: string;
  name: string;
  peripheryOf?: string | null | undefined;
  country: string;
  region?: string | null | undefined;
}>;


export type UpdateCityMutation = { updateCity: { _id: string | null, name: string | null, peripheryOf: string | null, region: string | null, country: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type DistinctRegionsQueryVariables = Exact<{ [key: string]: never; }>;


export type DistinctRegionsQuery = { distinctRegions: Array<string | null> | null };

export type CommitteeLocationKarkunsQueryVariables = Exact<{
  locationId: string;
  name?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type CommitteeLocationKarkunsQuery = { pagedOrgLocationKarkuns: { totalResults: number, data: Array<{ _id: string, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null }> } };

export type AddCommitteeMemberMutationVariables = Exact<{
  committeeId: string;
  karkunId: string;
  role?: string | null | undefined;
}>;


export type AddCommitteeMemberMutation = { addCommitteeMember: { _id: string | null } | null };

export type CommitteeByIdQueryVariables = Exact<{
  id: string;
}>;


export type CommitteeByIdQuery = { committeeById: { _id: string | null, name: string | null, color: string | null, description: string | null, locationId: string | null, features: Array<string | null> | null, memberCount: number | null, guestCount: number | null, observerCount: number | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, members: Array<{ karkunId: string | null } | null> | null } | null };

export type AllCommitteeFeaturesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllCommitteeFeaturesQuery = { allCommitteeFeatures: Array<{ key: string | null, name: string | null, description: string | null, category: string | null } | null> | null };

export type EnableCommitteeFeatureMutationVariables = Exact<{
  committeeId: string;
  featureKey: string;
}>;


export type EnableCommitteeFeatureMutation = { enableCommitteeFeature: boolean };

export type DisableCommitteeFeatureMutationVariables = Exact<{
  committeeId: string;
  featureKey: string;
}>;


export type DisableCommitteeFeatureMutation = { disableCommitteeFeature: boolean };

export type UpdateCommitteeMutationVariables = Exact<{
  id: string;
  name: string;
  color?: string | null | undefined;
  description?: string | null | undefined;
}>;


export type UpdateCommitteeMutation = { updateCommittee: { _id: string | null, name: string | null } | null };

export type RemoveCommitteeMemberMutationVariables = Exact<{
  committeeId: string;
  karkunId: string;
}>;


export type RemoveCommitteeMemberMutation = { removeCommitteeMember: { _id: string | null } | null };

export type SetCommitteeMemberRoleMutationVariables = Exact<{
  committeeId: string;
  karkunId: string;
  role: string;
}>;


export type SetCommitteeMemberRoleMutation = { setCommitteeMemberRole: { _id: string | null } | null };

export type SetCommitteeMemberDiscussionAccessMutationVariables = Exact<{
  committeeId: string;
  karkunId: string;
  hasAccess: boolean;
}>;


export type SetCommitteeMemberDiscussionAccessMutation = { setCommitteeMemberDiscussionAccess: boolean | null };

export type CommitteeMembersQueryVariables = Exact<{
  committeeId: string;
  roles: Array<string> | string;
  pageIndex: number;
  pageSize: number;
}>;


export type CommitteeMembersQuery = { committeeMembers: { totalResults: number | null, data: Array<{ karkunId: string | null, role: string | null, hasLoginAccount: boolean | null, hasChatAccount: boolean | null, hasDiscussionAccess: boolean | null, karkun: { _id: string | null, sharedData: { name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, contactNumber1: string | null, contactNumber2: string | null } | null } | null } | null> | null } | null };

export type MoveCommitteeMutationVariables = Exact<{
  committeeId: string;
  locationId: string;
}>;


export type MoveCommitteeMutation = { moveCommittee: { _id: string | null, locationId: string | null } | null };

export type DeletedPersonByIdQueryVariables = Exact<{
  _id: string;
}>;


export type DeletedPersonByIdQuery = { deletedPersonById: { _id: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, deletedAt: string | null, deletedBy: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, ehadDate: string | null, birthDate: string | null, referenceName: string | null, contactNumber1: string | null, contactNumber2: string | null, currentAddress: string | null, permanentAddress: string | null, educationalQualification: string | null, meansOfEarning: string | null, imageUrl: string | null, tagIds: Array<string | null> | null, tags: Array<{ _id: string | null, name: string | null, color: string | null, textColor: string | null } | null> | null } | null, visitorData: { city: string | null, country: string | null, criminalRecord: string | null, otherNotes: string | null } | null } | null };

export type DeletedPersonRelationCountsQueryVariables = Exact<{
  ids: Array<string> | string;
}>;


export type DeletedPersonRelationCountsQuery = { deletedPersonRelationCounts: Array<{ personId: string, total: number, counts: Array<{ name: string, count: number }> }> | null };

export type HardDeletePeopleMutationVariables = Exact<{
  _ids: Array<string> | string;
}>;


export type HardDeletePeopleMutation = { hardDeletePeople: number | null };

export type PagedDeletedPeopleQueryVariables = Exact<{
  filter?: Types.PersonFilter | null | undefined;
}>;


export type PagedDeletedPeopleQuery = { pagedDeletedPeople: { totalResults: number | null, data: Array<{ _id: string | null, isKarkun: boolean | null, sharedData: { name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null, tags: Array<{ _id: string | null, name: string | null, color: string | null, textColor: string | null } | null> | null } | null, visitorData: { city: string | null, country: string | null, criminalRecord: string | null, otherNotes: string | null } | null } | null> | null } | null };

export type RestorePersonMutationVariables = Exact<{
  _id: string;
}>;


export type RestorePersonMutation = { restorePerson: number | null };

export type DeleteDuplicatePeopleMutationVariables = Exact<{
  _ids: Array<string | null | undefined> | string;
}>;


export type DeleteDuplicatePeopleMutation = { deleteDuplicatePeople: number | null };

export type DuplicateCnicsQueryVariables = Exact<{ [key: string]: never; }>;


export type DuplicateCnicsQuery = { duplicateCnics: Array<{ value: string | null, count: number | null, people: Array<{ _id: string | null, name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, updatedAt: string | null } | null> | null } | null> | null };

export type DuplicatePersonByIdQueryVariables = Exact<{
  _id: string;
}>;


export type DuplicatePersonByIdQuery = { duplicatePersonById: { _id: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, deletedAt: string | null, deletedBy: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, ehadDate: string | null, birthDate: string | null, referenceName: string | null, contactNumber1: string | null, contactNumber2: string | null, currentAddress: string | null, permanentAddress: string | null, educationalQualification: string | null, meansOfEarning: string | null, imageUrl: string | null, tagIds: Array<string | null> | null, tags: Array<{ _id: string | null, name: string | null, color: string | null, textColor: string | null } | null> | null } | null, visitorData: { city: string | null, country: string | null, criminalRecord: string | null, otherNotes: string | null } | null } | null };

export type DuplicatePersonRelationCountsQueryVariables = Exact<{
  ids: Array<string> | string;
}>;


export type DuplicatePersonRelationCountsQuery = { duplicatePersonRelationCounts: Array<{ personId: string, total: number, counts: Array<{ name: string, count: number }> }> | null };

export type DuplicatePhoneNumbersQueryVariables = Exact<{ [key: string]: never; }>;


export type DuplicatePhoneNumbersQuery = { duplicatePhoneNumbers: Array<{ value: string | null, count: number | null, people: Array<{ _id: string | null, name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, updatedAt: string | null } | null> | null } | null> | null };

export type AdminFaceRecognitionSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminFaceRecognitionSettingsQuery = { adminFaceRecognitionSettings: { matchThreshold: number | null, minMatchMargin: number | null, minDetectionScore: number | null, minFacePixels: number | null, minSharpness: number | null, minFacePose: number | null, updatedAt: unknown, updatedBy: string | null, defaults: { matchThreshold: number | null, minMatchMargin: number | null, minDetectionScore: number | null, minFacePixels: number | null, minSharpness: number | null, minFacePose: number | null } | null } | null };

export type AdminPeopleRegistrationImageSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminPeopleRegistrationImageSettingsQuery = { adminPeopleRegistrationImageSettings: { minDetectionScore: number | null, minFacePixels: number | null, minSharpness: number | null, minFacePose: number | null, updatedAt: unknown, updatedBy: string | null, defaults: { minDetectionScore: number | null, minFacePixels: number | null, minSharpness: number | null, minFacePose: number | null } | null } | null };

export type AdminPeopleSearchFaceSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminPeopleSearchFaceSettingsQuery = { adminPeopleSearchFaceSettings: { matchThreshold: number | null, minMatchMargin: number | null, minDetectionScore: number | null, minFacePixels: number | null, minSharpness: number | null, minFacePose: number | null, updatedAt: unknown, updatedBy: string | null, defaults: { matchThreshold: number | null, minMatchMargin: number | null, minDetectionScore: number | null, minFacePixels: number | null, minSharpness: number | null, minFacePose: number | null } | null } | null };

export type UpdateAdminFaceRecognitionSettingsMutationVariables = Exact<{
  matchThreshold: number;
  minMatchMargin: number;
  minDetectionScore: number;
  minFacePixels: number;
  minSharpness: number;
  minFacePose: number;
}>;


export type UpdateAdminFaceRecognitionSettingsMutation = { updateAdminFaceRecognitionSettings: { matchThreshold: number | null, minMatchMargin: number | null, minDetectionScore: number | null, minFacePixels: number | null, minSharpness: number | null, minFacePose: number | null, updatedAt: unknown, updatedBy: string | null } | null };

export type UpdateAdminPeopleRegistrationImageSettingsMutationVariables = Exact<{
  minDetectionScore: number;
  minFacePixels: number;
  minSharpness: number;
  minFacePose: number;
}>;


export type UpdateAdminPeopleRegistrationImageSettingsMutation = { updateAdminPeopleRegistrationImageSettings: { minDetectionScore: number | null, minFacePixels: number | null, minSharpness: number | null, minFacePose: number | null, updatedAt: unknown, updatedBy: string | null } | null };

export type UpdateAdminPeopleSearchFaceSettingsMutationVariables = Exact<{
  matchThreshold: number;
  minMatchMargin: number;
  minDetectionScore: number;
  minFacePixels: number;
  minSharpness: number;
  minFacePose: number;
}>;


export type UpdateAdminPeopleSearchFaceSettingsMutation = { updateAdminPeopleSearchFaceSettings: { matchThreshold: number | null, minMatchMargin: number | null, minDetectionScore: number | null, minFacePixels: number | null, minSharpness: number | null, minFacePose: number | null, updatedAt: unknown, updatedBy: string | null } | null };

export type PagedFreeFormCitiesQueryVariables = Exact<{
  pageIndex: number;
  pageSize: number;
}>;


export type PagedFreeFormCitiesQuery = { pagedFreeFormCities: { totalResults: number | null, data: Array<{ name: string | null, count: number | null, locationId: string | null, locationName: string | null } | null> | null } | null };

export type PagedFreeFormCountriesQueryVariables = Exact<{
  pageIndex: number;
  pageSize: number;
}>;


export type PagedFreeFormCountriesQuery = { pagedFreeFormCountries: { totalResults: number | null, data: Array<{ name: string | null, count: number | null } | null> | null } | null };

export type RenameFreeFormCityMutationVariables = Exact<{
  existingSpelling: string;
  newSpelling: string;
}>;


export type RenameFreeFormCityMutation = { renameFreeFormCity: number | null };

export type RenameFreeFormCountryMutationVariables = Exact<{
  existingSpelling: string;
  newSpelling: string;
}>;


export type RenameFreeFormCountryMutation = { renameFreeFormCountry: number | null };

export type UpdateCityLocationMappingsMutationVariables = Exact<{ [key: string]: never; }>;


export type UpdateCityLocationMappingsMutation = { updateCityLocationMappings: number | null };

export type AllJobDefinitionsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllJobDefinitionsQuery = { allJobDefinitions: Array<{ _id: string | null, name: string | null, displayName: string | null, defaultSchedule: string | null, schedule: string | null, enabled: boolean | null, createdAt: unknown, updatedAt: unknown } | null> | null };

export type ClearJobDefinitionScheduleMutationVariables = Exact<{
  _id: string;
}>;


export type ClearJobDefinitionScheduleMutation = { clearJobDefinitionSchedule: { _id: string | null, schedule: string | null, updatedAt: unknown } | null };

export type IsJobProcessorActiveQueryVariables = Exact<{ [key: string]: never; }>;


export type IsJobProcessorActiveQuery = { isJobProcessorActive: boolean | null };

export type PagedJobLogsQueryVariables = Exact<{
  filter?: Types.JobLogsFilterType | null | undefined;
}>;


export type PagedJobLogsQuery = { pagedJobLogs: { totalResults: number | null, data: Array<{ _id: string | null, timestamp: unknown, level: string | null, event: string | null, jobId: string | null, jobName: string | null, message: string | null, duration: number | null, error: string | null, failCount: number | null, retryDelay: number | null, retryAttempt: number | null } | null> | null } | null };

export type PagedScheduledJobsQueryVariables = Exact<{
  filter?: Types.ScheduledJobsFilterType | null | undefined;
}>;


export type PagedScheduledJobsQuery = { pagedScheduledJobs: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, status: string | null, progress: number | null, nextRunAt: unknown, lastRunAt: unknown, lastFinishedAt: unknown, failedAt: unknown, failReason: string | null, failCount: number | null, repeatInterval: string | null, disabled: boolean | null } | null> | null } | null };

export type ResetJobDefinitionScheduleMutationVariables = Exact<{
  _id: string;
}>;


export type ResetJobDefinitionScheduleMutation = { resetJobDefinitionSchedule: { _id: string | null, schedule: string | null, updatedAt: unknown } | null };

export type RetryFailedJobMutationVariables = Exact<{
  _id: string;
}>;


export type RetryFailedJobMutation = { retryFailedJob: boolean | null };

export type RunScheduledJobNowMutationVariables = Exact<{
  name: string;
}>;


export type RunScheduledJobNowMutation = { runScheduledJobNow: boolean | null };

export type SetJobDefinitionEnabledMutationVariables = Exact<{
  _id: string;
  enabled: boolean;
}>;


export type SetJobDefinitionEnabledMutation = { setJobDefinitionEnabled: { _id: string | null, enabled: boolean | null, updatedAt: unknown } | null };

export type SetScheduledJobEnabledMutationVariables = Exact<{
  _id: string;
  enabled: boolean;
}>;


export type SetScheduledJobEnabledMutation = { setScheduledJobEnabled: boolean | null };

export type UpdateJobDefinitionScheduleMutationVariables = Exact<{
  _id: string;
  schedule: string;
}>;


export type UpdateJobDefinitionScheduleMutation = { updateJobDefinitionSchedule: { _id: string | null, schedule: string | null, updatedAt: unknown } | null };

export type AllMehfilDutiesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllMehfilDutiesQuery = { allMehfilDuties: Array<{ _id: string, name: string, description: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null> | null };

export type CreateMehfilDutyMutationVariables = Exact<{
  name: string;
  description?: string | null | undefined;
}>;


export type CreateMehfilDutyMutation = { createMehfilDuty: { _id: string } | null };

export type DeleteMehfilDutyMutationVariables = Exact<{
  _id: string;
}>;


export type DeleteMehfilDutyMutation = { deleteMehfilDuty: boolean | null };

export type UpdateMehfilDutyMutationVariables = Exact<{
  _id: string;
  name?: string | null | undefined;
  description?: string | null | undefined;
}>;


export type UpdateMehfilDutyMutation = { updateMehfilDuty: { _id: string } | null };

export type AllOrgLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllOrgLocationsQuery = { allOrgLocations: Array<{ _id: string | null, name: string | null, type: string | null, parentId: string | null, allParentIds: Array<string | null> | null, observerKarkunIds: Array<string | null> | null, committees: Array<{ _id: string | null, name: string | null } | null> | null } | null> | null };

export type CreateOrgLocationMutationVariables = Exact<{
  name: string;
  type: string;
  parentId?: string | null | undefined;
  mehfilDetails?: Types.OrgLocationMehfilDetailsInput | null | undefined;
}>;


export type CreateOrgLocationMutation = { createOrgLocation: { _id: string | null, name: string | null } | null };

export type OrgLocationByIdQueryVariables = Exact<{
  _id: string;
}>;


export type OrgLocationByIdQuery = { orgLocationById: { _id: string | null, name: string | null, type: string | null, parentId: string | null, allParentIds: Array<string | null> | null, observerKarkunIds: Array<string | null> | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, committees: Array<{ _id: string | null } | null> | null, mehfilDetails: { address: string | null, mehfilStartYear: string | null, timingDetails: string | null, lcdAvailability: boolean | null, tabAvailability: boolean | null, otherMehfilDetails: string | null, latitude: number | null, longitude: number | null, attendanceGeofenceMeters: number | null } | null } | null };

export type UpdateOrgLocationMutationVariables = Exact<{
  _id: string;
  name: string;
  parentId?: string | null | undefined;
  mehfilDetails?: Types.OrgLocationMehfilDetailsInput | null | undefined;
}>;


export type UpdateOrgLocationMutation = { updateOrgLocation: { _id: string | null, name: string | null } | null };

export type LocationKarkunsQueryVariables = Exact<{
  locationId: string;
  name?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type LocationKarkunsQuery = { pagedOrgLocationKarkuns: { totalResults: number, data: Array<{ _id: string, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, hasUserAccount: boolean }> } };

export type UserAccountAvailabilityQueryVariables = Exact<{
  userName?: string | null | undefined;
  email?: string | null | undefined;
}>;


export type UserAccountAvailabilityQuery = { userAccountAvailability: { userNameMessage: string | null, emailMessage: string | null } };

export type LinkableUsersQueryVariables = Exact<{
  search?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type LinkableUsersQuery = { pagedLinkableUsers: { totalResults: number | null, data: Array<{ _id: string | null, username: string | null, email: string | null, displayName: string | null } | null> | null } | null };

export type LinkOrgLocationUserMutationVariables = Exact<{
  locationId: string;
  karkunId: string;
  userId: string;
}>;


export type LinkOrgLocationUserMutation = { linkOrgLocationUser: { _id: string | null } | null };

export type LocationCommitteesQueryVariables = Exact<{
  locationId: string;
}>;


export type LocationCommitteesQuery = { committeesByLocationId: Array<{ _id: string | null, name: string | null, color: string | null, memberCount: number | null, guestCount: number | null, observerCount: number | null } | null> | null };

export type CreateLocationCommitteeMutationVariables = Exact<{
  name: string;
  color?: string | null | undefined;
  description?: string | null | undefined;
  locationId: string;
}>;


export type CreateLocationCommitteeMutation = { createCommittee: { _id: string | null, name: string | null } | null };

export type RemoveLocationCommitteeMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveLocationCommitteeMutation = { removeCommittee: number | null };

export type OrgLocationFeaturePermissionsQueryVariables = Exact<{
  locationId: string;
}>;


export type OrgLocationFeaturePermissionsQuery = { orgLocationFeaturePermissions: Array<{ featureKey: string, featureName: string, permissions: Array<{ key: string, name: string, description: string, users: Array<{ userId: string, personId: string | null, username: string | null, displayName: string | null } | null> } | null> } | null> | null };

export type HrFeatureUserKarkunSearchQueryVariables = Exact<{
  locationId: string;
  name?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type HrFeatureUserKarkunSearchQuery = { pagedOrgLocationKarkuns: { totalResults: number, data: Array<{ _id: string, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null }> } };

export type AddOrgLocationFeatureUserMutationVariables = Exact<{
  locationId: string;
  featureKey: string;
  permissionKey: string;
  karkunId: string;
}>;


export type AddOrgLocationFeatureUserMutation = { addOrgLocationFeatureUser: boolean | null };

export type RemoveOrgLocationFeatureUserMutationVariables = Exact<{
  locationId: string;
  featureKey: string;
  permissionKey: string;
  userId: string;
}>;


export type RemoveOrgLocationFeatureUserMutation = { removeOrgLocationFeatureUser: boolean | null };

export type LocationObserversQueryVariables = Exact<{
  _id: string;
}>;


export type LocationObserversQuery = { orgLocationById: { _id: string | null, observerStats: Array<{ karkunId: string | null, observedCommitteeCount: number | null, observedCommitteeIds: Array<string | null> | null } | null> | null, observers: Array<{ _id: string | null, sharedData: { name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, contactNumber1: string | null, contactNumber2: string | null } | null } | null> | null } | null };

export type AddOrgLocationObserverMutationVariables = Exact<{
  locationId: string;
  karkunId: string;
}>;


export type AddOrgLocationObserverMutation = { addOrgLocationObserver: { _id: string | null } | null };

export type RemoveOrgLocationObserverMutationVariables = Exact<{
  locationId: string;
  karkunId: string;
}>;


export type RemoveOrgLocationObserverMutation = { removeOrgLocationObserver: { _id: string | null } | null };

export type HrLocationObserverKarkunSearchQueryVariables = Exact<{
  filter?: Types.KarkunFilter | null | undefined;
}>;


export type HrLocationObserverKarkunSearchQuery = { pagedHrKarkuns: { totalResults: number | null, data: Array<{ _id: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null } | null> | null } | null };

export type SyncOrgLocationObserversMutationVariables = Exact<{
  locationId: string;
}>;


export type SyncOrgLocationObserversMutation = { syncOrgLocationObservers: { committeesChecked: number | null, addedCount: number | null, removedCount: number | null } | null };

export type LocationUsersQueryVariables = Exact<{
  locationId: string;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type LocationUsersQuery = { pagedOrgLocationUsers: { totalResults: number | null, data: Array<{ _id: string | null, username: string | null, email: string | null, locked: boolean | null, lastActiveAt: string | null, hasChatAccount: boolean | null, twoFactorEnabled: boolean | null, karkun: { _id: string | null, sharedData: { name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null } | null } | null> | null } | null };

export type ResetOrgLocationUserPasswordMutationVariables = Exact<{
  locationId: string;
  userId: string;
  password: string;
}>;


export type ResetOrgLocationUserPasswordMutation = { resetOrgLocationUserPassword: { _id: string | null } | null };

export type SetOrgLocationUserLockedMutationVariables = Exact<{
  locationId: string;
  userId: string;
  locked: boolean;
}>;


export type SetOrgLocationUserLockedMutation = { setOrgLocationUserLocked: { _id: string | null, locked: boolean | null } | null };

export type CreateOrgLocationUserChatAccountMutationVariables = Exact<{
  locationId: string;
  userId: string;
}>;


export type CreateOrgLocationUserChatAccountMutation = { createOrgLocationUserChatAccount: { _id: string | null, hasChatAccount: boolean | null } | null };

export type AllPeopleTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllPeopleTagsQuery = { allPeopleTags: Array<{ _id: string | null, name: string | null, color: string | null, textColor: string | null, moduleNames: Array<string | null> | null } | null> | null };

export type CreatePeopleTagMutationVariables = Exact<{
  name: string;
  color: string;
  textColor: string;
  moduleNames: Array<string | null | undefined> | string;
}>;


export type CreatePeopleTagMutation = { createPeopleTag: { _id: string | null, name: string | null, color: string | null, textColor: string | null, moduleNames: Array<string | null> | null } | null };

export type DeletePeopleTagMutationVariables = Exact<{
  _id: string;
}>;


export type DeletePeopleTagMutation = { deletePeopleTag: number | null };

export type UpdatePeopleTagMutationVariables = Exact<{
  _id: string;
  name: string;
  color: string;
  textColor: string;
  moduleNames: Array<string | null | undefined> | string;
}>;


export type UpdatePeopleTagMutation = { updatePeopleTag: { _id: string | null, name: string | null, color: string | null, textColor: string | null, moduleNames: Array<string | null> | null } | null };

export type AdminPhysicalStoreByIdQueryVariables = Exact<{
  id: string;
}>;


export type AdminPhysicalStoreByIdQuery = { referencePhysicalStoreById: { _id: string | null, name: string | null, address: string | null } | null };

export type CreatePhysicalStoreMutationVariables = Exact<{
  name: string;
  address?: string | null | undefined;
}>;


export type CreatePhysicalStoreMutation = { createPhysicalStore: { _id: string | null, name: string | null, address: string | null } | null };

export type UpdatePhysicalStoreMutationVariables = Exact<{
  id: string;
  name: string;
  address: string;
}>;


export type UpdatePhysicalStoreMutation = { updatePhysicalStore: { _id: string | null, name: string | null, address: string | null } | null };

export type PagedSecurityLogsQueryVariables = Exact<{
  filter?: Types.SecurityLogFilter | null | undefined;
}>;


export type PagedSecurityLogsQuery = { pagedSecurityLogs: { totalResults: number | null, data: Array<{ _id: string | null, userId: string | null, operationType: string | null, operationDetails: unknown, operationTime: string | null, operationBy: string | null, dataSource: string | null, dataSourceDetail: string | null, userName: string | null, userImageUrl: string | null, userImageThumbnailUrl: string | null, operationByName: string | null, operationByImageUrl: string | null, operationByImageThumbnailUrl: string | null } | null> | null } | null };

export type SecurityLogUsersQueryVariables = Exact<{
  search?: string | null | undefined;
  ids?: Array<string> | string | null | undefined;
}>;


export type SecurityLogUsersQuery = { securityLogUsers: Array<{ _id: string, name: string }> };

export type CreateUserGroupMutationVariables = Exact<{
  name: string;
  moduleName?: string | null | undefined;
  description?: string | null | undefined;
}>;


export type CreateUserGroupMutation = { createUserGroup: { _id: string | null, name: string | null, moduleName: string | null, description: string | null } | null };

export type DeleteUserGroupMutationVariables = Exact<{
  _id: string;
}>;


export type DeleteUserGroupMutation = { deleteUserGroup: number | null };

export type PagedUserGroupsQueryVariables = Exact<{
  queryString?: string | null | undefined;
}>;


export type PagedUserGroupsQuery = { pagedUserGroups: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, moduleName: string | null, description: string | null, users: Array<{ userId: string, personId: string | null, username: string | null, displayName: string | null, karkun: { _id: string | null, sharedData: { name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null } | null } | null } | null> | null } | null> | null } | null };

export type SetUserGroupInstanceAccessMutationVariables = Exact<{
  _id: string;
  instances: Array<string | null | undefined> | string;
}>;


export type SetUserGroupInstanceAccessMutation = { setUserGroupInstanceAccess: { _id: string | null, instances: Array<string | null> | null } | null };

export type SetUserGroupPermissionsMutationVariables = Exact<{
  _id: string;
  permissions: Array<string | null | undefined> | string;
}>;


export type SetUserGroupPermissionsMutation = { setUserGroupPermissions: { _id: string | null, permissions: Array<string | null> | null } | null };

export type UpdateUserGroupMutationVariables = Exact<{
  _id: string;
  name: string;
  moduleName?: string | null | undefined;
  description?: string | null | undefined;
}>;


export type UpdateUserGroupMutation = { updateUserGroup: { _id: string | null, name: string | null, moduleName: string | null, description: string | null } | null };

export type UserGroupGeneralInfoByIdQueryVariables = Exact<{
  _id: string;
}>;


export type UserGroupGeneralInfoByIdQuery = { userGroupById: { _id: string | null, name: string | null, moduleName: string | null, description: string | null } | null };

export type UserGroupInstanceAccessByIdQueryVariables = Exact<{
  _id: string;
}>;


export type UserGroupInstanceAccessByIdQuery = { userGroupById: { _id: string | null, instances: Array<string | null> | null } | null };

export type UserGroupPermissionsByIdQueryVariables = Exact<{
  _id: string;
}>;


export type UserGroupPermissionsByIdQuery = { userGroupById: { _id: string | null, permissions: Array<string | null> | null } | null };

export type ClearLoginBlocksMutationVariables = Exact<{
  userId: string;
}>;


export type ClearLoginBlocksMutation = { clearLoginBlocks: { _id: string | null, loginBlockedAddresses: number | null, untrustedLoginAddressesBlocked: boolean | null } | null };

export type CreateChatAccountMutationVariables = Exact<{
  userId: string;
}>;


export type CreateChatAccountMutation = { createChatAccount: { _id: string | null, username: string | null, hasChatAccount: boolean | null } | null };

export type CreateServiceAccountMutationVariables = Exact<{
  userName: string;
  displayName?: string | null | undefined;
}>;


export type CreateServiceAccountMutation = { createServiceAccount: { _id: string | null } | null };

export type CreateUserMutationVariables = Exact<{
  userName?: string | null | undefined;
  password?: string | null | undefined;
  email?: string | null | undefined;
  displayName?: string | null | undefined;
  personId?: string | null | undefined;
}>;


export type CreateUserMutation = { createUser: { _id: string | null } | null };

export type PagedUsersQueryVariables = Exact<{
  filter?: Types.UserFilter | null | undefined;
}>;


export type PagedUsersQuery = { pagedUsers: { totalResults: number | null, data: Array<{ _id: string | null, username: string | null, email: string | null, displayName: string | null, locked: boolean | null, lastActiveAt: string | null, hasChatAccount: boolean | null, twoFactorEnabled: boolean | null, karkun: { _id: string | null, sharedData: { name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null } | null } | null> | null } | null };

export type ResetTwoFactorMutationVariables = Exact<{
  userId: string;
}>;


export type ResetTwoFactorMutation = { resetTwoFactor: { _id: string | null, twoFactorEnabled: boolean | null } | null };

export type ResetUserPasswordMutationVariables = Exact<{
  userId: string;
  password: string;
}>;


export type ResetUserPasswordMutation = { resetUserPassword: { _id: string | null } | null };

export type RevokeUserTrustedDevicesMutationVariables = Exact<{
  userId: string;
}>;


export type RevokeUserTrustedDevicesMutation = { revokeUserTrustedDevices: number | null };

export type SetInstanceAccessMutationVariables = Exact<{
  userId: string;
  instances: Array<string | null | undefined> | string;
}>;


export type SetInstanceAccessMutation = { setInstanceAccess: { _id: string | null, instances: Array<string | null> | null } | null };

export type SetPermissionsMutationVariables = Exact<{
  userId: string;
  permissions: Array<string | null | undefined> | string;
}>;


export type SetPermissionsMutation = { setPermissions: { _id: string | null, permissions: Array<string | null> | null } | null };

export type SetSuperAdminMutationVariables = Exact<{
  userId: string;
  isSuperAdmin: boolean;
}>;


export type SetSuperAdminMutation = { setSuperAdmin: { _id: string | null, isSuperAdmin: boolean | null, permissions: Array<string | null> | null } | null };

export type UpdateUserMutationVariables = Exact<{
  userId: string;
  userName?: string | null | undefined;
  email?: string | null | undefined;
  displayName?: string | null | undefined;
  locked?: boolean | null | undefined;
}>;


export type UpdateUserMutation = { updateUser: { _id: string | null, username: string | null, email: string | null, displayName: string | null, locked: boolean | null, hasChatAccount: boolean | null, personId: string | null, karkun: { _id: string | null, sharedData: { name: string | null } | null } | null } | null };

export type AdminUserByIdQueryVariables = Exact<{
  _id: string;
}>;


export type AdminUserByIdQuery = { userById: { _id: string | null, username: string | null, email: string | null, displayName: string | null, locked: boolean | null, hasChatAccount: boolean | null, chatUserId: string | null, twoFactorEnabled: boolean | null, isSuperAdmin: boolean | null, isServiceAccount: boolean | null, loginBlockedAddresses: number | null, untrustedLoginAddressesBlocked: boolean | null, instances: Array<string | null> | null, permissions: Array<string | null> | null, personId: string | null, karkun: { _id: string | null, sharedData: { name: string | null } | null } | null } | null };

export type UserTrustedDevicesQueryVariables = Exact<{
  userId: string;
}>;


export type UserTrustedDevicesQuery = { userTrustedDevices: Array<{ _id: string | null, name: string | null, createdAt: string | null, lastUsedAt: string | null } | null> | null };

export type UserNamesQueryVariables = Exact<{
  ids?: Array<string | null | undefined> | string | null | undefined;
}>;


export type UserNamesQuery = { userNames: Array<string | null> | null };

export type InboxConversationQueryVariables = Exact<{
  roomId: string;
}>;


export type InboxConversationQuery = { inboxConversation: { conversation: { _id: string | null, customerName: string | null, mobileNumber: string | null, startedAt: string | null, assignedTo: string | null, open: boolean | null } | null, messages: Array<{ _id: string | null, roomId: string | null, text: string | null, sentAt: string | null, senderType: string | null, senderName: string | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null } | null> | null } | null };

export type PagedInboxConversationsQueryVariables = Exact<{
  filter?: Types.InboxConversationFilter | null | undefined;
}>;


export type PagedInboxConversationsQuery = { pagedInboxConversations: { totalResults: number | null, data: Array<{ _id: string | null, mobileNumber: string | null, lastMessageAt: string | null } | null> | null } | null };

export type SendInboxMessageMutationVariables = Exact<{
  roomId: string;
  text: string;
}>;


export type SendInboxMessageMutation = { sendInboxMessage: { _id: string | null } | null };

export type UpdateAttachmentMutationVariables = Exact<{
  _id: string;
  name?: string | null | undefined;
  description?: string | null | undefined;
}>;


export type UpdateAttachmentMutation = { updateAttachment: { _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null };

export type HelperPagedHrKarkunsQueryVariables = Exact<{
  filter?: Types.KarkunFilter | null | undefined;
}>;


export type HelperPagedHrKarkunsQuery = { pagedHrKarkuns: { totalResults: number | null, data: Array<{ _id: string | null, sharedData: { name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null, karkunData: { lastTarteebDate: string | null, teams: Array<{ _id: string | null, name: string | null, duty: { _id: string | null, name: string | null } | null } | null> | null } | null, employeeData: { job: { _id: string | null, name: string | null } | null } | null } | null> | null } | null };

export type DutyAttendanceCardsQueryVariables = Exact<{
  month: string;
  dutyId: string;
  locationId?: string | null | undefined;
  shiftId?: string | null | undefined;
  karkunIds: Array<string> | string;
}>;


export type DutyAttendanceCardsQuery = { dutyAttendanceCards: Array<{ _id: string | null, karkunId: string | null, name: string | null, shiftNames: Array<string | null> | null, percentage: number | null, barcodeId: string | null, karkun: { _id: string | null, sharedData: { name: string | null, bloodGroup: string | null, imageUrl: string | null } | null } | null, duty: { _id: string | null, name: string | null } | null } | null> | null };

export type DutyAttendanceSheetQueryVariables = Exact<{
  month: string;
  dutyId: string;
  locationId?: string | null | undefined;
  shiftId?: string | null | undefined;
}>;


export type DutyAttendanceSheetQuery = { dutyAttendanceSheet: Array<{ _id: string | null, month: string | null, karkunId: string | null, name: string | null, dutyId: string | null, locationId: string | null, shiftId: string | null, shiftName: string | null, daysOnDuty: number | null, presentCount: number | null, lateCount: number | null, absentCount: number | null, unmarkedCount: number | null, percentage: number | null, barcodeId: string | null, karkun: { _id: string | null, sharedData: { name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, cnicNumber: string | null, contactNumber1: string | null, bloodGroup: string | null } | null } | null, duty: { _id: string | null, name: string | null } | null, location: { _id: string | null, name: string | null } | null } | null> | null };

export type PagedHrAuditLogsQueryVariables = Exact<{
  filter?: Types.AuditLogFilter | null | undefined;
}>;


export type PagedHrAuditLogsQuery = { pagedHrAuditLogs: { totalResults: number | null, data: Array<{ _id: string | null, entityId: string | null, entityType: string | null, operationType: string | null, auditValues: Array<string | null> | null, operationTime: string | null, operationBy: string | null, operationByName: string | null, operationByImageUrl: string | null, operationByImageThumbnailUrl: string | null } | null> | null } | null };

export type ComposerHrCommitteeOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type ComposerHrCommitteeOptionsQuery = { hrCommitteeOptions: Array<{ _id: string | null, name: string | null } | null> | null };

export type ComposerAllDutyLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type ComposerAllDutyLocationsQuery = { allDutyLocations: Array<{ _id: string | null, dutyId: string | null, name: string | null } | null> | null };

export type AllDutyShiftsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllDutyShiftsQuery = { allDutyShifts: Array<{ _id: string | null, dutyId: string | null, name: string | null, startTime: string | null, endTime: string | null } | null> | null };

export type AllJobsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllJobsQuery = { allJobs: Array<{ _id: string | null, name: string | null, description: string | null, usedCount: number | null } | null> | null };

export type ComposerAllMsDutiesQueryVariables = Exact<{ [key: string]: never; }>;


export type ComposerAllMsDutiesQuery = { allMSDuties: Array<{ _id: string | null, name: string | null } | null> | null };

export type DutyPlanWeekQueryVariables = Exact<{
  dutyId: string;
  locationId: string;
}>;


export type DutyPlanWeekQuery = { dutyPlanWeek: { shifts: Array<{ _id: string | null, name: string | null, startTime: string | null, endTime: string | null } | null> | null, slots: Array<{ shiftId: string | null, teamId: string | null, teamName: string | null, teamColor: string | null, startDate: string | null } | null> | null } | null };

export type DutyPlanDaysQueryVariables = Exact<{
  dutyId: string;
  locationId: string;
  startDate: string;
}>;


export type DutyPlanDaysQuery = { dutyPlanDays: { startDate: string | null, days: Array<{ date: string | null, dayOfWeek: string | null, locked: boolean | null, slots: Array<{ shiftId: string | null, shiftName: string | null, teamName: string | null, addedKarkunIds: Array<string | null> | null, absentKarkunIds: Array<string | null> | null, teamKarkuns: Array<{ karkunId: string | null, name: string | null, off: boolean | null, imageUrl: string | null, imageThumbnailUrl: string | null, attendance: string | null } | null> | null, addedKarkuns: Array<{ karkunId: string | null, name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, attendance: string | null } | null> | null } | null> | null } | null> | null } | null };

export type DutyPlanTeamsQueryVariables = Exact<{ [key: string]: never; }>;


export type DutyPlanTeamsQuery = { allTeams: Array<{ _id: string | null, name: string | null, color: string | null, dutyId: string | null } | null> | null };

export type SetDutyShiftTeamMutationVariables = Exact<{
  dutyId: string;
  locationId: string;
  shiftId: string;
  teamId?: string | null | undefined;
}>;


export type SetDutyShiftTeamMutation = { setDutyShiftTeam: boolean | null };

export type SetDutyDayOverrideMutationVariables = Exact<{
  dutyId: string;
  locationId: string;
  shiftId: string;
  date: string;
  addedKarkunIds?: Array<string> | string | null | undefined;
  absentKarkunIds?: Array<string> | string | null | undefined;
}>;


export type SetDutyDayOverrideMutation = { setDutyDayOverride: boolean | null };

export type SetDutyAttendanceMutationVariables = Exact<{
  dutyId: string;
  locationId: string;
  shiftId: string;
  date: string;
  karkunId: string;
  status?: string | null | undefined;
}>;


export type SetDutyAttendanceMutation = { setDutyAttendance: boolean | null };

export type AddHrKarkunAttachmentMutationVariables = Exact<{
  _id: string;
  attachmentId: string;
}>;


export type AddHrKarkunAttachmentMutation = { addHrKarkunAttachment: { _id: string | null, karkunData: { attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null } | null };

export type HrKarkunByIdForPeopleQueryVariables = Exact<{
  _id: string;
}>;


export type HrKarkunByIdForPeopleQuery = { hrKarkunById: { _id: string | null, isEmployee: boolean | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, imageUrl: string | null, contactNumber1: string | null, contactNumber2: string | null, emailAddress: string | null, currentAddress: string | null, permanentAddress: string | null, bloodGroup: string | null, educationalQualification: string | null, meansOfEarning: string | null, ehadDate: string | null, birthDate: string | null, deathDate: string | null, referenceName: string | null } | null, karkunData: { cityLocationId: string | null, mehfilLocationId: string | null, ehadKarkun: boolean | null, ehadPermissionDate: string | null, lastTarteebDate: string | null, mehfilRaabta: string | null, msRaabta: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null, teams: Array<{ _id: string | null, name: string | null, duty: { _id: string | null, name: string | null } | null } | null> | null } | null, employeeData: { jobId: string | null, employmentStartDate: string | null, employmentEndDate: string | null, bankAccountDetails: string | null, job: { _id: string | null, name: string | null } | null } | null } | null };

export type HrKarkunsByIdQueryVariables = Exact<{
  _ids: string;
}>;


export type HrKarkunsByIdQuery = { hrKarkunsById: Array<{ _id: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, imageUrl: string | null, contactNumber1: string | null, contactNumber2: string | null, imageThumbnailUrl: string | null } | null, karkunData: { teams: Array<{ _id: string | null, name: string | null, duty: { _id: string | null, name: string | null } | null } | null> | null } | null, employeeData: { job: { _id: string | null, name: string | null } | null } | null } | null> | null };

export type HrPeoplePagedHrKarkunsQueryVariables = Exact<{
  filter?: Types.KarkunFilter | null | undefined;
}>;


export type HrPeoplePagedHrKarkunsQuery = { pagedHrKarkuns: { totalResults: number | null, data: Array<{ _id: string | null, sharedData: { name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null, karkunData: { lastTarteebDate: string | null, teams: Array<{ _id: string | null, name: string | null, duty: { _id: string | null, name: string | null } | null } | null> | null } | null, employeeData: { jobId: string | null, employmentStartDate: string | null, job: { _id: string | null, name: string | null } | null } | null } | null> | null } | null };

export type PagedSalariesByKarkunQueryVariables = Exact<{
  queryString?: string | null | undefined;
}>;


export type PagedSalariesByKarkunQuery = { pagedSalariesByKarkun: { totalResults: number | null, salaries: Array<{ _id: string | null, month: string | null, salary: number | null, rashanMadad: number | null, openingLoan: number | null, loanDeduction: number | null, newLoan: number | null, closingLoan: number | null, otherDeduction: number | null, arrears: number | null, netPayment: number | null } | null> | null } | null };

export type RemoveHrKarkunAttachmentMutationVariables = Exact<{
  _id: string;
  attachmentId: string;
}>;


export type RemoveHrKarkunAttachmentMutation = { removeHrKarkunAttachment: { _id: string | null, karkunData: { attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null } | null };

export type SetPeopleKarkunEmploymentInfoMutationVariables = Exact<{
  _id: string;
  isEmployee: boolean;
  jobId?: string | null | undefined;
  employmentStartDate?: string | null | undefined;
  employmentEndDate?: string | null | undefined;
  bankAccountDetails?: string | null | undefined;
}>;


export type SetPeopleKarkunEmploymentInfoMutation = { setHrKarkunEmploymentInfo: { _id: string | null, isEmployee: boolean | null, employeeData: { jobId: string | null, employmentStartDate: string | null, employmentEndDate: string | null, bankAccountDetails: string | null } | null } | null };

export type SetHrKarkunProfileImageMutationVariables = Exact<{
  _id: string;
  imageData: string;
}>;


export type SetHrKarkunProfileImageMutation = { setHrKarkunProfileImage: { _id: string | null, sharedData: { imageUrl: string | null, imageThumbnailUrl: string | null } | null } | null };

export type UpdateHrKarkunMutationVariables = Exact<{
  _id: string;
  name: string;
  parentName?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  contactNumber1?: string | null | undefined;
  contactNumber2?: string | null | undefined;
  emailAddress?: string | null | undefined;
  currentAddress?: string | null | undefined;
  permanentAddress?: string | null | undefined;
  bloodGroup?: string | null | undefined;
  cityLocationId?: string | null | undefined;
  mehfilLocationId?: string | null | undefined;
  educationalQualification?: string | null | undefined;
  meansOfEarning?: string | null | undefined;
  ehadDate?: string | null | undefined;
  birthDate?: string | null | undefined;
  deathDate?: string | null | undefined;
  referenceName?: string | null | undefined;
}>;


export type UpdateHrKarkunMutation = { updateHrKarkun: { _id: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, emailAddress: string | null, currentAddress: string | null, permanentAddress: string | null, bloodGroup: string | null, educationalQualification: string | null, meansOfEarning: string | null, ehadDate: string | null, birthDate: string | null, deathDate: string | null, referenceName: string | null } | null, karkunData: { cityLocationId: string | null, mehfilLocationId: string | null, lastTarteebDate: string | null, mehfilRaabta: string | null, msRaabta: string | null } | null } | null };

export type JobByIdQueryVariables = Exact<{
  id: string;
}>;


export type JobByIdQuery = { jobById: { _id: string | null, name: string | null, description: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateJobMutationVariables = Exact<{
  id: string;
  name: string;
  description?: string | null | undefined;
}>;


export type UpdateJobMutation = { updateJob: { _id: string | null, name: string | null, description: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type CreateJobMutationVariables = Exact<{
  name: string;
  description?: string | null | undefined;
}>;


export type CreateJobMutation = { createJob: { _id: string | null, name: string | null, description: string | null } | null };

export type RemoveJobMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveJobMutation = { removeJob: number | null };

export type CreateHrKarkunMutationVariables = Exact<{
  name: string;
  parentName?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  contactNumber1?: string | null | undefined;
  contactNumber2?: string | null | undefined;
  emailAddress?: string | null | undefined;
  currentAddress?: string | null | undefined;
  permanentAddress?: string | null | undefined;
  bloodGroup?: string | null | undefined;
  educationalQualification?: string | null | undefined;
  meansOfEarning?: string | null | undefined;
  ehadDate?: string | null | undefined;
  birthDate?: string | null | undefined;
  referenceName?: string | null | undefined;
}>;


export type CreateHrKarkunMutation = { createHrKarkun: { _id: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, emailAddress: string | null, currentAddress: string | null, permanentAddress: string | null, bloodGroup: string | null, educationalQualification: string | null, meansOfEarning: string | null, ehadDate: string | null, birthDate: string | null, referenceName: string | null } | null, karkunData: { lastTarteebDate: string | null, mehfilRaabta: string | null, msRaabta: string | null } | null } | null };

export type DeleteHrKarkunMutationVariables = Exact<{
  _id: string;
}>;


export type DeleteHrKarkunMutation = { deleteHrKarkun: number | null };

export type HrKarkunByIdForKarkunsQueryVariables = Exact<{
  _id: string;
}>;


export type HrKarkunByIdForKarkunsQuery = { hrKarkunById: { _id: string | null, isEmployee: boolean | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, imageUrl: string | null, contactNumber1: string | null, contactNumber2: string | null, emailAddress: string | null, currentAddress: string | null, permanentAddress: string | null, bloodGroup: string | null, educationalQualification: string | null, meansOfEarning: string | null, ehadDate: string | null, birthDate: string | null, deathDate: string | null, referenceName: string | null } | null, karkunData: { cityLocationId: string | null, mehfilLocationId: string | null, ehadKarkun: boolean | null, ehadPermissionDate: string | null, lastTarteebDate: string | null, mehfilRaabta: string | null, msRaabta: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null, teams: Array<{ _id: string | null, name: string | null, duty: { _id: string | null, name: string | null } | null } | null> | null } | null, employeeData: { jobId: string | null, employmentStartDate: string | null, employmentEndDate: string | null, bankAccountDetails: string | null, job: { _id: string | null, name: string | null } | null } | null } | null };

export type KarkunDutyAttendanceSheetQueryVariables = Exact<{
  karkunId: string;
}>;


export type KarkunDutyAttendanceSheetQuery = { karkunDutyAttendanceSheet: Array<{ _id: string | null, month: string | null, shiftName: string | null, daysOnDuty: number | null, presentCount: number | null, lateCount: number | null, absentCount: number | null, unmarkedCount: number | null, percentage: number | null, duty: { _id: string | null, name: string | null } | null, location: { _id: string | null, name: string | null } | null } | null> | null };

export type HrKarkunsPagedHrKarkunsQueryVariables = Exact<{
  filter?: Types.KarkunFilter | null | undefined;
}>;


export type HrKarkunsPagedHrKarkunsQuery = { pagedHrKarkuns: { totalResults: number | null, data: Array<{ _id: string | null, sharedData: { name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null, karkunData: { lastTarteebDate: string | null, teams: Array<{ _id: string | null, name: string | null, duty: { _id: string | null, name: string | null } | null, members: Array<{ karkunId: string | null, isCoordinator: boolean | null } | null> | null } | null> | null } | null, employeeData: { job: { _id: string | null, name: string | null } | null } | null } | null> | null } | null };

export type PromoteHrKarkunMutationVariables = Exact<{
  _id: string;
}>;


export type PromoteHrKarkunMutation = { promoteHrKarkun: { _id: string | null, isKarkun: boolean | null } | null };

export type CreateDutyLocationMutationVariables = Exact<{
  name: string;
  dutyId: string;
}>;


export type CreateDutyLocationMutation = { createDutyLocation: { _id: string | null, name: string | null, dutyId: string | null } | null };

export type CreateDutyShiftMutationVariables = Exact<{
  name: string;
  dutyId: string;
  startTime?: string | null | undefined;
  endTime?: string | null | undefined;
}>;


export type CreateDutyShiftMutation = { createDutyShift: { _id: string | null, name: string | null, dutyId: string | null, startTime: string | null, endTime: string | null } | null };

export type RemoveDutyLocationMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveDutyLocationMutation = { removeDutyLocation: number | null };

export type RemoveDutyShiftMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveDutyShiftMutation = { removeDutyShift: number | null };

export type UpdateDutyLocationMutationVariables = Exact<{
  id: string;
  name: string;
  dutyId: string;
}>;


export type UpdateDutyLocationMutation = { updateDutyLocation: { _id: string | null, name: string | null, dutyId: string | null } | null };

export type UpdateDutyShiftMutationVariables = Exact<{
  _id: string;
  name: string;
  dutyId: string;
  startTime?: string | null | undefined;
  endTime?: string | null | undefined;
}>;


export type UpdateDutyShiftMutation = { updateDutyShift: { _id: string | null, name: string | null, dutyId: string | null, startTime: string | null, endTime: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type ListAllMsDutiesQueryVariables = Exact<{ [key: string]: never; }>;


export type ListAllMsDutiesQuery = { allMSDuties: Array<{ _id: string | null, name: string | null, description: string | null, committeeId: string | null, canDelete: boolean | null, committee: { _id: string | null, name: string | null } | null, shifts: Array<{ _id: string | null, dutyId: string | null, name: string | null, startTime: string | null, endTime: string | null, canDelete: boolean | null } | null> | null, locations: Array<{ _id: string | null, dutyId: string | null, name: string | null, canDelete: boolean | null } | null> | null } | null> | null };

export type CreateDutyMutationVariables = Exact<{
  name: string;
  isMehfilDuty: boolean;
  description?: string | null | undefined;
  committeeId?: string | null | undefined;
}>;


export type CreateDutyMutation = { createDuty: { _id: string | null, name: string | null, isMehfilDuty: boolean | null, description: string | null } | null };

export type UpdateDutyMutationVariables = Exact<{
  id: string;
  name: string;
  description?: string | null | undefined;
  committeeId?: string | null | undefined;
}>;


export type UpdateDutyMutation = { updateDuty: { _id: string | null } | null };

export type RemoveDutyMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveDutyMutation = { removeDuty: number | null };

export type AddHrGroupMemberMutationVariables = Exact<{
  groupId: string;
  karkunId: string;
}>;


export type AddHrGroupMemberMutation = { addHrGroupMember: boolean | null };

export type AddHrPermissionGroupMutationVariables = Exact<{
  permissionKey: string;
  groupId: string;
}>;


export type AddHrPermissionGroupMutation = { addHrPermissionGroup: boolean | null };

export type AddHrPermissionUserMutationVariables = Exact<{
  permissionKey: string;
  karkunId: string;
}>;


export type AddHrPermissionUserMutation = { addHrPermissionUser: boolean | null };

export type CreateHrUserGroupMutationVariables = Exact<{
  name: string;
  description?: string | null | undefined;
}>;


export type CreateHrUserGroupMutation = { createHrUserGroup: { _id: string, name: string, description: string | null } | null };

export type DeleteHrUserGroupMutationVariables = Exact<{
  _id: string;
}>;


export type DeleteHrUserGroupMutation = { deleteHrUserGroup: boolean | null };

export type HrPermissionAssignmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type HrPermissionAssignmentsQuery = { hrPermissionAssignments: Array<{ featureKey: string, featureName: string, permissions: Array<{ key: string, name: string, description: string | null, users: Array<{ userId: string, personId: string | null, username: string | null, displayName: string | null } | null> | null, groups: Array<{ groupId: string, name: string } | null> | null } | null> | null } | null> | null };

export type HrPermissionKarkunSearchQueryVariables = Exact<{
  name?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type HrPermissionKarkunSearchQuery = { hrPermissionKarkunSearch: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null> | null } | null };

export type HrUserGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type HrUserGroupsQuery = { hrUserGroups: Array<{ _id: string, name: string, description: string | null, users: Array<{ userId: string, personId: string | null, username: string | null, displayName: string | null } | null> | null } | null> | null };

export type RemoveHrGroupMemberMutationVariables = Exact<{
  groupId: string;
  userId: string;
}>;


export type RemoveHrGroupMemberMutation = { removeHrGroupMember: boolean | null };

export type RemoveHrPermissionGroupMutationVariables = Exact<{
  permissionKey: string;
  groupId: string;
}>;


export type RemoveHrPermissionGroupMutation = { removeHrPermissionGroup: boolean | null };

export type RemoveHrPermissionUserMutationVariables = Exact<{
  permissionKey: string;
  userId: string;
}>;


export type RemoveHrPermissionUserMutation = { removeHrPermissionUser: boolean | null };

export type UpdateHrUserGroupMutationVariables = Exact<{
  _id: string;
  name: string;
  description?: string | null | undefined;
}>;


export type UpdateHrUserGroupMutation = { updateHrUserGroup: { _id: string, name: string, description: string | null } | null };

export type CreateSalariesMutationVariables = Exact<{
  month: string;
}>;


export type CreateSalariesMutation = { createSalaries: number | null };

export type CurrentMonthSalariesQueryVariables = Exact<{
  month: string;
  jobId?: string | null | undefined;
}>;


export type CurrentMonthSalariesQuery = { salariesByMonth: Array<{ _id: string | null, karkunId: string | null, month: string | null, jobId: string | null, salary: number | null, openingLoan: number | null, loanDeduction: number | null, newLoan: number | null, closingLoan: number | null, otherDeduction: number | null, arrears: number | null, netPayment: number | null, rashanMadad: number | null, approvedOn: string | null, approvedBy: string | null, approver: { _id: string | null, sharedData: { name: string | null } | null } | null, karkun: { _id: string | null, sharedData: { name: string | null, parentName: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, cnicNumber: string | null, contactNumber1: string | null } | null, employeeData: { bankAccountDetails: string | null } | null } | null, job: { _id: string | null, name: string | null } | null } | null> | null };

export type DeleteAllSalariesMutationVariables = Exact<{
  month: string;
}>;


export type DeleteAllSalariesMutation = { deleteAllSalaries: number | null };

export type DeleteSalariesMutationVariables = Exact<{
  month: string;
  ids: Array<string | null | undefined> | string;
}>;


export type DeleteSalariesMutation = { deleteSalaries: number | null };

export type PreviousMonthSalariesQueryVariables = Exact<{
  month: string;
  jobId?: string | null | undefined;
}>;


export type PreviousMonthSalariesQuery = { salariesByMonth: Array<{ _id: string | null, karkunId: string | null, month: string | null, jobId: string | null, salary: number | null, otherDeduction: number | null, arrears: number | null, rashanMadad: number | null } | null> | null };

export type UpdateSalaryMutationVariables = Exact<{
  _id: string;
  salary?: number | null | undefined;
  openingLoan?: number | null | undefined;
  loanDeduction?: number | null | undefined;
  newLoan?: number | null | undefined;
  otherDeduction?: number | null | undefined;
  arrears?: number | null | undefined;
  rashanMadad?: number | null | undefined;
}>;


export type UpdateSalaryMutation = { updateSalary: { _id: string | null, karkunId: string | null, jobId: string | null, month: string | null, salary: number | null, openingLoan: number | null, loanDeduction: number | null, newLoan: number | null, closingLoan: number | null, otherDeduction: number | null, arrears: number | null, netPayment: number | null, rashanMadad: number | null } | null };

export type EidReceiptSalariesByIdsQueryVariables = Exact<{
  ids: string;
}>;


export type EidReceiptSalariesByIdsQuery = { salariesByIds: Array<{ _id: string | null, karkunId: string | null, month: string | null, jobId: string | null, salary: number | null, karkun: { _id: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null } | null } | null, job: { _id: string | null, name: string | null } | null } | null> | null };

export type RashanReceiptSalariesByIdsQueryVariables = Exact<{
  ids: string;
}>;


export type RashanReceiptSalariesByIdsQuery = { salariesByIds: Array<{ _id: string | null, karkunId: string | null, month: string | null, jobId: string | null, rashanMadad: number | null, karkun: { _id: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null } | null } | null, job: { _id: string | null, name: string | null } | null } | null> | null };

export type SalaryReceiptSalariesByIdsQueryVariables = Exact<{
  ids: string;
}>;


export type SalaryReceiptSalariesByIdsQuery = { salariesByIds: Array<{ _id: string | null, karkunId: string | null, month: string | null, jobId: string | null, salary: number | null, openingLoan: number | null, loanDeduction: number | null, newLoan: number | null, closingLoan: number | null, otherDeduction: number | null, arrears: number | null, netPayment: number | null, karkun: { _id: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null } | null } | null, job: { _id: string | null, name: string | null } | null } | null> | null };

export type ListAllTeamsQueryVariables = Exact<{ [key: string]: never; }>;


export type ListAllTeamsQuery = { allTeams: Array<{ _id: string | null, name: string | null, color: string | null, description: string | null, dutyId: string | null, members: Array<{ karkunId: string | null, isCoordinator: boolean | null, daysOfWeek: Array<string | null> | null, karkun: { _id: string | null, sharedData: { name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null } | null } | null } | null> | null, duty: { _id: string | null, name: string | null } | null } | null> | null };

export type CreateTeamMutationVariables = Exact<{
  name: string;
  color?: string | null | undefined;
  description?: string | null | undefined;
  dutyId: string;
}>;


export type CreateTeamMutation = { createTeam: { _id: string | null, name: string | null } | null };

export type UpdateTeamMutationVariables = Exact<{
  id: string;
  name: string;
  color?: string | null | undefined;
  description?: string | null | undefined;
  dutyId: string;
}>;


export type UpdateTeamMutation = { updateTeam: { _id: string | null, name: string | null } | null };

export type RemoveTeamMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveTeamMutation = { removeTeam: number | null };

export type AddTeamMemberMutationVariables = Exact<{
  teamId: string;
  karkunId: string;
  daysOfWeek: Array<string> | string;
}>;


export type AddTeamMemberMutation = { addTeamMember: { _id: string | null } | null };

export type RemoveTeamMemberMutationVariables = Exact<{
  teamId: string;
  karkunId: string;
}>;


export type RemoveTeamMemberMutation = { removeTeamMember: { _id: string | null } | null };

export type AddTeamCoordinatorMutationVariables = Exact<{
  teamId: string;
  karkunId: string;
}>;


export type AddTeamCoordinatorMutation = { addTeamCoordinator: { _id: string | null } | null };

export type RemoveTeamCoordinatorMutationVariables = Exact<{
  teamId: string;
  karkunId: string;
}>;


export type RemoveTeamCoordinatorMutation = { removeTeamCoordinator: { _id: string | null } | null };

export type UpdateTeamMemberDaysMutationVariables = Exact<{
  teamId: string;
  karkunId: string;
  daysOfWeek: Array<string> | string;
}>;


export type UpdateTeamMemberDaysMutation = { updateTeamMemberDays: { _id: string | null } | null };

export type CreatePurchasingCatalogItemMutationVariables = Exact<{
  name: string;
  unit: string;
  category?: string | null | undefined;
  company?: string | null | undefined;
  description?: string | null | undefined;
  defaultUnitPrice?: number | null | undefined;
}>;


export type CreatePurchasingCatalogItemMutation = { createPurchasingCatalogItem: { _id: string | null } | null };

export type PagedPurchasingCatalogItemsQueryVariables = Exact<{
  search?: string | null | undefined;
  isActive?: boolean | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type PagedPurchasingCatalogItemsQuery = { pagedPurchasingCatalogItems: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, unit: string | null, category: string | null, company: string | null, imageUrl: string | null, defaultUnitPrice: number | null, lastUnitPrice: number | null, isActive: boolean | null } | null> | null } | null };

export type PurchasingCatalogItemByIdQueryVariables = Exact<{
  _id: string;
}>;


export type PurchasingCatalogItemByIdQuery = { purchasingCatalogItemById: { _id: string | null, name: string | null, unit: string | null, category: string | null, company: string | null, imageUrl: string | null, description: string | null, defaultUnitPrice: number | null, lastUnitPrice: number | null, isActive: boolean | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type RemovePurchasingCatalogItemImageMutationVariables = Exact<{
  _id: string;
}>;


export type RemovePurchasingCatalogItemImageMutation = { removePurchasingCatalogItemImage: { _id: string | null, imageUrl: string | null } | null };

export type RemovePurchasingCatalogItemMutationVariables = Exact<{
  _id: string;
}>;


export type RemovePurchasingCatalogItemMutation = { removePurchasingCatalogItem: boolean | null };

export type SetPurchasingCatalogItemActiveMutationVariables = Exact<{
  _id: string;
  isActive: boolean;
}>;


export type SetPurchasingCatalogItemActiveMutation = { setPurchasingCatalogItemActive: { _id: string | null, isActive: boolean | null } | null };

export type SetPurchasingCatalogItemImageMutationVariables = Exact<{
  _id: string;
  imageData: string;
}>;


export type SetPurchasingCatalogItemImageMutation = { setPurchasingCatalogItemImage: { _id: string | null, imageUrl: string | null } | null };

export type UpdatePurchasingCatalogItemMutationVariables = Exact<{
  _id: string;
  name: string;
  unit: string;
  category?: string | null | undefined;
  company?: string | null | undefined;
  description?: string | null | undefined;
  defaultUnitPrice?: number | null | undefined;
}>;


export type UpdatePurchasingCatalogItemMutation = { updatePurchasingCatalogItem: { _id: string | null, name: string | null, unit: string | null, category: string | null, company: string | null, imageUrl: string | null, description: string | null, defaultUnitPrice: number | null, lastUnitPrice: number | null, isActive: boolean | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type AbortPurchasingAttachmentUploadMutationVariables = Exact<{
  uploadId: string;
}>;


export type AbortPurchasingAttachmentUploadMutation = { abortPurchasingAttachmentUpload: boolean | null };

export type CompletePurchasingAttachmentUploadMutationVariables = Exact<{
  uploadId: string;
}>;


export type CompletePurchasingAttachmentUploadMutation = { completePurchasingAttachmentUpload: { _id: string | null } | null };

export type CreatePurchasingAttachmentUploadMutationVariables = Exact<{
  ownerType: string;
  ownerId: string;
  fileName: string;
  mimeType: string;
  size: number;
  name?: string | null | undefined;
}>;


export type CreatePurchasingAttachmentUploadMutation = { createPurchasingAttachmentUpload: { uploadId: string | null, url: string | null, contentType: string | null } | null };

export type DeletePurchasingAttachmentMutationVariables = Exact<{
  _id: string;
}>;


export type DeletePurchasingAttachmentMutation = { deletePurchasingAttachment: boolean | null };

export type PagedPurchasingAuditLogsQueryVariables = Exact<{
  filter?: Types.PurchasingAuditLogFilter | null | undefined;
}>;


export type PagedPurchasingAuditLogsQuery = { pagedPurchasingAuditLogs: { totalResults: number | null, data: Array<{ _id: string | null, entityId: string | null, entityType: string | null, operationType: string | null, auditValues: Array<string | null> | null, operationTime: string | null, operationBy: string | null, operationByName: string | null, operationByImageUrl: string | null, operationByImageThumbnailUrl: string | null } | null> | null } | null };

export type PurchasingAttachmentDownloadQueryVariables = Exact<{
  _id: string;
  inline?: boolean | null | undefined;
}>;


export type PurchasingAttachmentDownloadQuery = { purchasingAttachmentDownload: { url: string | null, fileName: string | null, mimeType: string | null } | null };

export type PurchasingAttachmentsQueryVariables = Exact<{
  ownerType: string;
  ownerId: string;
}>;


export type PurchasingAttachmentsQuery = { purchasingAttachments: Array<{ _id: string | null, name: string | null, fileName: string | null, mimeType: string | null, size: number | null, createdAt: string | null, createdBy: string | null } | null> | null };

export type CreatePurchasingInvoiceMutationVariables = Exact<{
  vendorId: string;
  orderId?: string | null | undefined;
  vendorInvoiceNo: string;
  invoiceDate: string;
  dueDate?: string | null | undefined;
  notes?: string | null | undefined;
  allowOverBilling?: boolean | null | undefined;
  lines: Array<Types.PurchasingPricedLineInput> | Types.PurchasingPricedLineInput;
}>;


export type CreatePurchasingInvoiceMutation = { createPurchasingInvoice: { _id: string | null } | null };

export type PagedPurchasingInvoicesQueryVariables = Exact<{
  search?: string | null | undefined;
  status?: string | null | undefined;
  vendorId?: string | null | undefined;
  orderId?: string | null | undefined;
  isDisputed?: boolean | null | undefined;
  overdue?: boolean | null | undefined;
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type PagedPurchasingInvoicesQuery = { pagedPurchasingInvoices: { totalResults: number | null, data: Array<{ _id: string | null, number: string | null, vendorInvoiceNo: string | null, vendorId: string | null, orderId: string | null, invoiceDate: string | null, dueDate: string | null, total: number | null, paidAmount: number | null, balance: number | null, status: string | null, isDisputed: boolean | null, vendor: { _id: string | null, name: string | null } | null, order: { _id: string | null, number: string | null } | null } | null> | null } | null };

export type PurchasingInvoiceByIdQueryVariables = Exact<{
  _id: string;
}>;


export type PurchasingInvoiceByIdQuery = { purchasingInvoiceById: { _id: string | null, number: string | null, vendorInvoiceNo: string | null, vendorId: string | null, orderId: string | null, invoiceDate: string | null, dueDate: string | null, total: number | null, paidAmount: number | null, balance: number | null, status: string | null, isDisputed: boolean | null, notes: string | null, subtotal: number | null, taxTotal: number | null, voidedAt: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, vendor: { _id: string | null, name: string | null } | null, order: { _id: string | null, number: string | null } | null, lines: Array<{ _id: string | null, catalogItemId: string | null, orderLineId: string | null, description: string | null, unit: string | null, quantity: number | null, unitPrice: number | null, taxRate: number | null } | null> | null } | null };

export type SetPurchasingInvoiceDisputedMutationVariables = Exact<{
  _id: string;
  isDisputed: boolean;
}>;


export type SetPurchasingInvoiceDisputedMutation = { setPurchasingInvoiceDisputed: { _id: string | null, isDisputed: boolean | null } | null };

export type UpdatePurchasingInvoiceMutationVariables = Exact<{
  _id: string;
  vendorInvoiceNo: string;
  dueDate: string;
  notes?: string | null | undefined;
}>;


export type UpdatePurchasingInvoiceMutation = { updatePurchasingInvoice: { _id: string | null } | null };

export type VoidPurchasingInvoiceMutationVariables = Exact<{
  _id: string;
}>;


export type VoidPurchasingInvoiceMutation = { voidPurchasingInvoice: { _id: string | null, status: string | null } | null };

export type ApprovePurchasingOrderMutationVariables = Exact<{
  _id: string;
}>;


export type ApprovePurchasingOrderMutation = { approvePurchasingOrder: { _id: string | null, status: string | null, version: number | null } | null };

export type CancelPurchasingOrderMutationVariables = Exact<{
  _id: string;
}>;


export type CancelPurchasingOrderMutation = { cancelPurchasingOrder: { _id: string | null, status: string | null, version: number | null } | null };

export type ClosePurchasingOrderMutationVariables = Exact<{
  _id: string;
}>;


export type ClosePurchasingOrderMutation = { closePurchasingOrder: { _id: string | null, status: string | null, version: number | null } | null };

export type CreatePurchasingOrderFromQuoteMutationVariables = Exact<{
  quoteId: string;
}>;


export type CreatePurchasingOrderFromQuoteMutation = { createPurchasingOrderFromQuote: { _id: string | null } | null };

export type CreatePurchasingOrderFromRequisitionMutationVariables = Exact<{
  requisitionId: string;
  vendorId: string;
}>;


export type CreatePurchasingOrderFromRequisitionMutation = { createPurchasingOrderFromRequisition: { _id: string | null } | null };

export type CreatePurchasingOrderMutationVariables = Exact<{
  vendorId: string;
  orderDate: string;
  expectedDeliveryDate?: string | null | undefined;
  deliveryAddress?: string | null | undefined;
  paymentTermsDays?: number | null | undefined;
  notes?: string | null | undefined;
  discount?: number | null | undefined;
  shipping?: number | null | undefined;
  lines: Array<Types.PurchasingPricedLineInput> | Types.PurchasingPricedLineInput;
}>;


export type CreatePurchasingOrderMutation = { createPurchasingOrder: { _id: string | null } | null };

export type DeletePurchasingOrderMutationVariables = Exact<{
  _id: string;
}>;


export type DeletePurchasingOrderMutation = { deletePurchasingOrder: boolean | null };

export type MarkPurchasingOrderSentMutationVariables = Exact<{
  _id: string;
}>;


export type MarkPurchasingOrderSentMutation = { markPurchasingOrderSent: { _id: string | null, status: string | null, version: number | null } | null };

export type PagedPurchasingOrdersQueryVariables = Exact<{
  search?: string | null | undefined;
  status?: string | null | undefined;
  vendorId?: string | null | undefined;
  requisitionId?: string | null | undefined;
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type PagedPurchasingOrdersQuery = { pagedPurchasingOrders: { totalResults: number | null, data: Array<{ _id: string | null, number: string | null, vendorId: string | null, orderDate: string | null, expectedDeliveryDate: string | null, total: number | null, status: string | null, requisitionId: string | null, version: number | null, vendor: { _id: string | null, name: string | null } | null } | null> | null } | null };

export type PurchasingOrderByIdQueryVariables = Exact<{
  _id: string;
}>;


export type PurchasingOrderByIdQuery = { purchasingOrderById: { _id: string | null, number: string | null, vendorId: string | null, orderDate: string | null, expectedDeliveryDate: string | null, total: number | null, status: string | null, requisitionId: string | null, version: number | null, quoteId: string | null, deliveryAddress: string | null, paymentTermsDays: number | null, notes: string | null, discount: number | null, shipping: number | null, subtotal: number | null, taxTotal: number | null, submittedAt: string | null, approvedAt: string | null, rejectionReason: string | null, sentAt: string | null, closedAt: string | null, cancelledAt: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, vendor: { _id: string | null, name: string | null } | null, lines: Array<{ _id: string | null, catalogItemId: string | null, description: string | null, unit: string | null, quantity: number | null, unitPrice: number | null, taxRate: number | null, receivedQuantity: number | null, invoicedQuantity: number | null } | null> | null } | null };

export type RejectPurchasingOrderMutationVariables = Exact<{
  _id: string;
  reason: string;
}>;


export type RejectPurchasingOrderMutation = { rejectPurchasingOrder: { _id: string | null, status: string | null, version: number | null } | null };

export type SubmitPurchasingOrderMutationVariables = Exact<{
  _id: string;
}>;


export type SubmitPurchasingOrderMutation = { submitPurchasingOrder: { _id: string | null, status: string | null, version: number | null } | null };

export type UpdatePurchasingOrderMutationVariables = Exact<{
  _id: string;
  version: number;
  vendorId: string;
  orderDate: string;
  expectedDeliveryDate?: string | null | undefined;
  deliveryAddress?: string | null | undefined;
  paymentTermsDays?: number | null | undefined;
  notes?: string | null | undefined;
  discount?: number | null | undefined;
  shipping?: number | null | undefined;
  lines: Array<Types.PurchasingPricedLineInput> | Types.PurchasingPricedLineInput;
}>;


export type UpdatePurchasingOrderMutation = { updatePurchasingOrder: { _id: string | null, version: number | null } | null };

export type PagedPurchasingPaymentsQueryVariables = Exact<{
  search?: string | null | undefined;
  status?: string | null | undefined;
  vendorId?: string | null | undefined;
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type PagedPurchasingPaymentsQuery = { pagedPurchasingPayments: { totalResults: number | null, data: Array<{ _id: string | null, number: string | null, vendorId: string | null, paymentDate: string | null, method: string | null, reference: string | null, amount: number | null, status: string | null, vendor: { _id: string | null, name: string | null } | null } | null> | null } | null };

export type PostPurchasingPaymentMutationVariables = Exact<{
  vendorId: string;
  paymentDate: string;
  method: string;
  reference?: string | null | undefined;
  notes?: string | null | undefined;
  allocations: Array<Types.PurchasingPaymentAllocationInput> | Types.PurchasingPaymentAllocationInput;
}>;


export type PostPurchasingPaymentMutation = { postPurchasingPayment: { _id: string | null } | null };

export type PurchasingPaymentByIdQueryVariables = Exact<{
  _id: string;
}>;


export type PurchasingPaymentByIdQuery = { purchasingPaymentById: { _id: string | null, number: string | null, vendorId: string | null, paymentDate: string | null, method: string | null, reference: string | null, amount: number | null, status: string | null, notes: string | null, voidedAt: string | null, voidReason: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, vendor: { _id: string | null, name: string | null } | null, allocations: Array<{ invoiceId: string | null, amount: number | null, invoice: { _id: string | null, number: string | null, vendorInvoiceNo: string | null, total: number | null } | null } | null> | null } | null };

export type VoidPurchasingPaymentMutationVariables = Exact<{
  _id: string;
  reason: string;
}>;


export type VoidPurchasingPaymentMutation = { voidPurchasingPayment: { _id: string | null, status: string | null } | null };

export type AddPurchasingGroupMemberMutationVariables = Exact<{
  groupId: string;
  karkunId: string;
}>;


export type AddPurchasingGroupMemberMutation = { addPurchasingGroupMember: boolean | null };

export type AddPurchasingPermissionGroupMutationVariables = Exact<{
  permissionKey: string;
  groupId: string;
}>;


export type AddPurchasingPermissionGroupMutation = { addPurchasingPermissionGroup: boolean | null };

export type AddPurchasingPermissionUserMutationVariables = Exact<{
  permissionKey: string;
  karkunId: string;
}>;


export type AddPurchasingPermissionUserMutation = { addPurchasingPermissionUser: boolean | null };

export type CreatePurchasingUserGroupMutationVariables = Exact<{
  name: string;
  description?: string | null | undefined;
}>;


export type CreatePurchasingUserGroupMutation = { createPurchasingUserGroup: { _id: string, name: string, description: string | null } | null };

export type DeletePurchasingUserGroupMutationVariables = Exact<{
  _id: string;
}>;


export type DeletePurchasingUserGroupMutation = { deletePurchasingUserGroup: boolean | null };

export type PurchasingKarkunSearchQueryVariables = Exact<{
  name?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type PurchasingKarkunSearchQuery = { purchasingKarkunSearch: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null> | null } | null };

export type PurchasingPermissionAssignmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type PurchasingPermissionAssignmentsQuery = { purchasingPermissionAssignments: Array<{ featureKey: string, featureName: string, permissions: Array<{ key: string, name: string, description: string | null, users: Array<{ userId: string, personId: string | null, username: string | null, displayName: string | null } | null> | null, groups: Array<{ groupId: string, name: string } | null> | null } | null> | null } | null> | null };

export type PurchasingUserGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type PurchasingUserGroupsQuery = { purchasingUserGroups: Array<{ _id: string, name: string, description: string | null, users: Array<{ userId: string, personId: string | null, username: string | null, displayName: string | null } | null> | null } | null> | null };

export type RemovePurchasingGroupMemberMutationVariables = Exact<{
  groupId: string;
  userId: string;
}>;


export type RemovePurchasingGroupMemberMutation = { removePurchasingGroupMember: boolean | null };

export type RemovePurchasingPermissionGroupMutationVariables = Exact<{
  permissionKey: string;
  groupId: string;
}>;


export type RemovePurchasingPermissionGroupMutation = { removePurchasingPermissionGroup: boolean | null };

export type RemovePurchasingPermissionUserMutationVariables = Exact<{
  permissionKey: string;
  userId: string;
}>;


export type RemovePurchasingPermissionUserMutation = { removePurchasingPermissionUser: boolean | null };

export type UpdatePurchasingUserGroupMutationVariables = Exact<{
  _id: string;
  name: string;
  description?: string | null | undefined;
}>;


export type UpdatePurchasingUserGroupMutation = { updatePurchasingUserGroup: { _id: string, name: string, description: string | null } | null };

export type CreatePurchasingQuoteMutationVariables = Exact<{
  requisitionId?: string | null | undefined;
  vendorId: string;
  reference?: string | null | undefined;
  quoteDate: string;
  validUntil?: string | null | undefined;
  notes?: string | null | undefined;
  lines: Array<Types.PurchasingPricedLineInput> | Types.PurchasingPricedLineInput;
}>;


export type CreatePurchasingQuoteMutation = { createPurchasingQuote: { _id: string | null } | null };

export type DeletePurchasingQuoteMutationVariables = Exact<{
  _id: string;
}>;


export type DeletePurchasingQuoteMutation = { deletePurchasingQuote: boolean | null };

export type PagedPurchasingQuotesQueryVariables = Exact<{
  search?: string | null | undefined;
  status?: string | null | undefined;
  vendorId?: string | null | undefined;
  requisitionId?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type PagedPurchasingQuotesQuery = { pagedPurchasingQuotes: { totalResults: number | null, data: Array<{ _id: string | null, requisitionId: string | null, vendorId: string | null, reference: string | null, quoteDate: string | null, validUntil: string | null, total: number | null, status: string | null, version: number | null, vendor: { _id: string | null, name: string | null } | null } | null> | null } | null };

export type PurchasingQuoteByIdQueryVariables = Exact<{
  _id: string;
}>;


export type PurchasingQuoteByIdQuery = { purchasingQuoteById: { _id: string | null, requisitionId: string | null, vendorId: string | null, reference: string | null, quoteDate: string | null, validUntil: string | null, total: number | null, status: string | null, version: number | null, notes: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, vendor: { _id: string | null, name: string | null } | null, lines: Array<{ _id: string | null, catalogItemId: string | null, description: string | null, unit: string | null, quantity: number | null, unitPrice: number | null } | null> | null } | null };

export type RejectPurchasingQuoteMutationVariables = Exact<{
  _id: string;
}>;


export type RejectPurchasingQuoteMutation = { rejectPurchasingQuote: { _id: string | null, status: string | null, version: number | null } | null };

export type SelectPurchasingQuoteMutationVariables = Exact<{
  _id: string;
}>;


export type SelectPurchasingQuoteMutation = { selectPurchasingQuote: { _id: string | null, status: string | null, version: number | null } | null };

export type UpdatePurchasingQuoteMutationVariables = Exact<{
  _id: string;
  version: number;
  requisitionId?: string | null | undefined;
  vendorId: string;
  reference?: string | null | undefined;
  quoteDate: string;
  validUntil?: string | null | undefined;
  notes?: string | null | undefined;
  lines: Array<Types.PurchasingPricedLineInput> | Types.PurchasingPricedLineInput;
}>;


export type UpdatePurchasingQuoteMutation = { updatePurchasingQuote: { _id: string | null, version: number | null } | null };

export type PagedPurchasingReceiptsQueryVariables = Exact<{
  search?: string | null | undefined;
  status?: string | null | undefined;
  vendorId?: string | null | undefined;
  orderId?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type PagedPurchasingReceiptsQuery = { pagedPurchasingReceipts: { totalResults: number | null, data: Array<{ _id: string | null, number: string | null, orderId: string | null, vendorId: string | null, receivedDate: string | null, deliveryNoteNo: string | null, status: string | null, order: { _id: string | null, number: string | null } | null, vendor: { _id: string | null, name: string | null } | null } | null> | null } | null };

export type PostPurchasingReceiptMutationVariables = Exact<{
  orderId: string;
  receivedDate: string;
  receivedBy?: string | null | undefined;
  deliveryNoteNo?: string | null | undefined;
  notes?: string | null | undefined;
  lines: Array<Types.PurchasingReceiptLineInput> | Types.PurchasingReceiptLineInput;
}>;


export type PostPurchasingReceiptMutation = { postPurchasingReceipt: { _id: string | null } | null };

export type PurchasingReceiptByIdQueryVariables = Exact<{
  _id: string;
}>;


export type PurchasingReceiptByIdQuery = { purchasingReceiptById: { _id: string | null, number: string | null, orderId: string | null, vendorId: string | null, receivedDate: string | null, deliveryNoteNo: string | null, status: string | null, receivedBy: string | null, notes: string | null, voidedAt: string | null, voidReason: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, order: { _id: string | null, number: string | null } | null, vendor: { _id: string | null, name: string | null } | null, receivedByPerson: { _id: string | null, sharedData: { name: string | null } | null } | null, lines: Array<{ _id: string | null, orderLineId: string | null, description: string | null, unit: string | null, receivedQuantity: number | null, rejectedQuantity: number | null, remarks: string | null } | null> | null } | null };

export type VoidPurchasingReceiptMutationVariables = Exact<{
  _id: string;
  reason: string;
}>;


export type VoidPurchasingReceiptMutation = { voidPurchasingReceipt: { _id: string | null, status: string | null } | null };

export type PurchasingDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type PurchasingDashboardQuery = { purchasingDashboard: { requisitionsAwaitingApproval: number | null, ordersAwaitingApproval: number | null, openOrders: number | null, overdueInvoices: number | null, totalPayable: number | null, overdueAmount: number | null } | null };

export type PurchasingOpenOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type PurchasingOpenOrdersQuery = { purchasingOpenOrders: Array<{ orderId: string | null, number: string | null, vendorId: string | null, status: string | null, orderDate: string | null, expectedDeliveryDate: string | null, total: number | null, outstandingValue: number | null, isOverdue: boolean | null, vendor: { _id: string | null, name: string | null } | null } | null> | null };

export type PurchasingPayablesAgingQueryVariables = Exact<{ [key: string]: never; }>;


export type PurchasingPayablesAgingQuery = { purchasingPayablesAging: Array<{ vendorId: string | null, current: number | null, days1To30: number | null, days31To60: number | null, days61Plus: number | null, total: number | null, vendor: { _id: string | null, name: string | null } | null } | null> | null };

export type PurchasingSpendingByMonthQueryVariables = Exact<{
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
}>;


export type PurchasingSpendingByMonthQuery = { purchasingSpendingByMonth: Array<{ month: string | null, invoiceCount: number | null, total: number | null } | null> | null };

export type PurchasingSpendingByVendorQueryVariables = Exact<{
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
}>;


export type PurchasingSpendingByVendorQuery = { purchasingSpendingByVendor: Array<{ vendorId: string | null, invoiceCount: number | null, total: number | null, paidAmount: number | null, vendor: { _id: string | null, name: string | null } | null } | null> | null };

export type PurchasingVendorLedgerQueryVariables = Exact<{
  vendorId: string;
  fromDate?: string | null | undefined;
  toDate?: string | null | undefined;
}>;


export type PurchasingVendorLedgerQuery = { purchasingVendorLedger: { openingBalance: number | null, closingBalance: number | null, entries: Array<{ date: string | null, type: string | null, documentId: string | null, number: string | null, reference: string | null, amount: number | null, balance: number | null } | null> | null } | null };

export type ApprovePurchasingRequisitionMutationVariables = Exact<{
  _id: string;
}>;


export type ApprovePurchasingRequisitionMutation = { approvePurchasingRequisition: { _id: string | null, status: string | null, version: number | null } | null };

export type CancelPurchasingRequisitionMutationVariables = Exact<{
  _id: string;
}>;


export type CancelPurchasingRequisitionMutation = { cancelPurchasingRequisition: { _id: string | null, status: string | null, version: number | null } | null };

export type CreatePurchasingRequisitionMutationVariables = Exact<{
  title: string;
  purpose?: string | null | undefined;
  requestedBy?: string | null | undefined;
  neededBy?: string | null | undefined;
  lines: Array<Types.PurchasingRequisitionLineInput> | Types.PurchasingRequisitionLineInput;
}>;


export type CreatePurchasingRequisitionMutation = { createPurchasingRequisition: { _id: string | null } | null };

export type DeletePurchasingRequisitionMutationVariables = Exact<{
  _id: string;
}>;


export type DeletePurchasingRequisitionMutation = { deletePurchasingRequisition: boolean | null };

export type PagedPurchasingRequisitionsQueryVariables = Exact<{
  search?: string | null | undefined;
  status?: string | null | undefined;
  requestedBy?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type PagedPurchasingRequisitionsQuery = { pagedPurchasingRequisitions: { totalResults: number | null, data: Array<{ _id: string | null, number: string | null, title: string | null, status: string | null, estimatedTotal: number | null, neededBy: string | null, requestedBy: string | null, version: number | null, createdAt: string | null, requestedByPerson: { _id: string | null, sharedData: { name: string | null } | null } | null } | null> | null } | null };

export type PurchasingRequisitionByIdQueryVariables = Exact<{
  _id: string;
}>;


export type PurchasingRequisitionByIdQuery = { purchasingRequisitionById: { _id: string | null, number: string | null, title: string | null, purpose: string | null, status: string | null, estimatedTotal: number | null, neededBy: string | null, requestedBy: string | null, version: number | null, submittedAt: string | null, approvedAt: string | null, approvedBy: string | null, rejectedAt: string | null, rejectionReason: string | null, cancelledAt: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, requestedByPerson: { _id: string | null, sharedData: { name: string | null } | null } | null, lines: Array<{ _id: string | null, catalogItemId: string | null, description: string | null, unit: string | null, quantity: number | null, estimatedUnitPrice: number | null } | null> | null } | null };

export type RejectPurchasingRequisitionMutationVariables = Exact<{
  _id: string;
  reason: string;
}>;


export type RejectPurchasingRequisitionMutation = { rejectPurchasingRequisition: { _id: string | null, status: string | null, version: number | null } | null };

export type ReopenPurchasingRequisitionMutationVariables = Exact<{
  _id: string;
}>;


export type ReopenPurchasingRequisitionMutation = { reopenPurchasingRequisition: { _id: string | null, status: string | null, version: number | null } | null };

export type SubmitPurchasingRequisitionMutationVariables = Exact<{
  _id: string;
}>;


export type SubmitPurchasingRequisitionMutation = { submitPurchasingRequisition: { _id: string | null, status: string | null, version: number | null } | null };

export type UpdatePurchasingRequisitionMutationVariables = Exact<{
  _id: string;
  version: number;
  title: string;
  purpose?: string | null | undefined;
  requestedBy?: string | null | undefined;
  neededBy?: string | null | undefined;
  lines: Array<Types.PurchasingRequisitionLineInput> | Types.PurchasingRequisitionLineInput;
}>;


export type UpdatePurchasingRequisitionMutation = { updatePurchasingRequisition: { _id: string | null, version: number | null } | null };

export type CreatePurchasingVendorMutationVariables = Exact<{
  name: string;
  contactPerson?: string | null | undefined;
  phone?: string | null | undefined;
  email?: string | null | undefined;
  address?: string | null | undefined;
  taxId?: string | null | undefined;
  paymentTermsDays?: number | null | undefined;
  bankName?: string | null | undefined;
  bankAccountTitle?: string | null | undefined;
  bankAccountNumber?: string | null | undefined;
  notes?: string | null | undefined;
}>;


export type CreatePurchasingVendorMutation = { createPurchasingVendor: { _id: string | null } | null };

export type PagedPurchasingVendorsQueryVariables = Exact<{
  search?: string | null | undefined;
  isActive?: boolean | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type PagedPurchasingVendorsQuery = { pagedPurchasingVendors: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, contactPerson: string | null, phone: string | null, paymentTermsDays: number | null, isActive: boolean | null } | null> | null } | null };

export type PurchasingVendorByIdQueryVariables = Exact<{
  _id: string;
}>;


export type PurchasingVendorByIdQuery = { purchasingVendorById: { _id: string | null, name: string | null, contactPerson: string | null, phone: string | null, email: string | null, address: string | null, taxId: string | null, paymentTermsDays: number | null, bankName: string | null, bankAccountTitle: string | null, bankAccountNumber: string | null, notes: string | null, isActive: boolean | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type RemovePurchasingVendorMutationVariables = Exact<{
  _id: string;
}>;


export type RemovePurchasingVendorMutation = { removePurchasingVendor: boolean | null };

export type SetPurchasingVendorActiveMutationVariables = Exact<{
  _id: string;
  isActive: boolean;
}>;


export type SetPurchasingVendorActiveMutation = { setPurchasingVendorActive: { _id: string | null, isActive: boolean | null } | null };

export type UpdatePurchasingVendorMutationVariables = Exact<{
  _id: string;
  name: string;
  contactPerson?: string | null | undefined;
  phone?: string | null | undefined;
  email?: string | null | undefined;
  address?: string | null | undefined;
  taxId?: string | null | undefined;
  paymentTermsDays?: number | null | undefined;
  bankName?: string | null | undefined;
  bankAccountTitle?: string | null | undefined;
  bankAccountNumber?: string | null | undefined;
  notes?: string | null | undefined;
}>;


export type UpdatePurchasingVendorMutation = { updatePurchasingVendor: { _id: string | null, name: string | null, contactPerson: string | null, phone: string | null, email: string | null, address: string | null, taxId: string | null, paymentTermsDays: number | null, bankName: string | null, bankAccountTitle: string | null, bankAccountNumber: string | null, notes: string | null, isActive: boolean | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type PagedSecurityAuditLogsQueryVariables = Exact<{
  filter?: Types.AuditLogFilter | null | undefined;
}>;


export type PagedSecurityAuditLogsQuery = { pagedSecurityAuditLogs: { totalResults: number | null, data: Array<{ _id: string | null, entityId: string | null, entityType: string | null, operationType: string | null, auditValues: Array<string | null> | null, operationTime: string | null, operationBy: string | null, operationByName: string | null, operationByImageUrl: string | null, operationByImageThumbnailUrl: string | null } | null> | null } | null };

export type PagedSecurityPeopleQueryVariables = Exact<{
  filter?: Types.PersonFilter | null | undefined;
}>;


export type PagedSecurityPeopleQuery = { pagedSecurityPeople: { totalResults: number | null, data: Array<{ _id: string | null, isVisitor: boolean | null, isKarkun: boolean | null, isEmployee: boolean | null, sharedData: { name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null, visitorData: { city: string | null, country: string | null } | null, karkunData: { cityLocation: { _id: string | null, name: string | null } | null } | null } | null> | null } | null };

export type ComposerAllSecurityMehfilDutiesQueryVariables = Exact<{
  mehfilId?: string | null | undefined;
}>;


export type ComposerAllSecurityMehfilDutiesQuery = { allSecurityMehfilDuties: Array<{ _id: string, name: string, urduName: string | null, overallUsedCount: number | null, mehfilUsedCount: number | null } | null> | null };

export type ComposerSecurityMehfilDutyByIdQueryVariables = Exact<{
  id: string;
}>;


export type ComposerSecurityMehfilDutyByIdQuery = { securityMehfilDutyById: { _id: string, name: string, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type MehfilByIdQueryVariables = Exact<{
  _id: string;
}>;


export type MehfilByIdQuery = { mehfilById: { _id: string | null, name: string | null, mehfilDate: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type MehfilKarkunByBarcodeIdQueryVariables = Exact<{
  barcode: string;
}>;


export type MehfilKarkunByBarcodeIdQuery = { mehfilKarkunByBarcodeId: { _id: string | null, mehfilId: string | null, karkunId: string | null, dutyId: string | null, dutyDetail: string | null, dutyCardBarcodeId: string | null, mehfil: { _id: string | null, name: string | null, mehfilDate: string | null } | null, karkun: { _id: string | null, sharedData: { name: string | null, imageUrl: string | null } | null } | null } | null };

export type AddMehfilKarkunMutationVariables = Exact<{
  mehfilId: string;
  karkunId: string;
  dutyId: string;
}>;


export type AddMehfilKarkunMutation = { addMehfilKarkun: { _id: string | null, mehfilId: string | null, karkunId: string | null, dutyId: string | null, dutyDetail: string | null, dutyCardBarcodeId: string | null } | null };

export type MehfilKarkunsByIdsQueryVariables = Exact<{
  ids: string;
}>;


export type MehfilKarkunsByIdsQuery = { mehfilKarkunsByIds: Array<{ _id: string | null, mehfilId: string | null, karkunId: string | null, dutyId: string | null, dutyDetail: string | null, dutyCardBarcodeId: string | null, duty: { _id: string, name: string, urduName: string | null } | null, karkun: { _id: string | null, isKarkun: boolean | null, sharedData: { name: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null, visitorData: { city: string | null, country: string | null } | null, karkunData: { cityLocation: { _id: string | null, name: string | null } | null } | null } | null } | null> | null };

export type MehfilKarkunsByMehfilIdQueryVariables = Exact<{
  mehfilId: string;
  dutyId?: string | null | undefined;
}>;


export type MehfilKarkunsByMehfilIdQuery = { mehfilKarkunsByMehfilId: Array<{ _id: string | null, mehfilId: string | null, karkunId: string | null, dutyId: string | null, dutyDetail: string | null, dutyCardBarcodeId: string | null, karkun: { _id: string | null, isKarkun: boolean | null, sharedData: { name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null } | null, visitorData: { city: string | null, country: string | null } | null, karkunData: { cityLocation: { _id: string | null, name: string | null } | null } | null } | null } | null> | null };

export type RemoveMehfilKarkunMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveMehfilKarkunMutation = { removeMehfilKarkun: number | null };

export type SetDutyDetailMutationVariables = Exact<{
  ids: Array<string | null | undefined> | string;
  dutyDetail: string;
}>;


export type SetDutyDetailMutation = { setDutyDetail: Array<{ _id: string | null, mehfilId: string | null, karkunId: string | null, dutyId: string | null, dutyDetail: string | null, dutyCardBarcodeId: string | null } | null> | null };

export type AllMehfilsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllMehfilsQuery = { allMehfils: Array<{ _id: string | null, name: string | null, mehfilDate: string | null, karkunCount: number | null } | null> | null };

export type CreateMehfilMutationVariables = Exact<{
  name: string;
  mehfilDate: string;
}>;


export type CreateMehfilMutation = { createMehfil: { _id: string | null, name: string | null, mehfilDate: string | null } | null };

export type RemoveMehfilMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveMehfilMutation = { removeMehfil: number | null };

export type UpdateMehfilMutationVariables = Exact<{
  _id: string;
  name: string;
  mehfilDate: string;
}>;


export type UpdateMehfilMutation = { updateMehfil: { _id: string | null, name: string | null, mehfilDate: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type AddSecurityGroupMemberMutationVariables = Exact<{
  groupId: string;
  karkunId: string;
}>;


export type AddSecurityGroupMemberMutation = { addSecurityGroupMember: boolean | null };

export type AddSecurityPermissionGroupMutationVariables = Exact<{
  permissionKey: string;
  groupId: string;
}>;


export type AddSecurityPermissionGroupMutation = { addSecurityPermissionGroup: boolean | null };

export type AddSecurityPermissionUserMutationVariables = Exact<{
  permissionKey: string;
  karkunId: string;
}>;


export type AddSecurityPermissionUserMutation = { addSecurityPermissionUser: boolean | null };

export type CreateSecurityUserGroupMutationVariables = Exact<{
  name: string;
  description?: string | null | undefined;
}>;


export type CreateSecurityUserGroupMutation = { createSecurityUserGroup: { _id: string, name: string, description: string | null } | null };

export type DeleteSecurityUserGroupMutationVariables = Exact<{
  _id: string;
}>;


export type DeleteSecurityUserGroupMutation = { deleteSecurityUserGroup: boolean | null };

export type RemoveSecurityGroupMemberMutationVariables = Exact<{
  groupId: string;
  userId: string;
}>;


export type RemoveSecurityGroupMemberMutation = { removeSecurityGroupMember: boolean | null };

export type RemoveSecurityPermissionGroupMutationVariables = Exact<{
  permissionKey: string;
  groupId: string;
}>;


export type RemoveSecurityPermissionGroupMutation = { removeSecurityPermissionGroup: boolean | null };

export type RemoveSecurityPermissionUserMutationVariables = Exact<{
  permissionKey: string;
  userId: string;
}>;


export type RemoveSecurityPermissionUserMutation = { removeSecurityPermissionUser: boolean | null };

export type SecurityPermissionAssignmentsQueryVariables = Exact<{ [key: string]: never; }>;


export type SecurityPermissionAssignmentsQuery = { securityPermissionAssignments: Array<{ featureKey: string, featureName: string, permissions: Array<{ key: string, name: string, description: string | null, users: Array<{ userId: string, personId: string | null, username: string | null, displayName: string | null } | null> | null, groups: Array<{ groupId: string, name: string } | null> | null } | null> | null } | null> | null };

export type SecurityPermissionKarkunSearchQueryVariables = Exact<{
  name?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type SecurityPermissionKarkunSearchQuery = { securityPermissionKarkunSearch: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null> | null } | null };

export type SecurityUserGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type SecurityUserGroupsQuery = { securityUserGroups: Array<{ _id: string, name: string, description: string | null, users: Array<{ userId: string, personId: string | null, username: string | null, displayName: string | null } | null> | null } | null> | null };

export type UpdateSecurityUserGroupMutationVariables = Exact<{
  _id: string;
  name: string;
  description?: string | null | undefined;
}>;


export type UpdateSecurityUserGroupMutation = { updateSecurityUserGroup: { _id: string, name: string, description: string | null } | null };

export type AddSecurityServerProfileImageMutationVariables = Exact<{
  profileId: string;
  imageData: string;
}>;


export type AddSecurityServerProfileImageMutation = { addSecurityServerProfileImage: { _id: string | null, name: string | null, isTest: boolean | null, alertsCount: number | null, deletedAt: string | null, defaultImageId: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, images: Array<{ _id: string | null, imageUrl: string | null, uploadedAt: string | null } | null> | null } | null };

export type AllSecurityServerChannelsQueryVariables = Exact<{
  includeDeleted?: boolean | null | undefined;
}>;


export type AllSecurityServerChannelsQuery = { allSecurityServerChannels: Array<{ _id: string | null, name: string | null, enabled: boolean | null, similarityThreshold: number | null, recognitionFps: number | null, minFaceSizePx: number | null, minFaceQuality: number | null, alertsCount: number | null, deletedAt: string | null, connection: { host: string | null, port: number | null, path: string | null, username: string | null, hasPassword: boolean | null } | null } | null> | null };

export type CreateMissingSecurityServerAlertThumbnailsMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateMissingSecurityServerAlertThumbnailsMutation = { createMissingSecurityServerAlertThumbnails: number | null };

export type CreateMissingSecurityServerProfileThumbnailsMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateMissingSecurityServerProfileThumbnailsMutation = { createMissingSecurityServerProfileThumbnails: number | null };

export type CreateSecurityServerChannelMutationVariables = Exact<{
  name: string;
  enabled: boolean;
  similarityThreshold?: number | null | undefined;
  recognitionFps: number;
  minFaceSizePx?: number | null | undefined;
  minFaceQuality?: number | null | undefined;
  connection: Types.SecurityServerChannelConnectionInput;
}>;


export type CreateSecurityServerChannelMutation = { createSecurityServerChannel: { _id: string | null } | null };

export type CreateSecurityServerProfileMutationVariables = Exact<{
  name: string;
  isTest: boolean;
}>;


export type CreateSecurityServerProfileMutation = { createSecurityServerProfile: { _id: string | null } | null };

export type DeleteSecurityServerChannelMutationVariables = Exact<{
  _id: string;
}>;


export type DeleteSecurityServerChannelMutation = { deleteSecurityServerChannel: number | null };

export type DeleteSecurityServerProfileMutationVariables = Exact<{
  _id: string;
}>;


export type DeleteSecurityServerProfileMutation = { deleteSecurityServerProfile: number | null };

export type PagedSecurityServerAlertGroupsQueryVariables = Exact<{
  filter?: Types.SecurityServerAlertFilter | null | undefined;
}>;


export type PagedSecurityServerAlertGroupsQuery = { pagedSecurityServerAlertGroups: { totalResults: number | null, data: Array<{ profileId: string | null, profileName: string | null, profileIsTest: boolean | null, alertCount: number | null, notReviewedCount: number | null, firstTimestamp: string | null, lastTimestamp: string | null, latestImageUrl: string | null, latestThumbnailUrl: string | null } | null> | null } | null };

export type PagedSecurityServerAlertsQueryVariables = Exact<{
  filter?: Types.SecurityServerAlertFilter | null | undefined;
}>;


export type PagedSecurityServerAlertsQuery = { pagedSecurityServerAlerts: { totalResults: number | null, data: Array<{ _id: string | null, profileId: string | null, profileName: string | null, profileIsTest: boolean | null, channelId: string | null, channelName: string | null, timestamp: string | null, similarityScore: number | null, imageUrl: string | null, thumbnailUrl: string | null, review: string | null } | null> | null } | null };

export type PagedSecurityServerProfilesQueryVariables = Exact<{
  filter?: Types.SecurityServerProfileFilter | null | undefined;
}>;


export type PagedSecurityServerProfilesQuery = { pagedSecurityServerProfiles: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, isTest: boolean | null, alertsCount: number | null, updatedAt: string | null, deletedAt: string | null, defaultImageId: string | null, images: Array<{ _id: string | null, imageUrl: string | null, thumbnailUrl: string | null } | null> | null } | null> | null } | null };

export type RemoveSecurityServerProfileImageMutationVariables = Exact<{
  profileId: string;
  imageId: string;
}>;


export type RemoveSecurityServerProfileImageMutation = { removeSecurityServerProfileImage: { _id: string | null, name: string | null, isTest: boolean | null, alertsCount: number | null, deletedAt: string | null, defaultImageId: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, images: Array<{ _id: string | null, imageUrl: string | null, uploadedAt: string | null } | null> | null } | null };

export type SecurityServerAlertByIdQueryVariables = Exact<{
  _id: string;
}>;


export type SecurityServerAlertByIdQuery = { securityServerAlertById: { _id: string | null, profileId: string | null, profileName: string | null, profileIsTest: boolean | null, channelId: string | null, channelName: string | null, timestamp: string | null, similarityScore: number | null, faceSizePx: number | null, faceQualityScore: number | null, faceQualityReasons: Array<string | null> | null, imageUrl: string | null, review: string | null, reviewedAt: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type SecurityServerAlertSyncStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type SecurityServerAlertSyncStatusQuery = { securityServerAlertSyncStatus: { lastSyncedAt: string | null } | null };

export type SecurityServerChannelByIdQueryVariables = Exact<{
  _id: string;
}>;


export type SecurityServerChannelByIdQuery = { securityServerChannelById: { _id: string | null, name: string | null, enabled: boolean | null, similarityThreshold: number | null, recognitionFps: number | null, minFaceSizePx: number | null, minFaceQuality: number | null, alertsCount: number | null, deletedAt: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, connection: { host: string | null, port: number | null, path: string | null, username: string | null, hasPassword: boolean | null } | null } | null };

export type SecurityServerProfileByIdQueryVariables = Exact<{
  _id: string;
}>;


export type SecurityServerProfileByIdQuery = { securityServerProfileById: { _id: string | null, name: string | null, isTest: boolean | null, alertsCount: number | null, deletedAt: string | null, defaultImageId: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, images: Array<{ _id: string | null, imageUrl: string | null, uploadedAt: string | null } | null> | null } | null };

export type SecurityServerUsageStatsQueryVariables = Exact<{
  minutes: number;
}>;


export type SecurityServerUsageStatsQuery = { securityServerUsageStats: { minutes: number | null, coveredSeconds: number | null, lastBucketAt: string | null, server: { windowCount: number | null, activeChannels: number | null, dnnTarget: string | null, inferenceBusyAvgPct: number | null, inferenceBusyMaxPct: number | null, gpuUtilAvgPct: number | null, gpuUtilMaxPct: number | null, gpuMemUsedMb: number | null, gpuMemTotalMb: number | null, cpuAvgPct: number | null, cpuCores: number | null, eventLoopLagP95Ms: number | null, eventLoopLagMaxMs: number | null } | null, channels: Array<{ channelId: string | null, name: string | null, recognitionFps: number | null, frameWidth: number | null, frameHeight: number | null, readFps: number | null, processedFps: number | null, busySkipPct: number | null, inferenceSharePct: number | null, faces: number | null, skippedFaceSize: number | null, skippedFaceQuality: number | null, faceSkipPct: number | null, readFailures: number | null, reconnects: number | null } | null> | null } | null };

export type SetSecurityServerAlertReviewMutationVariables = Exact<{
  _id: string;
  review?: string | null | undefined;
}>;


export type SetSecurityServerAlertReviewMutation = { setSecurityServerAlertReview: { _id: string | null, review: string | null, reviewedAt: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type SetSecurityServerProfileDefaultImageMutationVariables = Exact<{
  profileId: string;
  imageId: string;
}>;


export type SetSecurityServerProfileDefaultImageMutation = { setSecurityServerProfileDefaultImage: { _id: string | null, defaultImageId: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateSecurityServerChannelMutationVariables = Exact<{
  _id: string;
  name: string;
  enabled: boolean;
  similarityThreshold?: number | null | undefined;
  recognitionFps: number;
  minFaceSizePx?: number | null | undefined;
  minFaceQuality?: number | null | undefined;
  connection: Types.SecurityServerChannelConnectionInput;
}>;


export type UpdateSecurityServerChannelMutation = { updateSecurityServerChannel: { _id: string | null, name: string | null, enabled: boolean | null, similarityThreshold: number | null, recognitionFps: number | null, minFaceSizePx: number | null, minFaceQuality: number | null, updatedAt: string | null, updatedBy: string | null, connection: { host: string | null, port: number | null, path: string | null, username: string | null, hasPassword: boolean | null } | null } | null };

export type UpdateSecurityServerProfileMutationVariables = Exact<{
  _id: string;
  name: string;
  isTest: boolean;
}>;


export type UpdateSecurityServerProfileMutation = { updateSecurityServerProfile: { _id: string | null, name: string | null, isTest: boolean | null, alertsCount: number | null, deletedAt: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, images: Array<{ _id: string | null, imageUrl: string | null, uploadedAt: string | null } | null> | null } | null };

export type CreateSecurityMehfilDutyMutationVariables = Exact<{
  name: string;
  urduName: string;
}>;


export type CreateSecurityMehfilDutyMutation = { createSecurityMehfilDuty: { _id: string, name: string, urduName: string | null } | null };

export type RemoveSecurityMehfilDutyMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveSecurityMehfilDutyMutation = { removeSecurityMehfilDuty: number | null };

export type SetupAllSecurityMehfilDutiesQueryVariables = Exact<{ [key: string]: never; }>;


export type SetupAllSecurityMehfilDutiesQuery = { allSecurityMehfilDuties: Array<{ _id: string, name: string, urduName: string | null, overallUsedCount: number | null } | null> | null };

export type SetupSecurityMehfilDutyByIdQueryVariables = Exact<{
  id: string;
}>;


export type SetupSecurityMehfilDutyByIdQuery = { securityMehfilDutyById: { _id: string, name: string, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateSecurityMehfilDutyMutationVariables = Exact<{
  id: string;
  name: string;
  urduName: string;
}>;


export type UpdateSecurityMehfilDutyMutation = { updateSecurityMehfilDuty: { _id: string, name: string, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type AllSecurityMehfilLangarDishesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllSecurityMehfilLangarDishesQuery = { allSecurityMehfilLangarDishes: Array<{ _id: string | null, name: string | null, urduName: string | null, overallUsedCount: number | null } | null> | null };

export type CreateSecurityMehfilLangarDishMutationVariables = Exact<{
  name: string;
  urduName: string;
}>;


export type CreateSecurityMehfilLangarDishMutation = { createSecurityMehfilLangarDish: { _id: string | null, name: string | null, urduName: string | null } | null };

export type RemoveSecurityMehfilLangarDishMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveSecurityMehfilLangarDishMutation = { removeSecurityMehfilLangarDish: number | null };

export type SecurityMehfilLangarDishByIdQueryVariables = Exact<{
  id: string;
}>;


export type SecurityMehfilLangarDishByIdQuery = { securityMehfilLangarDishById: { _id: string | null, name: string | null, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateSecurityMehfilLangarDishMutationVariables = Exact<{
  id: string;
  name: string;
  urduName: string;
}>;


export type UpdateSecurityMehfilLangarDishMutation = { updateSecurityMehfilLangarDish: { _id: string | null, name: string | null, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type AllSecurityMehfilLangarLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllSecurityMehfilLangarLocationsQuery = { allSecurityMehfilLangarLocations: Array<{ _id: string | null, name: string | null, urduName: string | null, overallUsedCount: number | null } | null> | null };

export type CreateSecurityMehfilLangarLocationMutationVariables = Exact<{
  name: string;
  urduName: string;
}>;


export type CreateSecurityMehfilLangarLocationMutation = { createSecurityMehfilLangarLocation: { _id: string | null, name: string | null, urduName: string | null } | null };

export type RemoveSecurityMehfilLangarLocationMutationVariables = Exact<{
  _id: string;
}>;


export type RemoveSecurityMehfilLangarLocationMutation = { removeSecurityMehfilLangarLocation: number | null };

export type SecurityMehfilLangarLocationByIdQueryVariables = Exact<{
  id: string;
}>;


export type SecurityMehfilLangarLocationByIdQuery = { securityMehfilLangarLocationById: { _id: string | null, name: string | null, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateSecurityMehfilLangarLocationMutationVariables = Exact<{
  id: string;
  name: string;
  urduName: string;
}>;


export type UpdateSecurityMehfilLangarLocationMutation = { updateSecurityMehfilLangarLocation: { _id: string | null, name: string | null, urduName: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type CreateSecurityVisitorMutationVariables = Exact<{
  name: string;
  parentName: string;
  cnicNumber?: string | null | undefined;
  ehadDate: string;
  birthDate?: string | null | undefined;
  referenceName: string;
  contactNumber1?: string | null | undefined;
  contactNumber2?: string | null | undefined;
  city?: string | null | undefined;
  country?: string | null | undefined;
  currentAddress?: string | null | undefined;
  permanentAddress?: string | null | undefined;
  educationalQualification?: string | null | undefined;
  meansOfEarning?: string | null | undefined;
  tagIds?: Array<string | null | undefined> | string | null | undefined;
}>;


export type CreateSecurityVisitorMutation = { createSecurityVisitor: { _id: string | null } | null };

export type DeleteSecurityVisitorMutationVariables = Exact<{
  _id: string;
}>;


export type DeleteSecurityVisitorMutation = { deleteSecurityVisitor: number | null };

export type ImportSecurityVisitorsCsvDataMutationVariables = Exact<{
  csvData: string;
}>;


export type ImportSecurityVisitorsCsvDataMutation = { importSecurityVisitorsCsvData: string | null };

export type PagedSecurityVisitorsQueryVariables = Exact<{
  filter?: Types.VisitorFilter | null | undefined;
}>;


export type PagedSecurityVisitorsQuery = { pagedSecurityVisitors: { totalResults: number | null, data: Array<{ _id: string | null, isKarkun: boolean | null, sharedData: { name: string | null, parentName: string | null, referenceName: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, imageVectorData: { status: string | null } | null, tags: Array<{ _id: string | null, name: string | null, color: string | null, textColor: string | null } | null> | null } | null, visitorData: { city: string | null, country: string | null, criminalRecord: string | null, otherNotes: string | null } | null } | null> | null } | null };

export type SecurityFaceVectorFromImageQueryVariables = Exact<{
  imageData: string;
}>;


export type SecurityFaceVectorFromImageQuery = { securityFaceVectorFromImage: { status: string | null, vector: Array<number> | null } | null };

export type SecurityVisitorByCnicQueryVariables = Exact<{
  cnicNumbers: Array<string | null | undefined> | string;
}>;


export type SecurityVisitorByCnicQuery = { securityVisitorByCnic: { _id: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null } | null, visitorData: { city: string | null, country: string | null } | null } | null };

export type SecurityRegistrationVisitorByIdQueryVariables = Exact<{
  _id: string;
}>;


export type SecurityRegistrationVisitorByIdQuery = { securityVisitorById: { _id: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, ehadDate: string | null, birthDate: string | null, referenceName: string | null, contactNumber1: string | null, contactNumber2: string | null, currentAddress: string | null, permanentAddress: string | null, educationalQualification: string | null, meansOfEarning: string | null, imageUrl: string | null, tagIds: Array<string | null> | null, tags: Array<{ _id: string | null, name: string | null, color: string | null, textColor: string | null } | null> | null } | null, visitorData: { city: string | null, country: string | null, criminalRecord: string | null, otherNotes: string | null } | null } | null };

export type SecurityVisitorsByFaceVectorQueryVariables = Exact<{
  vector: Array<number> | number;
  limit?: number | null | undefined;
}>;


export type SecurityVisitorsByFaceVectorQuery = { securityVisitorsByFaceVector: Array<{ score: number | null, person: { _id: string | null, sharedData: { name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null } | null, visitorData: { city: string | null, country: string | null } | null } | null } | null> | null };

export type SetSecurityVisitorImageMutationVariables = Exact<{
  _id: string;
  imageData: string;
}>;


export type SetSecurityVisitorImageMutation = { setSecurityVisitorImage: { _id: string | null, sharedData: { imageUrl: string | null, imageThumbnailUrl: string | null } | null } | null };

export type UpdateSecurityVisitorNotesMutationVariables = Exact<{
  _id: string;
  criminalRecord?: string | null | undefined;
  otherNotes?: string | null | undefined;
}>;


export type UpdateSecurityVisitorNotesMutation = { updateSecurityVisitorNotes: { _id: string | null } | null };

export type UpdateSecurityVisitorMutationVariables = Exact<{
  _id: string;
  name: string;
  parentName: string;
  cnicNumber?: string | null | undefined;
  ehadDate: string;
  birthDate?: string | null | undefined;
  referenceName: string;
  contactNumber1?: string | null | undefined;
  contactNumber2?: string | null | undefined;
  city?: string | null | undefined;
  country?: string | null | undefined;
  currentAddress?: string | null | undefined;
  permanentAddress?: string | null | undefined;
  educationalQualification?: string | null | undefined;
  meansOfEarning?: string | null | undefined;
  tagIds?: Array<string | null | undefined> | string | null | undefined;
}>;


export type UpdateSecurityVisitorMutation = { updateSecurityVisitor: { _id: string | null } | null };

export type FixNameSpellingMutationVariables = Exact<{
  existingSpelling: string;
  newSpelling: string;
}>;


export type FixNameSpellingMutation = { fixNameSpelling: number | null };

export type ReportPagedVisitorStaysQueryVariables = Exact<{
  queryString: string;
}>;


export type ReportPagedVisitorStaysQuery = { pagedVisitorStays: { totalResults: number | null, data: Array<{ _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, refVisitor: { _id: string | null, sharedData: { name: string | null, imageUrl: string | null } | null, visitorData: { city: string | null, country: string | null, criminalRecord: string | null, otherNotes: string | null } | null } | null } | null> | null } | null };

export type CancelVisitorStayMutationVariables = Exact<{
  _id: string;
}>;


export type CancelVisitorStayMutation = { cancelVisitorStay: { _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, cancelledDate: string | null } | null };

export type CreateVisitorStayMutationVariables = Exact<{
  visitorId: string;
  numOfDays: number;
  stayReason?: string | null | undefined;
  stayAllowedBy?: string | null | undefined;
  dutyId?: string | null | undefined;
  shiftId?: string | null | undefined;
}>;


export type CreateVisitorStayMutation = { createVisitorStay: { _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, stayReason: string | null, stayAllowedBy: string | null, dutyId: string | null, shiftId: string | null } | null };

export type EditVisitorStayByIdQueryVariables = Exact<{
  _id: string;
}>;


export type EditVisitorStayByIdQuery = { visitorStayById: { _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, dutyId: string | null, shiftId: string | null } | null };

export type VisitorStaysPagedVisitorStaysQueryVariables = Exact<{
  queryString: string;
}>;


export type VisitorStaysPagedVisitorStaysQuery = { pagedVisitorStays: { totalResults: number | null, data: Array<{ _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, dutyName: string | null, shiftName: string | null, dutyShiftName: string | null, cancelledDate: string | null } | null> | null } | null };

export type UpdateVisitorStayMutationVariables = Exact<{
  _id: string;
  fromDate: string;
  toDate: string;
  stayReason?: string | null | undefined;
  stayAllowedBy?: string | null | undefined;
  dutyId?: string | null | undefined;
  shiftId?: string | null | undefined;
}>;


export type UpdateVisitorStayMutation = { updateVisitorStay: { _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, dutyId: string | null, shiftId: string | null } | null };

export type VerificationVisitorStayByIdQueryVariables = Exact<{
  _id: string;
}>;


export type VerificationVisitorStayByIdQuery = { visitorStayById: { _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, dutyName: string | null, shiftName: string | null, cancelledDate: string | null, isValid: boolean | null, refVisitor: { _id: string | null, sharedData: { name: string | null, parentName: string | null, referenceName: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null } | null, visitorData: { city: string | null, country: string | null, criminalRecord: string | null, otherNotes: string | null } | null } | null } | null };

export type ViewVisitorStayByIdQueryVariables = Exact<{
  _id: string;
}>;


export type ViewVisitorStayByIdQuery = { visitorStayById: { _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, dutyShiftName: string | null } | null };

export type ItemCategoriesByPhysicalStoreIdQueryVariables = Exact<{
  physicalStoreId: string;
}>;


export type ItemCategoriesByPhysicalStoreIdQuery = { itemCategoriesByPhysicalStoreId: Array<{ _id: string | null, name: string | null, physicalStoreId: string | null, stockItemCount: number | null } | null> | null };

export type LocationsByPhysicalStoreIdQueryVariables = Exact<{
  physicalStoreId: string;
}>;


export type LocationsByPhysicalStoreIdQuery = { locationsByPhysicalStoreId: Array<{ _id: string | null, name: string | null, physicalStoreId: string | null, parentId: string | null, description: string | null, isInUse: boolean | null, refParent: { _id: string | null, name: string | null } | null } | null> | null };

export type VendorsByPhysicalStoreIdQueryVariables = Exact<{
  physicalStoreId: string;
}>;


export type VendorsByPhysicalStoreIdQuery = { vendorsByPhysicalStoreId: Array<{ _id: string | null, name: string | null, physicalStoreId: string | null, contactPerson: string | null, contactNumber: string | null, address: string | null, notes: string | null, usageCount: number | null } | null> | null };

export type UseInventoryPhysicalStoreByIdQueryVariables = Exact<{
  id: string;
}>;


export type UseInventoryPhysicalStoreByIdQuery = { physicalStoreById: { _id: string | null, name: string | null } | null };

export type StockItemsByIdQueryVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type StockItemsByIdQuery = { stockItemsById: Array<{ _id: string | null, name: string | null, formattedName: string | null, unitOfMeasurement: string | null } | null> | null };

export type AddIssuanceFormAttachmentMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  attachmentId: string;
}>;


export type AddIssuanceFormAttachmentMutation = { addIssuanceFormAttachment: { _id: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null };

export type ApproveIssuanceFormsMutationVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type ApproveIssuanceFormsMutation = { approveIssuanceForms: Array<{ _id: string | null, issueDate: string | null, issuedBy: string | null, issuedTo: string | null, locationId: string | null, physicalStoreId: string | null, approvedOn: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null } | null> | null, refIssuedTo: { _id: string | null, sharedData: { name: string | null } | null } | null } | null> | null };

export type CreateIssuanceFormMutationVariables = Exact<{
  issueDate: string;
  issuedBy: string;
  issuedTo: string;
  handedOverTo?: string | null | undefined;
  physicalStoreId: string;
  locationId?: string | null | undefined;
  items?: Array<Types.ItemWithQuantityInput | null | undefined> | Types.ItemWithQuantityInput | null | undefined;
  notes?: string | null | undefined;
}>;


export type CreateIssuanceFormMutation = { createIssuanceForm: { _id: string | null, issueDate: string | null, physicalStoreId: string | null, locationId: string | null, notes: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null } | null> | null } | null };

export type IssuanceFormByIdQueryVariables = Exact<{
  physicalStoreId: string;
  _id: string;
}>;


export type IssuanceFormByIdQuery = { issuanceFormById: { _id: string | null, issueDate: string | null, issuedBy: string | null, issuedTo: string | null, handedOverTo: string | null, locationId: string | null, physicalStoreId: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, approvedOn: string | null, approvedBy: string | null, notes: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, refStockItem: { _id: string | null, name: string | null, unitOfMeasurement: string | null } | null } | null> | null, refLocation: { _id: string | null, name: string | null } | null, refIssuedBy: { _id: string | null, sharedData: { name: string | null } | null } | null, refIssuedTo: { _id: string | null, sharedData: { name: string | null } | null } | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null };

export type PagedIssuanceFormsQueryVariables = Exact<{
  physicalStoreId: string;
  queryString?: string | null | undefined;
}>;


export type PagedIssuanceFormsQuery = { pagedIssuanceForms: { totalResults: number | null, data: Array<{ _id: string | null, issueDate: string | null, issuedBy: string | null, issuedTo: string | null, handedOverTo: string | null, locationId: string | null, physicalStoreId: string | null, approvedOn: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, refStockItem: { _id: string | null, name: string | null, unitOfMeasurement: string | null } | null } | null> | null, attachments: Array<{ _id: string | null, name: string | null } | null> | null, refIssuedTo: { _id: string | null, sharedData: { name: string | null } | null } | null, refLocation: { _id: string | null, name: string | null } | null } | null> | null } | null };

export type RemoveIssuanceFormAttachmentMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  attachmentId: string;
}>;


export type RemoveIssuanceFormAttachmentMutation = { removeIssuanceFormAttachment: { _id: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null };

export type RemoveIssuanceFormsMutationVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type RemoveIssuanceFormsMutation = { removeIssuanceForms: number | null };

export type UpdateIssuanceFormMutationVariables = Exact<{
  _id: string;
  issueDate: string;
  issuedBy: string;
  issuedTo: string;
  handedOverTo?: string | null | undefined;
  locationId?: string | null | undefined;
  physicalStoreId: string;
  items?: Array<Types.ItemWithQuantityInput | null | undefined> | Types.ItemWithQuantityInput | null | undefined;
  notes?: string | null | undefined;
}>;


export type UpdateIssuanceFormMutation = { updateIssuanceForm: { _id: string | null, issueDate: string | null, locationId: string | null, physicalStoreId: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, notes: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null } | null> | null, refIssuedBy: { _id: string | null, sharedData: { name: string | null } | null } | null, refIssuedTo: { _id: string | null, sharedData: { name: string | null } | null } | null } | null };

export type IssuanceFormsByMonthQueryVariables = Exact<{
  physicalStoreId: string;
  month: string;
}>;


export type IssuanceFormsByMonthQuery = { issuanceFormsByMonth: Array<{ _id: string | null, issueDate: string | null, locationId: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, refStockItem: { _id: string | null, name: string | null, imageUrl: string | null, categoryName: string | null, unitOfMeasurement: string | null } | null } | null> | null } | null> | null };

export type CreateItemCategoryMutationVariables = Exact<{
  name: string;
  physicalStoreId: string;
}>;


export type CreateItemCategoryMutation = { createItemCategory: { _id: string | null, name: string | null, physicalStoreId: string | null } | null };

export type ItemCategoryByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type ItemCategoryByIdQuery = { itemCategoryById: { _id: string | null, name: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type RemoveItemCategoryMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type RemoveItemCategoryMutation = { removeItemCategory: number | null };

export type UpdateItemCategoryMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  name: string;
}>;


export type UpdateItemCategoryMutation = { updateItemCategory: { _id: string | null, name: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type CreateLocationMutationVariables = Exact<{
  name: string;
  physicalStoreId: string;
  parentId?: string | null | undefined;
  description?: string | null | undefined;
}>;


export type CreateLocationMutation = { createLocation: { _id: string | null, name: string | null, parentId: string | null, description: string | null } | null };

export type LocationByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type LocationByIdQuery = { locationById: { _id: string | null, name: string | null, parentId: string | null, description: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type RemoveLocationMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type RemoveLocationMutation = { removeLocation: number | null };

export type UpdateLocationMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  name: string;
  parentId?: string | null | undefined;
  description?: string | null | undefined;
}>;


export type UpdateLocationMutation = { updateLocation: { _id: string | null, name: string | null, parentId: string | null, description: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type AddPurchaseFormAttachmentMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  attachmentId: string;
}>;


export type AddPurchaseFormAttachmentMutation = { addPurchaseFormAttachment: { _id: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null };

export type ApprovePurchaseFormsMutationVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type ApprovePurchaseFormsMutation = { approvePurchaseForms: Array<{ _id: string | null, purchaseDate: string | null, receivedBy: string | null, purchasedBy: string | null, physicalStoreId: string | null, approvedOn: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null } | null> | null } | null> | null };

export type CreatePurchaseFormMutationVariables = Exact<{
  purchaseDate: string;
  receivedBy: string;
  purchasedBy: string;
  physicalStoreId: string;
  locationId?: string | null | undefined;
  vendorId?: string | null | undefined;
  items?: Array<Types.ItemWithQuantityAndPriceInput | null | undefined> | Types.ItemWithQuantityAndPriceInput | null | undefined;
  notes?: string | null | undefined;
}>;


export type CreatePurchaseFormMutation = { createPurchaseForm: { _id: string | null, purchaseDate: string | null, physicalStoreId: string | null, locationId: string | null, vendorId: string | null, notes: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, price: number | null } | null> | null, refReceivedBy: { _id: string | null, sharedData: { name: string | null } | null } | null, refPurchasedBy: { _id: string | null, sharedData: { name: string | null } | null } | null } | null };

export type PagedPurchaseFormsQueryVariables = Exact<{
  physicalStoreId: string;
  queryString?: string | null | undefined;
}>;


export type PagedPurchaseFormsQuery = { pagedPurchaseForms: { totalResults: number | null, data: Array<{ _id: string | null, purchaseDate: string | null, receivedBy: string | null, purchasedBy: string | null, physicalStoreId: string | null, approvedOn: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, refStockItem: { _id: string | null, name: string | null, unitOfMeasurement: string | null } | null } | null> | null, attachments: Array<{ _id: string | null, name: string | null } | null> | null, refReceivedBy: { _id: string | null, sharedData: { name: string | null } | null } | null, refPurchasedBy: { _id: string | null, sharedData: { name: string | null } | null } | null, refLocation: { _id: string | null, name: string | null } | null } | null> | null } | null };

export type InventoryPurchaseFormByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type InventoryPurchaseFormByIdQuery = { purchaseFormById: { _id: string | null, purchaseDate: string | null, receivedBy: string | null, purchasedBy: string | null, physicalStoreId: string | null, locationId: string | null, vendorId: string | null, approvedOn: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, notes: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, price: number | null, refStockItem: { _id: string | null, name: string | null, unitOfMeasurement: string | null } | null } | null> | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null, refReceivedBy: { _id: string | null, sharedData: { name: string | null } | null } | null, refPurchasedBy: { _id: string | null, sharedData: { name: string | null } | null } | null, refVendor: { _id: string | null, name: string | null } | null, refLocation: { _id: string | null, name: string | null } | null } | null };

export type RemovePurchaseFormAttachmentMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  attachmentId: string;
}>;


export type RemovePurchaseFormAttachmentMutation = { removePurchaseFormAttachment: { _id: string | null, attachments: Array<{ _id: string | null, name: string | null, description: string | null, mimeType: string | null } | null> | null } | null };

export type RemovePurchaseFormsMutationVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type RemovePurchaseFormsMutation = { removePurchaseForms: number | null };

export type UpdatePurchaseFormMutationVariables = Exact<{
  _id: string;
  purchaseDate: string;
  receivedBy: string;
  purchasedBy: string;
  physicalStoreId: string;
  locationId?: string | null | undefined;
  vendorId?: string | null | undefined;
  items?: Array<Types.ItemWithQuantityAndPriceInput | null | undefined> | Types.ItemWithQuantityAndPriceInput | null | undefined;
  notes?: string | null | undefined;
}>;


export type UpdatePurchaseFormMutation = { updatePurchaseForm: { _id: string | null, purchaseDate: string | null, physicalStoreId: string | null, locationId: string | null, vendorId: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, notes: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, price: number | null } | null> | null, refReceivedBy: { _id: string | null, sharedData: { name: string | null } | null } | null, refPurchasedBy: { _id: string | null, sharedData: { name: string | null } | null } | null } | null };

export type PurchaseFormsByMonthQueryVariables = Exact<{
  physicalStoreId: string;
  month: string;
}>;


export type PurchaseFormsByMonthQuery = { purchaseFormsByMonth: Array<{ _id: string | null, purchaseDate: string | null, locationId: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, price: number | null, refStockItem: { _id: string | null, name: string | null, imageUrl: string | null, categoryName: string | null, unitOfMeasurement: string | null } | null } | null> | null } | null> | null };

export type AllAccessiblePhysicalStoresQueryVariables = Exact<{ [key: string]: never; }>;


export type AllAccessiblePhysicalStoresQuery = { allAccessiblePhysicalStores: Array<{ _id: string | null, name: string | null } | null> | null };

export type ApproveStockAdjustmentsMutationVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type ApproveStockAdjustmentsMutation = { approveStockAdjustments: Array<{ _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null, approvedOn: string | null, approvedBy: string | null } | null> | null };

export type CreateStockAdjustmentMutationVariables = Exact<{
  physicalStoreId: string;
  stockItemId: string;
  adjustmentDate: string;
  adjustedBy: string;
  quantity: number;
  isInflow: boolean;
  adjustmentReason?: string | null | undefined;
}>;


export type CreateStockAdjustmentMutation = { createStockAdjustment: { _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null } | null };

export type EditStockAdjustmentByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type EditStockAdjustmentByIdQuery = { stockAdjustmentById: { _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, refStockItem: { _id: string | null, name: string | null, formattedName: string | null } | null, refAdjustedBy: { _id: string | null, sharedData: { name: string | null } | null } | null } | null };

export type PagedStockAdjustmentsQueryVariables = Exact<{
  physicalStoreId: string;
  queryString?: string | null | undefined;
}>;


export type PagedStockAdjustmentsQuery = { pagedStockAdjustments: { totalResults: number | null, data: Array<{ _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null, approvedOn: string | null, refStockItem: { _id: string | null, formattedName: string | null, imageUrl: string | null } | null, refAdjustedBy: { _id: string | null, sharedData: { name: string | null } | null } | null } | null> | null } | null };

export type RemoveStockAdjustmentsMutationVariables = Exact<{
  physicalStoreId: string;
  _ids: Array<string | null | undefined> | string;
}>;


export type RemoveStockAdjustmentsMutation = { removeStockAdjustments: number | null };

export type UpdateStockAdjustmentMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  adjustmentDate: string;
  adjustedBy: string;
  quantity: number;
  isInflow: boolean;
  adjustmentReason?: string | null | undefined;
}>;


export type UpdateStockAdjustmentMutation = { updateStockAdjustment: { _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, refStockItem: { _id: string | null, name: string | null, formattedName: string | null } | null, refAdjustedBy: { _id: string | null, sharedData: { name: string | null } | null } | null } | null };

export type ViewStockAdjustmentByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type ViewStockAdjustmentByIdQuery = { stockAdjustmentById: { _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, approvedOn: string | null, approvedBy: string | null, refStockItem: { _id: string | null, name: string | null, formattedName: string | null } | null, refAdjustedBy: { _id: string | null, sharedData: { name: string | null } | null } | null } | null };

export type StockAdjustmentsByStockItemQueryVariables = Exact<{
  physicalStoreId: string;
  stockItemId: string;
}>;


export type StockAdjustmentsByStockItemQuery = { stockAdjustmentsByStockItem: Array<{ _id: string | null, physicalStoreId: string | null, stockItemId: string | null, adjustmentDate: string | null, adjustedBy: string | null, quantity: number | null, isInflow: boolean | null, adjustmentReason: string | null, approvedOn: string | null, refAdjustedBy: { _id: string | null, sharedData: { name: string | null } | null } | null } | null> | null };

export type IssuanceFormsByStockItemQueryVariables = Exact<{
  physicalStoreId: string;
  stockItemId: string;
}>;


export type IssuanceFormsByStockItemQuery = { issuanceFormsByStockItem: Array<{ _id: string | null, issueDate: string | null, issuedBy: string | null, issuedTo: string | null, physicalStoreId: string | null, approvedOn: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, refStockItem: { _id: string | null, name: string | null } | null } | null> | null, refIssuedTo: { _id: string | null, sharedData: { name: string | null } | null } | null, refLocation: { _id: string | null, name: string | null } | null } | null> | null };

export type PurchaseFormsByStockItemQueryVariables = Exact<{
  physicalStoreId: string;
  stockItemId: string;
}>;


export type PurchaseFormsByStockItemQuery = { purchaseFormsByStockItem: Array<{ _id: string | null, purchaseDate: string | null, receivedBy: string | null, purchasedBy: string | null, physicalStoreId: string | null, approvedOn: string | null, items: Array<{ stockItemId: string | null, quantity: number | null, isInflow: boolean | null, price: number | null, refStockItem: { _id: string | null, name: string | null } | null } | null> | null, refReceivedBy: { _id: string | null, sharedData: { name: string | null } | null } | null, refPurchasedBy: { _id: string | null, sharedData: { name: string | null } | null } | null } | null> | null };

export type CreateStockItemMutationVariables = Exact<{
  name: string;
  company?: string | null | undefined;
  details?: string | null | undefined;
  unitOfMeasurement: string;
  categoryId: string;
  physicalStoreId: string;
  minStockLevel?: number | null | undefined;
  currentStockLevel?: number | null | undefined;
}>;


export type CreateStockItemMutation = { createStockItem: { _id: string | null, name: string | null, company: string | null, details: string | null, unitOfMeasurement: string | null, categoryId: string | null, physicalStoreId: string | null, minStockLevel: number | null, currentStockLevel: number | null } | null };

export type MergeStockItemsMutationVariables = Exact<{
  _idToKeep: string;
  _idsToMerge: Array<string | null | undefined> | string;
  physicalStoreId: string;
}>;


export type MergeStockItemsMutation = { mergeStockItems: { _id: string | null, currentStockLevel: number | null, purchaseFormsCount: number | null, issuanceFormsCount: number | null, stockAdjustmentsCount: number | null } | null };

export type PagedStockItemsQueryVariables = Exact<{
  physicalStoreId: string;
  queryString?: string | null | undefined;
}>;


export type PagedStockItemsQuery = { pagedStockItems: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, formattedName: string | null, company: string | null, details: string | null, imageUrl: string | null, categoryName: string | null, unitOfMeasurement: string | null, minStockLevel: number | null, currentStockLevel: number | null, totalStockLevel: number | null, verifiedOn: string | null, purchaseFormsCount: number | null, issuanceFormsCount: number | null, stockAdjustmentsCount: number | null } | null> | null } | null };

export type RecalculateStockLevelsMutationVariables = Exact<{
  _ids: Array<string | null | undefined> | string;
  physicalStoreId: string;
}>;


export type RecalculateStockLevelsMutation = { recalculateStockLevels: Array<{ _id: string | null, currentStockLevel: number | null, purchaseFormsCount: number | null, issuanceFormsCount: number | null, stockAdjustmentsCount: number | null } | null> | null };

export type RemoveStockItemMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type RemoveStockItemMutation = { removeStockItem: number | null };

export type SetStockItemImageMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  imageData: string;
}>;


export type SetStockItemImageMutation = { setStockItemImage: { _id: string | null, imageUrl: string | null } | null };

export type StockItemByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type StockItemByIdQuery = { stockItemById: { _id: string | null, physicalStoreId: string | null, name: string | null, company: string | null, details: string | null, imageUrl: string | null, categoryId: string | null, unitOfMeasurement: string | null, startingStockLevel: number | null, currentStockLevel: number | null, minStockLevel: number | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type UpdateStockItemMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  name: string;
  company?: string | null | undefined;
  details?: string | null | undefined;
  unitOfMeasurement: string;
  categoryId: string;
  minStockLevel?: number | null | undefined;
}>;


export type UpdateStockItemMutation = { updateStockItem: { _id: string | null, physicalStoreId: string | null, name: string | null, company: string | null, details: string | null, categoryId: string | null, unitOfMeasurement: string | null, minStockLevel: number | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type VerifyStockItemLevelMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type VerifyStockItemLevelMutation = { verifyStockItemLevel: { _id: string | null, verifiedOn: string | null } | null };

export type CreateVendorMutationVariables = Exact<{
  name: string;
  physicalStoreId: string;
  contactPerson?: string | null | undefined;
  contactNumber?: string | null | undefined;
  address?: string | null | undefined;
  notes?: string | null | undefined;
}>;


export type CreateVendorMutation = { createVendor: { _id: string | null, name: string | null, physicalStoreId: string | null, contactPerson: string | null, contactNumber: string | null, address: string | null, notes: string | null } | null };

export type RemoveVendorMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type RemoveVendorMutation = { removeVendor: number | null };

export type UpdateVendorMutationVariables = Exact<{
  _id: string;
  physicalStoreId: string;
  name: string;
  contactPerson?: string | null | undefined;
  contactNumber?: string | null | undefined;
  address?: string | null | undefined;
  notes?: string | null | undefined;
}>;


export type UpdateVendorMutation = { updateVendor: { _id: string | null, physicalStoreId: string | null, name: string | null, contactPerson: string | null, contactNumber: string | null, address: string | null, notes: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type VendorByIdQueryVariables = Exact<{
  _id: string;
  physicalStoreId: string;
}>;


export type VendorByIdQuery = { vendorById: { _id: string | null, physicalStoreId: string | null, name: string | null, contactPerson: string | null, contactNumber: string | null, address: string | null, notes: string | null, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null } | null };

export type WorkspaceDiscussionMessageFieldsFragment = { _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, threadLastReplyAt: string | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, usernames: Array<string | null> | null, reactedByMe: boolean | null } | null> | null };

export type WorkspaceDiscussionInfoQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceDiscussionInfoQuery = { workspaceDiscussionInfo: { canPost: boolean | null, canPin: boolean | null } | null };

export type WorkspaceDiscussionVideoCallInfoQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceDiscussionVideoCallInfoQuery = { workspaceDiscussionVideoCallInfo: { participantCount: number | null } | null };

export type WorkspaceDiscussionMembersQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceDiscussionMembersQuery = { workspaceDiscussionMembers: Array<{ username: string | null, name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null> | null };

export type WorkspaceDiscussionSyncQueryVariables = Exact<{
  committeeId: string;
  since?: string | null | undefined;
}>;


export type WorkspaceDiscussionSyncQuery = { workspaceDiscussionSync: { deletedIds: Array<string | null> | null, syncedAt: string | null, hasOlder: boolean | null, messages: Array<{ _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, threadLastReplyAt: string | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, usernames: Array<string | null> | null, reactedByMe: boolean | null } | null> | null } | null> | null } | null };

export type WorkspaceDiscussionThreadMessagesQueryVariables = Exact<{
  committeeId: string;
  threadId: string;
}>;


export type WorkspaceDiscussionThreadMessagesQuery = { workspaceDiscussionThreadMessages: Array<{ _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, threadLastReplyAt: string | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, usernames: Array<string | null> | null, reactedByMe: boolean | null } | null> | null } | null> | null };

export type WorkspaceDiscussionPinnedMessagesQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceDiscussionPinnedMessagesQuery = { workspaceDiscussionPinnedMessages: Array<{ _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, threadLastReplyAt: string | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, usernames: Array<string | null> | null, reactedByMe: boolean | null } | null> | null } | null> | null };

export type WorkspaceDiscussionStarredMessagesQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceDiscussionStarredMessagesQuery = { workspaceDiscussionStarredMessages: Array<{ _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, threadLastReplyAt: string | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, usernames: Array<string | null> | null, reactedByMe: boolean | null } | null> | null } | null> | null };

export type WorkspaceDiscussionSearchMessagesQueryVariables = Exact<{
  committeeId: string;
  searchText: string;
  offset?: number | null | undefined;
}>;


export type WorkspaceDiscussionSearchMessagesQuery = { workspaceDiscussionSearchMessages: { hasMore: boolean | null, messages: Array<{ _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, threadLastReplyAt: string | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, usernames: Array<string | null> | null, reactedByMe: boolean | null } | null> | null } | null> | null } | null };

export type WorkspaceDiscussionOlderMessagesQueryVariables = Exact<{
  committeeId: string;
  before: string;
}>;


export type WorkspaceDiscussionOlderMessagesQuery = { workspaceDiscussionOlderMessages: { hasMore: boolean | null, messages: Array<{ _id: string | null, text: string | null, sentAt: string | null, senderName: string | null, senderId: string | null, senderImageUrl: string | null, senderImageThumbnailUrl: string | null, isOwn: boolean | null, isSystem: boolean | null, editedAt: string | null, isPinned: boolean | null, isStarred: boolean | null, threadId: string | null, showInMainList: boolean | null, threadReplyCount: number | null, threadLastReplyAt: string | null, attachments: Array<{ kind: string | null, title: string | null, mimeType: string | null, size: number | null, url: string | null } | null> | null, reactions: Array<{ emoji: string | null, count: number | null, usernames: Array<string | null> | null, reactedByMe: boolean | null } | null> | null } | null> | null } | null };

export type WorkspaceSendDiscussionMessageMutationVariables = Exact<{
  committeeId: string;
  text: string;
  threadId?: string | null | undefined;
}>;


export type WorkspaceSendDiscussionMessageMutation = { workspaceSendDiscussionMessage: boolean };

export type WorkspaceReactToDiscussionMessageMutationVariables = Exact<{
  committeeId: string;
  messageId: string;
  emoji: string;
  shouldReact: boolean;
}>;


export type WorkspaceReactToDiscussionMessageMutation = { workspaceReactToDiscussionMessage: boolean };

export type WorkspaceSetDiscussionMessageStarredMutationVariables = Exact<{
  committeeId: string;
  messageId: string;
  starred: boolean;
}>;


export type WorkspaceSetDiscussionMessageStarredMutation = { workspaceSetDiscussionMessageStarred: boolean };

export type WorkspaceSetDiscussionMessagePinnedMutationVariables = Exact<{
  committeeId: string;
  messageId: string;
  pinned: boolean;
}>;


export type WorkspaceSetDiscussionMessagePinnedMutation = { workspaceSetDiscussionMessagePinned: boolean };

export type WorkspaceEditDiscussionMessageMutationVariables = Exact<{
  committeeId: string;
  messageId: string;
  text: string;
}>;


export type WorkspaceEditDiscussionMessageMutation = { workspaceEditDiscussionMessage: boolean };

export type WorkspaceDeleteDiscussionMessageMutationVariables = Exact<{
  committeeId: string;
  messageId: string;
}>;


export type WorkspaceDeleteDiscussionMessageMutation = { workspaceDeleteDiscussionMessage: boolean };

export type WorkspaceJoinDiscussionVideoCallMutationVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceJoinDiscussionVideoCallMutation = { workspaceJoinDiscussionVideoCall: { url: string } | null };

export type WorkspaceDocumentFolderFieldsFragment = { _id: string | null, name: string | null, parentId: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null };

export type WorkspaceDocumentFieldsFragment = { _id: string | null, name: string | null, folderId: string | null, folderName: string | null, description: string | null, tags: Array<string | null> | null, fileName: string | null, mimeType: string | null, size: number | null, currentVersionNumber: number | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null, lock: { userName: string | null, lockedAt: string | null, expiresAt: string | null, note: string | null, isMine: boolean | null } | null };

export type WorkspaceDocumentsInfoQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceDocumentsInfoQuery = { workspaceDocumentsInfo: { canManage: boolean | null, maxFileSize: number | null } | null };

export type WorkspaceDocumentFolderContentsQueryVariables = Exact<{
  committeeId: string;
  folderId?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type WorkspaceDocumentFolderContentsQuery = { workspaceDocumentFolderContents: { path: Array<{ _id: string | null, name: string | null, parentId: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null } | null> | null, folders: Array<{ _id: string | null, name: string | null, parentId: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null } | null> | null, documents: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, folderId: string | null, folderName: string | null, description: string | null, tags: Array<string | null> | null, fileName: string | null, mimeType: string | null, size: number | null, currentVersionNumber: number | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null, lock: { userName: string | null, lockedAt: string | null, expiresAt: string | null, note: string | null, isMine: boolean | null } | null } | null> | null } | null } | null };

export type WorkspaceDocumentFoldersQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceDocumentFoldersQuery = { workspaceDocumentFolders: Array<{ _id: string | null, name: string | null, parentId: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null } | null> | null };

export type WorkspaceDocumentSearchQueryVariables = Exact<{
  committeeId: string;
  text: string;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type WorkspaceDocumentSearchQuery = { workspaceDocumentSearch: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, folderId: string | null, folderName: string | null, description: string | null, tags: Array<string | null> | null, fileName: string | null, mimeType: string | null, size: number | null, currentVersionNumber: number | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null, lock: { userName: string | null, lockedAt: string | null, expiresAt: string | null, note: string | null, isMine: boolean | null } | null } | null> | null } | null };

export type WorkspaceDocumentByIdQueryVariables = Exact<{
  committeeId: string;
  documentId: string;
}>;


export type WorkspaceDocumentByIdQuery = { workspaceDocumentById: { _id: string | null, name: string | null, folderId: string | null, folderName: string | null, description: string | null, tags: Array<string | null> | null, fileName: string | null, mimeType: string | null, size: number | null, currentVersionNumber: number | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null, lock: { userName: string | null, lockedAt: string | null, expiresAt: string | null, note: string | null, isMine: boolean | null } | null } | null };

export type WorkspaceDocumentVersionsQueryVariables = Exact<{
  committeeId: string;
  documentId: string;
}>;


export type WorkspaceDocumentVersionsQuery = { workspaceDocumentVersions: Array<{ _id: string | null, versionNumber: number | null, fileName: string | null, mimeType: string | null, size: number | null, comment: string | null, isCurrent: boolean | null, createdAt: string | null, createdByName: string | null } | null> | null };

export type WorkspaceDocumentActivityQueryVariables = Exact<{
  committeeId: string;
  documentId?: string | null | undefined;
  before?: string | null | undefined;
  limit?: number | null | undefined;
}>;


export type WorkspaceDocumentActivityQuery = { workspaceDocumentActivity: Array<{ _id: string | null, action: string | null, entityType: string | null, entityId: string | null, documentId: string | null, userName: string | null, at: string | null, details: string | null } | null> | null };

export type WorkspaceDocumentTrashQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceDocumentTrashQuery = { workspaceDocumentTrash: { folders: Array<{ _id: string | null, name: string | null, parentId: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null } | null> | null, documents: Array<{ _id: string | null, name: string | null, folderId: string | null, folderName: string | null, description: string | null, tags: Array<string | null> | null, fileName: string | null, mimeType: string | null, size: number | null, currentVersionNumber: number | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null, lock: { userName: string | null, lockedAt: string | null, expiresAt: string | null, note: string | null, isMine: boolean | null } | null } | null> | null } | null };

export type WorkspaceCreateDocumentFolderMutationVariables = Exact<{
  committeeId: string;
  parentId?: string | null | undefined;
  name: string;
}>;


export type WorkspaceCreateDocumentFolderMutation = { workspaceCreateDocumentFolder: boolean | null };

export type WorkspaceRenameDocumentFolderMutationVariables = Exact<{
  committeeId: string;
  folderId: string;
  name: string;
}>;


export type WorkspaceRenameDocumentFolderMutation = { workspaceRenameDocumentFolder: boolean | null };

export type WorkspaceMoveDocumentFolderMutationVariables = Exact<{
  committeeId: string;
  folderId: string;
  parentId?: string | null | undefined;
}>;


export type WorkspaceMoveDocumentFolderMutation = { workspaceMoveDocumentFolder: boolean | null };

export type WorkspaceTrashDocumentFolderMutationVariables = Exact<{
  committeeId: string;
  folderId: string;
}>;


export type WorkspaceTrashDocumentFolderMutation = { workspaceTrashDocumentFolder: boolean | null };

export type WorkspaceCreateDocumentUploadMutationVariables = Exact<{
  committeeId: string;
  folderId?: string | null | undefined;
  documentId?: string | null | undefined;
  fileName: string;
  mimeType?: string | null | undefined;
  size: number;
  comment?: string | null | undefined;
}>;


export type WorkspaceCreateDocumentUploadMutation = { workspaceCreateDocumentUpload: { uploadId: string | null, documentId: string | null, url: string | null, contentType: string | null, expiresAt: string | null } | null };

export type WorkspaceCompleteDocumentUploadMutationVariables = Exact<{
  committeeId: string;
  uploadId: string;
}>;


export type WorkspaceCompleteDocumentUploadMutation = { workspaceCompleteDocumentUpload: { _id: string | null, name: string | null, folderId: string | null, folderName: string | null, description: string | null, tags: Array<string | null> | null, fileName: string | null, mimeType: string | null, size: number | null, currentVersionNumber: number | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, deletedAt: string | null, deletedByName: string | null, lock: { userName: string | null, lockedAt: string | null, expiresAt: string | null, note: string | null, isMine: boolean | null } | null } | null };

export type WorkspaceAbortDocumentUploadMutationVariables = Exact<{
  committeeId: string;
  uploadId: string;
}>;


export type WorkspaceAbortDocumentUploadMutation = { workspaceAbortDocumentUpload: boolean | null };

export type WorkspaceUpdateDocumentMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
  name: string;
  description?: string | null | undefined;
  tags?: Array<string | null | undefined> | string | null | undefined;
}>;


export type WorkspaceUpdateDocumentMutation = { workspaceUpdateDocument: boolean | null };

export type WorkspaceMoveDocumentMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
  folderId?: string | null | undefined;
}>;


export type WorkspaceMoveDocumentMutation = { workspaceMoveDocument: boolean | null };

export type WorkspaceTrashDocumentMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
}>;


export type WorkspaceTrashDocumentMutation = { workspaceTrashDocument: boolean | null };

export type WorkspaceDocumentDownloadUrlMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
  versionId?: string | null | undefined;
  inline?: boolean | null | undefined;
}>;


export type WorkspaceDocumentDownloadUrlMutation = { workspaceDocumentDownloadUrl: { url: string | null, fileName: string | null } | null };

export type WorkspaceRestoreDocumentVersionMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
  versionId: string;
}>;


export type WorkspaceRestoreDocumentVersionMutation = { workspaceRestoreDocumentVersion: boolean | null };

export type WorkspaceDeleteDocumentVersionMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
  versionId: string;
}>;


export type WorkspaceDeleteDocumentVersionMutation = { workspaceDeleteDocumentVersion: boolean | null };

export type WorkspaceCheckOutDocumentMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
  durationMinutes: number;
  note?: string | null | undefined;
}>;


export type WorkspaceCheckOutDocumentMutation = { workspaceCheckOutDocument: boolean | null };

export type WorkspaceCheckInDocumentMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
}>;


export type WorkspaceCheckInDocumentMutation = { workspaceCheckInDocument: boolean | null };

export type WorkspaceForceUnlockDocumentMutationVariables = Exact<{
  committeeId: string;
  documentId: string;
}>;


export type WorkspaceForceUnlockDocumentMutation = { workspaceForceUnlockDocument: boolean | null };

export type WorkspaceRestoreDocumentTrashItemMutationVariables = Exact<{
  committeeId: string;
  itemId: string;
  newName?: string | null | undefined;
  toRoot?: boolean | null | undefined;
}>;


export type WorkspaceRestoreDocumentTrashItemMutation = { workspaceRestoreDocumentTrashItem: boolean | null };

export type WorkspacePurgeDocumentTrashItemMutationVariables = Exact<{
  committeeId: string;
  itemId: string;
}>;


export type WorkspacePurgeDocumentTrashItemMutation = { workspacePurgeDocumentTrashItem: boolean | null };

export type WorkspaceEmptyDocumentTrashMutationVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceEmptyDocumentTrashMutation = { workspaceEmptyDocumentTrash: number | null };

export type MyDutiesAttendanceLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyDutiesAttendanceLocationsQuery = { myDutiesAttendanceLocations: Array<{ locationId: string, name: string, type: string, parentId: string | null, hasWorkspace: boolean, permissions: Array<string> } | null> };

export type WorkspaceDaAccessQueryVariables = Exact<{
  locationId: string;
}>;


export type WorkspaceDaAccessQuery = { workspaceDaAccess: { locationId: string, permissions: Array<string> } | null };

export type WorkspaceDaDutiesQueryVariables = Exact<{
  locationId: string;
}>;


export type WorkspaceDaDutiesQuery = { workspaceDaDuties: Array<{ _id: string, mehfilDutyId: string | null, name: string, description: string | null, isActive: boolean, createdAt: string | null, createdBy: string | null, updatedAt: string | null, updatedBy: string | null, members: Array<{ karkunId: string, isCoordinator: boolean | null, canMarkOwnAttendance: boolean | null, daysOfWeek: Array<string | null> | null, karkun: { _id: string | null, sharedData: { name: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null } | null } | null> } | null> | null };

export type WorkspaceDaMehfilDutiesQueryVariables = Exact<{
  locationId: string;
}>;


export type WorkspaceDaMehfilDutiesQuery = { workspaceDaMehfilDuties: Array<{ _id: string, name: string, description: string | null } | null> | null };

export type WorkspaceDaPlanDaysQueryVariables = Exact<{
  locationId: string;
  dutyId: string;
  startDate: string;
}>;


export type WorkspaceDaPlanDaysQuery = { workspaceDaPlanDays: { startDate: string, days: Array<{ date: string, dayOfWeek: string, locked: boolean, addedKarkunIds: Array<string | null>, absentKarkunIds: Array<string | null>, karkuns: Array<{ karkunId: string, name: string | null, off: boolean, addedForDay: boolean, imageUrl: string | null, imageThumbnailUrl: string | null, attendance: string | null } | null> } | null> } | null };

export type WorkspaceDaAttendanceSheetQueryVariables = Exact<{
  locationId: string;
  month: string;
  dutyId?: string | null | undefined;
}>;


export type WorkspaceDaAttendanceSheetQuery = { workspaceDaAttendanceSheet: Array<{ _id: string, month: string, karkunId: string, name: string | null, dutyId: string, dutyName: string | null, daysOnDuty: number, presentCount: number, lateCount: number, absentCount: number, unmarkedCount: number, percentage: number } | null> | null };

export type WorkspaceDaKarkunSearchQueryVariables = Exact<{
  locationId: string;
  name?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type WorkspaceDaKarkunSearchQuery = { workspaceDaKarkunSearch: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null> | null } | null };

export type WorkspaceDaAddDutiesMutationVariables = Exact<{
  locationId: string;
  mehfilDutyIds: Array<string> | string;
}>;


export type WorkspaceDaAddDutiesMutation = { workspaceDaAddDuties: Array<{ _id: string } | null> | null };

export type WorkspaceDaUpdateDutyMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
  isActive?: boolean | null | undefined;
}>;


export type WorkspaceDaUpdateDutyMutation = { workspaceDaUpdateDuty: { _id: string } | null };

export type WorkspaceDaRemoveDutyMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
}>;


export type WorkspaceDaRemoveDutyMutation = { workspaceDaRemoveDuty: boolean | null };

export type WorkspaceDaAddDutyMemberMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
  karkunId: string;
  isCoordinator?: boolean | null | undefined;
  canMarkOwnAttendance?: boolean | null | undefined;
  daysOfWeek?: Array<string | null | undefined> | string | null | undefined;
}>;


export type WorkspaceDaAddDutyMemberMutation = { workspaceDaAddDutyMember: { _id: string } | null };

export type WorkspaceDaUpdateDutyMemberMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
  karkunId: string;
  isCoordinator?: boolean | null | undefined;
  canMarkOwnAttendance?: boolean | null | undefined;
  daysOfWeek?: Array<string | null | undefined> | string | null | undefined;
}>;


export type WorkspaceDaUpdateDutyMemberMutation = { workspaceDaUpdateDutyMember: { _id: string } | null };

export type WorkspaceDaRemoveDutyMemberMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
  karkunId: string;
}>;


export type WorkspaceDaRemoveDutyMemberMutation = { workspaceDaRemoveDutyMember: { _id: string } | null };

export type WorkspaceDaSetDayOverrideMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
  date: string;
  addedKarkunIds?: Array<string | null | undefined> | string | null | undefined;
  absentKarkunIds?: Array<string | null | undefined> | string | null | undefined;
}>;


export type WorkspaceDaSetDayOverrideMutation = { workspaceDaSetDayOverride: boolean | null };

export type WorkspaceDaSetAttendanceMutationVariables = Exact<{
  locationId: string;
  dutyId: string;
  date: string;
  karkunId: string;
  status?: string | null | undefined;
}>;


export type WorkspaceDaSetAttendanceMutation = { workspaceDaSetAttendance: boolean | null };

export type MyCommitteeLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyCommitteeLocationsQuery = { myCommitteeLocations: Array<{ _id: string | null, name: string | null, type: string | null, parentId: string | null } | null> | null };

export type MyCommitteesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyCommitteesQuery = { myCommittees: Array<{ _id: string | null, name: string | null, color: string | null, locationId: string | null, features: Array<string | null> | null } | null> | null };

export type WorkspaceMeetingFieldsFragment = { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null };

export type WorkspaceMeetingAttachmentFieldsFragment = { _id: string | null, name: string | null, description: string | null, fileName: string | null, mimeType: string | null, size: number | null, createdAt: string | null, createdByName: string | null, canDelete: boolean | null };

export type WorkspaceMeetingActionItemFieldsFragment = { _id: string | null, meetingId: string | null, meetingTitle: string | null, agendaItemId: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, canChangeStatus: boolean | null };

export type WorkspaceMeetingsInfoQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceMeetingsInfoQuery = { workspaceMeetingsInfo: { canManage: boolean | null, canJoinVideoCall: boolean | null, myParticipantId: string | null, maxFileSize: number | null, timeZone: string | null } | null };

export type WorkspaceMeetingMembersQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceMeetingMembersQuery = { workspaceMeetingMembers: Array<{ participantId: string | null, name: string | null, isCoordinator: boolean | null } | null> | null };

export type WorkspaceMeetingsQueryVariables = Exact<{
  committeeId: string;
  view?: string | null | undefined;
  from?: string | null | undefined;
  to?: string | null | undefined;
  text?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type WorkspaceMeetingsQuery = { workspaceMeetings: { totalResults: number | null, data: Array<{ _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null> | null } | null };

export type WorkspaceMeetingByIdQueryVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type WorkspaceMeetingByIdQuery = { workspaceMeetingById: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceMeetingAttachmentsQueryVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type WorkspaceMeetingAttachmentsQuery = { workspaceMeetingAttachments: Array<{ _id: string | null, name: string | null, description: string | null, fileName: string | null, mimeType: string | null, size: number | null, createdAt: string | null, createdByName: string | null, canDelete: boolean | null } | null> | null };

export type WorkspaceMeetingActionItemsQueryVariables = Exact<{
  committeeId: string;
  meetingId?: string | null | undefined;
  assigneeId?: string | null | undefined;
  status?: Array<string | null | undefined> | string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type WorkspaceMeetingActionItemsQuery = { workspaceMeetingActionItems: { totalResults: number | null, data: Array<{ _id: string | null, meetingId: string | null, meetingTitle: string | null, agendaItemId: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, canChangeStatus: boolean | null } | null> | null } | null };

export type WorkspaceMeetingActivityQueryVariables = Exact<{
  committeeId: string;
  meetingId?: string | null | undefined;
  before?: string | null | undefined;
  limit?: number | null | undefined;
}>;


export type WorkspaceMeetingActivityQuery = { workspaceMeetingActivity: Array<{ _id: string | null, action: string | null, entityType: string | null, entityId: string | null, meetingId: string | null, userName: string | null, at: string | null, details: string | null } | null> | null };

export type WorkspaceCreateMeetingMutationVariables = Exact<{
  committeeId: string;
  input: Types.WorkspaceMeetingInput;
  participantIds?: Array<string | null | undefined> | string | null | undefined;
}>;


export type WorkspaceCreateMeetingMutation = { workspaceCreateMeeting: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceUpdateMeetingMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  input: Types.WorkspaceMeetingInput;
}>;


export type WorkspaceUpdateMeetingMutation = { workspaceUpdateMeeting: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceCancelMeetingMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  reason?: string | null | undefined;
}>;


export type WorkspaceCancelMeetingMutation = { workspaceCancelMeeting: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceCompleteMeetingMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type WorkspaceCompleteMeetingMutation = { workspaceCompleteMeeting: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceReopenMeetingMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type WorkspaceReopenMeetingMutation = { workspaceReopenMeeting: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceDeleteMeetingMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type WorkspaceDeleteMeetingMutation = { workspaceDeleteMeeting: boolean | null };

export type WorkspaceSetMeetingParticipantsMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  participantIds: Array<string | null | undefined> | string;
}>;


export type WorkspaceSetMeetingParticipantsMutation = { workspaceSetMeetingParticipants: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceSetMeetingParticipantRoleMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  participantId: string;
  role: string;
}>;


export type WorkspaceSetMeetingParticipantRoleMutation = { workspaceSetMeetingParticipantRole: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceRespondToMeetingMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  participantId?: string | null | undefined;
  status: string;
  comment?: string | null | undefined;
}>;


export type WorkspaceRespondToMeetingMutation = { workspaceRespondToMeeting: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceMarkMeetingAttendanceMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  entries: Array<Types.WorkspaceMeetingAttendanceInput | null | undefined> | Types.WorkspaceMeetingAttendanceInput;
}>;


export type WorkspaceMarkMeetingAttendanceMutation = { workspaceMarkMeetingAttendance: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceAddMeetingAgendaItemMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  input: Types.WorkspaceMeetingAgendaItemInput;
}>;


export type WorkspaceAddMeetingAgendaItemMutation = { workspaceAddMeetingAgendaItem: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceUpdateMeetingAgendaItemMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  agendaItemId: string;
  input: Types.WorkspaceMeetingAgendaItemInput;
}>;


export type WorkspaceUpdateMeetingAgendaItemMutation = { workspaceUpdateMeetingAgendaItem: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceRemoveMeetingAgendaItemMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  agendaItemId: string;
}>;


export type WorkspaceRemoveMeetingAgendaItemMutation = { workspaceRemoveMeetingAgendaItem: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceReorderMeetingAgendaMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  agendaItemIds: Array<string | null | undefined> | string;
}>;


export type WorkspaceReorderMeetingAgendaMutation = { workspaceReorderMeetingAgenda: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceSetMeetingMinutesMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  text?: string | null | undefined;
}>;


export type WorkspaceSetMeetingMinutesMutation = { workspaceSetMeetingMinutes: { _id: string | null, title: string | null, description: string | null, location: string | null, videoCall: boolean | null, startsAt: string | null, endsAt: string | null, status: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, completedAt: string | null, completedByName: string | null, minutes: string | null, minutesUpdatedAt: string | null, minutesUpdatedByName: string | null, attachmentCount: number | null, openActionItemCount: number | null, myRsvpStatus: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ participantId: string | null, name: string | null, role: string | null, rsvpStatus: string | null, rsvpRespondedAt: string | null, rsvpComment: string | null, attendanceStatus: string | null, attendanceNote: string | null, attendanceMarkedAt: string | null, attendanceMarkedByName: string | null, isMe: boolean | null } | null> | null, agenda: Array<{ _id: string | null, title: string | null, description: string | null, durationMinutes: number | null, presenterId: string | null, presenterName: string | null } | null> | null } | null };

export type WorkspaceCreateMeetingAttachmentUploadMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  fileName: string;
  mimeType?: string | null | undefined;
  size: number;
}>;


export type WorkspaceCreateMeetingAttachmentUploadMutation = { workspaceCreateMeetingAttachmentUpload: { uploadId: string | null, url: string | null, contentType: string | null, expiresAt: string | null } | null };

export type WorkspaceCompleteMeetingAttachmentUploadMutationVariables = Exact<{
  committeeId: string;
  uploadId: string;
}>;


export type WorkspaceCompleteMeetingAttachmentUploadMutation = { workspaceCompleteMeetingAttachmentUpload: { _id: string | null, name: string | null, description: string | null, fileName: string | null, mimeType: string | null, size: number | null, createdAt: string | null, createdByName: string | null, canDelete: boolean | null } | null };

export type WorkspaceAbortMeetingAttachmentUploadMutationVariables = Exact<{
  committeeId: string;
  uploadId: string;
}>;


export type WorkspaceAbortMeetingAttachmentUploadMutation = { workspaceAbortMeetingAttachmentUpload: boolean | null };

export type WorkspaceMeetingAttachmentDownloadUrlMutationVariables = Exact<{
  committeeId: string;
  attachmentId: string;
  inline?: boolean | null | undefined;
}>;


export type WorkspaceMeetingAttachmentDownloadUrlMutation = { workspaceMeetingAttachmentDownloadUrl: { url: string | null, fileName: string | null } | null };

export type WorkspaceDeleteMeetingAttachmentMutationVariables = Exact<{
  committeeId: string;
  attachmentId: string;
}>;


export type WorkspaceDeleteMeetingAttachmentMutation = { workspaceDeleteMeetingAttachment: boolean | null };

export type WorkspaceCreateMeetingActionItemMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
  input: Types.WorkspaceMeetingActionItemInput;
}>;


export type WorkspaceCreateMeetingActionItemMutation = { workspaceCreateMeetingActionItem: { _id: string | null, meetingId: string | null, meetingTitle: string | null, agendaItemId: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, canChangeStatus: boolean | null } | null };

export type WorkspaceUpdateMeetingActionItemMutationVariables = Exact<{
  committeeId: string;
  actionItemId: string;
  input: Types.WorkspaceMeetingActionItemInput;
}>;


export type WorkspaceUpdateMeetingActionItemMutation = { workspaceUpdateMeetingActionItem: { _id: string | null, meetingId: string | null, meetingTitle: string | null, agendaItemId: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, canChangeStatus: boolean | null } | null };

export type WorkspaceSetMeetingActionItemStatusMutationVariables = Exact<{
  committeeId: string;
  actionItemId: string;
  status: string;
}>;


export type WorkspaceSetMeetingActionItemStatusMutation = { workspaceSetMeetingActionItemStatus: { _id: string | null, meetingId: string | null, meetingTitle: string | null, agendaItemId: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, canChangeStatus: boolean | null } | null };

export type WorkspaceDeleteMeetingActionItemMutationVariables = Exact<{
  committeeId: string;
  actionItemId: string;
}>;


export type WorkspaceDeleteMeetingActionItemMutation = { workspaceDeleteMeetingActionItem: boolean | null };

export type WorkspaceMeetingVideoCallInfoQueryVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type WorkspaceMeetingVideoCallInfoQuery = { workspaceMeetingVideoCallInfo: { participantCount: number | null } | null };

export type WorkspaceJoinMeetingVideoCallMutationVariables = Exact<{
  committeeId: string;
  meetingId: string;
}>;


export type WorkspaceJoinMeetingVideoCallMutation = { workspaceJoinMeetingVideoCall: { url: string } | null };

export type MyMehfilDetailsLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyMehfilDetailsLocationsQuery = { myMehfilDetailsLocations: Array<{ locationId: string, name: string, type: string, parentId: string | null, hasWorkspace: boolean, permissions: Array<string> } | null> };

export type WorkspaceMehfilDetailsQueryVariables = Exact<{
  locationId: string;
}>;


export type WorkspaceMehfilDetailsQuery = { workspaceMehfilDetails: { locationId: string, name: string, permissions: Array<string>, mehfilDetails: { address: string | null, mehfilStartYear: string | null, timingDetails: string | null, lcdAvailability: boolean | null, tabAvailability: boolean | null, otherMehfilDetails: string | null, latitude: number | null, longitude: number | null } | null } | null };

export type WorkspaceUpdateMehfilDetailsMutationVariables = Exact<{
  locationId: string;
  mehfilDetails: Types.OrgLocationMehfilDetailsInput;
}>;


export type WorkspaceUpdateMehfilDetailsMutation = { workspaceUpdateMehfilDetails: { locationId: string, permissions: Array<string>, mehfilDetails: { address: string | null, mehfilStartYear: string | null, timingDetails: string | null, lcdAvailability: boolean | null, tabAvailability: boolean | null, otherMehfilDetails: string | null, latitude: number | null, longitude: number | null } | null } | null };

export type MyMehfilKarkunsLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyMehfilKarkunsLocationsQuery = { myMehfilKarkunsLocations: Array<{ locationId: string, name: string, type: string, parentId: string | null, hasWorkspace: boolean, permissions: Array<string> } | null> };

export type PagedMehfilKarkunsQueryVariables = Exact<{
  locationId: string;
  name?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type PagedMehfilKarkunsQuery = { pagedMehfilKarkuns: { totalResults: number, data: Array<{ _id: string, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, contactNumber2: string | null, imageUrl: string | null, imageThumbnailUrl: string | null }> } };

export type MyMehfilPermissionsLocationsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyMehfilPermissionsLocationsQuery = { myMehfilPermissionsLocations: Array<{ locationId: string, name: string, type: string, parentId: string | null, hasWorkspace: boolean, permissions: Array<string> } | null> };

export type WorkspaceMehfilPermissionsQueryVariables = Exact<{
  locationId: string;
}>;


export type WorkspaceMehfilPermissionsQuery = { workspaceMehfilPermissions: { locationId: string, permissions: Array<string>, groups: Array<{ featureKey: string, featureName: string, permissions: Array<{ key: string, name: string, description: string, users: Array<{ userId: string, personId: string | null, username: string | null, displayName: string | null } | null> } | null> } | null> } | null };

export type WorkspaceMehfilPermissionsKarkunSearchQueryVariables = Exact<{
  locationId: string;
  name?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type WorkspaceMehfilPermissionsKarkunSearchQuery = { workspaceMehfilPermissionsKarkunSearch: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null> | null } | null };

export type WorkspaceAddMehfilPermissionUserMutationVariables = Exact<{
  locationId: string;
  featureKey: string;
  permissionKey: string;
  karkunId: string;
}>;


export type WorkspaceAddMehfilPermissionUserMutation = { workspaceAddMehfilPermissionUser: boolean | null };

export type WorkspaceRemoveMehfilPermissionUserMutationVariables = Exact<{
  locationId: string;
  featureKey: string;
  permissionKey: string;
  userId: string;
}>;


export type WorkspaceRemoveMehfilPermissionUserMutation = { workspaceRemoveMehfilPermissionUser: boolean | null };

export type WorkspaceCommitteeMembersQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceCommitteeMembersQuery = { workspaceCommitteeById: { _id: string | null, canManageMembers: boolean | null, features: Array<string | null> | null, memberCount: number | null, guestCount: number | null, observerCount: number | null, members: Array<{ karkunId: string | null, role: string | null, isCoordinator: boolean | null, name: string | null, imageUrl: string | null, imageThumbnailUrl: string | null, contactNumber1: string | null, contactNumber2: string | null, hasChatAccount: boolean | null, hasDiscussionAccess: boolean | null } | null> | null } | null };

export type WorkspaceCommitteeKarkunSearchQueryVariables = Exact<{
  committeeId: string;
  name?: string | null | undefined;
  cnicNumber?: string | null | undefined;
  phoneNumber?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type WorkspaceCommitteeKarkunSearchQuery = { workspaceCommitteeKarkunSearch: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, parentName: string | null, cnicNumber: string | null, contactNumber1: string | null, imageUrl: string | null, imageThumbnailUrl: string | null } | null> | null } | null };

export type WorkspaceAddCommitteeMemberMutationVariables = Exact<{
  committeeId: string;
  karkunId: string;
  role?: string | null | undefined;
}>;


export type WorkspaceAddCommitteeMemberMutation = { workspaceAddCommitteeMember: { _id: string | null } | null };

export type WorkspaceRemoveCommitteeMemberMutationVariables = Exact<{
  committeeId: string;
  karkunId: string;
}>;


export type WorkspaceRemoveCommitteeMemberMutation = { workspaceRemoveCommitteeMember: { _id: string | null } | null };

export type WorkspaceSetCommitteeMemberDiscussionAccessMutationVariables = Exact<{
  committeeId: string;
  karkunId: string;
  hasAccess: boolean;
}>;


export type WorkspaceSetCommitteeMemberDiscussionAccessMutation = { workspaceSetCommitteeMemberDiscussionAccess: boolean | null };

export type WorkspaceSetCommitteeMemberCoordinatorMutationVariables = Exact<{
  committeeId: string;
  karkunId: string;
  isCoordinator: boolean;
}>;


export type WorkspaceSetCommitteeMemberCoordinatorMutation = { workspaceSetCommitteeMemberCoordinator: boolean | null };

export type WorkspaceMonitoringAlertsQueryVariables = Exact<{
  committeeId: string;
  date: string;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type WorkspaceMonitoringAlertsQuery = { workspaceMonitoringAlerts: { totalResults: number | null, data: Array<{ _id: string | null, timestamp: string | null, profileName: string | null, profileIsTest: boolean | null, channelName: string | null, similarityScore: number | null, review: string | null, imageUrl: string | null, thumbnailUrl: string | null } | null> | null } | null };

export type WorkspaceMonitoringProfilesQueryVariables = Exact<{
  committeeId: string;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type WorkspaceMonitoringProfilesQuery = { workspaceMonitoringProfiles: { totalResults: number | null, data: Array<{ _id: string | null, name: string | null, isTest: boolean | null, alertsCount: number | null, photos: Array<{ _id: string | null, imageUrl: string | null, thumbnailUrl: string | null } | null> | null } | null> | null } | null };

export type WorkspaceNightStaysQueryVariables = Exact<{
  committeeId: string;
  stayDate: string;
  name?: string | null | undefined;
  city?: string | null | undefined;
  stayReason?: string | null | undefined;
  sortBy?: string | null | undefined;
  sortOrder?: string | null | undefined;
  pageIndex?: string | null | undefined;
  pageSize?: string | null | undefined;
}>;


export type WorkspaceNightStaysQuery = { workspaceNightStays: { totalResults: number | null, data: Array<{ _id: string | null, visitorId: string | null, fromDate: string | null, toDate: string | null, numOfDays: number | null, stayReason: string | null, stayAllowedBy: string | null, visitorName: string | null, visitorImageUrl: string | null, visitorImageThumbnailUrl: string | null, city: string | null, country: string | null } | null> | null } | null };

export type WorkspacePollFieldsFragment = { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null };

export type WorkspacePollsInfoQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspacePollsInfoQuery = { workspacePollsInfo: { canManage: boolean | null, myVoterId: string | null } | null };

export type WorkspacePollsQueryVariables = Exact<{
  committeeId: string;
  view?: string | null | undefined;
  text?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type WorkspacePollsQuery = { workspacePolls: { totalResults: number | null, data: Array<{ _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null> | null } | null };

export type WorkspacePollByIdQueryVariables = Exact<{
  committeeId: string;
  pollId: string;
}>;


export type WorkspacePollByIdQuery = { workspacePollById: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type WorkspacePollResultsQueryVariables = Exact<{
  committeeId: string;
  pollId: string;
}>;


export type WorkspacePollResultsQuery = { workspacePollResults: { pollId: string | null, status: string | null, anonymous: boolean | null, closedAt: string | null, totalVoters: number | null, questions: Array<{ questionId: string | null, text: string | null, type: string | null, answeredCount: number | null, options: Array<{ optionId: string | null, text: string | null, count: number | null, percentage: number | null, voters: Array<{ voterId: string | null, name: string | null } | null> | null } | null> | null } | null> | null } | null };

export type WorkspacePollActivityQueryVariables = Exact<{
  committeeId: string;
  pollId?: string | null | undefined;
  before?: string | null | undefined;
  limit?: number | null | undefined;
}>;


export type WorkspacePollActivityQuery = { workspacePollActivity: Array<{ _id: string | null, action: string | null, entityType: string | null, entityId: string | null, pollId: string | null, userName: string | null, at: string | null, details: string | null } | null> | null };

export type WorkspaceCreatePollMutationVariables = Exact<{
  committeeId: string;
  input: Types.WorkspacePollInput;
}>;


export type WorkspaceCreatePollMutation = { workspaceCreatePoll: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type WorkspaceUpdatePollMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
  input: Types.WorkspacePollInput;
}>;


export type WorkspaceUpdatePollMutation = { workspaceUpdatePoll: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type WorkspaceOpenPollMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
  closesAt?: string | null | undefined;
}>;


export type WorkspaceOpenPollMutation = { workspaceOpenPoll: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type WorkspaceClosePollMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
}>;


export type WorkspaceClosePollMutation = { workspaceClosePoll: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type WorkspaceReopenPollMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
  closesAt: string;
}>;


export type WorkspaceReopenPollMutation = { workspaceReopenPoll: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type WorkspaceCancelPollMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
  reason?: string | null | undefined;
}>;


export type WorkspaceCancelPollMutation = { workspaceCancelPoll: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type WorkspaceDeletePollMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
}>;


export type WorkspaceDeletePollMutation = { workspaceDeletePoll: boolean | null };

export type WorkspaceCastPollVoteMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
  answers: Array<Types.WorkspacePollAnswerInput | null | undefined> | Types.WorkspacePollAnswerInput;
}>;


export type WorkspaceCastPollVoteMutation = { workspaceCastPollVote: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type WorkspaceWithdrawPollVoteMutationVariables = Exact<{
  committeeId: string;
  pollId: string;
}>;


export type WorkspaceWithdrawPollVoteMutation = { workspaceWithdrawPollVote: { _id: string | null, title: string | null, description: string | null, status: string | null, anonymous: boolean | null, closesAt: string | null, openedAt: string | null, closedAt: string | null, closedByName: string | null, cancelledAt: string | null, cancelledByName: string | null, cancellationReason: string | null, voteCount: number | null, isEligible: boolean | null, hasVoted: boolean | null, canSeeResults: boolean | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, questions: Array<{ _id: string | null, text: string | null, description: string | null, type: string | null, required: boolean | null, minChoices: number | null, maxChoices: number | null, options: Array<{ _id: string | null, text: string | null } | null> | null } | null> | null, myAnswers: Array<{ questionId: string | null, optionIds: Array<string | null> | null } | null> | null } | null };

export type WorkspaceProjectFieldsFragment = { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null };

export type WorkspaceTaskFieldsFragment = { _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null };

export type WorkspaceTaskCommentFieldsFragment = { _id: string | null, taskId: string | null, text: string | null, authorName: string | null, isOwn: boolean | null, canDelete: boolean | null, createdAt: string | null };

export type WorkspaceProjectsInfoQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceProjectsInfoQuery = { workspaceProjectsInfo: { canManage: boolean | null, myPersonId: string | null } | null };

export type WorkspaceProjectMembersQueryVariables = Exact<{
  committeeId: string;
}>;


export type WorkspaceProjectMembersQuery = { workspaceProjectMembers: Array<{ personId: string | null, name: string | null, isCoordinator: boolean | null } | null> | null };

export type WorkspaceProjectsQueryVariables = Exact<{
  committeeId: string;
  view?: string | null | undefined;
  text?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type WorkspaceProjectsQuery = { workspaceProjects: { totalResults: number | null, data: Array<{ _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null> | null } | null };

export type WorkspaceProjectByIdQueryVariables = Exact<{
  committeeId: string;
  projectId: string;
}>;


export type WorkspaceProjectByIdQuery = { workspaceProjectById: { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null };

export type WorkspaceTasksQueryVariables = Exact<{
  committeeId: string;
  view?: string | null | undefined;
  projectId?: string | null | undefined;
  standalone?: boolean | null | undefined;
  assigneeId?: string | null | undefined;
  priority?: string | null | undefined;
  text?: string | null | undefined;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type WorkspaceTasksQuery = { workspaceTasks: { totalResults: number | null, data: Array<{ _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null } | null> | null } | null };

export type WorkspaceTaskByIdQueryVariables = Exact<{
  committeeId: string;
  taskId: string;
}>;


export type WorkspaceTaskByIdQuery = { workspaceTaskById: { _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null } | null };

export type WorkspaceTaskCommentsQueryVariables = Exact<{
  committeeId: string;
  taskId: string;
  pageIndex?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type WorkspaceTaskCommentsQuery = { workspaceTaskComments: { totalResults: number | null, data: Array<{ _id: string | null, taskId: string | null, text: string | null, authorName: string | null, isOwn: boolean | null, canDelete: boolean | null, createdAt: string | null } | null> | null } | null };

export type WorkspaceProjectsActivityQueryVariables = Exact<{
  committeeId: string;
  projectId?: string | null | undefined;
  taskId?: string | null | undefined;
  before?: string | null | undefined;
  limit?: number | null | undefined;
}>;


export type WorkspaceProjectsActivityQuery = { workspaceProjectsActivity: Array<{ _id: string | null, action: string | null, entityType: string | null, entityId: string | null, projectId: string | null, taskId: string | null, userName: string | null, at: string | null, details: string | null } | null> | null };

export type WorkspaceCreateProjectMutationVariables = Exact<{
  committeeId: string;
  input: Types.WorkspaceProjectInput;
}>;


export type WorkspaceCreateProjectMutation = { workspaceCreateProject: { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null };

export type WorkspaceUpdateProjectMutationVariables = Exact<{
  committeeId: string;
  projectId: string;
  input: Types.WorkspaceProjectInput;
}>;


export type WorkspaceUpdateProjectMutation = { workspaceUpdateProject: { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null };

export type WorkspaceSetProjectStatusMutationVariables = Exact<{
  committeeId: string;
  projectId: string;
  status: string;
  force?: boolean | null | undefined;
}>;


export type WorkspaceSetProjectStatusMutation = { workspaceSetProjectStatus: { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null };

export type WorkspaceAddProjectParticipantsMutationVariables = Exact<{
  committeeId: string;
  projectId: string;
  personIds: Array<string | null | undefined> | string;
}>;


export type WorkspaceAddProjectParticipantsMutation = { workspaceAddProjectParticipants: { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null };

export type WorkspaceRemoveProjectParticipantMutationVariables = Exact<{
  committeeId: string;
  projectId: string;
  personId: string;
  unassignTasks?: boolean | null | undefined;
}>;


export type WorkspaceRemoveProjectParticipantMutation = { workspaceRemoveProjectParticipant: { _id: string | null, title: string | null, objective: string | null, description: string | null, status: string | null, participantCount: number | null, isParticipant: boolean | null, canManage: boolean | null, startDate: string | null, targetDate: string | null, isOverdue: boolean | null, taskCount: number | null, doneCount: number | null, openTaskCount: number | null, progress: number | null, tags: Array<string | null> | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null, participants: Array<{ personId: string | null, name: string | null } | null> | null } | null };

export type WorkspaceDeleteProjectMutationVariables = Exact<{
  committeeId: string;
  projectId: string;
  deleteTasks?: boolean | null | undefined;
}>;


export type WorkspaceDeleteProjectMutation = { workspaceDeleteProject: boolean | null };

export type WorkspaceCreateTaskMutationVariables = Exact<{
  committeeId: string;
  input: Types.WorkspaceTaskInput;
}>;


export type WorkspaceCreateTaskMutation = { workspaceCreateTask: { _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null } | null };

export type WorkspaceUpdateTaskMutationVariables = Exact<{
  committeeId: string;
  taskId: string;
  input: Types.WorkspaceTaskInput;
}>;


export type WorkspaceUpdateTaskMutation = { workspaceUpdateTask: { _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null } | null };

export type WorkspaceDeleteTaskMutationVariables = Exact<{
  committeeId: string;
  taskId: string;
}>;


export type WorkspaceDeleteTaskMutation = { workspaceDeleteTask: boolean | null };

export type WorkspaceSetTaskStatusMutationVariables = Exact<{
  committeeId: string;
  taskId: string;
  status: string;
}>;


export type WorkspaceSetTaskStatusMutation = { workspaceSetTaskStatus: { _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null } | null };

export type WorkspaceSetTaskProgressMutationVariables = Exact<{
  committeeId: string;
  taskId: string;
  progress: number;
}>;


export type WorkspaceSetTaskProgressMutation = { workspaceSetTaskProgress: { _id: string | null, projectId: string | null, projectTitle: string | null, title: string | null, description: string | null, assigneeId: string | null, assigneeName: string | null, dueDate: string | null, status: string | null, priority: string | null, progress: number | null, isOverdue: boolean | null, tags: Array<string | null> | null, commentCount: number | null, canManage: boolean | null, canUpdate: boolean | null, completedAt: string | null, completedByName: string | null, createdAt: string | null, createdByName: string | null, updatedAt: string | null, updatedByName: string | null } | null };

export type WorkspaceAddTaskCommentMutationVariables = Exact<{
  committeeId: string;
  taskId: string;
  text: string;
}>;


export type WorkspaceAddTaskCommentMutation = { workspaceAddTaskComment: { _id: string | null, taskId: string | null, text: string | null, authorName: string | null, isOwn: boolean | null, canDelete: boolean | null, createdAt: string | null } | null };

export type WorkspaceDeleteTaskCommentMutationVariables = Exact<{
  committeeId: string;
  commentId: string;
}>;


export type WorkspaceDeleteTaskCommentMutation = { workspaceDeleteTaskComment: boolean | null };
