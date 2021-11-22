import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Flex, Modal, WhiteSpace } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCameraRetro } from '@fortawesome/free-solid-svg-icons/faCameraRetro';

import PictureModal from './picture-modal';

const ColStyle = { paddingLeft: '10px', paddingRight: '10px' };

export default class PictureControl extends Component {
  static propTypes = {
    error: PropTypes.bool,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };

  state = {
    showModal: false,
  };

  handleClose = imageData => {
    const { onChange } = this.props;
    onChange(imageData);
    this.setState({
      showModal: false,
    });
  };

  render() {
    const { showModal } = this.state;
    const { error, value } = this.props;
    const imageCtrl = value ? <img src={value} /> : null;
    return (
      <Flex direction="column" justify="end" align="end" style={ColStyle}>
        {imageCtrl}
        <WhiteSpace />
        <Button
          type={error ? 'warning' : 'default'}
          icon={
            <FontAwesomeIcon
              icon={faCameraRetro}
              style={{ fontSize: 20, margin: 0 }}
            />
          }
          style={{ width: '60px' }}
          onClick={() => {
            this.setState({
              showModal: true,
            });
          }}
        />
        <Modal popup visible={showModal} animationType="slide-down">
          {showModal ? <PictureModal handleClose={this.handleClose} /> : null}
        </Modal>
      </Flex>
    );
  }
}
