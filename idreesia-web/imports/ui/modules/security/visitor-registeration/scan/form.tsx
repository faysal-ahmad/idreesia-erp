import React, { Fragment, useRef, useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { InputMask } from '@react-input/mask';
import { Button, Divider, Row, Col } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import ScanCnic from '/imports/ui/modules/helpers/controls/cnic/scan-cnic';
import SearchByPicture from '/imports/ui/modules/helpers/controls/picture/search-by-picture';
import SearchResult from './search-result';
import FaceSearchResult from './face-search-result';

type Props = RouteComponentProps;

// One search at a time - starting either kind replaces whatever was on screen, so results can
// never be stale with respect to the inputs above them.
type Search =
  | { kind: 'cnic'; cnicNumbers: string[] }
  | { kind: 'face'; vector: number[] };

const Form = ({ history }: Props) => {
  useBreadcrumbs(['Security', 'Visitor Registration']);

  const manualCnicRef = useRef<HTMLInputElement | null>(null);
  const scanCnicRef = useRef<ScanCnic | null>(null);
  const [search, setSearch] = useState<Search | null>(null);

  const clearCnicInputs = () => {
    if (manualCnicRef.current) {
      manualCnicRef.current.value = '';
    }
    scanCnicRef.current?.resetState();
  };

  const onCnicCaptured = (numbers: string[]) => {
    if (manualCnicRef.current) {
      manualCnicRef.current.value = '';
    }
    if (numbers.length === 0) {
      message.error('CNIC number was not recognized.', 3);
    } else {
      setSearch({ kind: 'cnic', cnicNumbers: numbers });
    }
  };

  const handleManualSearch = () => {
    if (!manualCnicRef.current?.value) return;
    scanCnicRef.current?.resetState();
    setSearch({ kind: 'cnic', cnicNumbers: [manualCnicRef.current.value] });
  };

  // The dialog hands back a vector, never the image - the photo is embedded server-side and
  // discarded, so nothing about the capture is stored.
  const handleVectorComputed = (vector: number[]) => {
    clearCnicInputs();
    setSearch({ kind: 'face', vector });
  };

  const handleNewVisitor = () => {
    history.push(paths.visitorRegistrationNewFormPath);
  };

  let searchResults = null;
  if (search?.kind === 'cnic') {
    searchResults = <SearchResult cnicNumbers={search.cnicNumbers} />;
  } else if (search?.kind === 'face') {
    searchResults = <FaceSearchResult vector={search.vector} />;
  }

  return (
    <Fragment>
      <Row justify="space-between">
        <Col order={1}>
          <Row justify="start" align="middle" gutter={16}>
            <Col order={1}>Manual CNIC</Col>
            <Col order={2}>
              <InputMask
                mask="_____-_______-_"
                replacement={{ _: /\d/ }}
                ref={manualCnicRef}
              />
            </Col>
            <Col order={2}>
              <Button icon={<SearchOutlined />} onClick={handleManualSearch} />
            </Col>
          </Row>
          <Divider />
          <ScanCnic
            onCnicCaptured={onCnicCaptured}
            ref={scanCnicRef}
          />
          <Divider />
          <Row justify="start" align="middle" gutter={16}>
            <Col order={1}>Search by Picture</Col>
            <Col order={2}>
              <SearchByPicture onVectorComputed={handleVectorComputed} />
            </Col>
          </Row>
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
      {/* Plain block, not a Row - ResultGrid renders its own Row/Col grid. */}
      <div className="visitor-result-grid">{searchResults}</div>
    </Fragment>
  );
};

export default Form;
