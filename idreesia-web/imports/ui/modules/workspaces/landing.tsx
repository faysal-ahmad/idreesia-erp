import React from 'react';
import { Empty, Flex, Spin } from 'antd';

import { useMyCommittees } from './hooks/use-my-committees';

const Landing = () => {
  const { committees, loading } = useMyCommittees();

  return (
    <Flex justify="center" align="center" style={{ minHeight: 240 }}>
      {loading ? (
        <Spin />
      ) : (
        <Empty
          description={
            committees.length > 0
              ? 'Select a committee from the sidebar.'
              : 'You are not a member of any committee.'
          }
        />
      )}
    </Flex>
  );
};

export default Landing;
