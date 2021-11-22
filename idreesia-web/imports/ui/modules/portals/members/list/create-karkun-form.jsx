import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/react-hooks';

import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { find } from 'meteor/idreesia-common/utilities/lodash';
import { Button, Col, Divider, Row } from 'antd';
import { SearchResultRow } from '/imports/ui/modules/helpers/controls';

import { FIND_PORTAL_KARKUN_BY_CNIC_OR_CONTACT_NUMBER } from '../gql';

const ErrorStatusStyle = {
  color: 'red',
  fontSize: 20,
};

const WarningStatusStyle = {
  color: 'orange',
  fontSize: 20,
};

const SuccessStatusStyle = {
  color: 'green',
  fontSize: 20,
};

const CreateKarkunForm = ({
  portalId,
  portalCities,
  cnicNumber,
  contactNumber,
  handleCreate,
  handleLink,
  handleCancel,
}) => {
  const { data, loading } = useQuery(
    FIND_PORTAL_KARKUN_BY_CNIC_OR_CONTACT_NUMBER,
    {
      variables: {
        portalId,
        cnicNumber,
        contactNumber,
      },
    }
  );

  if (loading) return null;
  const karkun = data.findPortalKarkunByCnicOrContactNumber;

  if (karkun) {
    // Check if the found karkun is in the current portal or not.
    const karkunCity = find(
      portalCities,
      portalCity => portalCity._id === karkun.cityId
    );

    const url = karkun.imageId ? getDownloadUrl(karkun.imageId) : null;
    const imageNode = url ? <img src={url} style={{ width: '200px' }} /> : null;

    if (karkunCity) {
      return (
        <>
          <span style={WarningStatusStyle}>
            A karkun with this CNIC/Contact Number already exists. Do you want
            to link to this Karkun?
          </span>
          <Row type="flex" gutter={16}>
            <Col order={1}>{imageNode}</Col>
            <Col order={2}>
              <SearchResultRow label="Name" text={karkun.name} />
              <SearchResultRow label="CNIC" text={karkun.cnicNumber} />
              <SearchResultRow
                label="Mobile No."
                text={karkun.contactNumber1}
              />
              <SearchResultRow label="Mehfil" text={karkun?.cityMehfil?.name} />
              <SearchResultRow label="City" text={karkun?.city?.name} />
            </Col>
          </Row>
          <Divider />
          <Row type="flex" justify="end">
            <Button type="default" size="large" onClick={handleCancel}>
              Cancel
            </Button>
            &nbsp; &nbsp;
            <Button
              type="primary"
              size="large"
              onClick={() => {
                handleLink(karkun._id);
              }}
            >
              Link Karkun
            </Button>
          </Row>
        </>
      );
    }

    return (
      <>
        <span style={ErrorStatusStyle}>
          A karkun with this CNIC/Contact Number already exists in another
          Portal. Contact the system administrator to move that Karkun into this
          Portal.
        </span>
        <Row type="flex" gutter={16}>
          <Col order={1}>{imageNode}</Col>
          <Col order={2}>
            <SearchResultRow label="Name" text={karkun.name} />
            <SearchResultRow label="CNIC" text={karkun.cnicNumber} />
            <SearchResultRow label="Mobile No." text={karkun.contactNumber1} />
            <SearchResultRow label="Mehfil" text={karkun?.cityMehfil?.name} />
            <SearchResultRow label="City" text={karkun?.city?.name} />
          </Col>
        </Row>
        <Divider />
        <Row type="flex" justify="end">
          <Button type="default" size="large" onClick={handleCancel}>
            Cancel
          </Button>
        </Row>
      </>
    );
  }

  return (
    <>
      <span style={SuccessStatusStyle}>
        No existing karkun found for this member. Click &apos;Create&apos; to
        create a new Karkun.
      </span>
      <Divider />
      <Row type="flex" justify="end">
        <Button type="default" size="large" onClick={handleCancel}>
          Cancel
        </Button>
        &nbsp; &nbsp;
        <Button type="primary" size="large" onClick={handleCreate}>
          Create Karkun
        </Button>
      </Row>
    </>
  );
};

CreateKarkunForm.propTypes = {
  portalId: PropTypes.string,
  portalCities: PropTypes.array,
  cnicNumber: PropTypes.string,
  contactNumber: PropTypes.string,
  handleCreate: PropTypes.func,
  handleLink: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default CreateKarkunForm;
