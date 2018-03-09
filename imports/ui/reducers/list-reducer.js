import { ActionNames } from '../constants';

export function listData(previousValue, action) {
  let newValue;
  if (!previousValue) newValue = {};
  else newValue = Object.assign({}, previousValue);

  if (action.type === ActionNames.UPDATE_LIST_DATA) {
    const { listName, pageNumber, itemsCount, filterCriteria, result } = action;
    listData = Object.assign({}, newValue[listName]);
    listData.listName = listName;
    listData.pageNumber = pageNumber;
    listData.itemsCount = itemsCount;
    listData.filterCriteria = filterCriteria;
    listData.data = result.data;
    listData.pageCount = result.pageCount;

    newValue[listName] = listData;
  }

  return newValue;
}
