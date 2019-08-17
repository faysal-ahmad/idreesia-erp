import { sortBy } from "lodash";

export default function treeify(
  list,
  idAttr = "number",
  parentAttr = "parent",
  childrenAttr = "children"
) {
  const sortedList = sortBy(list, "number");
  const treeList = [];
  const lookup = {};
  sortedList.forEach(obj => {
    lookup[obj[idAttr]] = obj;
    // eslint-disable-next-line no-param-reassign
    obj[childrenAttr] = [];
  });

  sortedList.forEach(obj => {
    if (obj[parentAttr] !== 0) {
      lookup[obj[parentAttr]][childrenAttr].push(obj);
    } else {
      treeList.push(obj);
    }
  });

  sortedList.forEach(obj => {
    if (obj[childrenAttr].length === 0) {
      // eslint-disable-next-line no-param-reassign
      delete obj[childrenAttr];
    }
  });

  return treeList;
}
