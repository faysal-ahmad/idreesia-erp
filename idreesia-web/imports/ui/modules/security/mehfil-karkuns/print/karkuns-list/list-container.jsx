import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithDynamicBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import {
  WithMehfilId,
  WithMehfil,
} from '/imports/ui/modules/security/common/composers';

import { List } from './list';
import { MEHFIL_KARKUNS_BY_IDS } from '../../gql'

const ControlsContainer = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  width: '100%',
};

const ListContainer = ({ queryParams: { ids }, history }) => {
  const listRef = useRef(null);
  const { data, loading } = useQuery(MEHFIL_KARKUNS_BY_IDS, {
    variables: { ids },
  });

  if (loading) return null;

  return (
    <>
      <div style={ControlsContainer}>
        <div>
          <ReactToPrint
            content={() => listRef.current}
            trigger={() => (
              <Button size="large" type="primary" icon={<PrinterOutlined />}>
                Print List
              </Button>
            )}
          />
          &nbsp;&nbsp;
          <Button
            size="large"
            type="primary"
            onClick={() => {
              history.goBack();
            }}
          >
            Back
          </Button>
        </div>
      </div>
      <Divider />
      <List
        ref={listRef}
        karkuns={data.mehfilKarkunsByIds}
      />
    </>
  );
};

ListContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  queryParams: PropTypes.object,
};

export const MehfilKarkunsPrintList = flowRight(
  WithQueryParams(),
  WithMehfilId(),
  WithMehfil(),
  WithDynamicBreadcrumbs(({ mehfil }) => {
    if (mehfil) {
      return `Security, Mehfils, ${mehfil.name}, Print Karkun List`;
    }
    return `Security, Mehfils, Print Karkun List`;
  })
)(ListContainer);
