// @ts-nocheck
import React, { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithAllPhysicalStores } from 'meteor/idreesia-common/composers/admin';

import { InstanceSelection } from '/imports/ui/modules/helpers/controls';

import { USER_BY_ID, SET_INSTANCE_ACCESS } from '../gql';

const InstanceAccess = ({
  userId,
  history,
  allPhysicalStoresLoading,
  allPhysicalStores,
}) => {
  const instanceSelection = useRef(null);
  const { data, loading: userLoading } = useQuery(USER_BY_ID, {
    variables: { _id: userId },
  });
  const [setInstanceAccess] = useMutation(SET_INSTANCE_ACCESS, {
    refetchQueries: ['pagedUser'],
  });
  const { userById } = data || {};

  const handleSave = e => {
    e.preventDefault();
    const instances = instanceSelection.current.getSelectedInstances();

    setInstanceAccess({
      variables: {
        userId: userById._id,
        instances,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleCancel = () => {
    history.goBack();
  };

  if (userLoading || allPhysicalStoresLoading) {
    return null;
  }

  return (
    <Fragment>
      <InstanceSelection
        securityEntity={userById}
        allPhysicalStores={allPhysicalStores}
        ref={instanceSelection}
      />
      <br />
      <br />
      <Row type="flex" justify="start">
        <Button
          size="large"
          icon={<CloseCircleOutlined />}
          type="default"
          onClick={handleCancel}
        >
          Cancel
        </Button>
        &nbsp;
        <Button
          size="large"
          icon={<SaveOutlined />}
          type="primary"
          onClick={handleSave}
        >
          Save
        </Button>
      </Row>
    </Fragment>
  );
};

InstanceAccess.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  userId: PropTypes.string,
  allPhysicalStoresLoading: PropTypes.bool,
  allPhysicalStores: PropTypes.array,
};

export default flowRight(
  WithAllPhysicalStores()
)(InstanceAccess);
