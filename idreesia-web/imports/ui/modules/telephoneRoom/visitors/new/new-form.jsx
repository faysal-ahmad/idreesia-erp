import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { message } from '/imports/ui/controls';
import { VisitorsNewForm } from '/imports/ui/modules/common';
import { TelephoneRoomSubModulePaths as paths } from '/imports/ui/modules/telephoneRoom';

import { CREATE_TELEPHONE_ROOM_VISITOR } from '../gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    createTelephoneRoomVisitor: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = ({
    name,
    parentName,
    cnicNumber,
    ehadDate,
    birthDate,
    referenceName,
    contactNumber1,
    contactNumber2,
    address,
    city,
    country,
  }) => {
    const { history, createTelephoneRoomVisitor } = this.props;

    createTelephoneRoomVisitor({
      variables: {
        name,
        parentName,
        cnicNumber,
        ehadDate,
        birthDate,
        referenceName,
        contactNumber1,
        contactNumber2,
        address,
        city,
        country,
      },
    })
      .then(({ data: { createTelephoneRoomVisitor: newVisitor } }) => {
        history.push(`${paths.visitorsEditFormPath(newVisitor._id)}`);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    return (
      <VisitorsNewForm
        handleSubmit={this.handleSubmit}
        handleCancel={this.handleCancel}
      />
    );
  }
}

export default flowRight(
  graphql(CREATE_TELEPHONE_ROOM_VISITOR, {
    name: 'createTelephoneRoomVisitor',
    options: {
      refetchQueries: ['pagedTelephoneRoomVisitors'],
    },
  }),
  WithBreadcrumbs(['Telephone Room', 'Visitors', 'New'])
)(NewForm);
