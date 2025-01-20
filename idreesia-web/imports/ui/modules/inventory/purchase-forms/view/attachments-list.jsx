import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

import { WithPhysicalStoreId } from "/imports/ui/modules/inventory/common/composers";
import { AttachmentsList as AttachmentsListControl } from "/imports/ui/modules/helpers/controls";

const AttachmentsList = ({ purchaseFormById, formDataLoading }) =>{
  if (formDataLoading) return null;

  return (
    <AttachmentsListControl
      canEditAttachments={false}
      attachments={purchaseFormById.attachments}
    />
  );
}

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
  query purchaseFormById($_id: String!) {
    purchaseFormById(_id: $_id) {
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
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ purchaseFormId }) => ({ variables: { _id: purchaseFormId } }),
  })
)(AttachmentsList);
