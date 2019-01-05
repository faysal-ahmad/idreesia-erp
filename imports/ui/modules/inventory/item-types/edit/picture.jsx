import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Row, Col, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import {
  TakePicture,
  UploadAttachment,
} from "/imports/ui/modules/helpers/controls";

class Picture extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    itemTypeId: PropTypes.string,
    itemTypeById: PropTypes.object,
    setItemTypeImage: PropTypes.func,
  };

  updateImageId = imageId => {
    const { itemTypeId, setItemTypeImage } = this.props;
    setItemTypeImage({
      variables: {
        _id: itemTypeId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { loading, itemTypeById } = this.props;
    if (loading) return null;
    const url = itemTypeById.imageId
      ? `${Meteor.settings.public.graphqlServerUrl}/download-file?attachmentId=${
          itemTypeById.imageId
        }`
      : null;

    return (
      <Fragment>
        <Row>
          <Col span={16}>
            <img style={{ maxWidth: "400px" }} src={url} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col span={16}>
            <UploadAttachment onUploadFinish={this.updateImageId} />
            <TakePicture onPictureTaken={this.updateImageId} />
          </Col>
        </Row>
      </Fragment>
    );
  }
}

const formQuery = gql`
  query itemTypeById($_id: String!) {
    itemTypeById(_id: $_id) {
      _id
      imageId
    }
  }
`;

const formMutation = gql`
  mutation setItemTypeImage($_id: String!, $imageId: String!) {
    setItemTypeImage(_id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default compose(
  graphql(formMutation, {
    name: "setItemTypeImage",
    options: {
      refetchQueries: ["allItemTypes"],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ itemTypeId }) => ({ variables: { _id: itemTypeId } }),
  })
)(Picture);
