import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { InstagramOutlined } from '@ant-design/icons';

import { getUploadUrl } from 'meteor/idreesia-common/utilities';
import { Button, Modal, message } from 'antd';
import TakePictureForm from './take-picture-form';

const ReactFragment = Fragment as any;
const AntButton = Button as any;
const AntModal = Modal as any;
const AntInstagramOutlined = InstagramOutlined as any;
const TakePictureFormControl = TakePictureForm as any;
interface Props { disabled?: boolean; buttonText?: string; onPictureTaken?(attachmentId: string): void; }
interface State { showForm: boolean; }
interface UploadPayload { name: string; mimeType: string; data: string; }

export default class TakePicture extends Component<Props, State> {
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

  pictureForm: any;

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
      }),
    }).then((response: Response) => response.json());

  handlePictureFormSaved = () => {
    const { onPictureTaken } = this.props;
    this.setState({ showForm: false });
    let data = this.pictureForm.state.imageSrc;
    if (!data) return;

    const timestamp = dayjs();

    if (data.startsWith('data:image/jpeg;base64,')) {
      data = data.slice(23);
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
    const { disabled, buttonText } = this.props;
    const { showForm } = this.state;

    return (
      <ReactFragment>
        <AntButton type="default" disabled={disabled} onClick={this.updatePicture}>
          <AntInstagramOutlined />
          {buttonText}
        </AntButton>

        <AntModal
          open={showForm}
          title={buttonText}
          width={750}
          okText="Save"
          destroyOnClose
          onOk={this.handlePictureFormSaved}
          onCancel={this.handlePictureFormCancelled}
        >
          <TakePictureFormControl
            ref={(f: any) => {
              this.pictureForm = f;
            }}
          />
        </AntModal>
      </ReactFragment>
    );
  }
}
