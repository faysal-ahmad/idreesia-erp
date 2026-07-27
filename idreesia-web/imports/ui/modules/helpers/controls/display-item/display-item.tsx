import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'antd';

import { isArray } from 'meteor/idreesia-common/utilities/lodash';

const AntCol = Col as any;
const AntRow = Row as any;
interface Props { label: string; value?: React.ReactNode | React.ReactNode[]; children?: React.ReactNode; labelStyle?: Record<string, unknown>; dataStyle?: Record<string, unknown>; }

const LabelStyle = {
  fontWeight: 'bold',
  fontSize: 20,
};

const DataStyle = {
  fontSize: 20,
};

const DisplayItem = ({ label, value, children, labelStyle, dataStyle }: Props) => (
  <AntRow type="flex" gutter={16}>
    <AntCol order={1}>
      <span style={labelStyle as any}>{label}:</span>
    </AntCol>
    {value ? (
      <AntCol order={2} flex='auto'>
        {isArray(value) ? (
          value.map((val, index) => (
            <AntRow key={index}>
              <div style={dataStyle as any}>{val}</div>
            </AntRow>
          ))
        ) : (
          <div style={dataStyle as any}>{value}</div>
        )}
      </AntCol>
    ) : (
      <AntCol order={2} style={dataStyle as any} flex='auto'>
        {children}
      </AntCol>
    )}
  </AntRow>
);

DisplayItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  children: PropTypes.array,
  labelStyle: PropTypes.object,
  dataStyle: PropTypes.object,
};

DisplayItem.defaultProps = {
  labelStyle: LabelStyle,
  dataStyle: DataStyle,
};

export default DisplayItem;
