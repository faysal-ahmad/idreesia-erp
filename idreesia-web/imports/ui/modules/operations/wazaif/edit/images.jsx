import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/react-hooks';

import { compact, find } from 'meteor/idreesia-common/utilities/lodash';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';

import {
  Icon,
  Row,
  Table,
  Tooltip,
  Popconfirm,
  message,
} from '/imports/ui/controls';
import { UploadAttachment } from '/imports/ui/modules/helpers/controls';

import {
  OPERATIONS_WAZEEFA_BY_ID,
  SET_OPERATIONS_WAZEEFA_IMAGE,
  REMOVE_OPERATIONS_WAZEEFA_IMAGE,
} from '../gql';

const Images = ({ wazeefaId }) => {
  const [setOperationsWazeefaImage] = useMutation(SET_OPERATIONS_WAZEEFA_IMAGE);
  const [removeOperationsWazeefaImage] = useMutation(
    REMOVE_OPERATIONS_WAZEEFA_IMAGE
  );
  const { data, loading, refetch } = useQuery(OPERATIONS_WAZEEFA_BY_ID, {
    variables: { _id: wazeefaId },
  });

  if (loading) return null;
  const { operationsWazeefaById } = data;

  const handleDeleteClicked = attachmentId => {
    removeOperationsWazeefaImage({
      variables: {
        _id: wazeefaId,
        imageId: attachmentId,
      },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleMoveUpClicked = imageId => {
    const { imageIds } = operationsWazeefaById;
    const index = imageIds.indexOf(imageId);
    imageIds[index] = imageIds[index - 1];
    imageIds[index - 1] = imageId;

    setOperationsWazeefaImage({
      variables: {
        _id: wazeefaId,
        imageIds,
      },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleMoveDownClicked = imageId => {
    const { imageIds } = operationsWazeefaById;
    const index = imageIds.indexOf(imageId);
    imageIds[index] = imageIds[index + 1];
    imageIds[index + 1] = imageId;

    setOperationsWazeefaImage({
      variables: {
        _id: wazeefaId,
        imageIds,
      },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleImageAdded = imageId => {
    const { imageIds } = operationsWazeefaById;
    setOperationsWazeefaImage({
      variables: {
        _id: wazeefaId,
        imageIds: (imageIds || []).concat(imageId),
      },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Row type="flex" align="middle" gutter={6}>
          {record.name}
        </Row>
      ),
    },
    {
      title: 'File Preview',
      key: 'preview',
      render: (text, record) => {
        const imageUrl = getDownloadUrl(record._id);
        return <img src={imageUrl} style={{ maxWidth: '200px' }} />;
      },
    },
    {
      key: 'action',
      render: (text, record, index) => {
        const { imageIds } = operationsWazeefaById;

        const moveDownAction =
          index !== imageIds.length - 1 && imageIds.length > 1 ? (
            <div
              onClick={() => {
                handleMoveDownClicked(record._id);
              }}
            >
              <Tooltip title="Move Down">
                <Icon type="arrow-down" className="list-actions-icon" />
              </Tooltip>
            </div>
          ) : null;

        const moveUpAction =
          index !== 0 && imageIds.length > 1 ? (
            <div
              onClick={() => {
                handleMoveUpClicked(record._id);
              }}
            >
              <Tooltip title="Move Up">
                <Icon type="arrow-up" className="list-actions-icon" />
              </Tooltip>
            </div>
          ) : null;

        const deleteAction = (
          <span>
            <Popconfirm
              title="Are you sure you want to delete this image?"
              onConfirm={() => {
                handleDeleteClicked(record._id);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete">
                <Icon type="delete" className="list-actions-icon" />
              </Tooltip>
            </Popconfirm>
          </span>
        );

        return (
          <div className="list-actions-column">
            {moveDownAction}
            {moveUpAction}
            {deleteAction}
          </div>
        );
      },
    },
  ];

  const getSortedImages = () => {
    const { imageIds, images } = operationsWazeefaById;
    return (imageIds || []).map(imageId =>
      find(images, ({ _id }) => _id === imageId)
    );
  };

  const sortedImages = compact(getSortedImages());

  return (
    <Table
      rowKey="_id"
      dataSource={sortedImages}
      columns={columns}
      bordered
      title={() => (
        <UploadAttachment
          accept="image/*"
          buttonText="Upload Image"
          onUploadFinish={handleImageAdded}
        />
      )}
    />
  );
};

Images.propTypes = {
  wazeefaId: PropTypes.string,
};

export default Images;
