import React from 'react';
import PropTypes from 'prop-types';

import { flowRight, get } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from 'antd';
import {
  WithCompanyId,
  WithCompany,
} from '/imports/ui/modules/accounts/common/composers';

import VoucherInfo from './voucher-info';
import AttachmentsList from './attachments-list';
import VoucherDetails from './voucher-details';

const EditForm = props => {
  const voucherId = get(props, ['match', 'params', 'voucherId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="Voucher Info" key="1">
        <VoucherInfo voucherId={voucherId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Voucher Details" key="2">
        <VoucherDetails voucherId={voucherId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="File Attachments" key="3">
        <AttachmentsList voucherId={voucherId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  setBreadcrumbs: PropTypes.func,
  companyId: PropTypes.string,
  company: PropTypes.object,
};

export default flowRight(
  WithCompanyId(),
  WithCompany(),
  WithDynamicBreadcrumbs(({ company }) => {
    if (company) {
      return `Accounts, ${company.name}, Vouchers, Edit`;
    }
    return `Accounts, Vouchers, Edit`;
  })
)(EditForm);
