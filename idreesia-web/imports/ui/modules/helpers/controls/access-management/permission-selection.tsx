import React, { forwardRef, useEffect, useImperativeHandle, useState, type Key } from 'react';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';

import { filter } from 'meteor/idreesia-common/utilities/lodash';

import { AllModulePermissions } from './all-module-permissions';

type TreeKey = Key;

interface SecurityEntity {
  permissions?: TreeKey[];
}

interface Props {
  permissions?: DataNode[];
  securityEntity?: SecurityEntity | null;
  onChange?(permissions: TreeKey[]): void;
  readOnly?: boolean;
}

export interface PermissionSelectionHandle {
  getSelectedPermissions(): string[];
}

const PermissionSelection = forwardRef<PermissionSelectionHandle, Props>(({
  permissions = AllModulePermissions,
  securityEntity,
  onChange,
  readOnly = false,
}: Props, ref) => {
  const [initDone, setInitDone] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<TreeKey[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<TreeKey[]>([]);

  useEffect(() => {
    if (securityEntity && !initDone) {
      setInitDone(true);
      setCheckedKeys(securityEntity.permissions ?? []);
      setExpandedKeys(securityEntity.permissions ?? []);
    }
  }, [securityEntity, initDone]);

  useImperativeHandle(ref, () => ({
    getSelectedPermissions: () =>
      filter(checkedKeys, (key: TreeKey) => !String(key).startsWith('module-')).map(
        String
      ),
  }), [checkedKeys]);

  const onExpand = (keys: TreeKey[]) => {
    setExpandedKeys(keys);
  };

  const onCheck = (keys: TreeKey[] | { checked: TreeKey[]; halfChecked: TreeKey[] }) => {
    const selectedKeys = Array.isArray(keys) ? keys : keys.checked;
    if (!readOnly) {
      setCheckedKeys(selectedKeys);
      const selectedPermissions = filter(selectedKeys, (key: TreeKey) => !String(key).startsWith('module-'));
      onChange?.(selectedPermissions);
    }
  };

  return (
    <Tree
      checkable
      autoExpandParent
      onExpand={onExpand}
      expandedKeys={expandedKeys}
      onCheck={onCheck}
      checkedKeys={checkedKeys}
      treeData={permissions}
    />
  );
});

export default PermissionSelection;
