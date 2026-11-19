import React from 'react';
import { Empty, Flex, Spin } from 'antd';

import { useMyDutiesAttendanceLocations } from './duties-attendance';
import { useMyCommittees } from './hooks/use-my-committees';

const Landing = () => {
  const { committees, loading: committeesLoading } = useMyCommittees();
  const { locations, loading: locationsLoading } =
    useMyDutiesAttendanceLocations();
  const loading = committeesLoading || locationsLoading;
  const hasWorkspaces =
    committees.length > 0 || locations.some(location => location.hasWorkspace);

  return (
    <Flex justify="center" align="center" style={{ minHeight: 240 }}>
      {loading ? (
        <Spin />
      ) : (
        <Empty
          description={
            hasWorkspaces
              ? 'Select a workspace from the sidebar.'
              : 'You are not a member of any committee or workspace.'
          }
        />
      )}
    </Flex>
  );
};

export default Landing;
