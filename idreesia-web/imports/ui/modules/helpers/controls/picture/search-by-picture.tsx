import React, { Fragment, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client/react';
import { Button, Modal } from 'antd';
import { CameraOutlined } from '@ant-design/icons';

import { ImageVectorStatus } from 'meteor/idreesia-common/constants';
import { SECURITY_FACE_VECTOR_FROM_IMAGE } from '/imports/ui/modules/security/visitor-registeration/gql';

import SearchByPictureForm from './search-by-picture-form';

// Every non-'computed' status is a reason to retake rather than an error to swallow, so each one
// tells the operator what to change about the next photo.
const StatusMessages: Record<string, string> = {
  [ImageVectorStatus.NO_FACE]: 'No face was detected in this photo.',
  [ImageVectorStatus.MULTIPLE_FACES]:
    'More than one face in this photo — retake with only the visitor in frame.',
  [ImageVectorStatus.TOO_SMALL]:
    'The face is too small — move closer or zoom in.',
  [ImageVectorStatus.ERROR]: 'This photo could not be processed. Try another.',
};

const ErrorStyle = {
  color: 'red',
};

interface Props {
  disabled?: boolean;
  buttonText?: string;
  onVectorComputed(vector: number[]): void;
}

const SearchByPicture = ({
  disabled = false,
  buttonText = 'Search by Picture',
  onVectorComputed,
}: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [hasCapture, setHasCapture] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<SearchByPictureForm | null>(null);

  const [computeFaceVector, { loading }] = useLazyQuery(
    SECURITY_FACE_VECTOR_FROM_IMAGE,
    { fetchPolicy: 'no-cache' }
  );

  const closeForm = () => {
    setShowForm(false);
    setHasCapture(false);
    setError(null);
  };

  const handleCaptureChange = (imageSrc: string | null) => {
    setHasCapture(Boolean(imageSrc));
    // A fresh capture invalidates whatever the last attempt complained about.
    setError(null);
  };

  const handleSearch = async () => {
    const imageData = formRef.current?.state.imageSrc;
    if (!imageData) return;

    try {
      const { data } = await computeFaceVector({ variables: { imageData } });
      const result = data?.securityFaceVectorFromImage;

      // A null result means the permission check rejected the call outright.
      if (!result) {
        setError(StatusMessages[ImageVectorStatus.ERROR]);
        return;
      }

      const { status, vector } = result;
      if (status !== ImageVectorStatus.COMPUTED || !vector) {
        setError(
          StatusMessages[status ?? ImageVectorStatus.ERROR] ??
            StatusMessages[ImageVectorStatus.ERROR]
        );
        return;
      }

      closeForm();
      onVectorComputed(vector);
    } catch {
      // A network/server failure is, from the operator's point of view, the same situation as an
      // unusable photo: the modal stays open so they can simply try again.
      setError(StatusMessages[ImageVectorStatus.ERROR]);
    }
  };

  return (
    <Fragment>
      <Button type="default" disabled={disabled} onClick={() => setShowForm(true)}>
        <CameraOutlined />
        {buttonText}
      </Button>

      <Modal
        open={showForm}
        title={buttonText}
        width={750}
        okText="Search"
        okButtonProps={{ disabled: !hasCapture }}
        confirmLoading={loading}
        destroyOnHidden
        onOk={handleSearch}
        onCancel={closeForm}
      >
        <SearchByPictureForm
          ref={(form) => {
            formRef.current = form;
          }}
          onCaptureChange={handleCaptureChange}
          errorMessage={error ? <span style={ErrorStyle}>{error}</span> : null}
        />
      </Modal>
    </Fragment>
  );
};

export default SearchByPicture;
