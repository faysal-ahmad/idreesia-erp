import React, { Component, Fragment } from 'react';
import dayjs from 'dayjs';
import { InstagramOutlined } from '@ant-design/icons';

import type { AttachmentCategoryValue } from 'meteor/idreesia-common/constants';
import { getUploadUrl } from 'meteor/idreesia-common/utilities';
import { Button, Modal } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import TakePictureForm from './take-picture-form';

interface Props {
  disabled?: boolean;
  buttonText?: string;
  /** What the picture belongs to, when it is uploaded as an attachment. */
  category?: AttachmentCategoryValue;
  /** Called with the uploaded Attachments id (needs `category`). */
  onPictureTaken?(attachmentId: string): void;
  /**
   * Called with the captured photo as base64 JPEG data instead of uploading
   * it to Attachments - the caller sends it on (e.g. people photos, which are
   * stored in object storage).
   */
  onPictureCaptured?(imageData: string): void;
}

interface State {
  showForm: boolean;
}

interface UploadPayload {
  name: string;
  mimeType: string;
  data: string;
}

export default class TakePicture extends Component<Props, State> {
  state = {
    showForm: false,
  };

  pictureForm: TakePictureForm | null = null;

  updatePicture = () => {
    this.setState({ showForm: true });
  };

  handlePictureFormCancelled = () => {
    this.setState({ showForm: false });
  };

  uploadAttachment = ({ name, mimeType, data }: UploadPayload) =>
    fetch(getUploadUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        mimeType,
        data,
        category: this.props.category,
      }),
    }).then((response: Response) => response.json());

  handlePictureFormSaved = () => {
    const { onPictureTaken, onPictureCaptured } = this.props;
    this.setState({ showForm: false });
    let data = this.pictureForm?.state.imageSrc;
    if (!data) return;

    const timestamp = dayjs();

    if (data.startsWith('data:image/jpeg;base64,')) {
      data = data.slice(23);
    }

    if (onPictureCaptured) {
      onPictureCaptured(data);
      return;
    }

    this.uploadAttachment({
      name: `Image_${timestamp.format('DD-MM-YY_HH:mm')}.jpeg`,
      mimeType: 'image/jpeg',
      data,
    })
      .then(({ attachmentId }) => {
        onPictureTaken?.(attachmentId);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { disabled = false, buttonText = 'Take Picture' } = this.props;
    const { showForm } = this.state;

    return (
      <Fragment>
        <Button type="default" disabled={disabled} onClick={this.updatePicture}>
          <InstagramOutlined />
          {buttonText}
        </Button>

        <Modal
          open={showForm}
          title={buttonText}
          width={750}
          okText="Save"
          destroyOnHidden
          onOk={this.handlePictureFormSaved}
          onCancel={this.handlePictureFormCancelled}
        >
          <TakePictureForm
            ref={(form) => {
              this.pictureForm = form;
            }}
          />
        </Modal>
      </Fragment>
    );
  }
}
