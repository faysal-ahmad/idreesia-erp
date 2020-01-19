import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Flex, Modal, WhiteSpace } from '/imports/ui/controls';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCameraRetro } from '@fortawesome/free-solid-svg-icons/faCameraRetro';

import PictureModal from './picture-modal';

const ColStyle = { paddingLeft: '10px', paddingRight: '10px' };

const PictureControl = ({ value, onChange }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClose = imageData => {
    setShowModal(false);
    onChange(imageData);
  };

  const imageCtrl = value ? <img src={value} /> : null;
  return (
    <Flex direction="column" justify="end" align="end" style={ColStyle}>
      {imageCtrl}
      <WhiteSpace />
      <Button
        icon={<FontAwesomeIcon icon={faCameraRetro} style={{ fontSize: 20 }} />}
        onClick={() => {
          setShowModal(true);
        }}
      />
      <Modal popup visible={showModal} animationType="slide-down">
        {showModal ? <PictureModal handleClose={handleClose} /> : null}
      </Modal>
    </Flex>
  );
};

PictureControl.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default PictureControl;
