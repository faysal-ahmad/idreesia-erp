import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import { Button, message } from '/imports/ui/controls';
import { WazaifList } from '/imports/ui/modules/common';
import { WazaifManagementSubModulePaths as paths } from '/imports/ui/modules/wazaif-management';

import { PAGED_WAZAIF, DELETE_WAZEEFA } from '../gql';

const ButtonGroupStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
};

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const wazaifList = useRef(null);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['pageIndex', 'pageSize'],
  });

  const [deleteWzeefa] = useMutation(DELETE_WAZEEFA);
  const { data, refetch } = useQuery(PAGED_WAZAIF, {
    variables: { filter: queryParams },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Wazaif Management', 'Wazaif', 'List']));
  }, [location]);

  const { pageIndex, pageSize } = queryParams;

  const handleSelectItem = wazeefa => {
    history.push(paths.wazaifEditFormPath(wazeefa._id));
  };

  const handleDeleteItem = record => {
    deleteWzeefa({
      variables: {
        _id: record._id,
      },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  const handleNewClicked = () => {
    history.push(paths.wazaifNewFormPath);
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div style={ButtonGroupStyle}>
        <Button
          type="primary"
          icon="plus-circle-o"
          size="large"
          onClick={handleNewClicked}
        >
          New Wazeefa
        </Button>
      </div>
    </div>
  );

  const pagedWazaif = data
    ? data.pagedWazaif
    : {
        data: [],
        totalResults: 0,
      };
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <>
      <WazaifList
        ref={wazaifList}
        listHeader={getTableHeader}
        handleSelectItem={handleSelectItem}
        handleDeleteItem={handleDeleteItem}
        setPageParams={setPageParams}
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        pagedData={pagedWazaif}
      />
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
