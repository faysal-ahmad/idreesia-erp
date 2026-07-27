import React, { Fragment, useRef } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Row, message } from 'antd';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithAllPhysicalStores } from 'meteor/idreesia-common/composers/admin';

import { InstanceSelection } from '/imports/ui/modules/helpers/controls';

import { USER_BY_ID, SET_INSTANCE_ACCESS } from '../gql';

const ReactFragment = Fragment as any;
const AntButton = Button as any;
const AntRow = Row as any;
const AntCloseCircleOutlined = CloseCircleOutlined as any;
const AntSaveOutlined = SaveOutlined as any;
const InstanceSelectionControl = InstanceSelection as any;
type AnyRecord = Record<string, any>;
interface HistoryLike { goBack(): void; }
interface QueryData { userById?: AnyRecord | null; }
interface Props extends Record<string, any> { userId?: string | null; history: HistoryLike; allPhysicalStoresLoading?: boolean; allPhysicalStores?: AnyRecord[]; }

const InstanceAccess = ({
  userId,
  history,
  allPhysicalStoresLoading,
  allPhysicalStores,
}: Props) => {
  const instanceSelection = useRef<any>(null);
  const { data, loading: userLoading } = useQuery(USER_BY_ID as any, {
    variables: { _id: userId },
  });
  const [setInstanceAccess] = useMutation(SET_INSTANCE_ACCESS as any, {
    refetchQueries: ['pagedUser'],
  });
  const { userById } = (data ?? {}) as QueryData;

  const handleSave = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const instances = instanceSelection.current?.getSelectedInstances() ?? [];

    setInstanceAccess({
      variables: {
        userId: userById?._id,
        instances,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch((error: Error) => {
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
    <ReactFragment>
      <InstanceSelectionControl
        securityEntity={userById}
        allPhysicalStores={allPhysicalStores}
        ref={instanceSelection}
      />
      <br />
      <br />
      <AntRow type="flex" justify="start">
        <AntButton
          size="large"
          icon={<AntCloseCircleOutlined />}
          type="default"
          onClick={handleCancel}
        >
          Cancel
        </AntButton>
        &nbsp;
        <AntButton
          size="large"
          icon={<AntSaveOutlined />}
          type="primary"
          onClick={handleSave}
        >
          Save
        </AntButton>
      </AntRow>
    </ReactFragment>
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
)(InstanceAccess as any);
