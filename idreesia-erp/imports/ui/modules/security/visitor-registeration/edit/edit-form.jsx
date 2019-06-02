import React from "react";
import PropTypes from "prop-types";
import { get } from "lodash";
import { Tabs } from "antd";

import { WithBreadcrumbs } from "/imports/ui/composers";
import GeneralInfo from "./general-info";
import Picture from "./picture";

const EditForm = props => {
  const visitorId = get(props, ["match", "params", "visitorId"], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo visitorId={visitorId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Picture" key="2">
        <Picture visitorId={visitorId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(["Security", "Visitor Registration", "Edit"])(
  EditForm
);
