import React from "react";
import PropTypes from "prop-types";

import { AttachmentsList as AttachmentsListControl } from "/imports/ui/modules/helpers/controls";

const AttachmentsListControlComponent = AttachmentsListControl as any;
interface Attachment { _id: string; name: string; }
interface IssuanceForm { attachments?: Attachment[]; }
interface AttachmentsListProps { issuanceFormById: IssuanceForm; }

export const AttachmentsList = ({ issuanceFormById }: AttachmentsListProps) =>(
  <AttachmentsListControlComponent
    canEditAttachments={false}
    attachments={issuanceFormById.attachments}
  />
);

AttachmentsList.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  physicalStoreId: PropTypes.string,
  issuanceFormById: PropTypes.object,
  addPurchaseFormAttachment: PropTypes.func,
  removePurchaseFormAttachment: PropTypes.func,
};
