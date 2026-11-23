import React from 'react';
import { List, Tag } from 'antd-mobile';
import { useQuery } from '@apollo/client/react';
import { ModulePaths } from 'meteor/idreesia-common/constants';

import { PagedList } from '../../../components';
import { usePagedQuery } from '../../../hooks';
import { Page } from '../../../layout';
import { useHistory, useParams } from '../../../router';
import { openExternalUrl } from '../../../utilities/open-external-url';
import { DetailFields, DetailSummary } from '../components/detail-fields';
import { DocumentPage } from '../components/document-page';
import { useListControls } from '../components/list-controls';
import { MOBILE_PURCHASING_PAGED_VENDORS, MOBILE_PURCHASING_VENDOR_BY_ID } from '../gql';
import { PurchasingPaths } from '../paths';

/** Purchasing → Vendors. */
export const VendorsListScreen = () => {
  const history = useHistory();
  const controls = useListControls({ placeholder: 'Vendor name' });

  const paged = usePagedQuery(MOBILE_PURCHASING_PAGED_VENDORS, {
    filter: { search: controls.search },
    toVariables: (filter, paging) => ({
      ...filter,
      pageIndex: Number(paging.pageIndex),
      pageSize: Number(paging.pageSize),
    }),
    getPage: data => data.pagedPurchasingVendors,
    getKey: vendor => vendor._id,
  });

  return (
    <Page backTo={ModulePaths.purchasing} title="Vendors">
      {controls.toolbar}
      <PagedList
        emptyTitle="No vendors found"
        getKey={vendor => vendor._id ?? ''}
        itemsLabel="vendors"
        paged={paged}
        renderItem={vendor => (
          <List.Item
            arrowIcon
            description={[vendor.contactPerson, vendor.phone].filter(Boolean).join(' · ')}
            extra={
              vendor.isActive === false ? (
                <Tag color="default" fill="outline">
                  Inactive
                </Tag>
              ) : undefined
            }
            onClick={() => vendor._id && history.push(PurchasingPaths.vendor(vendor._id))}
          >
            {vendor.name}
          </List.Item>
        )}
      />
    </Page>
  );
};

export const VendorDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refetch } = useQuery(MOBILE_PURCHASING_VENDOR_BY_ID, {
    variables: { _id: id },
    fetchPolicy: 'cache-and-network',
  });
  const vendor = data?.purchasingVendorById;

  const link = (href: string, text: string) => (
    <a
      href={href}
      onClick={event => {
        event.preventDefault();
        openExternalUrl(href);
      }}
    >
      {text}
    </a>
  );

  return (
    <DocumentPage
      backTo={PurchasingPaths.vendors}
      error={error}
      found={Boolean(vendor)}
      loading={loading}
      notFoundTitle="Vendor not found"
      refetch={() => refetch()}
      title="Vendor"
    >
      {vendor && (
        <>
          <DetailSummary
            eyebrow={vendor.isActive === false ? 'Inactive' : undefined}
            title={vendor.name}
          />
          <DetailFields
            fields={[
              { label: 'Contact person', value: vendor.contactPerson },
              { label: 'Phone', value: vendor.phone ? link(`tel:${vendor.phone}`, vendor.phone) : null },
              { label: 'Email', value: vendor.email ? link(`mailto:${vendor.email}`, vendor.email) : null },
              { label: 'Address', value: vendor.address },
              {
                label: 'Payment terms',
                value: vendor.paymentTermsDays != null ? `${vendor.paymentTermsDays} days` : null,
              },
              { label: 'Notes', value: vendor.notes },
            ]}
          />
        </>
      )}
    </DocumentPage>
  );
};
