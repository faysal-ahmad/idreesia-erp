import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import ReactToPrint from 'react-to-print';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Button, Icon } from '/imports/ui/controls';
import MulakaatCard from './mulakaat-card';

import { VISITOR_MULAKAAT_BY_ID, PAGED_VISITOR_MULAKAATS } from '../gql';

class MulakaatCardContainer extends Component {
  static propTypes = {
    visitorId: PropTypes.string,
    visitorMulakaatId: PropTypes.string,
    visitorMulakaatByIdLoading: PropTypes.bool,
    visitorMulakaatById: PropTypes.object,
    pagedVisitorMulakaatsLoading: PropTypes.bool,
    pagedVisitorMulakaats: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
    onCloseCard: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.cardRef = React.createRef();
  }

  getCardMarkup() {
    const { visitorMulakaatById, pagedVisitorMulakaats } = this.props;

    return (
      <Fragment>
        <MulakaatCard
          ref={this.cardRef}
          visitorMulakaat={visitorMulakaatById}
          visitorMulakaatHistory={pagedVisitorMulakaats.data}
        />
        <div style={{ paddingTop: '5px' }}>
          <ReactToPrint
            trigger={() => (
              <Button type="primary" size="large">
                <Icon type="printer" />
                Print
              </Button>
            )}
            content={() => this.cardRef.current}
          />
          &nbsp;
          <Button
            size="large"
            type="default"
            onClick={() => this.props.onCloseCard()}
          >
            Close
          </Button>
        </div>
      </Fragment>
    );
  }

  render() {
    const {
      visitorMulakaatByIdLoading,
      pagedVisitorMulakaatsLoading,
    } = this.props;
    if (visitorMulakaatByIdLoading || pagedVisitorMulakaatsLoading) return null;
    return this.getCardMarkup();
  }
}

export default flowRight(
  graphql(VISITOR_MULAKAAT_BY_ID, {
    props: ({ data }) => ({
      visitorMulakaatByIdLoading: data.loading,
      ...data,
    }),
    options: ({ visitorMulakaatId }) => ({
      variables: { _id: visitorMulakaatId },
    }),
  }),
  graphql(PAGED_VISITOR_MULAKAATS, {
    props: ({ data }) => ({
      pagedVisitorMulakaatsLoading: data.loading,
      ...data,
    }),
    options: ({ visitorId }) => ({
      variables: {
        filter: {
          visitorId,
          pageIndex: '0',
          pageSize: '4',
        },
      },
    }),
  })
)(MulakaatCardContainer);
