import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import ReactToPrint from 'react-to-print';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Button, Checkbox, Divider } from '/imports/ui/controls';

import { HR_KARKUN_BY_ID } from '../../gql';
import { DataInputForm } from './data-input-form';
import { DataDisplayForm } from './data-display-form';

const ControlsContainer = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  width: '100%',
};

class PrintView extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    karkunId: PropTypes.string,
    hrKarkunById: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.printViewRef = React.createRef();
  }

  state = {
    showDataInput: false,
  };

  handleBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  handlePrint = e => {
    e.preventDefault();
  };

  render() {
    const { history, formDataLoading, hrKarkunById } = this.props;
    if (formDataLoading) return null;

    const form = this.state.showDataInput ? (
      <DataInputForm hrKarkunById={hrKarkunById} />
    ) : (
      <DataDisplayForm hrKarkunById={hrKarkunById} />
    );

    return (
      <>
        <div style={ControlsContainer}>
          <div>
            <ReactToPrint
              content={() => this.printViewRef.current}
              trigger={() => (
                <Button size="large" type="primary" icon="printer">
                  Print
                </Button>
              )}
            />
            &nbsp;
            <Button
              size="large"
              type="primary"
              onClick={() => {
                history.goBack();
              }}
            >
              Back
            </Button>
          </div>
          <Checkbox
            checked={this.state.showDataInput}
            onChange={e => this.setState({ showDataInput: e.target.checked })}
          >
            Show Data Input Form
          </Checkbox>
        </div>
        <Divider />
        <div className="karkun-print-view" ref={this.printViewRef}>
          {form}
        </div>
      </>
    );
  }
}

export default flowRight(
  graphql(HR_KARKUN_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  }),
  WithBreadcrumbs(['HR', 'Karkuns', 'Print Karkun'])
)(PrintView);
