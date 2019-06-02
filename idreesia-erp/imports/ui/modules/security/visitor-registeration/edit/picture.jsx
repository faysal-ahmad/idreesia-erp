import { Meteor } from "meteor/meteor";
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
    visitorId: PropTypes.string,
    visitorById: PropTypes.object,
    setVisitorImage: PropTypes.func,
  };

  updateImageId = imageId => {
    const { visitorId, setVisitorImage } = this.props;
    setVisitorImage({
      variables: {
        _id: visitorId,
        imageId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { loading, visitorById } = this.props;
    if (loading) return null;
    const url = visitorById.imageId
      ? Meteor.absoluteUrl(`download-file?attachmentId=${visitorById.imageId}`)
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
  query visitorById($_id: String!) {
    visitorById(_id: $_id) {
      _id
      imageId
    }
  }
`;

const formMutation = gql`
  mutation setVisitorImage($_id: String!, $imageId: String!) {
    setVisitorImage(_id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default compose(
  graphql(formMutation, {
    name: "setVisitorImage",
    options: {
      refetchQueries: ["pagedVisitors"],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { visitorId } = match.params;
      return { variables: { _id: visitorId } };
    },
  })
)(Picture);
