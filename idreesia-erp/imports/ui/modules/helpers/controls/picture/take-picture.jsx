import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import moment from "moment";

import TakePictureForm from "./take-picture-form";

class TakePicture extends Component {
  static propTypes = {
    enabled: PropTypes.bool,
    buttonText: PropTypes.string,
    onPictureTaken: PropTypes.func,
    createAttachment: PropTypes.func,
  };

  static defaultProps = {
    enabled: true,
    buttonText: "Take Picture",
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
    const timestamp = moment();

    createAttachment({
      variables: {
        name: `Image_${timestamp.format("DD-MM-YY_HH:mm")}.jpeg`,
        mimeType: "image/jpeg",
        data: picture,
      },
    })
      .then(result => {
        const attachmentId = result.data.createAttachment._id;
        onPictureTaken(attachmentId);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { enabled, buttonText } = this.props;
    const { showForm } = this.state;

    return (
      <Fragment>
        <Button type="default" enabled={enabled} onClick={this.updatePicture}>
          <Icon type="instagram" />
          {buttonText}
        </Button>

        <Modal
          visible={showForm}
          title={buttonText}
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
  mutation createAttachment($name: String, $mimeType: String, $data: String!) {
    createAttachment(name: $name, mimeType: $mimeType, data: $data) {
      _id
    }
  }
`;

export default compose(graphql(formMutation, { name: "createAttachment" }))(
  TakePicture
);
