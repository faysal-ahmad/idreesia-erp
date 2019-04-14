import React, { Component } from "react";
import PropTypes from "prop-types";
import { compose } from "react-apollo";
import { get } from "lodash";
import { Tabs } from "antd";

import {
  WithCompanyId,
  WithCompany,
} from "/imports/ui/modules/accounts/common/composers";
import { WithBreadcrumbs } from "/imports/ui/composers";

import VoucherInfo from "./edit/voucher-info";
import AttachmentsList from "./edit/attachments-list";

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    setBreadcrumbs: PropTypes.func,
    companyId: PropTypes.string,
    company: PropTypes.object,
  };

  componentDidMount() {
    const { company, setBreadcrumbs } = this.props;
    if (company) {
      setBreadcrumbs([company.name, "Vouchers", "Edit"]);
    }
  }

  render() {
    const voucherId = get(this.props, ["match", "params", "voucherId"], null);
    return (
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Voucher Info" key="1">
          <VoucherInfo voucherId={voucherId} {...this.props} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="File Attachments" key="4">
          <AttachmentsList voucherId={voucherId} {...this.props} />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}

export default compose(
  WithCompanyId(),
  WithCompany(),
  WithBreadcrumbs(["Accounts", "Vouchers", "Edit"])
)(EditForm);
