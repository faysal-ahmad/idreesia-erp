import React, { useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Button, Tree } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import {
  useAllOrgLocations,
} from 'meteor/idreesia-common/hooks/admin';

const locationsData = [
  {
    _id: '1',
    name: '381-A',
    type: 'Root',
    parentId: null,
  },
  {
    _id: '2',
    name: 'Pakistan',
    type: 'Country',
    parentId: 1,
  },
  {
    _id: '3',
    name: 'Lahore',
    type: 'City',
    parentId: 2,
  },
  {
    _id: '4',
    name: 'Faisal Town',
    type: 'Mehfil',
    parentId: 3,
  },
];

const List = ({ history, location }) => {
  const [treeData, setTreeData] = useState([]);
  const dispatch = useDispatch();
  const { allOrgLocations, allOrgLocationsLoading } = useAllOrgLocations();

  // Recursively convert the raw flat locations data into
  // the hierarchichal json data that the tree control requires.
  const getChildNodes = (parentId, locationsByParentId) => {
    const treeNodes = [];
    // Get all locations that have the specified parentId
    const childOrgLocations = locationsByParentId[parentId] ?? [];
    childOrgLocations.forEach(childOrgLocation => {
      const treeNode = {
        key: childOrgLocation._id,
        title: childOrgLocation.name,
        children: getChildNodes(childOrgLocation._id, locationsByParentId),
      };

      treeNodes.push(treeNode);
    });

    return treeNodes;
  }

  useEffect(() => {
    dispatch(
      setBreadcrumbs(['Admin', 'Organization Locations', 'List'])
    );

    // Index all the locations by parentId for quick access
    const locationsByParentId = {};
    locationsData.forEach(orgLocation => {
      if (orgLocation.parentId) {
        if (!locationsByParentId[orgLocation.parentId]) {
          locationsByParentId[orgLocation.parentId] = [];
        }
  
        locationsByParentId[orgLocation.parentId].push(orgLocation);
      }
    });

    const updatedTreeData = [];
    // Iterate through the locations once again, and for locations
    // that do not have a parentId, add nodes to the treeData array.
    locationsData.forEach(orgLocation => {
      if (!orgLocation.parentId) {
        const treeNode = {
          key: orgLocation._id,
          title: orgLocation.name,
          children: getChildNodes(orgLocation._id, locationsByParentId),
        };

        updatedTreeData.push(treeNode);
      }
    });

    // Set the updated tree data in state
    setTreeData(updatedTreeData);
  }, []);

  const handleNewClicked = () => { };

  const onDragEnter = (info) => {
    // console.log(info);
    // expandedKeys, set it when controlled is needed
    // setExpandedKeys(info.expandedKeys)
  };

  const onDrop = (info) => { }

  if (allOrgLocationsLoading) return null;

  return (
    <Tree
      className="draggable-tree"
      draggable
      blockNode
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      treeData={treeData}
      title={() => (
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={this.handleNewClicked}
        >
          New Organization Location
        </Button>
      )}
    />
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;