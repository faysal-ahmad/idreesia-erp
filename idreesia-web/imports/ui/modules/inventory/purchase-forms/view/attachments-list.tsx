import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { withQuery } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import { flowRight } from 'lodash';

import { WithPhysicalStoreId } from '/imports/ui/modules/inventory/common/composers';
import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';

const AttachmentsListControlComponent = AttachmentsListControl as any;

interface Attachment {
  _id: string;
  name: string;
  description?: string;
  mimeType?: string;
}

interface PurchaseForm {
  _id: string;
  attachments?: Attachment[];
}

interface AttachmentsListProps {
  purchaseFormById?: PurchaseForm;
  formDataLoading?: boolean;
}

const AttachmentsList = ({
  purchaseFormById,
  formDataLoading,
}: AttachmentsListProps) => {
  if (formDataLoading) return null;
  if (!purchaseFormById) return null;

  return (
    <AttachmentsListControlComponent
      canEditAttachments={false}
      attachments={purchaseFormById.attachments}
    />
  );
};

AttachmentsList.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  physicalStoreId: PropTypes.string,
  purchaseFormId: PropTypes.string,
  formDataLoading: PropTypes.bool,
  purchaseFormById: PropTypes.object,
  addPurchaseFormAttachment: PropTypes.func,
  removePurchaseFormAttachment: PropTypes.func,
};

const formQuery = gql`
  query purchaseFormById($_id: String!, $physicalStoreId: String!) {
    purchaseFormById(_id: $_id, physicalStoreId: $physicalStoreId) {
      _id
      attachments {
        _id
        name
        description
        mimeType
      }
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  withQuery(formQuery, {
    props: ({ data }: { data: Record<string, any> }) => ({
      formDataLoading: data.loading,
      ...data,
    }),
    options: ({ purchaseFormId }: { purchaseFormId?: string }) => ({
      variables: { _id: purchaseFormId },
    }),
  })
)(AttachmentsList as any);
