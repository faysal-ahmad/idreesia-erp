import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import { Drawer, NavBar } from '/imports/ui/controls';
import AppRouter from './app-router';
import DrawerContent from './drawer-content';

const MainLayout = ({ history, location }) => {
  const activeModuleName = useSelector(state => state.activeModuleName);
  const activeSubModuleName = useSelector(state => state.activeSubModuleName);
  const [showDrawer, setShowDrawer] = useState(false);

  const toggleDrawer = () => {
    setShowDrawer(!showDrawer);
  };

  const getSubModuleDisplayName = () => {
    if (activeModuleName && activeSubModuleName) {
      return `${activeModuleName} - ${activeSubModuleName}`;
    }

    return 'Idreesia ERP';
  };

  const title = getSubModuleDisplayName();

  return (
    <div>
      <NavBar
        className="app-nav-bar"
        icon={<FontAwesomeIcon icon={faBars} style={{ color: '#FFF' }} />}
        onLeftClick={toggleDrawer}
      >
        {title}
      </NavBar>
      <Drawer
        className="app-drawer"
        style={{
          top: '45px',
          minHeight: document.documentElement.clientHeight,
        }}
        enableDragHandle
        contentStyle={{
          color: '#A6A6A6',
          textAlign: 'center',
        }}
        sidebar={
          <DrawerContent
            history={history}
            location={location}
            toggleDrawer={toggleDrawer}
          />
        }
        open={showDrawer}
        onOpenChange={toggleDrawer}
      >
        <AppRouter />
      </Drawer>
    </div>
  );
};

MainLayout.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default MainLayout;
