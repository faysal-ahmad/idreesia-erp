import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Webcam from 'react-webcam';

import { Button, Flex, WhiteSpace } from '/imports/ui/controls';

const RowStyle = { paddingLeft: '10px', paddingRight: '10px' };

const PictureModal = ({ handleClose }) => {
  const [imageData, setImageData] = useState(null);
  const webcam = useRef(null);

  const capture = () => {
    const screenshot = webcam.current.getScreenshot();
    setImageData(screenshot);
  };

  if (imageData) {
    return (
      <div>
        <WhiteSpace size="lg" />
        <img src={imageData} />
        <WhiteSpace size="lg" />
        <Flex direction="row" justify="center" style={RowStyle}>
          <Flex.Item>
            <Button
              type="ghost"
              onClick={() => {
                setImageData(null);
              }}
            >
              Capture another
            </Button>
          </Flex.Item>
          <Flex.Item>
            <Button
              type="primary"
              onClick={() => {
                handleClose(imageData);
              }}
            >
              Close
            </Button>
          </Flex.Item>
        </Flex>
        <WhiteSpace size="lg" />
      </div>
    );
  }

  const videoConstraints = {
    facingMode: { exact: 'environment' },
  };

  return (
    <div>
      <Webcam
        ref={webcam}
        audio={false}
        height={300}
        width={350}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />
      <Flex direction="row" justify="center" style={RowStyle}>
        <Flex.Item>
          <Button type="primary" onClick={capture}>
            Capture photo
          </Button>
        </Flex.Item>
        <Flex.Item>
          <Button type="primary" onClick={handleClose}>
            Close
          </Button>
        </Flex.Item>
      </Flex>
      <WhiteSpace size="lg" />
    </div>
  );
};

PictureModal.propTypes = {
  handleClose: PropTypes.func,
};

export default PictureModal;
