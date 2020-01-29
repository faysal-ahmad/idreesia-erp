import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { filter, flowRight } from 'lodash';

import { Tree } from '/imports/ui/controls';

class InstanceSelection extends Component {
  static propTypes = {
    securityEntity: PropTypes.object,
    companiesListLoading: PropTypes.bool,
    allCompanies: PropTypes.array,
    physicalStoresListLoading: PropTypes.bool,
    allPhysicalStores: PropTypes.array,
    portalsListLoading: PropTypes.bool,
    allPortals: PropTypes.array,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { securityEntity } = nextProps;
    if (securityEntity && !prevState.initDone) {
      return {
        initDone: true,
        checkedKeys: securityEntity.instances,
      };
    }

    return null;
  }

  state = {
    initDone: false,
    expandedKeys: [],
    checkedKeys: [],
  };

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  onCheck = checkedKeys => {
    this.setState({ checkedKeys });
  };

  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <Tree.TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }

      return <Tree.TreeNode {...item} />;
    });

  getSelectedInstances = () => {
    const { checkedKeys } = this.state;
    const instances = filter(checkedKeys, key => !key.startsWith('module-'));
    return instances;
  };

  render() {
    const {
      physicalStoresListLoading,
      allPhysicalStores,
      companiesListLoading,
      allCompanies,
      portalsListLoading,
      allPortals,
    } = this.props;
    if (physicalStoresListLoading || companiesListLoading || portalsListLoading)
      return null;

    const accessData = [
      {
        title: 'Physical Stores',
        key: 'module-inventory-physical-stores',
        children: allPhysicalStores.map(physicalStore => ({
          title: physicalStore.name,
          key: physicalStore._id,
        })),
      },
      {
        title: 'Companies',
        key: 'module-accounts-companies',
        children: allCompanies.map(company => ({
          title: company.name,
          key: company._id,
        })),
      },
      {
        title: 'Portals',
        key: 'module-portals',
        children: allPortals.map(portal => ({
          title: portal.name,
          key: portal._id,
        })),
      },
    ];

    return (
      <Tree
        checkable
        onExpand={this.onExpand}
        expandedKeys={this.state.expandedKeys}
        autoExpandParent={this.state.autoExpandParent}
        onCheck={this.onCheck}
        checkedKeys={this.state.checkedKeys}
      >
        {this.renderTreeNodes(accessData)}
      </Tree>
    );
  }
}

const physicalStoresListQuery = gql`
  query allPhysicalStores {
    allPhysicalStores {
      _id
      name
    }
  }
`;

const companiesListQuery = gql`
  query allCompanies {
    allCompanies {
      _id
      name
    }
  }
`;

const portalsListQuery = gql`
  query allPortals {
    allPortals {
      _id
      name
    }
  }
`;

export default flowRight(
  graphql(physicalStoresListQuery, {
    props: ({ data }) => ({ physicalStoresListLoading: data.loading, ...data }),
  }),
  graphql(companiesListQuery, {
    props: ({ data }) => ({ companiesListLoading: data.loading, ...data }),
  }),
  graphql(portalsListQuery, {
    props: ({ data }) => ({ portalsListLoading: data.loading, ...data }),
  })
)(InstanceSelection);
