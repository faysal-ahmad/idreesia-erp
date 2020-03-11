import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Button, Col, Divider, Row } from '/imports/ui/controls';

const WazeefaPreview = ({ images }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const imageUrl = getDownloadUrl(images[selectedIndex]._id);
  const navigationRow =
    images.length > 1 ? (
      <Row type="flex" justify="center" gutter={10}>
        <Col>
          <Button
            type="secondary"
            shape="circle"
            size="large"
            icon="caret-left"
            disabled={selectedIndex === 0}
            onClick={() => {
              setSelectedIndex(selectedIndex - 1);
            }}
          />
        </Col>
        <Col>
          <Button
            type="secondary"
            shape="circle"
            size="large"
            icon="caret-right"
            disabled={selectedIndex === images.length - 1}
            onClick={() => {
              setSelectedIndex(selectedIndex + 1);
            }}
          />
        </Col>
      </Row>
    ) : null;

  const divider = images.length > 1 ? <Divider /> : null;

  return (
    <div>
      {navigationRow}
      {divider}
      <img src={imageUrl} style={{ maxWidth: '450px' }} />
    </div>
  );
};

WazeefaPreview.propTypes = {
  images: PropTypes.array,
};

export default WazeefaPreview;
