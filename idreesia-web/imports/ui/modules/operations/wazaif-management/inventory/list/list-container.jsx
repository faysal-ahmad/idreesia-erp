import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { Button, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';

import { WazaifListFilter } from '/imports/ui/modules/common';
import { OperationsSubModulePaths as paths } from '/imports/ui/modules/operations';

import WazaifList from './list';
import { PAGED_OPERATIONS_WAZAIF, DELETE_OPERATIONS_WAZEEFA, SET_OPERATIONS_WAZEEFA_STOCK_LEVEL } from '../gql';

const ButtonGroupStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
};

const ListContainer = ({ history, location }) => {
  const dispatch = useDispatch();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['name', 'pageIndex', 'pageSize'],
  });

  const [deleteOperationsWzeefa] = useMutation(DELETE_OPERATIONS_WAZEEFA);
  const [setOperationsWazeefaStockLevel] = useMutation(SET_OPERATIONS_WAZEEFA_STOCK_LEVEL);
   const { data, refetch } = useQuery(PAGED_OPERATIONS_WAZAIF, {
    variables: { filter: queryParams },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Operations', 'Wazaif Management', 'Inventory']));
  }, [location]);

  const { name, pageIndex, pageSize } = queryParams;

  const handleSelectItem = wazeefa => {
    history.push(paths.wazaifInventoryEditFormPath(wazeefa._id));
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
    history.push(paths.wazaifInventoryNewFormPath);
  };

  const handleSetStockLevel = (wazeefaId, currentStockLevel, adjustmentReason) => setOperationsWazeefaStockLevel({
      variables: {
        _id: wazeefaId,
        currentStockLevel,
        adjustmentReason,
      },
    })
      .then(() => {
        refetch();
      })
      .catch(error => {
        message.error(error.message, 5);
      });

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
    <WazaifList
      listHeader={getTableHeader}
      handleSelectItem={handleSelectItem}
      handleDeleteItem={handleDeleteItem}
      handleSetStockLevel={handleSetStockLevel}
      setPageParams={setPageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={pagedOperationsWazaif}
    />
  );
};

ListContainer.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default ListContainer;
