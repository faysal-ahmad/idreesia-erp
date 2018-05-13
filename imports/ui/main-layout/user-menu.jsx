import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Dropdown, Menu } from 'antd';

export default class UserMenu extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object
  };

  handleMenuItemClicked = ({ item, key, keyPath }) => {
    const { history } = this.props;
    const rootUrl = Meteor.absoluteUrl('/');

    switch (key) {
      case 'logout':
        Meteor.logout(error => {
          if (error) console.log(error);
          history.push(rootUrl);
        });
        break;

      default:
        break;
    }
  };

  render() {
    const menu = (
      <Menu style={{ height: '100%', borderRight: 0 }} onClick={this.handleMenuItemClicked}>
        <Menu.Item key="logout">Logout</Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu} placement="bottomLeft">
        <Avatar size="large" icon="user" />
      </Dropdown>
    );
  }
}
