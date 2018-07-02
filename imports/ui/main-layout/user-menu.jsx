import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Dropdown, Menu } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
};

class UserMenu extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    karkunByUserId: PropTypes.object,
  };

  handleMenuItemClicked = ({ key }) => {
    const { history } = this.props;

    switch (key) {
      case 'logout':
        Meteor.logout(error => {
          if (error) console.log(error);
          history.push('/');
        });
        break;

      default:
        break;
    }
  };

  render() {
    const { karkunByUserId } = this.props;
    const userName = karkunByUserId ? karkunByUserId.name : '';

    let avatar = <Avatar size="large" icon="user" />;
    if (karkunByUserId && karkunByUserId.profilePicture) {
      avatar = <Avatar size="large" src={karkunByUserId.profilePicture} />;
    }

    const menu = (
      <Menu style={{ height: '100%', borderRight: 0 }} onClick={this.handleMenuItemClicked}>
        <Menu.Item key="logout">Logout</Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu} placement="bottomLeft">
        <div style={ContainerStyle}>
          <div style={{ color: '#FFFFFF' }}>{userName}</div>
          &nbsp; &nbsp;
          {avatar}
        </div>
      </Dropdown>
    );
  }
}

const formQuery = gql`
  query karkunByUserId($userId: String!) {
    karkunByUserId(userId: $userId) {
      _id
      name
      profilePicture
    }
  }
`;

export default graphql(formQuery, {
  props: ({ data }) => ({ ...data }),
  options: () => ({ variables: { userId: Meteor.userId() } }),
})(UserMenu);
