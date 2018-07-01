import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Row, Tree, message } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { filter } from 'lodash';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

class InstanceAccess extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    karkunId: PropTypes.string,
    karkunById: PropTypes.object,
    setInstanceAccess: PropTypes.func,
    allPhysicalStores: PropTypes.array,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { karkunById } = nextProps;
    if (karkunById && !prevState.initDone) {
      return {
        initDone: true,
        checkedKeys: karkunById.user.instances,
      };
    }

    return null;
  }

  state = {
    initDone: false,
    expandedKeys: [],
    checkedKeys: [],
  };

  handleSave = e => {
    e.preventDefault();
    const { history, karkunById, setInstanceAccess } = this.props;
    const { checkedKeys } = this.state;
    const instances = filter(checkedKeys, key => !key.startsWith('module-'));

    setInstanceAccess({
      variables: {
        karkunId: karkunById._id,
        karkunUserId: karkunById.userId,
        instances,
      },
    })
      .then(() => {
        history.push(paths.accountsPath);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.accountsPath);
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

  render() {
    const { loading, allPhysicalStores } = this.props;
    if (loading) return null;

    const accessData = [
      {
        title: 'Physical Stores',
        key: 'module-inventory-physical-stores',
        children: allPhysicalStores.map(physicalStore => ({
          title: physicalStore.name,
          key: physicalStore._id,
        })),
      },
    ];

    return (
      <Fragment>
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
        <br />
        <br />
        <Row type="flex" justify="start">
          <Button type="secondary" onClick={this.handleCancel}>
            Cancel
          </Button>
          &nbsp;
          <Button type="primary" onClick={this.handleSave}>
            Save
          </Button>
        </Row>
      </Fragment>
    );
  }
}

const formMutation = gql`
  mutation setInstanceAccess($karkunId: String!, $karkunUserId: String!, $instances: [String]!) {
    setInstanceAccess(karkunId: $karkunId, karkunUserId: $karkunUserId, instances: $instances) {
      _id
      userId
      user {
        _id
        instances
      }
    }
  }
`;

const formQuery = gql`
  query karkunById($_id: String!) {
    karkunById(_id: $_id) {
      _id
      userId
      user {
        _id
        instances
      }
    }
  }
`;

const listQuery = gql`
  query allPhysicalStores {
    allPhysicalStores {
      _id
      name
    }
  }
`;

export default compose(
  graphql(formMutation, {
    name: 'setInstanceAccess',
    options: {
      refetchQueries: ['allkarkunsWithAccounts'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ karkunId }) => ({ variables: { _id: karkunId } }),
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  })
)(InstanceAccess);
