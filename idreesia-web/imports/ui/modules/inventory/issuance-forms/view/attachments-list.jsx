import React from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

import { WithPhysicalStoreId } from "/imports/ui/modules/inventory/common/composers";
import { AttachmentsList as AttachmentsListControl } from "/imports/ui/modules/helpers/controls";

const AttachmentsList = ({ issuanceFormById, formDataLoading }) =>{
  if (formDataLoading) return null;

  return (
    <AttachmentsListControl
      canEditAttachments={false}
      attachments={issuanceFormById.attachments}
    />
  );
}

AttachmentsList.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  physicalStoreId: PropTypes.string,
  issuanceFormId: PropTypes.string,
  formDataLoading: PropTypes.bool,
  issuanceFormById: PropTypes.object,
  addPurchaseFormAttachment: PropTypes.func,
  removePurchaseFormAttachment: PropTypes.func,
};

const formQuery = gql`
  query issuanceFormById($_id: String!) {
    issuanceFormById(_id: $_id) {
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
    options: ({ issuanceFormId }) => ({ variables: { _id: issuanceFormId } }),
  })
)(AttachmentsList);
