import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';

import { HR_KARKUNS_BY_ID } from '../../gql';
import KarkunsList from './karkuns-list';

const PrintView = ({ history, location }) => {
  const karkunsList = useRef(null);
  const dispatch = useDispatch();
  const { queryParams } = useQueryParams({ history, location });

  const { data, loading } = useQuery(HR_KARKUNS_BY_ID, {
    variables: {
      _ids: queryParams.karkunIds,
    },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Karkuns', 'Print Karkuns']));
  }, [location]);

  if (loading) return null;

  const { hrKarkunsById } = data;
  return (
    <>
      <ReactToPrint
        content={() => karkunsList.current}
        trigger={() => (
          <Button size="large" type="primary" icon={<PrinterOutlined />}>
            Print Data
          </Button>
        )}
      />
      &nbsp;
      <Button
        size="large"
        type="primary"
        onClick={() => {
          history.goBack();
        }}
      >
        Back
      </Button>
      <Divider />
      <KarkunsList ref={karkunsList} karkuns={hrKarkunsById} />
    </>
  );
};

PrintView.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default PrintView;
