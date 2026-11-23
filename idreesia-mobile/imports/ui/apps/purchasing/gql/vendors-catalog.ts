import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobilePurchasingCatalogItemByIdQuery,
  MobilePurchasingCatalogItemByIdQueryVariables,
  MobilePurchasingPagedCatalogItemsQuery,
  MobilePurchasingPagedCatalogItemsQueryVariables,
  MobilePurchasingPagedVendorsQuery,
  MobilePurchasingPagedVendorsQueryVariables,
  MobilePurchasingRemoveCatalogItemImageMutation,
  MobilePurchasingRemoveCatalogItemImageMutationVariables,
  MobilePurchasingSetCatalogItemImageMutation,
  MobilePurchasingSetCatalogItemImageMutationVariables,
  MobilePurchasingVendorByIdQuery,
  MobilePurchasingVendorByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_PURCHASING_PAGED_VENDORS: TypedDocumentNode<
  MobilePurchasingPagedVendorsQuery,
  MobilePurchasingPagedVendorsQueryVariables
> = gql`
  query mobilePurchasingPagedVendors($search: String, $isActive: Boolean, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingVendors(search: $search, isActive: $isActive, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        _id
        name
        contactPerson
        phone
        isActive
      }
    }
  }
`;

export const MOBILE_PURCHASING_VENDOR_BY_ID: TypedDocumentNode<
  MobilePurchasingVendorByIdQuery,
  MobilePurchasingVendorByIdQueryVariables
> = gql`
  query mobilePurchasingVendorById($_id: String!) {
    purchasingVendorById(_id: $_id) {
      _id
      name
      contactPerson
      phone
      email
      address
      paymentTermsDays
      notes
      isActive
    }
  }
`;

export const MOBILE_PURCHASING_PAGED_CATALOG_ITEMS: TypedDocumentNode<
  MobilePurchasingPagedCatalogItemsQuery,
  MobilePurchasingPagedCatalogItemsQueryVariables
> = gql`
  query mobilePurchasingPagedCatalogItems($search: String, $isActive: Boolean, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingCatalogItems(
      search: $search
      isActive: $isActive
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        name
        unit
        category
        company
        imageUrl
        isActive
      }
    }
  }
`;

export const MOBILE_PURCHASING_CATALOG_ITEM_BY_ID: TypedDocumentNode<
  MobilePurchasingCatalogItemByIdQuery,
  MobilePurchasingCatalogItemByIdQueryVariables
> = gql`
  query mobilePurchasingCatalogItemById($_id: String!) {
    purchasingCatalogItemById(_id: $_id) {
      _id
      name
      unit
      category
      company
      description
      imageUrl
      defaultUnitPrice
      lastUnitPrice
      isActive
    }
  }
`;

export const MOBILE_PURCHASING_SET_CATALOG_ITEM_IMAGE: TypedDocumentNode<
  MobilePurchasingSetCatalogItemImageMutation,
  MobilePurchasingSetCatalogItemImageMutationVariables
> = gql`
  mutation mobilePurchasingSetCatalogItemImage($_id: String!, $imageData: String!) {
    setPurchasingCatalogItemImage(_id: $_id, imageData: $imageData) {
      _id
      imageUrl
    }
  }
`;

export const MOBILE_PURCHASING_REMOVE_CATALOG_ITEM_IMAGE: TypedDocumentNode<
  MobilePurchasingRemoveCatalogItemImageMutation,
  MobilePurchasingRemoveCatalogItemImageMutationVariables
> = gql`
  mutation mobilePurchasingRemoveCatalogItemImage($_id: String!) {
    removePurchasingCatalogItemImage(_id: $_id) {
      _id
      imageUrl
    }
  }
`;
