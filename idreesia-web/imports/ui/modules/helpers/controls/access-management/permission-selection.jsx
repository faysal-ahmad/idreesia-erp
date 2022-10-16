import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tree } from 'antd';

import { filter } from 'meteor/idreesia-common/utilities/lodash';

import { AllModulePermissions } from './all-module-permissions';

const PermissionSelection = ({ permissions, securityEntity, onChange, readOnly }) => {
  const [initDone, setInitDone] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);

  useEffect(() => {
    if (securityEntity && !initDone) {
      setInitDone(true);
      setCheckedKeys(securityEntity.permissions);
      setExpandedKeys(securityEntity.permissions);
    }
  }, [securityEntity]);

  const onExpand = keys => {
    setExpandedKeys(keys);
  };

  const onCheck = keys => {
    if (!readOnly) {
      setCheckedKeys(keys);
      const selectedPermissions = filter(keys, key => !key.startsWith('module-'));
      onChange(selectedPermissions);
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
}

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