import { Meteor } from "meteor/meteor";
import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Avatar, Dropdown, Menu, Modal, message } from "antd";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

import ChangePasswordForm from "./change-password-form";

const ContainerStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  alignItems: "center",
};

class UserMenu extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    karkunByUserId: PropTypes.object,
  };

  state = {
    showChangePasswordForm: false,
  };

  changePasswordForm;

  handleMenuItemClicked = ({ key }) => {
    const { history } = this.props;

    switch (key) {
      case "logout":
        Meteor.logout(error => {
          if (error) console.log(error);
          history.push("/");
        });
        break;

      case "change-password":
        this.setState({
          showChangePasswordForm: true,
        });
        break;

      default:
        break;
    }
  };

  handleChagePassword = () => {
    this.changePasswordForm.validateFields(null, (err, values) => {
      if (!err) {
        const { oldPassword, newPassword } = values;

        Accounts.changePassword(oldPassword, newPassword, error => {
          this.setState({
            showChangePasswordForm: false,
          });

          if (!error) {
            Meteor.logoutOtherClients();
            message.success("Your password has been changed.", 5);
            history.push(location.pathname);
          } else {
            message.error(error.message, 5);
          }
        });
      }
    });
  };

  handleChangePasswordCancelled = () => {
    this.setState({
      showChangePasswordForm: false,
    });
  };

  render() {
    const { karkunByUserId } = this.props;
    const userName = karkunByUserId ? karkunByUserId.name : "";

    let avatar = <Avatar size="large" icon="user" />;
    if (karkunByUserId && karkunByUserId.imageId) {
      const url = Meteor.absoluteUrl(
        `download-file?attachmentId=${karkunByUserId.imageId}`
      );
      avatar = <Avatar size="large" src={url} />;
    }

    const menu = (
      <Menu
        style={{ height: "100%", borderRight: 0 }}
        onClick={this.handleMenuItemClicked}
      >
        <Menu.Item key="change-password">Change Password</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout">Logout</Menu.Item>
      </Menu>
    );

    return (
      <Fragment>
        <Dropdown overlay={menu} placement="bottomLeft">
          <div style={ContainerStyle}>
            <div style={{ color: "#FFFFFF" }}>{userName}</div>
            &nbsp; &nbsp;
            {avatar}
          </div>
        </Dropdown>
        <Modal
          title="Change Password"
          visible={this.state.showChangePasswordForm}
          onOk={this.handleChagePassword}
          onCancel={this.handleChangePasswordCancelled}
        >
          <ChangePasswordForm
            ref={f => {
              this.changePasswordForm = f;
            }}
          />
        </Modal>
      </Fragment>
    );
  }
}

const formQuery = gql`
  query karkunByUserId($userId: String!) {
    karkunByUserId(userId: $userId) {
      _id
      name
      imageId
    }
  }
`;

export default graphql(formQuery, {
  props: ({ data }) => ({ ...data }),
  options: () => ({ variables: { userId: Meteor.userId() } }),
})(UserMenu);
