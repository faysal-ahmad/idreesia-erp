import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { InstagramOutlined } from '@ant-design/icons';

import { getUploadUrl } from 'meteor/idreesia-common/utilities';
import { Button, Modal, message } from '/imports/ui/controls';
import TakePictureForm from './take-picture-form';

export default class TakePicture extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    buttonText: PropTypes.string,
    onPictureTaken: PropTypes.func,
  };

  static defaultProps = {
    disabled: false,
    buttonText: 'Take Picture',
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

  uploadAttachment = ({ name, mimeType, data }) =>
    fetch(getUploadUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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

    if (data.startsWith('data:image/jpeg;base64,')) {
      data = data.slice(23);
    }

    this.uploadAttachment({
      name: `Image_${timestamp.format('DD-MM-YY_HH:mm')}.jpeg`,
      mimeType: 'image/jpeg',
      data,
    })
      .then(({ attachmentId }) => {
        onPictureTaken(attachmentId);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { disabled, buttonText } = this.props;
    const { showForm } = this.state;

    return (
      <Fragment>
        <Button type="default" disabled={disabled} onClick={this.updatePicture}>
          <InstagramOutlined />
          {buttonText}
        </Button>

        <Modal
          visible={showForm}
          title={buttonText}
          width={750}
          okText="Save"
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
