import { Dispatch } from 'react-redux';

import { ActionNames } from '../constants';

class ListActionsCreator {
  // ********************************************************************************************
  // Sync Action Creators
  // ********************************************************************************************
  updateListData({ listName, pageNumber, itemsCount, filterCriteria, result }) {
    return {
      type: ActionNames.UPDATE_LIST_DATA,
      listName,
      pageNumber,
      itemsCount,
      filterCriteria,
      result
    };
  }

  // ********************************************************************************************
  // Async Action Creators
  // ********************************************************************************************
  setListParams({ listName, pageNumber, itemsCount, filterCriteria, finderMethod }) {
    return (dispatch, getState) => {
      finderMethod.call(
        {
          pageNumber,
          itemsCount,
          filterCriteria
        },
        (error, result) => {
          if (error) {
            console.log(error);
            return;
          }

          dispatch(
            this.updateListData({
              listName,
              pageNumber,
              itemsCount,
              filterCriteria,
              result
            })
          );
        }
      );
    };
  }
}

export default new ListActionsCreator();
