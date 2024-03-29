import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';

import { setDrawerOpen } from 'meteor/idreesia-common/action-creators';
import { Drawer, NavBar } from 'antd';
import AppRouter from './app-router';
import DrawerContent from './drawer-content';

const MainLayout = ({ history, location }) => {
  const dispatch = useDispatch();
  const breadcrumbs = useSelector(state => state.breadcrumbs);
  const drawerOpen = useSelector(state => state.drawerOpen);

  const toggleDrawer = () => {
    dispatch(setDrawerOpen(!drawerOpen));
  };

  const getTitle = () => {
    if (breadcrumbs) {
      return breadcrumbs.join(' - ');
    }

    return 'Idreesia ERP';
  };

  const title = getTitle();

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
        open={drawerOpen}
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
