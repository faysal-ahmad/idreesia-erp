import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import TakePictureForm from "./take-picture-form";

class TakePicture extends Component {
  static propTypes = {
    onPictureTaken: PropTypes.func,
    createAttachment: PropTypes.func,
  };

  state = {
    showForm: false,
  };

  pictureForm;

  updatePicture = () => {
    this.setState({ showForm: true });
  };

  handlePictureFormCancelled = () => {
    this.setState({ showForm: false });
  };

  handlePictureFormSaved = () => {
    const { createAttachment, onPictureTaken } = this.props;
    const picture = this.pictureForm.state.imageSrc;
    this.setState({ showForm: false });

    createAttachment({
      variables: {
        data: picture,
      },
    })
      .then(data => {
        console.log(data);
        // onPictureTaken(picture);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { showForm } = this.state;

    return (
      <Fragment>
        <Button type="default" onClick={this.updatePicture}>
          <Icon type="instagram" />Take Picture
        </Button>

        <Modal
          visible={showForm}
          title="Take Picture"
          okText="Save"
          width={400}
          destroyOnClose
          onOk={this.handlePictureFormSaved}
          onCancel={this.handlePictureFormCancelled}
        >
          <TakePictureForm
            ref={f => {
              this.pictureForm = f;
            }}
          />
        </Modal>
      </Fragment>
    );
  }
}

const formMutation = gql`
  mutation createAttachment($name: String, $data: String!) {
    createAttachment(name: $name, data: $data) {
      _id
    }
  }
`;

export default compose(graphql(formMutation, { name: "createAttachment" }))(
  TakePicture
);
