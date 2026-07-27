import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { filter, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Tree } from 'antd';

const AntTree = Tree as any;
type TreeKey = string;
interface SecurityEntity { instances?: TreeKey[]; }
interface PhysicalStore { _id: string; name: string; }
interface TreeDataItem { title: string; key: string; children?: TreeDataItem[]; }
interface Props { securityEntity?: SecurityEntity | null; allPhysicalStores?: PhysicalStore[]; }
interface State { initDone: boolean; expandedKeys: TreeKey[]; checkedKeys: TreeKey[]; autoExpandParent?: boolean; }

class InstanceSelection extends Component<Props, State> {
  static propTypes = {
    securityEntity: PropTypes.object,
    allPhysicalStores: PropTypes.array,
  };

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { securityEntity } = nextProps;
    if (securityEntity && !prevState.initDone) {
      return {
        initDone: true,
        checkedKeys: securityEntity.instances,
      };
    }

    return null;
  }

  state: State = {
    initDone: false,
    expandedKeys: [],
    checkedKeys: [],
  };

  onExpand = (expandedKeys: TreeKey[]) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  onCheck = (checkedKeys: TreeKey[] | { checked: TreeKey[] }) => {
    const selectedKeys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
    this.setState({ checkedKeys: selectedKeys });
  };

  renderTreeNodes = (data: TreeDataItem[]): React.ReactNode[] =>
    data.map((item: TreeDataItem) => {
      if (item.children) {
        return (
          <AntTree.TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </AntTree.TreeNode>
        );
      }

      return <AntTree.TreeNode {...item} />;
    });

  getSelectedInstances = () => {
    const { checkedKeys } = this.state;
    const instances = filter(checkedKeys, (key: TreeKey) => !key.startsWith('module-'));
    return instances;
  };

  render() {
    const { allPhysicalStores } = this.props;

    const accessData = [
      {
        title: 'Physical Stores',
        key: 'module-inventory-physical-stores',
        children: (allPhysicalStores ?? []).map((physicalStore: PhysicalStore) => ({
          title: physicalStore.name,
          key: physicalStore._id,
        })),
      },
    ];

    return (
      <AntTree
        checkable
        onExpand={this.onExpand}
        expandedKeys={this.state.expandedKeys}
        autoExpandParent={this.state.autoExpandParent}
        onCheck={this.onCheck}
        checkedKeys={this.state.checkedKeys}
      >
        {this.renderTreeNodes(accessData)}
      </AntTree>
    );
  }
}

export default flowRight()(InstanceSelection as any);
