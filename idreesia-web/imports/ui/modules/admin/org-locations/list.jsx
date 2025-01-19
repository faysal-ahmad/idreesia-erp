import React, { useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { sortBy } from "lodash";
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { Button, Flex, Input, Modal, Splitter, Tree } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useAllOrgLocations } from 'meteor/idreesia-common/hooks/admin';

import { NewForm } from './new';
import { EditForm } from './edit';

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
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [newOrgLocationType, setNewOrgLocationType] = useState();
  const [selectedOrgLocation, setSelectedOrgLocation] = useState();
  const [treeData, setTreeData] = useState([]);
  const dispatch = useDispatch();
  const {
    allOrgLocations,
    allOrgLocationsLoading,
    refetchAllOrgLocations,
  } = useAllOrgLocations();
  
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
  
  const handleCreateLocation = (locationType) => { 
    setNewOrgLocationType(locationType);
    setNewFormOpen(true);
  };

  const handleCreateLocationClose = (refreshData) => {
    setNewOrgLocationType(null);
    setNewFormOpen(false);
    if (refreshData) {
      refetchAllOrgLocations();
    }
  }

  const onSelect = (selectedKeys) => {
    const selectedLocationId = selectedKeys[0];
    const orgLocation = allOrgLocations.find(
      location => location._id === selectedLocationId
    );
 
    setSelectedOrgLocation(orgLocation);
  }

  if (allOrgLocationsLoading) return null;

  return (
    <>
      <Splitter>
        <Splitter.Panel defaultSize="30%" min="30%" max="50%">
          <Flex gap="middle" vertical>
            <Flex gap="middle">
              <Button icon={<SyncOutlined />} size="middle" onClick={() => { refetchAllOrgLocations() }} />
              <Input.Search style={{ width: "100%" }} placeholder="Search" />
            </Flex>
            <Tree
              blockNode
              showLine
              onSelect={onSelect}
              treeData={treeData}
            />
          </Flex>
        </Splitter.Panel>
        <Splitter.Panel>
          {
            selectedOrgLocation ? (
              <EditForm
                orgLocation={selectedOrgLocation}
                onCreateLocation={handleCreateLocation}
              />
            ) : null
          }
        </Splitter.Panel>
      </Splitter>
      <Modal
        title="New Organization Location"
        open={newFormOpen}
        onCancel={() => { handleCreateLocationClose(false) }}
        width={600}
        footer={null}
      >
        <div>
          {
            newFormOpen ? (
              <NewForm
                parentOrgLocation={selectedOrgLocation}
                newOrgLocationType={newOrgLocationType}
                onClose={handleCreateLocationClose}
              />
            ) : null
          }
        </div>
      </Modal>
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;