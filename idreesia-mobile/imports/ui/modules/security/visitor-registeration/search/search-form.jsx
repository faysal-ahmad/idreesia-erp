import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { createForm, formShape } from 'rc-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEraser } from '@fortawesome/free-solid-svg-icons/faEraser';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  Button,
  InputItemField,
  Flex,
  List,
  WhiteSpace,
  WingBlank,
} from '/imports/ui/controls';
import { SecuritySubModulePaths } from '/imports/ui/modules/security';

import SearchResult from './search-result';

const RowStyle = { padding: '10px' };
const IconStyle = { fontSize: 20, margin: 0 };
const ButtonStyle = { width: '50px' };
const ButtonsContainer = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-end',
  alignItems: 'center',
  width: '100%',
};

const SearchForm = ({
  history,
  form: { getFieldDecorator, getFieldError, resetFields, validateFields },
}) => {
  const [cnicNumber, setCnicNumber] = useState(null);
  const [contactNumber, setContactNumber] = useState(null);

  const handleReset = () => {
    resetFields();
  };

  const handleNewRegisteration = () => {
    history.push(SecuritySubModulePaths.visitorRegistrationNewFormPath);
  };

  const handleSearch = () => {
    validateFields((error, { _cnicNumber, _contactNumber }) => {
      if (error) return;

      if (_cnicNumber) {
        const formattedCnicNumber = `${_cnicNumber.slice(
          0,
          5
        )}-${_cnicNumber.slice(5, 12)}-${_cnicNumber.slice(12)}`;
        setCnicNumber(formattedCnicNumber);
      }

      if (_contactNumber) {
        const formattedContactNumber = `${_contactNumber.slice(
          0,
          4
        )}-${_contactNumber.slice(4)}`;
        setContactNumber(formattedContactNumber);
      }
    });
  };

  return (
    <List>
      <InputItemField
        fieldName="_cnicNumber"
        placeholder="CNIC"
        getFieldError={getFieldError}
        getFieldDecorator={getFieldDecorator}
        type="number"
        maxLength={13}
      />
      <InputItemField
        fieldName="_contactNumber"
        placeholder="Mobile No."
        getFieldError={getFieldError}
        getFieldDecorator={getFieldDecorator}
        type="number"
      />
      <WhiteSpace size="lg" />
      <Flex direction="row" justify="between" style={RowStyle}>
        <Flex.Item>
          <Button type="ghost" onClick={handleNewRegisteration}>
            New Registeration
          </Button>
        </Flex.Item>
        <Flex.Item>
          <div style={ButtonsContainer}>
            <WingBlank>
              <Button
                onClick={handleReset}
                style={ButtonStyle}
                icon={<FontAwesomeIcon icon={faEraser} style={IconStyle} />}
              />
            </WingBlank>
            <Button
              type="primary"
              onClick={handleSearch}
              style={ButtonStyle}
              icon={<FontAwesomeIcon icon={faSearch} style={IconStyle} />}
            />
          </div>
        </Flex.Item>
      </Flex>
      <WhiteSpace size="lg" />
      <SearchResult cnicNumber={cnicNumber} contactNumber={contactNumber} />
    </List>
  );
};

SearchForm.propTypes = {
  history: PropTypes.object,
  form: formShape,
};

export default flowRight(
  createForm(),
  WithBreadcrumbs(['Security', 'Search Visitor Registration'])
)(SearchForm);
