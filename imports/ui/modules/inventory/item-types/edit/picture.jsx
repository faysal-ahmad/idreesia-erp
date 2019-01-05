import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Modal, Row, Col, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { UploadAttachment } from "/imports/ui/modules/helpers/controls";
import PictureForm from "./picture-form";

class Picture extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    itemTypeId: PropTypes.string,
    itemTypeById: PropTypes.object,
    setItemTypeImage: PropTypes.func,
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

  /*
  handlePictureFormSaved = () => {
    const { itemTypeId, setItemTypeImage } = this.props;
    const picture = this.pictureForm.state.imageSrc;
    this.setState({ showForm: false });
    setPicture({
      variables: {
        _id: itemTypeId,
        picture,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };
*/

  handleImageUploaded = attachmentId => {
    const { itemTypeId, setItemTypeImage } = this.props;
    setItemTypeImage({
      variables: {
        _id: itemTypeId,
        attachmentId,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { showForm } = this.state;
    const { loading, itemTypeById } = this.props;
    if (loading) return null;
    const url = itemTypeById.imageId
      ? `${Meteor.absoluteUrl()}download-file?attachmentId=${
          itemTypeById.imageId
        }`
      : null;

    return (
      <Fragment>
        <Row>
          <Col span={16}>
            <img style={{ "max-width": "400px" }} src={url} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col span={16}>
            <UploadAttachment onUploadFinish={this.handleImageUploaded} />
            <Button type="default" onClick={this.updatePicture}>
              <Icon type="instagram" />Take Picture
            </Button>
          </Col>
        </Row>

        <Modal
          visible={showForm}
          title="Take Picture"
          okText="Save"
          width={400}
          destroyOnClose
          onOk={this.handlePictureFormSaved}
          onCancel={this.handlePictureFormCancelled}
        >
          <PictureForm
            ref={f => {
              this.pictureForm = f;
            }}
          />
        </Modal>
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
  mutation setItemTypeImage($_id: String!, $attachmentId: String!) {
    setItemTypeImage(_id: $_id, attachmentId: $attachmentId) {
      _id
      imageId
    }
  }
`;

/*
const formMutation = gql`
  mutation setPicture($_id: String!, $picture: String!) {
    setPicture(_id: $_id, picture: $picture) {
      _id
      picture
    }
  }
`;
*/

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
