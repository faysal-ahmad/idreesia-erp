import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal, message } from "antd";
import moment from "moment";

import { getUploadUrl } from "/imports/ui/modules/helpers/misc";
import TakePictureForm from "./take-picture-form";

export default class TakePicture extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    buttonText: PropTypes.string,
    onPictureTaken: PropTypes.func,
  };

  static defaultProps = {
    disabled: false,
    buttonText: "Take Picture",
  };

  state = {
    value: 1,
    height: 300,
    width: 350,
    showForm: false,
  };

  pictureForm;

  updatePicture = () => {
    this.setState({ showForm: true });
  };

  handlePictureFormCancelled = () => {
    this.setState({ showForm: false });
  };

  uploadAttachment = ({ name, mimeType, data }) =>
    fetch(getUploadUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        mimeType,
        data,
      }),
    }).then(response => response.json());

  handlePictureFormSaved = () => {
    const { onPictureTaken } = this.props;
    this.setState({ showForm: false });
    let data = this.pictureForm.state.imageSrc;
    if (!data) return;

    const timestamp = moment();

    if (data.startsWith("data:image/jpeg;base64,")) {
      data = data.slice(23);
    }

    this.uploadAttachment({
      name: `Image_${timestamp.format("DD-MM-YY_HH:mm")}.jpeg`,
      mimeType: "image/jpeg",
      data,
    })
      .then(({ attachmentId }) => {
        onPictureTaken(attachmentId);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  setDimensions = value => {
    if (value === 1) {
      this.setState({
        value,
        height: 300,
        width: 350,
      });
    } else if (value === 2) {
      this.setState({
        value,
        height: 600,
        width: 700,
      });
    } else if (value === 3) {
      this.setState({
        value,
        height: 900,
        width: 1050,
      });
    }
  };

  render() {
    const { disabled, buttonText } = this.props;
    const { value, height, width, showForm } = this.state;

    return (
      <Fragment>
        <Button type="default" disabled={disabled} onClick={this.updatePicture}>
          <Icon type="instagram" />
          {buttonText}
        </Button>

        <Modal
          visible={showForm}
          title={buttonText}
          width={width + 50}
          okText="Save"
          destroyOnClose
          onOk={this.handlePictureFormSaved}
          onCancel={this.handlePictureFormCancelled}
        >
          <TakePictureForm
            value={value}
            height={height}
            width={width}
            setDimensions={this.setDimensions}
            ref={f => {
              this.pictureForm = f;
            }}
          />
        </Modal>
      </Fragment>
    );
  }
}
