import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Row, Col, message } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import PictureForm from './picture-form';

class ProfilePicture extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    karkunId: PropTypes.string,
    karkunById: PropTypes.object,
    setProfilePicture: PropTypes.func,
  };

  state = {
    showForm: false,
  };

  pictureForm;

  updatePhoto = () => {
    this.setState({ showForm: true });
  };

  handlePictureFormCancelled = () => {
    this.setState({ showForm: false });
  };

  handlePictureFormSaved = () => {
    const { karkunId, setProfilePicture } = this.props;
    const profilePicture = this.pictureForm.state.imageSrc;
    this.setState({ showForm: false });
    setProfilePicture({
      variables: {
        _id: karkunId,
        profilePicture,
      },
    }).catch(error => {
      message.error(error.message, 5);
    });
  };

  render() {
    const { showForm } = this.state;
    const { loading, karkunById } = this.props;
    if (loading) return null;

    return (
      <Fragment>
        <Row>
          <Col span={16}>
            <img src={karkunById.profilePicture} />
          </Col>
        </Row>
        <br />
        <Row>
          <Col span={16}>
            <Button type="secondary" onClick={this.updatePhoto}>
              Update photo
            </Button>
          </Col>
        </Row>

        <Modal
          visible={showForm}
          title="Take Photo"
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
  query karkunById($_id: String!) {
    karkunById(_id: $_id) {
      _id
      profilePicture
    }
  }
`;

const formMutation = gql`
  mutation setProfilePicture($_id: String!, $profilePicture: String!) {
    setProfilePicture(_id: $_id, profilePicture: $profilePicture) {
      _id
      profilePicture
    }
  }
`;

export default compose(
  graphql(formMutation, {
    name: 'setProfilePicture',
    options: {
      refetchQueries: ['allKarkuns'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  })
)(ProfilePicture);
