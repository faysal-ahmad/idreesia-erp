import React from "react";
import PropTypes from "prop-types";
import { List, Typography } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import moment from "moment";

import { Formats } from "meteor/idreesia-common/constants";

const ListStyle = {
  backgroundColor: "#F0F2F5",
};

const RecordInfo = ({ record, formDataLoading, karkunNames }) => {
  if (formDataLoading || !karkunNames || karkunNames.length === 0) return null;
  const { createdAt, updatedAt } = record;

  const strCreatedAt = createdAt
    ? moment(Number(createdAt)).format(Formats.DATE_TIME_FORMAT)
    : null;
  const strUpdatedAt = updatedAt
    ? moment(Number(updatedAt)).format(Formats.DATE_TIME_FORMAT)
    : null;

  return (
    <List size="small" bordered style={ListStyle}>
      <List.Item>
        <Typography.Text type="secondary">
          {`Created by ${karkunNames[0]} on ${strCreatedAt}`}
        </Typography.Text>
      </List.Item>
      <List.Item>
        <Typography.Text type="secondary">
          {`Updated by ${karkunNames[1]} on ${strUpdatedAt}`}
        </Typography.Text>
      </List.Item>
    </List>
  );
};

RecordInfo.propTypes = {
  record: PropTypes.shape({
    createdAt: PropTypes.string,
    createdBy: PropTypes.string,
    updatedAt: PropTypes.string,
    updatedBy: PropTypes.string,
  }),
  formDataLoading: PropTypes.bool,
  karkunNames: PropTypes.array,
};

const formQuery = gql`
  query karkunNames($ids: [String]) {
    karkunNames(ids: $ids)
  }
`;

export default compose(
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ record }) => ({
      variables: { ids: [record.createdBy, record.updatedBy] },
    }),
  })
)(RecordInfo);
