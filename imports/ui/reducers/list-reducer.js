import { ActionNames } from '../constants';

export function listData(previousValue, action) {
  let newValue;
  if (!previousValue) newValue = {};
  else newValue = previousValue;

  if (action.type === ActionNames.UPDATE_LIST_DATA) {
    const { listName, pageNumber, itemsCount, filterCriteria, result } = action;
    let listData = Object.assign({}, newValue[listName]);
    if (!listData) {
      listData = {
        listName
      };

      newValue[listName] = listData;
    }

    listData.pageNumber = pageNumber;
    listData.itemsCount = itemsCount;
    listData.filterCriteria = filterCriteria;
    listData.data = result.data;
    listData.pageCount = result.pageCount;
  }

  return newValue;
}
