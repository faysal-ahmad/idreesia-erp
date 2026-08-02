import React, { Fragment, useRef, useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import InputMask from 'react-input-mask';
import { Button, Divider, Row, Col, message } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import ScanCnic from '/imports/ui/modules/helpers/controls/cnic/scan-cnic';
import SearchResult from './search-result';

type Props = RouteComponentProps;

const Form = ({ history }: Props) => {
  useBreadcrumbs(['Security', 'Visitor Registration']);

  const manualCnicRef = useRef<HTMLInputElement | null>(null);
  const scanCnicRef = useRef<ScanCnic | null>(null);
  const [cnicNumbers, setCnicNumbers] = useState<string[]>([]);

  const onCnicCaptured = (numbers: string[]) => {
    if (manualCnicRef.current) {
      manualCnicRef.current.value = '';
    }
    if (numbers.length === 0) {
      message.error('CNIC number was not recognized.', 3);
    } else {
      setCnicNumbers(numbers);
    }
  };

  const handleNewVisitor = () => {
    history.push(paths.visitorRegistrationNewFormPath);
  };

  const searchResults =
    cnicNumbers.length > 0 ? (
      <SearchResult cnicNumbers={cnicNumbers} />
    ) : null;

  return (
    <Fragment>
      <Row justify="space-between">
        <Col order={1}>
          <Row justify="start" align="middle" gutter={16}>
            <Col order={1}>Manual CNIC</Col>
            <Col order={2}>
              <InputMask
                mask="99999-9999999-9"
                ref={manualCnicRef as React.Ref<never>}
              />
            </Col>
            <Col order={2}>
              <Button
                icon={<SearchOutlined />}
                onClick={() => {
                  if (manualCnicRef.current?.value) {
                    scanCnicRef.current?.resetState();
                    setCnicNumbers([manualCnicRef.current.value]);
                  }
                }}
              />
            </Col>
          </Row>
          <Divider />
          <ScanCnic
            onCnicCaptured={onCnicCaptured}
            ref={scanCnicRef}
          />
        </Col>
        <Col order={2}>
          <Button
            size="large"
            icon={<UserAddOutlined />}
            type="primary"
            onClick={handleNewVisitor}
          >
            New Visitor Registration
          </Button>
        </Col>
      </Row>
      <Row>
        <Divider />
      </Row>
      <Row>{searchResults}</Row>
    </Fragment>
  );
};

export default Form;
