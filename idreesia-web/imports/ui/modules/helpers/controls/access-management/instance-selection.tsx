import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type Key,
} from 'react';
import { Tree } from 'antd';

import { filter } from 'meteor/idreesia-common/utilities/lodash';

type TreeKey = Key;

interface SecurityEntity {
  instances?: Array<string | null> | null;
}

interface PhysicalStore {
  _id: string;
  name: string;
}

interface TreeDataItem {
  title: string;
  key: string;
  children?: TreeDataItem[];
}

interface Props {
  securityEntity?: SecurityEntity | null;
  allPhysicalStores?: PhysicalStore[];
}

export interface InstanceSelectionHandle {
  getSelectedInstances(): string[];
}

const InstanceSelection = forwardRef<InstanceSelectionHandle, Props>(
  ({ securityEntity, allPhysicalStores }, ref) => {
    const [initDone, setInitDone] = useState(false);
    const [expandedKeys, setExpandedKeys] = useState<TreeKey[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<TreeKey[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState<boolean | undefined>();

    useEffect(() => {
      if (securityEntity && !initDone) {
        setInitDone(true);
        setCheckedKeys(
          (securityEntity.instances ?? []).filter(
            (instance): instance is string => instance != null
          )
        );
      }
    }, [securityEntity, initDone]);

    useImperativeHandle(
      ref,
      () => ({
        getSelectedInstances: () =>
          filter(checkedKeys, (key: TreeKey) => !String(key).startsWith('module-')).map(
            String
          ),
      }),
      [checkedKeys]
    );

    const onExpand = (keys: TreeKey[]) => {
      setExpandedKeys(keys);
      setAutoExpandParent(false);
    };

    const onCheck = (
      keys: TreeKey[] | { checked: TreeKey[]; halfChecked: TreeKey[] }
    ) => {
      const selectedKeys = Array.isArray(keys) ? keys : keys.checked;
      setCheckedKeys(selectedKeys);
    };

    const renderTreeNodes = (data: TreeDataItem[]): React.ReactNode[] =>
      data.map((item) => {
        if (item.children) {
          return (
            <Tree.TreeNode title={item.title} key={item.key}>
              {renderTreeNodes(item.children)}
            </Tree.TreeNode>
          );
        }

        return <Tree.TreeNode title={item.title} key={item.key} />;
      });

    const accessData = [
      {
        title: 'Physical Stores',
        key: 'module-inventory-physical-stores',
        children: (allPhysicalStores ?? []).map((physicalStore) => ({
          title: physicalStore.name,
          key: physicalStore._id,
        })),
      },
    ];

    return (
      <Tree
        checkable
        onExpand={onExpand}
        expandedKeys={expandedKeys}
        autoExpandParent={autoExpandParent}
        onCheck={onCheck}
        checkedKeys={checkedKeys}
      >
        {renderTreeNodes(accessData)}
      </Tree>
    );
  }
);

export default InstanceSelection;
