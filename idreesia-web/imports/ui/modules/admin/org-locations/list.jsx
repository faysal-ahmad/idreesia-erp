import React, { useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { sortBy } from "lodash";
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Button, Descriptions, Divider, Dropdown, Flex, Input, Space, Splitter, Tree } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import {
  useAllOrgLocations,
} from 'meteor/idreesia-common/hooks/admin';

const items = [
  {
    key: '1',
    label: 'Country',
  },
  {
    key: '2',
    label: 'City',
  },
  {
    key: '3',
    label: 'Mehfil',
  },
  {
    type: 'divider',
  },
  {
    key: '4',
    label: 'Group',
  },
];

// Helper function to recursively convert the raw flat locations data into
// the hierarchichal json data that the tree control requires.
const getChildNodes = (parentId, locationsByParentId) => {
  const treeNodes = [];
  // Get all locations that have the specified parentId
  let childOrgLocations = locationsByParentId[parentId] ?? [];
  childOrgLocations = sortBy(childOrgLocations, 'name');
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

const List = ({ history, location }) => {
  const [selectedLocation, setSelectedLocation] = useState();
  const [treeData, setTreeData] = useState([]);
  const dispatch = useDispatch();
  const { allOrgLocations, allOrgLocationsLoading } = useAllOrgLocations();
  
  useEffect(() => {
    dispatch(
      setBreadcrumbs(['Admin', 'Organization Locations', 'List'])
    );
  }, []);
  
  useEffect(() => {
    if (allOrgLocationsLoading) return null;

    // Index all the locations by parentId for quick access
    const locationsByParentId = {};
    allOrgLocations.forEach(orgLocation => {
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
    allOrgLocations.forEach(orgLocation => {
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
  }, [allOrgLocations])
  
  const handleNewClicked = () => { };

  const onDragEnter = (info) => {
    // console.log(info);
    // expandedKeys, set it when controlled is needed
    // setExpandedKeys(info.expandedKeys)
  };

  const onDrop = (info) => { }

  const onSelect = (selectedKeys) => {
    const selectedLocationId = selectedKeys[0];
    const location = allOrgLocations.find(
      location => location._id === selectedLocationId
    );

    setSelectedLocation(location);
  }

  if (allOrgLocationsLoading) return null;

  // If there is a selected mehfil location in the tree then
  // create the description node to show in the splitter panel
  let descriptionNode = <div />;
  if (selectedLocation && selectedLocation.type === 'Mehfil') {
    const mehfilDetails = selectedLocation.mehfilDetails ?? {};
    const items = [
      {
        key: '1',
        label: 'LCD Available',
        children: <p>{mehfilDetails.lcdAvailability ? 'Yes' : 'No'}</p>,
      },     
      {
        key: '2',
        label: 'Tab Available',
        children: <p>{mehfilDetails.tabAvailability ? 'Yes' : 'No'}</p>,
      },     
      {
        key: '3',
        label: 'Address',
        children: <p>{mehfilDetails.address}</p>,
      },     
    ]

    descriptionNode = <Descriptions bordered title="Mehfil Details" items={items} />;
  }

  return (
    <>
      <Flex justify='space-between'>
        <Dropdown menu={{ items }}>
          <Button type='primary'>
            <Space>
              New Location
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <Input.Search style={{ width: 300 }} placeholder="Search" />
      </Flex>
      <Divider />
      <Splitter>
        <Splitter.Panel defaultSize="30%" min="30%" max="50%">
          <Tree
            className="draggable-tree"
            draggable
            blockNode
            onDragEnter={onDragEnter}
            onDrop={onDrop}
            onSelect={onSelect}
            treeData={treeData}
            showLine
          />
        </Splitter.Panel>
        <Splitter.Panel>
          <Flex justify="center">
            {descriptionNode}
          </Flex>
        </Splitter.Panel>
      </Splitter>
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;