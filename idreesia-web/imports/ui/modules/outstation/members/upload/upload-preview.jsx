import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircleTwoTone, CloseCircleTwoTone, InfoCircleTwoTone } from '@ant-design/icons';

import {
  Button,
  Table,
  Tooltip,
  notification,
} from '/imports/ui/controls';

const columns = [
  {
    title: 'Name',
    dataIndex: 'Name',
    key: 'name',
    width: 150,
    fixed: 'left',
  },
  {
    title: 'Father Name',
    dataIndex: 'Father Name',
    key: 'fatherName',
    width: 150,
    fixed: 'left',
  },
  {
    title: 'CNIC',
    dataIndex: 'CNIC',
    key: 'cnic',
    width: 150,
    fixed: 'left',
  },
  {
    title: 'Mobile No.',
    dataIndex: 'Mobile No.',
    key: 'mobileNumber',
    width: 150,
    fixed: 'left',
  },
  {
    title: 'Age',
    dataIndex: 'Age',
    width: 100,
    key: 'age',
  },
  {
    title: 'Arsa Ehad',
    dataIndex: 'Arsa Ehad',
    width: 100,
    key: 'arsaEhad',
  },
  {
    title: 'Ehad Date',
    dataIndex: 'Ehad Date',
    width: 100,
    key: 'ehadDate',
  },
  {
    title: 'Maarfat',
    dataIndex: 'Maarfat',
    width: 150,
    key: 'maarfat',
  },
  {
    key: 'status',
    width: 80,
    fixed: 'right',
    render: (text, record) => {
      let errorsNode = null;
      let importedNode = null;

      const { errors, imported, importMessage } = record;
      if (errors.length > 0) {
        errorsNode = (
          <Tooltip title="Errors">
            <InfoCircleTwoTone
              className="list-actions-icon"
              twoToneColor="red"
              onClick={() => {
                notification.open({
                  message: 'Errors',
                  duration: 5,
                  description: (
                    <ul>
                      {errors.map(e => (
                        <li>{e}</li>
                      ))}
                    </ul>
                  ),
                });
              }}
            />
          </Tooltip>
        );
      } else if (imported === true) {
        importedNode = (
          <Tooltip title={importMessage}>
            <CheckCircleTwoTone
              className="list-actions-icon"
              twoToneColor="green"
            />
          </Tooltip>
        );
      } else if (imported === false) {
        importedNode = (
          <Tooltip title={importMessage}>
            <CloseCircleTwoTone
              className="list-actions-icon"
              twoToneColor="red"
            />
          </Tooltip>
        );
      }

      return (
        <div className="list-actions-column">
          {errorsNode}
          {importedNode}
        </div>
      );
    },
  },
];

const UploadPreview = ({
  importing,
  data,
  handleCancel,
  handleStartImport,
}) => {
  const getTableHeader = () => (
    <div className="list-table-header">
      <div>
        <Button
          size="large"
          type="primary"
          icon="import"
          disabled={importing}
          onClick={handleStartImport}
        >
          Start Import
        </Button>
        &nbsp;&nbsp;
        <Button
          size="large"
          type="default"
          icon="close-circle"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <Table
      rowKey="_id"
      size="small"
      columns={columns}
      dataSource={data}
      pagination={false}
      title={getTableHeader}
      scroll={{ x: 1000 }}
      bordered
    />
  );
};

UploadPreview.propTypes = {
  importing: PropTypes.bool,
  data: PropTypes.array,
  handleCancel: PropTypes.func,
  handleStartImport: PropTypes.func,
};

export default UploadPreview;
