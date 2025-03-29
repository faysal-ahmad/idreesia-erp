import React from "react";
import PropTypes from "prop-types";

import { AttachmentsList as AttachmentsListControl } from "/imports/ui/modules/helpers/controls";

export const AttachmentsList = ({ issuanceFormById }) =>(
  <AttachmentsListControl
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
