import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Modal, Row, Col, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import PictureForm from './picture-form';

class Picture extends Component {
  static propTypes = {
    itemTypeId: PropTypes.string,
    itemTypeById: PropTypes.object,
    setPicture: PropTypes.func
  };

  state = {
    showForm: false
  };

  pictureForm;

  updatePicture = () => {
    this.setState({ showForm: true });
  };

  handlePictureFormCancelled = () => {
    this.setState({ showForm: false });
  };

  handlePictureFormSaved = () => {
    const { itemTypeId, setPicture } = this.props;
    const picture = this.pictureForm.state.imageSrc;
    this.setState({ showForm: false });
    setPicture({
      variables: {
        _id: itemTypeId,
        picture
      }
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { showForm, imageSrc } = this.state;
    const { loading, itemTypeById } = this.props;
    if (loading) return null;

    return (
      <Fragment>
        <Row>
          <Col span={16}>
            <img src={itemTypeById.picture} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col span={16}>
            <Button type="secondary" onClick={this.updatePicture}>
              Update Picture
            </Button>
          </Col>
        </Row>

        <Modal
          visible={showForm}
          title="Take Picture"
          okText="Save"
          width={400}
          destroyOnClose={true}
          onOk={this.handlePictureFormSaved}
          onCancel={this.handlePictureFormCancelled}
        >
          <PictureForm ref={f => (this.pictureForm = f)} />
        </Modal>
      </Fragment>
    );
  }
}

const formQuery = gql`
  query itemTypeById($_id: String!) {
    itemTypeById(_id: $_id) {
      _id
      picture
    }
  }
`;

const formMutation = gql`
  mutation setPicture($_id: String!, $picture: String!) {
    setPicture(_id: $_id, picture: $picture) {
      _id
      picture
    }
  }
`;

export default merge(
  graphql(formMutation, {
    name: 'setPicture',
    options: {
      refetchQueries: ['allItemTypes']
    }
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { itemTypeId } = match.params;
      return { variables: { _id: itemTypeId } };
    }
  })
)(Picture);
