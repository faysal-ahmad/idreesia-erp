import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tree } from 'antd';

import { filter } from 'meteor/idreesia-common/utilities/lodash';

import { AllModulePermissions } from './all-module-permissions';

const PermissionSelection = ({ permissions, securityEntity, onChange }) => {
  const [initDone, setInitDone] = useState(false);
  const [autoExpandParent, setAutoExpandParent] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);

  useEffect(() => {
    if (securityEntity && !initDone) {
      setInitDone(true);
      setCheckedKeys(securityEntity.permissions);
    }
  }, [securityEntity]);

  const onExpand = keys => {
    setExpandedKeys(keys);
    setAutoExpandParent(false);
  };

  const onCheck = keys => {
    setCheckedKeys(keys);
    const selectedPermissions = filter(keys, key => !key.startsWith('module-'));
    onChange(selectedPermissions);
  };
  
  return (
    <Tree
      checkable
      onExpand={onExpand}
      expandedKeys={expandedKeys}
      autoExpandParent={autoExpandParent}
      onCheck={onCheck}
      checkedKeys={checkedKeys}
      treeData={permissions}
    />
  );
}

PermissionSelection.propTypes = {
  permissions: PropTypes.array,
  securityEntity: PropTypes.object,
  onChange: PropTypes.func,
};

PermissionSelection.defaultProps = {
  permissions: AllModulePermissions,
};

export default PermissionSelection;