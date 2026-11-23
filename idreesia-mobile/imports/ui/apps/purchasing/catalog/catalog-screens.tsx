import React, { useState } from 'react';
import { ActionSheet, Avatar, Dialog, ImageViewer, List, Tag } from 'antd-mobile';
import { CameraOutline } from 'antd-mobile-icons';
import { useMutation, useQuery } from '@apollo/client/react';
import { ModulePaths } from 'meteor/idreesia-common/constants';
import { toDeviceUrl } from '/imports/startup/backend';

import { PagedList } from '../../../components';
import { useOnlineStatus, usePagedQuery } from '../../../hooks';
import { Page, showError, showSuccess } from '../../../layout';
import { useHistory, useParams } from '../../../router';
import { capturePhoto } from '../../../utilities';
import { DetailFields, DetailSummary } from '../components/detail-fields';
import { DocumentPage } from '../components/document-page';
import { useListControls } from '../components/list-controls';
import { formatMoney } from '../format';
import {
  MOBILE_PURCHASING_CATALOG_ITEM_BY_ID,
  MOBILE_PURCHASING_PAGED_CATALOG_ITEMS,
  MOBILE_PURCHASING_REMOVE_CATALOG_ITEM_IMAGE,
  MOBILE_PURCHASING_SET_CATALOG_ITEM_IMAGE,
} from '../gql';
import { PurchasingPaths } from '../paths';
import { usePurchasingAccess } from '../use-purchasing-access';

/** Purchasing → Catalog. */
export const CatalogListScreen = () => {
  const history = useHistory();
  const controls = useListControls({ placeholder: 'Item name' });

  const paged = usePagedQuery(MOBILE_PURCHASING_PAGED_CATALOG_ITEMS, {
    filter: { search: controls.search },
    toVariables: (filter, paging) => ({
      ...filter,
      pageIndex: Number(paging.pageIndex),
      pageSize: Number(paging.pageSize),
    }),
    getPage: data => data.pagedPurchasingCatalogItems,
    getKey: item => item._id,
  });

  return (
    <Page backTo={ModulePaths.purchasing} title="Catalog">
      {controls.toolbar}
      <PagedList
        emptyTitle="No catalog items found"
        getKey={item => item._id ?? ''}
        itemsLabel="items"
        paged={paged}
        renderItem={item => (
          <List.Item
            arrowIcon
            description={[item.unit, item.category, item.company].filter(Boolean).join(' · ')}
            extra={
              item.isActive === false ? (
                <Tag color="default" fill="outline">
                  Inactive
                </Tag>
              ) : undefined
            }
            prefix={<Avatar fallback="" src={toDeviceUrl(item.imageUrl) ?? ''} />}
            onClick={() => item._id && history.push(PurchasingPaths.catalogItem(item._id))}
          >
            {item.name}
          </List.Item>
        )}
      />
    </Page>
  );
};

/** A catalog item. People who manage the catalog can take or remove its picture. */
export const CatalogItemScreen = () => {
  const { id } = useParams<{ id: string }>();
  const online = useOnlineStatus();
  const { canManageCatalog } = usePurchasingAccess();
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery(MOBILE_PURCHASING_CATALOG_ITEM_BY_ID, {
    variables: { _id: id },
    fetchPolicy: 'cache-and-network',
  });
  const refetchQueries = ['mobilePurchasingPagedCatalogItems'];
  const [setImage] = useMutation(MOBILE_PURCHASING_SET_CATALOG_ITEM_IMAGE, { refetchQueries });
  const [removeImage] = useMutation(MOBILE_PURCHASING_REMOVE_CATALOG_ITEM_IMAGE, { refetchQueries });

  const item = data?.purchasingCatalogItemById;
  const imageUrl = toDeviceUrl(item?.imageUrl);

  const takePhoto = async () => {
    try {
      const photo = await capturePhoto();
      if (!photo) return;
      await setImage({ variables: { _id: id, imageData: photo } });
      showSuccess('Picture saved.');
      await refetch();
    } catch (photoError) {
      showError(photoError, 'Could not save the picture.');
    }
  };

  const remove = async () => {
    const confirmed = await Dialog.confirm({
      content: 'Remove this picture?',
      confirmText: <span className="purchasing-danger-text">Remove</span>,
      cancelText: 'Keep it',
    });
    if (!confirmed) return;
    try {
      await removeImage({ variables: { _id: id } });
      showSuccess('Picture removed.');
      await refetch();
    } catch (removeError) {
      showError(removeError, 'Could not remove the picture.');
    }
  };

  return (
    <DocumentPage
      backTo={PurchasingPaths.catalog}
      error={error}
      found={Boolean(item)}
      loading={loading}
      notFoundTitle="Catalog item not found"
      refetch={() => refetch()}
      right={
        canManageCatalog ? (
          <div className="page-nav-actions">
            <CameraOutline aria-label="Picture" className="page-nav-action" onClick={() => setMenuOpen(true)} />
          </div>
        ) : undefined
      }
      title="Catalog item"
    >
      {item && (
        <>
          {imageUrl && (
            <button
              aria-label="View picture"
              className="purchasing-item-photo"
              type="button"
              onClick={() => setPhotoOpen(true)}
            >
              <img alt={item.name ?? ''} src={imageUrl} />
            </button>
          )}
          {imageUrl && <ImageViewer image={imageUrl} visible={photoOpen} onClose={() => setPhotoOpen(false)} />}
          <DetailSummary eyebrow={item.isActive === false ? 'Inactive' : undefined} title={item.name} />
          <DetailFields
            fields={[
              { label: 'Unit', value: item.unit },
              { label: 'Category', value: item.category },
              { label: 'Company', value: item.company },
              { label: 'Description', value: item.description },
              { label: 'Default price', value: item.defaultUnitPrice ? formatMoney(item.defaultUnitPrice) : null },
              { label: 'Last price', value: item.lastUnitPrice ? formatMoney(item.lastUnitPrice) : null },
            ]}
          />
          <ActionSheet
            actions={[
              { key: 'take', text: imageUrl ? 'Replace picture' : 'Take picture', disabled: !online },
              ...(imageUrl ? [{ key: 'remove', text: 'Remove picture', danger: true, disabled: !online }] : []),
            ]}
            cancelText="Close"
            visible={menuOpen}
            onAction={action => {
              setMenuOpen(false);
              if (action.key === 'take') takePhoto();
              else remove();
            }}
            onClose={() => setMenuOpen(false)}
          />
        </>
      )}
    </DocumentPage>
  );
};
