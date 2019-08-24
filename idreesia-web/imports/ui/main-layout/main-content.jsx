import React from "react";
import PropTypes from "prop-types";
import { Layout } from "antd";

import { ModuleNames } from "meteor/idreesia-common/constants";
import { withActiveModule } from "meteor/idreesia-common/composers/common";
import { AdminRouter } from "../modules/admin";
import { InventoryRouter } from "../modules/inventory";
import { HRRouter } from "../modules/hr";
import { AccountsRouter } from "../modules/accounts";
import { SecurityRouter } from "../modules/security";

const { Content } = Layout;

const MainContent = props => {
  let main;
  const { activeModuleName } = props;

  switch (activeModuleName) {
    case ModuleNames.admin:
      main = <AdminRouter />;
      break;

    case ModuleNames.inventory:
      main = <InventoryRouter />;
      break;

    case ModuleNames.hr:
      main = <HRRouter />;
      break;

    case ModuleNames.accounts:
      main = <AccountsRouter />;
      break;

    case ModuleNames.security:
      main = <SecurityRouter />;
      break;

    default:
      main = <div />;
      break;
  }

  return (
    <Content
      style={{ background: "#fff", padding: 24, margin: 0, minHeight: 280 }}
    >
      {main}
    </Content>
  );
};

MainContent.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  activeModuleName: PropTypes.string,
  activeSubModuleName: PropTypes.string,
};

const MainContentContainer = withActiveModule()(MainContent);
export default MainContentContainer;
