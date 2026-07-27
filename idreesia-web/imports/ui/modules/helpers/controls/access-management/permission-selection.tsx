import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import PropTypes from 'prop-types';
import { Tree } from 'antd';

import { filter } from 'meteor/idreesia-common/utilities/lodash';

import { AllModulePermissions } from './all-module-permissions';

const AntTree = Tree as any;
type TreeKey = string;
interface SecurityEntity { permissions?: TreeKey[]; }
interface Props { permissions?: unknown[]; securityEntity?: SecurityEntity | null; onChange?(permissions: TreeKey[]): void; readOnly?: boolean; }
export interface PermissionSelectionHandle { getSelectedPermissions(): TreeKey[]; }

const PermissionSelection = forwardRef<PermissionSelectionHandle, Props>(({ permissions, securityEntity, onChange, readOnly }: Props, ref) => {
  const [initDone, setInitDone] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<TreeKey[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<TreeKey[]>([]);

  useEffect(() => {
    if (securityEntity && !initDone) {
      setInitDone(true);
      setCheckedKeys(securityEntity.permissions ?? []);
      setExpandedKeys(securityEntity.permissions ?? []);
    }
  }, [securityEntity]);

  useImperativeHandle(ref, () => ({
    getSelectedPermissions: () => filter(checkedKeys, (key: TreeKey) => !key.startsWith('module-')),
  }), [checkedKeys]);

  const onExpand = (keys: TreeKey[]) => {
    setExpandedKeys(keys);
  };

  const onCheck = (keys: TreeKey[] | { checked: TreeKey[] }) => {
    const selectedKeys = Array.isArray(keys) ? keys : keys.checked;
    if (!readOnly) {
      setCheckedKeys(selectedKeys);
      const selectedPermissions = filter(selectedKeys, (key: TreeKey) => !key.startsWith('module-'));
      onChange?.(selectedPermissions);
    }
  };
  
  return (
    <AntTree
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

PermissionSelection.propTypes = {
  readOnly: PropTypes.bool,
  permissions: PropTypes.array,
  securityEntity: PropTypes.object,
  onChange: PropTypes.func,
};

PermissionSelection.defaultProps = {
  readOnly: false,
  permissions: AllModulePermissions,
};

export default PermissionSelection;