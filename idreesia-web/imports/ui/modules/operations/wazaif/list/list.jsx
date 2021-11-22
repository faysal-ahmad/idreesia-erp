import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { Button, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import { WazaifList, WazaifListFilter } from '/imports/ui/modules/common';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';

import { PAGED_OPERATIONS_WAZAIF, DELETE_OPERATIONS_WAZEEFA } from '../gql';

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
    paramNames: ['name', 'pageIndex', 'pageSize'],
  });

  const [deleteOperationsWzeefa] = useMutation(DELETE_OPERATIONS_WAZEEFA);
  const { data, refetch } = useQuery(PAGED_OPERATIONS_WAZAIF, {
    variables: { filter: queryParams },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Operations', 'Wazaif', 'List']));
  }, [location]);

  const { name, pageIndex, pageSize } = queryParams;

  const handleSelectItem = wazeefa => {
    history.push(paths.wazaifEditFormPath(wazeefa._id));
  };

  const handleDeleteItem = record => {
    deleteOperationsWzeefa({
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
          icon={<PlusCircleOutlined />}
          size="large"
          onClick={handleNewClicked}
        >
          New Wazeefa
        </Button>
      </div>
      <div className="list-table-header-section">
        <WazaifListFilter
          name={name}
          setPageParams={setPageParams}
          refreshData={refetch}
        />
      </div>
    </div>
  );

  const pagedOperationsWazaif = data
    ? data.pagedOperationsWazaif
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
        pagedData={pagedOperationsWazaif}
      />
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
